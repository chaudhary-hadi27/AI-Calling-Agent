"""Authentication routes with httpOnly cookies."""

from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from ..core.database import db_manager
from ..core.security import create_access_token, verify_token
from ..schemas.user import UserCreate, UserLogin, UserResponse, ChangePasswordRequest
from ..services.user_service import user_service
from ..utils.logger import get_logger
from ..utils.exceptions import UserAlreadyExistsError, InvalidCredentialsError
from ..middleware.csrf import csrf_protection

logger = get_logger(__name__)
router = APIRouter(prefix="/api/auth", tags=["auth"])


async def get_db_session() -> AsyncSession:
    """Get database session."""
    async with db_manager.get_session() as session:
        yield session


@router.post("/register")
async def register(
        user_data: UserCreate,
        response: Response,
        session: AsyncSession = Depends(get_db_session)
):
    """Register a new user with httpOnly cookie."""
    try:
        # Create user
        user = await user_service.create_user(session, user_data)

        # Create JWT token
        access_token = create_access_token(
            user_id=user.id,
            email=user.email,
            role=user.role.value
        )

        # ✅ Set httpOnly cookie
        response.set_cookie(
            key="auth-token",
            value=access_token,
            httponly=True,  # Prevent JavaScript access
            secure=True,    # HTTPS only in production
            samesite="strict",
            max_age=24 * 3600  # 24 hours
        )

        logger.info("User registered", email=user.email)

        return {
            "success": True,
            "user": UserResponse.from_orm(user),
            "message": "Registration successful"
        }

    except UserAlreadyExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error("Registration error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@router.post("/login")
async def login(
        credentials: UserLogin,
        response: Response,
        session: AsyncSession = Depends(get_db_session)
):
    """Login user with httpOnly cookie."""
    try:
        # Authenticate
        user = await user_service.authenticate_user(
            session,
            credentials.email,
            credentials.password
        )

        # Update last login
        await user_service.update_last_login(session, user.id)

        # Create JWT token
        access_token = create_access_token(
            user_id=user.id,
            email=user.email,
            role=user.role.value
        )

        # ✅ Set httpOnly cookie
        response.set_cookie(
            key="auth-token",
            value=access_token,
            httponly=True,
            secure=True,
            samesite="strict",
            max_age=24 * 3600
        )

        logger.info("User logged in", email=user.email)

        return {
            "success": True,
            "user": UserResponse.from_orm(user),
            "message": "Login successful"
        }

    except InvalidCredentialsError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    except Exception as e:
        logger.error("Login error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@router.post("/logout")
async def logout(response: Response):
    """Logout user by clearing cookie."""
    response.delete_cookie(key="auth-token", httponly=True, samesite="strict")
    logger.info("User logged out")

    return {"success": True, "message": "Logged out successfully"}


@router.get("/me")
async def get_current_user(
        request: Request,
        session: AsyncSession = Depends(get_db_session)
):
    """Get current user from cookie."""
    token = request.cookies.get("auth-token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    # Verify token
    token_data = verify_token(token)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    # Get user from database
    from uuid import UUID
    user = await user_service.get_user_by_id(session, UUID(token_data.user_id))

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return {"user": UserResponse.from_orm(user)}


@router.post("/refresh")
async def refresh_token(
        request: Request,
        response: Response,
        session: AsyncSession = Depends(get_db_session)
):
    """Refresh auth token."""
    token = request.cookies.get("auth-token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    # Verify existing token
    token_data = verify_token(token)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    # Create new token
    from uuid import UUID
    new_token = create_access_token(
        user_id=UUID(token_data.user_id),
        email=token_data.email,
        role=token_data.role
    )

    # Set new cookie
    response.set_cookie(
        key="auth-token",
        value=new_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=24 * 3600
    )

    return {"success": True, "message": "Token refreshed"}


@router.get("/csrf")
async def get_csrf_token(response: Response):
    """Get CSRF token."""
    token = csrf_protection.generate_token()
    csrf_protection.set_csrf_cookie(response, token)

    return {"csrfToken": token}


@router.post("/change-password")
async def change_password(
        change_pwd: ChangePasswordRequest,
        request: Request,
        session: AsyncSession = Depends(get_db_session)
):
    """Change user password."""
    # Get current user from cookie
    token = request.cookies.get("auth-token")
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

    try:
        if change_pwd.new_password != change_pwd.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match"
            )

        from uuid import UUID
        await user_service.change_password(
            session,
            UUID(token_data.user_id),
            change_pwd.current_password,
            change_pwd.new_password
        )

        logger.info("Password changed", user_id=token_data.user_id)

        return {"success": True, "message": "Password changed successfully"}

    except InvalidCredentialsError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        logger.error("Change password error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to change password"
        )