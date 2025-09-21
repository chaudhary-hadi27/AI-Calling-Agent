"""API routes for analytics and reporting."""

from typing import Optional
from datetime import datetime, timedelta
import json

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, case
from fastapi.responses import StreamingResponse
import io
import csv

from ...core.database import db_manager, Call, Campaign, Contact, CallStatus
from ...utils.logger import get_logger
from ...utils.exceptions import AICallingAgentException

logger = get_logger(__name__)
router = APIRouter()


# Dependency to get database session
async def get_db_session() -> AsyncSession:
    """Get database session dependency."""
    async with db_manager.get_session() as session:
        yield session


@router.get("/dashboard")
async def get_dashboard_stats(
        start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
        end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
        campaign_id: Optional[str] = Query(None, description="Filter by campaign ID"),
        session: AsyncSession = Depends(get_db_session)
):
    """Get dashboard overview statistics."""
    try:
        # Set default date range (last 30 days)
        if not start_date:
            start_date = (datetime.utcnow() - timedelta(days=30)).date().isoformat()
        if not end_date:
            end_date = datetime.utcnow().date().isoformat()

        start_dt = datetime.fromisoformat(start_date)
        end_dt = datetime.fromisoformat(end_date) + timedelta(days=1)  # Include end date

        # Base query filters
        base_filters = [Call.created_at >= start_dt, Call.created_at < end_dt]
        if campaign_id:
            base_filters.append(Call.campaign_id == campaign_id)

        # Today's stats for comparison
        today = datetime.utcnow().date()
        today_filters = [
            func.date(Call.created_at) == today
        ]
        if campaign_id:
            today_filters.append(Call.campaign_id == campaign_id)

        yesterday_filters = [
            func.date(Call.created_at) == today - timedelta(days=1)
        ]
        if campaign_id:
            yesterday_filters.append(Call.campaign_id == campaign_id)

        # Get today's call count
        today_calls_query = select(func.count(Call.id)).where(and_(*today_filters))
        today_calls = await session.scalar(today_calls_query) or 0

        # Get yesterday's call count for comparison
        yesterday_calls_query = select(func.count(Call.id)).where(and_(*yesterday_filters))
        yesterday_calls = await session.scalar(yesterday_calls_query) or 0

        # Calculate change percentage
        today_calls_change = 0
        if yesterday_calls > 0:
            today_calls_change = ((today_calls - yesterday_calls) / yesterday_calls) * 100

        # Active campaigns
        active_campaigns_query = select(func.count(Campaign.id)).where(
            Campaign.status.in_(['running', 'scheduled'])
        )
        active_campaigns = await session.scalar(active_campaigns_query) or 0

        # Active sessions (in progress calls)
        active_sessions_query = select(func.count(Call.id)).where(
            Call.status.in_(['ringing', 'in_progress'])
        )
        active_sessions = await session.scalar(active_sessions_query) or 0

        # Success rate calculation
        total_completed_query = select(func.count(Call.id)).where(
            and_(*base_filters, Call.status.in_(['completed', 'failed', 'no_answer', 'busy']))
        )
        total_completed = await session.scalar(total_completed_query) or 0

        successful_calls_query = select(func.count(Call.id)).where(
            and_(*base_filters, Call.status == 'completed')
        )
        successful_calls = await session.scalar(successful_calls_query) or 0

        success_rate = (successful_calls / total_completed * 100) if total_completed > 0 else 0

        # Previous period success rate for comparison
        prev_start = start_dt - (end_dt - start_dt)
        prev_end = start_dt
        prev_filters = [Call.created_at >= prev_start, Call.created_at < prev_end]
        if campaign_id:
            prev_filters.append(Call.campaign_id == campaign_id)

        prev_total_query = select(func.count(Call.id)).where(
            and_(*prev_filters, Call.status.in_(['completed', 'failed', 'no_answer', 'busy']))
        )
        prev_total = await session.scalar(prev_total_query) or 0

        prev_successful_query = select(func.count(Call.id)).where(
            and_(*prev_filters, Call.status == 'completed')
        )
        prev_successful = await session.scalar(prev_successful_query) or 0

        prev_success_rate = (prev_successful / prev_total * 100) if prev_total > 0 else 0
        success_rate_change = success_rate - prev_success_rate

        # Average call duration
        avg_duration_query = select(func.avg(Call.duration_seconds)).where(
            and_(*base_filters, Call.duration_seconds.isnot(None))
        )
        avg_call_duration = await session.scalar(avg_duration_query) or 0

        # Total contacts
        total_contacts_query = select(func.count(Contact.id))
        total_contacts = await session.scalar(total_contacts_query) or 0

        # Calls by status distribution
        status_distribution_query = select(
            Call.status,
            func.count(Call.id).label('count')
        ).where(
            and_(*base_filters)
        ).group_by(Call.status)

        result = await session.execute(status_distribution_query)
        calls_by_status = {row.status: row.count for row in result}

        # Recent calls (last 10)
        recent_calls_query = select(Call).where(
            and_(*base_filters)
        ).order_by(Call.created_at.desc()).limit(10)

        result = await session.execute(recent_calls_query)
        recent_calls_data = []
        for call in result.scalars():
            recent_calls_data.append({
                'id': str(call.id),
                'to_number': call.to_number,
                'status': call.status,
                'duration_seconds': call.duration_seconds,
                'created_at': call.created_at.isoformat(),
                'sentiment_score': call.sentiment_score
            })

        return {
            'today_calls': today_calls,
            'today_calls_change': round(today_calls_change, 1),
            'active_campaigns': active_campaigns,
            'active_sessions': active_sessions,
            'success_rate': round(success_rate, 1),
            'success_rate_change': round(success_rate_change, 1),
            'avg_call_duration': round(float(avg_call_duration), 1) if avg_call_duration else 0,
            'total_contacts': total_contacts,
            'calls_by_status': calls_by_status,
            'recent_calls': recent_calls_data
        }

    except Exception as e:
        logger.error("Error getting dashboard stats", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get dashboard stats: {str(e)}"
        )


