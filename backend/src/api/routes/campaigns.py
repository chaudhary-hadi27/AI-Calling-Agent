"""API routes for campaigns management."""

from typing import List, Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from ...core.database import db_manager, Campaign, Contact, CampaignContact, Call, CampaignStatus
from ...api.schemas import CampaignCreate, CampaignResponse, CampaignStats, APIResponse
from ...utils.logger import get_logger
from ...utils.exceptions import AICallingAgentException

logger = get_logger(__name__)
router = APIRouter()


# Dependency to get database session
async def get_db_session() -> AsyncSession:
    """Get database session dependency."""
    async with db_manager.get_session() as session:
        yield session


@router.get("/", response_model=List[CampaignResponse])
async def list_campaigns(
        skip: int = Query(0, ge=0, description="Number of records to skip"),
        limit: int = Query(50, ge=1, le=100, description="Number of records to return"),
        status: Optional[CampaignStatus] = Query(None, description="Filter by campaign status"),
        session: AsyncSession = Depends(get_db_session)
):
    """List campaigns with optional filtering and pagination."""
    try:
        query = select(Campaign)

        # Add status filter
        if status:
            query = query.where(Campaign.status == status)

        # Add ordering and pagination
        query = query.order_by(Campaign.created_at.desc()).offset(skip).limit(limit)

        result = await session.execute(query)
        campaigns = result.scalars().all()

        return [CampaignResponse.from_orm(campaign) for campaign in campaigns]

    except Exception as e:
        logger.error("Error listing campaigns", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list campaigns: {str(e)}"
        )


@router.post("/", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_campaign(
        campaign_data: CampaignCreate,
        session: AsyncSession = Depends(get_db_session)
):
    """Create a new campaign."""
    try:
        # Validate contacts exist
        if campaign_data.contact_ids:
            contacts_query = select(Contact.id).where(Contact.id.in_(campaign_data.contact_ids))
            result = await session.execute(contacts_query)
            existing_contact_ids = [str(contact_id) for contact_id in result.scalars().all()]

            missing_contacts = set(campaign_data.contact_ids) - set(existing_contact_ids)
            if missing_contacts:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Contacts not found: {list(missing_contacts)}"
                )

        # Create campaign
        campaign = Campaign(
            name=campaign_data.name,
            description=campaign_data.description,
            script=campaign_data.script,
            max_concurrent_calls=campaign_data.max_concurrent_calls,
            retry_attempts=campaign_data.retry_attempts,
            retry_delay_minutes=campaign_data.retry_delay_minutes,
            scheduled_start=campaign_data.scheduled_start,
            scheduled_end=campaign_data.scheduled_end,
            total_contacts=len(campaign_data.contact_ids),
            status=CampaignStatus.DRAFT
        )

        session.add(campaign)
        await session.flush()  # Get campaign ID

        # Create campaign-contact associations
        for contact_id in campaign_data.contact_ids:
            campaign_contact = CampaignContact(
                campaign_id=campaign.id,
                contact_id=UUID(contact_id),
                attempts=0
            )
            session.add(campaign_contact)

        await session.commit()
        await session.refresh(campaign)

        logger.info("Campaign created", campaign_id=str(campaign.id), name=campaign_data.name)

        return CampaignResponse.from_orm(campaign)

    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        logger.error("Error creating campaign", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create campaign: {str(e)}"
        )


@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(
        campaign_id: UUID,
        session: AsyncSession = Depends(get_db_session)
):
    """Get specific campaign by ID."""
    try:
        query = select(Campaign).where(Campaign.id == campaign_id)
        campaign = await session.scalar(query)

        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Campaign {campaign_id} not found"
            )

        return CampaignResponse.from_orm(campaign)

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error retrieving campaign", campaign_id=str(campaign_id), error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve campaign: {str(e)}"
        )


