"""Health check routes."""

from fastapi import APIRouter
from datetime import datetime

from ..utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "AI Calling Agent Backend"
    }


@router.get("/api/health")
async def api_health_check():
    """API health check endpoint."""
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat()
    }