@router.get("/call-volume")
async def get_call_volume_analytics(
        start_date: Optional[str] = Query(None),
        end_date: Optional[str] = Query(None),
        granularity: str = Query('day', regex='^(hour|day|week|month)$'),
        campaign_id: Optional[str] = Query(None),
        session: AsyncSession = Depends(get_db_session)
):
    """Get call volume trends over time."""
    try:
        # Set default date range
        if not start_date:
            start_date = (datetime.utcnow() - timedelta(days=30)).date().isoformat()
        if not end_date:
            end_date = datetime.utcnow().date().isoformat()

        start_dt = datetime.fromisoformat(start_date)
        end_dt = datetime.fromisoformat(end_date) + timedelta(days=1)

        # Build query filters
        filters = [Call.created_at >= start_dt, Call.created_at < end_dt]
        if campaign_id:
            filters.append(Call.campaign_id == campaign_id)

        # Choose date truncation based on granularity
        if granularity == 'hour':
            date_trunc = func.date_trunc('hour', Call.created_at)
        elif granularity == 'day':
            date_trunc = func.date_trunc('day', Call.created_at)
        elif granularity == 'week':
            date_trunc = func.date_trunc('week', Call.created_at)
        else:  # month
            date_trunc = func.date_trunc('month', Call.created_at)

        query = select(
            date_trunc.label('time_period'),
            func.count(Call.id).label('total_calls'),
            func.sum(case((Call.status == 'completed', 1), else_=0)).label('completed_calls'),
            func.sum(case((Call.status.in_(['failed', 'no_answer', 'busy']), 1), else_=0)).label('failed_calls')
        ).where(
            and_(*filters)
        ).group_by('time_period').order_by('time_period')

        result = await session.execute(query)

        data = []
        for row in result:
            data.append({
                'timestamp': row.time_period.isoformat(),
                'total_calls': row.total_calls,
                'completed_calls': row.completed_calls,
                'failed_calls': row.failed_calls
            })

        return data

    except Exception as e:
        logger.error("Error getting call volume analytics", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get call volume analytics: {str(e)}"
        )


