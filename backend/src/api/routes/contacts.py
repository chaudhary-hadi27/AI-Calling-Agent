"""API routes for contacts management."""

from typing import List, Optional
from uuid import UUID
import csv
import io

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from ...core.database import db_manager, Contact
from ...api.schemas import ContactCreate, ContactResponse, APIResponse, PaginatedResponse
from ...utils.logger import get_logger
from ...utils.exceptions import AICallingAgentException

logger = get_logger(__name__)
router = APIRouter()


# Dependency to get database session
async def get_db_session() -> AsyncSession:
    """Get database session dependency."""
    async with db_manager.get_session() as session:
        yield session


@router.get("/", response_model=List[ContactResponse])
async def list_contacts(
        skip: int = Query(0, ge=0, description="Number of records to skip"),
        limit: int = Query(50, ge=1, le=100, description="Number of records to return"),
        search: Optional[str] = Query(None, description="Search in name, email, or phone"),
        session: AsyncSession = Depends(get_db_session)
):
    """List contacts with optional search and pagination."""
    try:
        query = select(Contact)

        # Add search filter
        if search:
            search_term = f"%{search}%"
            query = query.where(
                Contact.first_name.ilike(search_term) |
                Contact.last_name.ilike(search_term) |
                Contact.email.ilike(search_term) |
                Contact.phone_number.ilike(search_term)
            )

        # Add ordering and pagination
        query = query.order_by(Contact.created_at.desc()).offset(skip).limit(limit)

        result = await session.execute(query)
        contacts = result.scalars().all()

        return [ContactResponse.from_orm(contact) for contact in contacts]

    except Exception as e:
        logger.error("Error listing contacts", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list contacts: {str(e)}"
        )


@router.post("/", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def create_contact(
        contact_data: ContactCreate,
        session: AsyncSession = Depends(get_db_session)
):
    """Create a new contact."""
    try:
        # Check if contact with same phone number exists
        existing_query = select(Contact).where(Contact.phone_number == contact_data.phone_number)
        existing_contact = await session.scalar(existing_query)

        if existing_contact:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Contact with phone number {contact_data.phone_number} already exists"
            )

        # Create new contact
        contact = Contact(
            phone_number=contact_data.phone_number,
            first_name=contact_data.first_name,
            last_name=contact_data.last_name,
            email=contact_data.email,
            metadata=contact_data.metadata or {}
        )

        session.add(contact)
        await session.commit()
        await session.refresh(contact)

        logger.info("Contact created", contact_id=str(contact.id), phone=contact_data.phone_number)

        return ContactResponse.from_orm(contact)

    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        logger.error("Error creating contact", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create contact: {str(e)}"
        )


@router.get("/{contact_id}", response_model=ContactResponse)
async def get_contact(
        contact_id: UUID,
        session: AsyncSession = Depends(get_db_session)
):
    """Get specific contact by ID."""
    try:
        query = select(Contact).where(Contact.id == contact_id)
        contact = await session.scalar(query)

        if not contact:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Contact {contact_id} not found"
            )

        return ContactResponse.from_orm(contact)

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error retrieving contact", contact_id=str(contact_id), error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve contact: {str(e)}"
        )


@router.patch("/{contact_id}", response_model=ContactResponse)
async def update_contact(
        contact_id: UUID,
        update_data: ContactCreate,  # Using same schema for simplicity
        session: AsyncSession = Depends(get_db_session)
):
    """Update existing contact."""
    try:
        query = select(Contact).where(Contact.id == contact_id)
        contact = await session.scalar(query)

        if not contact:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Contact {contact_id} not found"
            )

        # Update fields
        if update_data.phone_number and update_data.phone_number != contact.phone_number:
            # Check for duplicate phone number
            duplicate_query = select(Contact).where(
                Contact.phone_number == update_data.phone_number,
                Contact.id != contact_id
            )
            duplicate = await session.scalar(duplicate_query)
            if duplicate:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Phone number {update_data.phone_number} is already in use"
                )
            contact.phone_number = update_data.phone_number

        if update_data.first_name is not None:
            contact.first_name = update_data.first_name
        if update_data.last_name is not None:
            contact.last_name = update_data.last_name
        if update_data.email is not None:
            contact.email = update_data.email
        if update_data.metadata is not None:
            contact.metadata = update_data.metadata

        await session.commit()
        await session.refresh(contact)

        logger.info("Contact updated", contact_id=str(contact_id))

        return ContactResponse.from_orm(contact)

    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        logger.error("Error updating contact", contact_id=str(contact_id), error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update contact: {str(e)}"
        )