@router.patch("/{campaign_id}", response_model=CampaignResponse)
async def update_campaign(
        campaign_id: UUID,
        update_data: dict,  # Flexible update data
        session: AsyncSession = Depends(get_db_session)
):
    """Update existing campaign."""
    try:
        query = select(Campaign).where(Campaign.id == campaign_id)
        campaign = await session.scalar(query)

        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Campaign {campaign_id} not found"
            )

        # Only allow updates if campaign is in draft or paused state
        if campaign.status not in [CampaignStatus.DRAFT, CampaignStatus.PAUSED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot update campaign in {campaign.status} status"
            )

        # Update allowed fields
        for field, value in update_data.items():
            if hasattr(campaign, field) and field not in ['id', 'created_at']:
                setattr(campaign, field, value)

        campaign.updated_at = datetime.utcnow()

        await session.commit()
        await session.refresh(campaign)

        logger.info("Campaign updated", campaign_id=str(campaign_id))

        return CampaignResponse.from_orm(campaign)

    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        logger.error("Error updating campaign", campaign_id=str(campaign_id), error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update campaign: {str(e)}"
        )


@router.delete("/{campaign_id}")
async def delete_campaign(
        campaign_id: UUID,
        session: AsyncSession = Depends(get_db_session)
):
    """Delete campaign (only if not running)."""
    try:
        query = select(Campaign).where(Campaign.id == campaign_id)
        campaign = await session.scalar(query)

        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Campaign {campaign_id} not found"
            )

        # Don't allow deletion of running campaigns
        if campaign.status == CampaignStatus.RUNNING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete running campaign. Stop it first."
            )

        await session.delete(campaign)
        await session.commit()

        logger.info("Campaign deleted", campaign_id=str(campaign_id))

        return {"message": "Campaign deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        logger.error("Error deleting campaign", campaign_id=str(campaign_id), error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete campaign: {str(e)}"
        )


@router.post("/{campaign_id}/start", response_model=CampaignResponse)
async def start_campaign(
        campaign_id: UUID,
        session: AsyncSession = Depends(get_db_session)
):
    """Start a campaign."""
    try:
        query = select(Campaign).where(Campaign.id == campaign_id)
        campaign = await session.scalar(query)

        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Campaign {campaign_id} not found"
            )

        if campaign.status not in [CampaignStatus.DRAFT, CampaignStatus.PAUSED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot start campaign in {campaign.status} status"
            )

        campaign.status = CampaignStatus.RUNNING
        campaign.started_at = datetime.utcnow()

        await session.commit()
        await session.refresh(campaign)

        logger.info("Campaign started", campaign_id=str(campaign_id))

        return CampaignResponse.from_orm(campaign)

    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        logger.error("Error starting campaign", campaign_id=str(campaign_id), error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start campaign: {str(e)}"
        )


@router.post("/{campaign_id}/pause", response_model=CampaignResponse)
async def pause_campaign(
        campaign_id: UUID,
        session: AsyncSession = Depends(get_db_session)
):
    """Pause a running campaign."""
    try:
        query = select(Campaign).where(Campaign.id == campaign_id)
        campaign = await session.scalar(query)

        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Campaign {campaign_id} not found"
            )

        if campaign.status != CampaignStatus.RUNNING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot pause campaign in {campaign.status} status"
            )

        campaign.status = CampaignStatus.PAUSED

        await session.commit()
        await session.refresh(campaign)

        logger.info("Campaign paused", campaign_id=str(campaign_id))

        return CampaignResponse.from_orm(campaign)

    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        logger.error("Error pausing campaign", campaign_id=str(campaign_id), error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to pause campaign: {str(e)}"
        )


@router.post("/{campaign_id}/stop", response_model=CampaignResponse)
async def stop_campaign(
        campaign_id: UUID,
        session: AsyncSession = Depends(get_db_session)
):
    """Stop a campaign."""
    try:
        query = select(Campaign).where(Campaign.id == campaign_id)
        campaign = await session.scalar(query)

        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Campaign {campaign_id} not found"
            )

        if campaign.status not in [CampaignStatus.RUNNING, CampaignStatus.PAUSED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot stop campaign in {campaign.status} status"
            )

        campaign.status = CampaignStatus.COMPLETED
        campaign.completed_at = datetime.utcnow()

        await session.commit()
        await session.refresh(campaign)

        logger.info("Campaign stopped", campaign_id=str(campaign_id))

        return CampaignResponse.from_orm(campaign)

    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        logger.error("Error stopping campaign", campaign_id=str(campaign_id), error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to stop campaign: {str(e)}"
        )


