"""Authentication routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import db_manager
from ..core.security import create_access_token
from ..schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse, ChangePasswordRequest
from ..services.user_service import user_service
from ..utils.logger import get_logger
from ..utils.exceptions import UserAlreadyExistsError, InvalidCredentialsError

logger = get_logger(__name__)
router = APIRouter(prefix="/api/auth", tags=["auth"])


# Dependency
async def get_db_session() -> AsyncSession:
    """Get database session."""
    async with db_manager.get_session() as session:
        yield session


@router.post("/register", response_model=TokenResponse)
async def register(
        user_data: UserCreate,
        session: AsyncSession = Depends(get_db_session)
):
    """Register a new user."""
    try:
        # Create user
        user = await user_service.create_user(session, user_data)

        # Create token
        access_token = create_access_token(
            user_id=user.id,
            email=user.email,
            role=user.role.value
        )

        return TokenResponse(
            access_token=access_token,
            user=UserResponse.from_orm(user),
            expires_in=24 * 3600  # 24 hours in seconds
        )

    except UserAlreadyExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@router.post("/login", response_model=TokenResponse)
async def login(
        credentials: UserLogin,
        session: AsyncSession = Depends(get_db_session)
):
    """Login user."""
    try:
        # Authenticate
        user = await user_service.authenticate_user(
            session,
            credentials.email,
            credentials.password
        )

        # Update last login
        await user_service.update_last_login(session, user.id)

        # Create token
        access_token = create_access_token(
            user_id=user.id,
            email=user.email,
            role=user.role.value
        )

        return TokenResponse(
            access_token=access_token,
            user=UserResponse.from_orm(user),
            expires_in=24 * 3600
        )

    except InvalidCredentialsError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@router.post("/change-password")
async def change_password(
        change_pwd: ChangePasswordRequest,
        session: AsyncSession = Depends(get_db_session),
        current_user=Depends(get_current_user)  # We'll create this dependency next
):
    """Change user password."""
    try:
        if change_pwd.new_password != change_pwd.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match"
            )

        await user_service.change_password(
            session,
            current_user.user_id,
            change_pwd.current_password,
            change_pwd.new_password
        )

        return {"message": "Password changed successfully"}

    except InvalidCredentialsError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Change password error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to change password"
        )


async def get_current_user(token: str = None):
    """Extract current user from token."""
    from ..core.security import verify_token

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    token_data = verify_token(token)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    return token_data