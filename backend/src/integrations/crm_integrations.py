"""CRM integration for contact and lead management."""

import asyncio
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
from datetime import datetime
import httpx

from ..utils.logger import LoggerMixin
from ..utils.exceptions import CRMError, IntegrationError


class BaseCRMIntegration(ABC, LoggerMixin):
    """Base class for CRM integrations."""

    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
        self.client = httpx.AsyncClient(timeout=30.0)

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()

    @abstractmethod
    async def get_contact(self, phone_number: str) -> Optional[Dict[str, Any]]:
        """Get contact information by phone number."""
        pass

    @abstractmethod
    async def create_contact(self, contact_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new contact."""
        pass

    @abstractmethod
    async def update_contact(self, contact_id: str, contact_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update existing contact."""
        pass

    @abstractmethod
    async def create_call_log(self, call_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create call log entry."""
        pass

    @abstractmethod
    async def health_check(self) -> bool:
        """Check if CRM API is accessible."""
        pass


class HubSpotIntegration(BaseCRMIntegration):
    """HubSpot CRM integration."""

    def __init__(self, api_key: str):
        super().__init__(api_key, "https://api.hubapi.com")
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    async def get_contact(self, phone_number: str) -> Optional[Dict[str, Any]]:
        """Get contact by phone number from HubSpot."""
        try:
            # Search for contact by phone
            search_url = f"{self.base_url}/crm/v3/objects/contacts/search"
            search_payload = {
                "filterGroups": [
                    {
                        "filters": [
                            {
                                "propertyName": "phone",
                                "operator": "EQ",
                                "value": phone_number
                            }
                        ]
                    }
                ],
                "properties": ["firstname", "lastname", "email", "phone", "company"]
            }

            response = await self.client.post(
                search_url,
                headers=self.headers,
                json=search_payload
            )
            response.raise_for_status()

            data = response.json()

            if data.get("results"):
                contact = data["results"][0]
                return {
                    "id": contact["id"],
                    "first_name": contact["properties"].get("firstname"),
                    "last_name": contact["properties"].get("lastname"),
                    "email": contact["properties"].get("email"),
                    "phone": contact["properties"].get("phone"),
                    "company": contact["properties"].get("company"),
                    "source": "hubspot"
                }

            return None

        except httpx.HTTPError as e:
            self.logger.error("HubSpot API error", error=str(e))
            raise CRMError(f"Failed to get contact from HubSpot: {str(e)}")

    async def create_contact(self, contact_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create contact in HubSpot."""
        try:
            url = f"{self.base_url}/crm/v3/objects/contacts"

            hubspot_properties = {
                "phone": contact_data.get("phone_number"),
                "firstname": contact_data.get("first_name"),
                "lastname": contact_data.get("last_name"),
                "email": contact_data.get("email"),
            }

            payload = {"properties": hubspot_properties}

            response = await self.client.post(
                url,
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()

            data = response.json()

            return {
                "id": data["id"],
                "created_at": data["createdAt"],
                "source": "hubspot"
            }

        except httpx.HTTPError as e:
            self.logger.error("Failed to create HubSpot contact", error=str(e))
            raise CRMError(f"Failed to create contact in HubSpot: {str(e)}")

    async def update_contact(self, contact_id: str, contact_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update contact in HubSpot."""
        try:
            url = f"{self.base_url}/crm/v3/objects/contacts/{contact_id}"

            hubspot_properties = {}
            if contact_data.get("first_name"):
                hubspot_properties["firstname"] = contact_data["first_name"]
            if contact_data.get("last_name"):
                hubspot_properties["lastname"] = contact_data["last_name"]
            if contact_data.get("email"):
                hubspot_properties["email"] = contact_data["email"]

            payload = {"properties": hubspot_properties}

            response = await self.client.patch(
                url,
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()

            return {"updated_at": datetime.utcnow().isoformat(), "source": "hubspot"}

        except httpx.HTTPError as e:
            self.logger.error("Failed to update HubSpot contact", error=str(e))
            raise CRMError(f"Failed to update contact in HubSpot: {str(e)}")

    async def create_call_log(self, call_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create call activity in HubSpot."""
        try:
            url = f"{self.base_url}/crm/v3/objects/calls"

            properties = {
                "hs_timestamp": call_data.get("started_at", datetime.utcnow().isoformat()),
                "hs_call_duration": str(call_data.get("duration_seconds", 0) * 1000),  # HubSpot uses milliseconds
                "hs_call_to_number": call_data.get("to_number"),
                "hs_call_from_number": call_data.get("from_number"),
                "hs_call_status": self._map_call_status(call_data.get("status")),
                "hs_call_body": call_data.get("conversation_summary", ""),
                "hs_call_direction": "OUTBOUND",
                "hs_call_disposition": call_data.get("intent_detected", ""),
            }

            payload = {"properties": properties}

            # Associate with contact if available
            if call_data.get("contact_id"):
                payload["associations"] = [
                    {
                        "to": {"id": call_data["contact_id"]},
                        "types": [{"associationCategory": "HUBSPOT_DEFINED", "associationTypeId": 194}]
                    }
                ]

            response = await self.client.post(
                url,
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()

            data = response.json()
            return {"id": data["id"], "created_at": data["createdAt"]}

        except httpx.HTTPError as e:
            self.logger.error("Failed to create HubSpot call log", error=str(e))
            raise CRMError(f"Failed to create call log in HubSpot: {str(e)}")

    def _map_call_status(self, status: str) -> str:
        """Map our call status to HubSpot call status."""
        status_mapping = {
            "completed": "COMPLETED",
            "no_answer": "NO_ANSWER",
            "busy": "BUSY",
            "failed": "FAILED",
            "canceled": "CANCELED"
        }
        return status_mapping.get(status, "COMPLETED")

    async def health_check(self) -> bool:
        """Check HubSpot API health."""
        try:
            response = await self.client.get(
                f"{self.base_url}/crm/v3/properties/contacts",
                headers=self.headers
            )
            return response.status_code == 200
        except Exception:
            return False


class SalesforceIntegration(BaseCRMIntegration):
    """Salesforce CRM integration."""

    def __init__(self, api_key: str, instance_url: str):
        super().__init__(api_key, instance_url)
        self.access_token = None
        self.headers = {"Content-Type": "application/json"}

    async def authenticate(self, client_id: str, client_secret: str, username: str, password: str):
        """Authenticate with Salesforce."""
        try:
            auth_url = f"{self.base_url}/services/oauth2/token"
            auth_data = {
                "grant_type": "password",
                "client_id": client_id,
                "client_secret": client_secret,
                "username": username,
                "password": password
            }

            response = await self.client.post(auth_url, data=auth_data)
            response.raise_for_status()

            auth_response = response.json()
            self.access_token = auth_response["access_token"]
            self.headers["Authorization"] = f"Bearer {self.access_token}"

        except httpx.HTTPError as e:
            self.logger.error("Salesforce authentication failed", error=str(e))
            raise CRMError(f"Failed to authenticate with Salesforce: {str(e)}")

    async def get_contact(self, phone_number: str) -> Optional[Dict[str, Any]]:
        """Get contact by phone number from Salesforce."""
        if not self.access_token:
            raise CRMError("Not authenticated with Salesforce")

        try:
            # Query contacts by phone
            query = f"SELECT Id, FirstName, LastName, Email, Phone, Account.Name FROM Contact WHERE Phone = '{phone_number}'"
            url = f"{self.base_url}/services/data/v58.0/query/?q={query}"

            response = await self.client.get(url, headers=self.headers)
            response.raise_for_status()

            data = response.json()

            if data.get("records"):
                contact = data["records"][0]
                return {
                    "id": contact["Id"],
                    "first_name": contact.get("FirstName"),
                    "last_name": contact.get("LastName"),
                    "email": contact.get("Email"),
                    "phone": contact.get("Phone"),
                    "company": contact.get("Account", {}).get("Name"),
                    "source": "salesforce"
                }

            return None

        except httpx.HTTPError as e:
            self.logger.error("Salesforce API error", error=str(e))
            raise CRMError(f"Failed to get contact from Salesforce: {str(e)}")

    async def create_contact(self, contact_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create contact in Salesforce."""
        if not self.access_token:
            raise CRMError("Not authenticated with Salesforce")

        try:
            url = f"{self.base_url}/services/data/v58.0/sobjects/Contact/"

            salesforce_data = {
                "Phone": contact_data.get("phone_number"),
                "FirstName": contact_data.get("first_name"),
                "LastName": contact_data.get("last_name"),
                "Email": contact_data.get("email"),
            }

            response = await self.client.post(
                url,
                headers=self.headers,
                json=salesforce_data
            )
            response.raise_for_status()

            data = response.json()
            return {
                "id": data["id"],
                "created_at": datetime.utcnow().isoformat(),
                "source": "salesforce"
            }

        except httpx.HTTPError as e:
            self.logger.error("Failed to create Salesforce contact", error=str(e))
            raise CRMError(f"Failed to create contact in Salesforce: {str(e)}")

    async def update_contact(self, contact_id: str, contact_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update contact in Salesforce."""
        if not self.access_token:
            raise CRMError("Not authenticated with Salesforce")

        try:
            url = f"{self.base_url}/services/data/v58.0/sobjects/Contact/{contact_id}"

            salesforce_data = {}
            if contact_data.get("first_name"):
                salesforce_data["FirstName"] = contact_data["first_name"]
            if contact_data.get("last_name"):
                salesforce_data["LastName"] = contact_data["last_name"]
            if contact_data.get("email"):
                salesforce_data["Email"] = contact_data["email"]

            response = await self.client.patch(
                url,
                headers=self.headers,
                json=salesforce_data
            )
            response.raise_for_status()

            return {"updated_at": datetime.utcnow().isoformat(), "source": "salesforce"}

        except httpx.HTTPError as e:
            self.logger.error("Failed to update Salesforce contact", error=str(e))
            raise CRMError(f"Failed to update contact in Salesforce: {str(e)}")

    async def create_call_log(self, call_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create task record for call in Salesforce."""
        if not self.access_token:
            raise CRMError("Not authenticated with Salesforce")

        try:
            url = f"{self.base_url}/services/data/v58.0/sobjects/Task/"

            task_data = {
                "Subject": f"Phone Call - {call_data.get('to_number')}",
                "ActivityDate": call_data.get("started_at", datetime.utcnow().isoformat())[:10],
                "Status": "Completed",
                "Priority": "Normal",
                "Description": call_data.get("conversation_summary", ""),
                "CallDurationInSeconds": call_data.get("duration_seconds", 0),
                "CallType": "Outbound",
                "CallDisposition": call_data.get("intent_detected", ""),
            }

            # Associate with contact if available
            if call_data.get("contact_id"):
                task_data["WhoId"] = call_data["contact_id"]

            response = await self.client.post(
                url,
                headers=self.headers,
                json=task_data
            )
            response.raise_for_status()

            data = response.json()
            return {"id": data["id"], "created_at": datetime.utcnow().isoformat()}

        except httpx.HTTPError as e:
            self.logger.error("Failed to create Salesforce call log", error=str(e))
            raise CRMError(f"Failed to create call log in Salesforce: {str(e)}")

    async def health_check(self) -> bool:
        """Check Salesforce API health."""
        if not self.access_token:
            return False
        try:
            response = await self.client.get(
                f"{self.base_url}/services/data/v58.0/sobjects/",
                headers=self.headers
            )
            return response.status_code == 200
        except Exception:
            return False


class CRMManager(LoggerMixin):
    """Manager for CRM integrations."""

    def __init__(self):
        self.integrations: Dict[str, BaseCRMIntegration] = {}

    def register_integration(self, name: str, integration: BaseCRMIntegration):
        """Register a CRM integration."""
        self.integrations[name] = integration
        self.logger.info(f"CRM integration registered: {name}")

    async def get_contact_from_all_crms(self, phone_number: str) -> Optional[Dict[str, Any]]:
        """Try to find contact in all registered CRMs."""
        for name, crm in self.integrations.items():
            try:
                contact = await crm.get_contact(phone_number)
                if contact:
                    self.logger.info(f"Contact found in {name}", phone_number=phone_number)
                    return contact
            except Exception as e:
                self.logger.error(f"Error searching {name} for contact", error=str(e))

        return None

    async def sync_call_to_crms(self, call_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Sync call data to all CRMs."""
        results = []

        for name, crm in self.integrations.items():
            try:
                result = await crm.create_call_log(call_data)
                result["crm"] = name
                results.append(result)
                self.logger.info(f"Call synced to {name}", call_id=call_data.get("id"))
            except Exception as e:
                self.logger.error(f"Failed to sync call to {name}", error=str(e))
                results.append({"crm": name, "error": str(e)})

        return results

    async def health_check_all(self) -> Dict[str, bool]:
        """Health check all CRM integrations."""
        results = {}

        for name, crm in self.integrations.items():
            try:
                results[name] = await crm.health_check()
            except Exception as e:
                self.logger.error(f"Health check failed for {name}", error=str(e))
                results[name] = False

        return results


# Global CRM manager instance
crm_manager = CRMManager()