@router.get("/{campaign_id}/stats", response_model=CampaignStats)
async def get_campaign_stats(
        campaign_id: UUID,
        session: AsyncSession = Depends(get_db_session)
):
    """Get campaign statistics."""
    try:
        campaign = await session.scalar(select(Campaign).where(Campaign.id == campaign_id))

        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Campaign {campaign_id} not found"
            )

        # Get call statistics
        total_calls_query = select(func.count(Call.id)).where(Call.campaign_id == campaign_id)
        total_calls = await session.scalar(total_calls_query) or 0

        completed_calls_query = select(func.count(Call.id)).where(
            and_(Call.campaign_id == campaign_id, Call.status == 'completed')
        )
        completed_calls = await session.scalar(completed_calls_query) or 0

        failed_calls_query = select(func.count(Call.id)).where(
            and_(Call.campaign_id == campaign_id, Call.status.in_(['failed', 'no_answer', 'busy']))
        )
        failed_calls = await session.scalar(failed_calls_query) or 0

        in_progress_calls_query = select(func.count(Call.id)).where(
            and_(Call.campaign_id == campaign_id, Call.status.in_(['queued', 'ringing', 'in_progress']))
        )
        in_progress_calls = await session.scalar(in_progress_calls_query) or 0

        # Calculate success rate
        success_rate = (completed_calls / total_calls * 100) if total_calls > 0 else 0

        # Get average duration
        avg_duration_query = select(func.avg(Call.duration_seconds)).where(
            and_(Call.campaign_id == campaign_id, Call.duration_seconds.isnot(None))
        )
        avg_duration = await session.scalar(avg_duration_query) or 0

        # Get total cost
        total_cost_query = select(func.sum(Call.cost)).where(
            and_(Call.campaign_id == campaign_id, Call.cost.isnot(None))
        )
        total_cost = await session.scalar(total_cost_query) or 0

        return CampaignStats(
            total_contacts=campaign.total_contacts,
            calls_completed=completed_calls,
            calls_failed=failed_calls,
            calls_in_progress=in_progress_calls,
            success_rate=round(success_rate, 2),
            average_duration=float(avg_duration) if avg_duration else None,
            total_cost=float(total_cost) if total_cost else None
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting campaign stats", campaign_id=str(campaign_id), error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get campaign stats: {str(e)}"
        )


@router.get("/{campaign_id}/calls")
async def get_campaign_calls(
        campaign_id: UUID,
        skip: int = Query(0, ge=0),
        limit: int = Query(50, ge=1, le=100),
        status: Optional[str] = Query(None, description="Filter by call status"),
        session: AsyncSession = Depends(get_db_session)
):
    """Get calls for a specific campaign."""
    try:
        # Verify campaign exists
        campaign = await session.scalar(select(Campaign).where(Campaign.id == campaign_id))

        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Campaign {campaign_id} not found"
            )

        # Build query
        query = select(Call).where(Call.campaign_id == campaign_id)

        if status:
            query = query.where(Call.status == status)

        query = query.order_by(Call.created_at.desc()).offset(skip).limit(limit)

        result = await session.execute(query)
        calls = result.scalars().all()

        # Convert to response format
        calls_data = []
        for call in calls:
            calls_data.append({
                'id': str(call.id),
                'call_sid': call.call_sid,
                'status': call.status,
                'direction': call.direction,
                'from_number': call.from_number,
                'to_number': call.to_number,
                'duration_seconds': call.duration_seconds,
                'created_at': call.created_at.isoformat(),
                'answered_at': call.answered_at.isoformat() if call.answered_at else None,
                'ended_at': call.ended_at.isoformat() if call.ended_at else None,
                'cost': call.cost,
                'sentiment_score': call.sentiment_score,
                'intent_detected': call.intent_detected
            })

        return calls_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting campaign calls", campaign_id=str(campaign_id), error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get campaign calls: {str(e)}"
        )