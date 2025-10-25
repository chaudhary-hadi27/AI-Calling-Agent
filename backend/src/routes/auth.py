"""Authentication routes with httpOnly cookies and email verification."""

from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from pydantic import BaseModel, EmailStr

from ..core.database import db_manager
from ..core.security import create_access_token, verify_token
from ..schemas.user import UserCreate, UserLogin, UserResponse, ChangePasswordRequest
from ..services.user_service import user_service
from ..utils.logger import get_logger
from ..utils.exceptions import UserAlreadyExistsError, InvalidCredentialsError
from ..middleware.csrf import csrf_protection
from ..utils.config import get_settings

logger = get_logger(__name__)
router = APIRouter(prefix="/api/auth", tags=["auth"])
settings = get_settings()


async def get_db_session() -> AsyncSession:
    """Get database session."""
    async with db_manager.get_session() as session:
        yield session


# ✅ NEW: Email Verification Schema
class EmailVerification(BaseModel):
    """Schema for email verification."""
    email: EmailStr
    code: str


class ResendVerification(BaseModel):
    """Schema for resending verification code."""
    email: EmailStr


@router.post("/register")
async def register(
        user_data: UserCreate,
        response: Response,
        session: AsyncSession = Depends(get_db_session)
):
    """Register a new user and send verification email."""
    try:
        # Create user and get verification code
        user, verification_code = await user_service.create_user(session, user_data)

        logger.info(
            "User registered - verification email sent",
            email=user.email,
            # ⚠️ Remove in production - only for debugging
            verification_code=verification_code if settings.environment == "development" else "***"
        )

        return {
            "success": True,
            "message": "Registration successful! Please check your email for verification code.",
            "email": user.email,
            # ⚠️ Only return code in development mode for testing
            "verification_code": verification_code if settings.environment == "development" else None
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


@router.post("/verify-email")
async def verify_email(
        verification: EmailVerification,
        response: Response,
        session: AsyncSession = Depends(get_db_session)
):
    """Verify email with 6-digit code."""
    try:
        # Verify the code
        success = await user_service.verify_email(
            session,
            verification.email,
            verification.code
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification failed"
            )

        # Get verified user
        user = await user_service.get_user_by_email(session, verification.email)

        # Create JWT token
        access_token = create_access_token(
            user_id=user.id,
            email=user.email,
            role=user.role.value
        )

        # Set httpOnly cookie
        response.set_cookie(
            key="auth-token",
            value=access_token,
            httponly=True,
            secure=settings.environment == "production",
            samesite="strict",
            max_age=24 * 3600  # 24 hours
        )

        logger.info("Email verified successfully", email=user.email)

        return {
            "success": True,
            "message": "Email verified successfully!",
            "user": UserResponse.from_orm(user)
        }

    except InvalidCredentialsError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error("Verification error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email verification failed"
        )


@router.post("/resend-verification")
async def resend_verification(
        resend_data: ResendVerification,
        session: AsyncSession = Depends(get_db_session)
):
    """Resend verification code."""
    try:
        user = await user_service.get_user_by_email(session, resend_data.email)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        if user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already verified"
            )

        # Generate new code
        from ..services.email_service import email_service
        from datetime import timedelta

        verification_code = email_service.generate_verification_code()

        # Update user
        user.verification_code = verification_code
        user.verification_code_expires = datetime.utcnow() + timedelta(minutes=10)
        await session.commit()

        # Send email
        email_sent = await email_service.send_verification_code(
            email=user.email,
            code=verification_code,
            user_name=user.full_name
        )

        if not email_sent:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send verification email"
            )

        logger.info("Verification code resent", email=user.email)

        return {
            "success": True,
            "message": "Verification code sent! Check your email.",
            # ⚠️ Only in development
            "verification_code": verification_code if settings.environment == "development" else None
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Resend verification error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to resend verification code"
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

        # Check if email is verified
        if not user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Please verify your email before logging in"
            )

        # Update last login
        await user_service.update_last_login(session, user.id)

        # Create JWT token
        access_token = create_access_token(
            user_id=user.id,
            email=user.email,
            role=user.role.value
        )

        # Set httpOnly cookie
        response.set_cookie(
            key="auth-token",
            value=access_token,
            httponly=True,
            secure=settings.environment == "production",
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
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Login error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@router.post("/logout")
async def logout(response: Response):
    """Logout user by clearing cookie."""
    response.delete_cookie(
        key="auth-token",
        httponly=True,
        samesite="strict"
    )
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
        secure=settings.environment == "production",
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