@router.get("/performance-metrics")
async def get_performance_metrics(
        start_date: Optional[str] = Query(None),
        end_date: Optional[str] = Query(None),
        campaign_id: Optional[str] = Query(None),
        session: AsyncSession = Depends(get_db_session)
):
    """Get comprehensive performance metrics."""
    try:
        # Set date range
        if not start_date:
            start_date = (datetime.utcnow() - timedelta(days=30)).date().isoformat()
        if not end_date:
            end_date = datetime.utcnow().date().isoformat()

        start_dt = datetime.fromisoformat(start_date)
        end_dt = datetime.fromisoformat(end_date) + timedelta(days=1)

        filters = [Call.created_at >= start_dt, Call.created_at < end_dt]
        if campaign_id:
            filters.append(Call.campaign_id == campaign_id)

        # Total calls
        total_calls_query = select(func.count(Call.id)).where(and_(*filters))
        total_calls = await session.scalar(total_calls_query) or 0

        # Success rate
        completed_calls_query = select(func.count(Call.id)).where(
            and_(*filters, Call.status == 'completed')
        )
        completed_calls = await session.scalar(completed_calls_query) or 0
        success_rate = (completed_calls / total_calls * 100) if total_calls > 0 else 0

        # Average duration
        avg_duration_query = select(func.avg(Call.duration_seconds)).where(
            and_(*filters, Call.duration_seconds.isnot(None))
        )
        avg_duration = await session.scalar(avg_duration_query) or 0

        # Total cost
        total_cost_query = select(func.sum(Call.cost)).where(
            and_(*filters, Call.cost.isnot(None))
        )
        total_cost = await session.scalar(total_cost_query) or 0

        # Cost per call
        cost_per_call = (total_cost / total_calls) if total_calls > 0 else 0

        # Calls per hour (based on date range)
        hours_diff = (end_dt - start_dt).total_seconds() / 3600
        calls_per_hour = total_calls / hours_diff if hours_diff > 0 else 0

        # Peak calling hours
        peak_hours_query = select(
            func.extract('hour', Call.created_at).label('hour'),
            func.count(Call.id).label('calls')
        ).where(and_(*filters)).group_by('hour').order_by(func.count(Call.id).desc()).limit(5)

        result = await session.execute(peak_hours_query)
        peak_hours = [{'hour': int(row.hour), 'calls': row.calls} for row in result]

        # Sentiment distribution
        sentiment_query = select(
            func.sum(case((Call.sentiment_score > 0.2, 1), else_=0)).label('positive'),
            func.sum(case((Call.sentiment_score.between(-0.2, 0.2), 1), else_=0)).label('neutral'),
            func.sum(case((Call.sentiment_score < -0.2, 1), else_=0)).label('negative')
        ).where(and_(*filters, Call.sentiment_score.isnot(None)))

        sentiment_result = await session.scalar(sentiment_query)
        sentiment_distribution = {
            'positive': sentiment_result.positive if sentiment_result else 0,
            'neutral': sentiment_result.neutral if sentiment_result else 0,
            'negative': sentiment_result.negative if sentiment_result else 0
        }

        # Intent distribution
        intent_query = select(
            Call.intent_detected,
            func.count(Call.id).label('count')
        ).where(
            and_(*filters, Call.intent_detected.isnot(None))
        ).group_by(Call.intent_detected)

        result = await session.execute(intent_query)
        intent_distribution = {row.intent_detected: row.count for row in result}

        return {
            'total_calls': total_calls,
            'success_rate': round(success_rate, 2),
            'average_duration': round(float(avg_duration), 1) if avg_duration else 0,
            'total_cost': round(float(total_cost), 2) if total_cost else 0,
            'cost_per_call': round(float(cost_per_call), 3) if cost_per_call else 0,
            'calls_per_hour': round(calls_per_hour, 1),
            'peak_calling_hours': peak_hours,
            'sentiment_distribution': sentiment_distribution,
            'intent_distribution': intent_distribution
        }

    except Exception as e:
        logger.error("Error getting performance metrics", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get performance metrics: {str(e)}"
        )


@router.get("/export")
async def export_analytics_data(
        start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
        end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
        format: str = Query('csv', regex='^(csv|json)$'),
        data_type: str = Query('calls', regex='^(calls|campaigns|contacts|analytics)$'),
        campaign_id: Optional[str] = Query(None),
        session: AsyncSession = Depends(get_db_session)
):
    """Export analytics data in CSV or JSON format."""
    try:
        start_dt = datetime.fromisoformat(start_date)
        end_dt = datetime.fromisoformat(end_date) + timedelta(days=1)

        if data_type == 'calls':
            # Export call data
            filters = [Call.created_at >= start_dt, Call.created_at < end_dt]
            if campaign_id:
                filters.append(Call.campaign_id == campaign_id)

            query = select(Call).where(and_(*filters)).order_by(Call.created_at.desc())
            result = await session.execute(query)
            calls = result.scalars().all()

            data = []
            for call in calls:
                data.append({
                    'id': str(call.id),
                    'call_sid': call.call_sid,
                    'status': call.status,
                    'direction': call.direction,
                    'from_number': call.from_number,
                    'to_number': call.to_number,
                    'duration_seconds': call.duration_seconds,
                    'cost': call.cost,
                    'sentiment_score': call.sentiment_score,
                    'intent_detected': call.intent_detected,
                    'created_at': call.created_at.isoformat(),
                    'answered_at': call.answered_at.isoformat() if call.answered_at else None,
                    'ended_at': call.ended_at.isoformat() if call.ended_at else None
                })

        # Generate response based on format
        if format == 'csv':
            output = io.StringIO()
            if data:
                writer = csv.DictWriter(output, fieldnames=data[0].keys())
                writer.writeheader()
                writer.writerows(data)

            response = StreamingResponse(
                io.BytesIO(output.getvalue().encode('utf-8')),
                media_type='text/csv',
                headers={
                    'Content-Disposition': f'attachment; filename=analytics_{data_type}_{start_date}_{end_date}.csv'}
            )
            return response
        else:  # JSON format
            json_data = json.dumps(data, indent=2)
            response = StreamingResponse(
                io.BytesIO(json_data.encode('utf-8')),
                media_type='application/json',
                headers={
                    'Content-Disposition': f'attachment; filename=analytics_{data_type}_{start_date}_{end_date}.json'}
            )
            return response

    except Exception as e:
        logger.error("Error exporting analytics data", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export analytics data: {str(e)}"
        )