@router.delete("/{contact_id}")
async def delete_contact(
        contact_id: UUID,
        session: AsyncSession = Depends(get_db_session)
):
    """Delete contact."""
    try:
        query = select(Contact).where(Contact.id == contact_id)
        contact = await session.scalar(query)

        if not contact:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Contact {contact_id} not found"
            )

        await session.delete(contact)
        await session.commit()

        logger.info("Contact deleted", contact_id=str(contact_id))

        return {"message": "Contact deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        logger.error("Error deleting contact", contact_id=str(contact_id), error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete contact: {str(e)}"
        )


@router.post("/import", response_model=dict)
async def import_contacts(
        file: UploadFile = File(...),
        session: AsyncSession = Depends(get_db_session)
):
    """Import contacts from CSV file."""
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only CSV files are supported"
            )

        # Read CSV content
        content = await file.read()
        csv_content = content.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(csv_content))

        imported_count = 0
        failed_count = 0
        errors = []

        for row_num, row in enumerate(csv_reader, start=1):
            try:
                # Validate required fields
                phone_number = row.get('phone_number', '').strip()
                if not phone_number:
                    errors.append(f"Row {row_num}: Phone number is required")
                    failed_count += 1
                    continue

                # Check if contact already exists
                existing_query = select(Contact).where(Contact.phone_number == phone_number)
                existing_contact = await session.scalar(existing_query)

                if existing_contact:
                    errors.append(f"Row {row_num}: Contact with phone {phone_number} already exists")
                    failed_count += 1
                    continue

                # Create contact
                contact = Contact(
                    phone_number=phone_number,
                    first_name=row.get('first_name', '').strip() or None,
                    last_name=row.get('last_name', '').strip() or None,
                    email=row.get('email', '').strip() or None,
                    metadata={}
                )

                session.add(contact)
                imported_count += 1

                # Commit in batches to avoid memory issues
                if imported_count % 100 == 0:
                    await session.commit()

            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
                failed_count += 1

        # Final commit
        await session.commit()

        logger.info("Contacts imported", imported=imported_count, failed=failed_count)

        return {
            "imported": imported_count,
            "failed": failed_count,
            "errors": errors[:50]  # Limit errors to avoid huge responses
        }

    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        logger.error("Error importing contacts", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to import contacts: {str(e)}"
        )


@router.get("/{contact_id}/calls")
async def get_contact_calls(
        contact_id: UUID,
        skip: int = Query(0, ge=0),
        limit: int = Query(50, ge=1, le=100),
        session: AsyncSession = Depends(get_db_session)
):
    """Get call history for a specific contact."""
    try:
        # First verify contact exists
        contact_query = select(Contact).where(Contact.id == contact_id)
        contact = await session.scalar(contact_query)

        if not contact:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Contact {contact_id} not found"
            )

        # Import here to avoid circular imports
        from ...core.database import Call

        # Get calls for this contact
        calls_query = select(Call).where(
            Call.contact_id == contact_id
        ).order_by(Call.created_at.desc()).offset(skip).limit(limit)

        result = await session.execute(calls_query)
        calls = result.scalars().all()

        # Convert to response format (you might want to create a CallResponse schema)
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
        logger.error("Error getting contact calls", contact_id=str(contact_id), error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get contact calls: {str(e)}"
        )


@router.get("/stats/overview")
async def get_contacts_stats(
        session: AsyncSession = Depends(get_db_session)
):
    """Get contacts overview statistics."""
    try:
        # Total contacts
        total_query = select(func.count(Contact.id))
        total_contacts = await session.scalar(total_query)

        # Contacts with calls
        from ...core.database import Call

        contacts_with_calls_query = select(func.count(func.distinct(Call.contact_id))).where(
            Call.contact_id.isnot(None)
        )
        contacts_with_calls = await session.scalar(contacts_with_calls_query) or 0

        # Recent contacts (last 7 days)
        from datetime import datetime, timedelta
        week_ago = datetime.utcnow() - timedelta(days=7)

        recent_contacts_query = select(func.count(Contact.id)).where(
            Contact.created_at >= week_ago
        )
        recent_contacts = await session.scalar(recent_contacts_query)

        return {
            "total_contacts": total_contacts,
            "contacts_with_calls": contacts_with_calls,
            "contacts_without_calls": total_contacts - contacts_with_calls,
            "recent_contacts": recent_contacts,
            "engagement_rate": round((contacts_with_calls / total_contacts) * 100, 2) if total_contacts > 0 else 0
        }

    except Exception as e:
        logger.error("Error getting contacts stats", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get contacts stats: {str(e)}"
        )