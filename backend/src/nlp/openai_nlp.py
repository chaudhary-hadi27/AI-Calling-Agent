"""OpenAI NLP agent brain for conversational AI."""

import asyncio
import json
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
from enum import Enum

from openai import AsyncOpenAI
import tiktoken

from ..utils.config import get_settings
from ..utils.logger import LoggerMixin
from ..utils.exceptions import NLPError, LLMError

settings = get_settings()


class ConversationState(str, Enum):
    """Conversation state machine."""
    GREETING = "greeting"
    LISTENING = "listening"
    PROCESSING = "processing"
    RESPONDING = "responding"
    CLARIFYING = "clarifying"
    CLOSING = "closing"
    ENDED = "ended"
    ERROR = "error"


class IntentType(str, Enum):
    """Detected intent types."""
    GREETING = "greeting"
    QUESTION = "question"
    REQUEST = "request"
    COMPLAINT = "complaint"
    COMPLIMENT = "compliment"
    GOODBYE = "goodbye"
    UNCLEAR = "unclear"
    INTERRUPTION = "interruption"
    HOLD_REQUEST = "hold_request"
    TRANSFER_REQUEST = "transfer_request"


class OpenAINLP(LoggerMixin):
    """OpenAI-powered NLP agent for human-like conversations."""

    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.external_apis.openai_api_key)
        self.model = "gpt-4"  # Use GPT-4 for better conversation quality
        self.encoding = tiktoken.encoding_for_model(self.model)
        self.max_tokens = 8192
        self.conversation_memory = {}  # Store conversation context per call

        # System prompts for different conversation scenarios
        self.system_prompts = {
            "sales": """You are a professional, friendly sales representative making outbound calls. 
Your goal is to have natural, helpful conversations while being respectful of people's time.
- Be conversational and human-like
- Listen actively and respond appropriately
- Handle objections professionally
- Know when to gracefully end the conversation
- Keep responses concise but engaging""",

            "support": """You are a helpful customer support agent making follow-up calls.
- Be empathetic and solution-focused  
- Ask clarifying questions when needed
- Provide clear, actionable information
- Maintain a professional yet warm tone
- Escalate complex issues appropriately""",

            "appointment": """You are calling to schedule or confirm appointments.
- Be clear about the purpose of your call
- Offer flexible scheduling options
- Confirm details accurately
- Handle scheduling conflicts professionally
- Thank people for their time"""
        }

    async def process_conversation_turn(
            self,
            call_id: str,
            user_input: str,
            context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process a conversation turn and generate appropriate response.

        Args:
            call_id: Unique call identifier
            user_input: What the user said (from STT)
            context: Additional context (contact info, campaign, etc.)

        Returns:
            Response containing text, intent, emotion, and next actions
        """
        try:
            # Get or initialize conversation memory
            conversation = self._get_conversation_memory(call_id)

            # Add user input to conversation history
            conversation['messages'].append({
                "role": "user",
                "content": user_input,
                "timestamp": datetime.utcnow().isoformat()
            })

            # Detect intent and sentiment
            intent_data = await self._analyze_intent(user_input, conversation)

            # Generate contextual response
            response_data = await self._generate_response(
                call_id=call_id,
                conversation=conversation,
                intent_data=intent_data,
                context=context
            )

            # Update conversation state
            conversation['state'] = response_data.get('next_state', ConversationState.LISTENING)
            conversation['turn_count'] += 1
            conversation['last_activity'] = datetime.utcnow().isoformat()

            # Add assistant response to memory
            conversation['messages'].append({
                "role": "assistant",
                "content": response_data['text'],
                "timestamp": datetime.utcnow().isoformat()
            })

            self.logger.info(
                "Conversation turn processed",
                call_id=call_id,
                intent=intent_data['intent'],
                sentiment=intent_data['sentiment'],
                response_length=len(response_data['text'])
            )

            return {
                **response_data,
                'intent': intent_data['intent'],
                'sentiment': intent_data['sentiment'],
                'confidence': intent_data['confidence'],
                'conversation_state': conversation['state']
            }

        except Exception as e:
            self.logger.error("Error processing conversation turn", error=str(e))
            return self._generate_error_response()

    async def _analyze_intent(
            self,
            user_input: str,
            conversation: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze user intent and sentiment."""
        try:
            analysis_prompt = f"""
Analyze this user input in the context of a phone conversation:

User said: "{user_input}"

Conversation context: {len(conversation['messages'])} previous messages

Provide analysis in this JSON format:
{{
    "intent": "one of: {', '.join([i.value for i in IntentType])}",
    "sentiment": "positive/negative/neutral",
    "confidence": 0.0-1.0,
    "key_entities": ["list", "of", "key", "entities"],
    "urgency": "low/medium/high",
    "needs_clarification": true/false,
    "suggested_actions": ["action1", "action2"]
}}
"""

            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",  # Faster model for analysis
                messages=[{"role": "user", "content": analysis_prompt}],
                temperature=0.1,
                max_tokens=300
            )

            analysis_text = response.choices[0].message.content
            return json.loads(analysis_text)

        except Exception as e:
            self.logger.warning("Intent analysis failed", error=str(e))
            return {
                "intent": IntentType.UNCLEAR,
                "sentiment": "neutral",
                "confidence": 0.5,
                "key_entities": [],
                "urgency": "medium",
                "needs_clarification": True,
                "suggested_actions": ["ask_clarification"]
            }

    async def _generate_response(
            self,
            call_id: str,
            conversation: Dict[str, Any],
            intent_data: Dict[str, Any],
            context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate contextual response using GPT-4."""
        try:
            # Build system prompt based on context
            campaign_type = context.get('campaign_type', 'sales') if context else 'sales'
            system_prompt = self.system_prompts.get(campaign_type, self.system_prompts['sales'])

            # Add context information
            if context:
                contact_name = context.get('contact_name', '')
                if contact_name:
                    system_prompt += f"\n\nYou are speaking with {contact_name}."

                if context.get('previous_calls'):
                    system_prompt += "\nThis person has been contacted before. Be mindful of their history."

            # Build conversation messages for GPT-4
            messages = [{"role": "system", "content": system_prompt}]

            # Add recent conversation history (last 10 messages to stay within token limits)
            recent_messages = conversation['messages'][-10:]
            messages.extend([
                {"role": msg["role"], "content": msg["content"]}
                for msg in recent_messages
            ])

            # Add intent context
            intent_context = f"""
Current analysis:
- Intent: {intent_data['intent']}
- Sentiment: {intent_data['sentiment']}  
- Urgency: {intent_data['urgency']}
- Needs clarification: {intent_data['needs_clarification']}

Respond appropriately to this intent while maintaining natural conversation flow.
Keep your response conversational and under 100 words.
"""

            messages.append({"role": "system", "content": intent_context})

            # Generate response
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,  # Balanced creativity and consistency
                max_tokens=200,  # Keep responses concise for phone calls
                presence_penalty=0.1,
                frequency_penalty=0.1
            )

            response_text = response.choices[0].message.content.strip()

            # Determine emotional tone and next state
            emotion = self._determine_emotion(intent_data, response_text)
            next_state = self._determine_next_state(intent_data, conversation)

            return {
                'text': response_text,
                'emotion': emotion,
                'next_state': next_state,
                'should_transfer': intent_data['intent'] == IntentType.TRANSFER_REQUEST,
                'should_end_call': intent_data['intent'] == IntentType.GOODBYE,
                'confidence': 0.9,
                'response_type': 'conversational'
            }

        except Exception as e:
            self.logger.error("Response generation failed", error=str(e))
            raise LLMError(f"Failed to generate response: {str(e)}")

    def _get_conversation_memory(self, call_id: str) -> Dict[str, Any]:
        """Get or initialize conversation memory for a call."""
        if call_id not in self.conversation_memory:
            self.conversation_memory[call_id] = {
                'call_id': call_id,
                'messages': [],
                'state': ConversationState.GREETING,
                'turn_count': 0,
                'started_at': datetime.utcnow().isoformat(),
                'last_activity': datetime.utcnow().isoformat(),
                'context': {}
            }
        return self.conversation_memory[call_id]

    def _determine_emotion(
            self,
            intent_data: Dict[str, Any],
            response_text: str
    ) -> str:
        """Determine appropriate emotional tone for TTS."""
        intent = intent_data['intent']
        sentiment = intent_data['sentiment']

        emotion_mapping = {
            IntentType.GREETING: "friendly",
            IntentType.QUESTION: "helpful",
            IntentType.REQUEST: "professional",
            IntentType.COMPLAINT: "empathetic",
            IntentType.COMPLIMENT: "happy",
            IntentType.GOODBYE: "friendly",
            IntentType.UNCLEAR: "patient"
        }

        base_emotion = emotion_mapping.get(intent, "neutral")

        # Adjust for sentiment
        if sentiment == "negative" and base_emotion == "friendly":
            base_emotion = "empathetic"
        elif sentiment == "positive":
            base_emotion = "happy"

        return base_emotion

    def _determine_next_state(
            self,
            intent_data: Dict[str, Any],
            conversation: Dict[str, Any]
    ) -> ConversationState:
        """Determine next conversation state."""
        intent = intent_data['intent']
        current_state = conversation.get('state', ConversationState.GREETING)

        state_transitions = {
            IntentType.GREETING: ConversationState.LISTENING,
            IntentType.GOODBYE: ConversationState.CLOSING,
            IntentType.TRANSFER_REQUEST: ConversationState.CLOSING,
            IntentType.UNCLEAR: ConversationState.CLARIFYING
        }

        return state_transitions.get(intent, ConversationState.LISTENING)

    def _generate_error_response(self) -> Dict[str, Any]:
        """Generate fallback response for errors."""
        return {
            'text': "I apologize, I'm having trouble understanding. Could you please repeat that?",
            'emotion': 'apologetic',
            'next_state': ConversationState.LISTENING,
            'should_transfer': False,
            'should_end_call': False,
            'confidence': 0.3,
            'response_type': 'error_recovery'
        }

    async def initialize_conversation(
            self,
            call_id: str,
            context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Initialize a new conversation with greeting."""
        try:
            conversation = self._get_conversation_memory(call_id)
            conversation['context'] = context or {}

            # Generate personalized greeting
            contact_name = context.get('contact_name', '') if context else ''
            campaign_type = context.get('campaign_type', 'sales') if context else 'sales'

            greeting_prompts = {
                'sales': f"Generate a friendly, professional greeting for a sales call{f' to {contact_name}' if contact_name else ''}. Keep it under 50 words.",
                'support': f"Generate a helpful greeting for a support follow-up call{f' to {contact_name}' if contact_name else ''}. Keep it under 50 words.",
                'appointment': f"Generate a polite greeting for an appointment confirmation call{f' to {contact_name}' if contact_name else ''}. Keep it under 50 words."
            }

            greeting_prompt = greeting_prompts.get(campaign_type, greeting_prompts['sales'])

            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": greeting_prompt}],
                temperature=0.7,
                max_tokens=100
            )

            greeting_text = response.choices[0].message.content.strip()

            # Add to conversation memory
            conversation['messages'].append({
                "role": "assistant",
                "content": greeting_text,
                "timestamp": datetime.utcnow().isoformat()
            })

            conversation['state'] = ConversationState.LISTENING

            return {
                'text': greeting_text,
                'emotion': 'friendly',
                'next_state': ConversationState.LISTENING,
                'should_transfer': False,
                'should_end_call': False,
                'confidence': 0.9,
                'response_type': 'greeting'
            }

        except Exception as e:
            self.logger.error("Failed to initialize conversation", error=str(e))
            return {
                'text': "Hello! How can I help you today?",
                'emotion': 'friendly',
                'next_state': ConversationState.LISTENING,
                'should_transfer': False,
                'should_end_call': False,
                'confidence': 0.7,
                'response_type': 'fallback_greeting'
            }

    async def end_conversation(self, call_id: str, reason: str = "normal") -> Dict[str, Any]:
        """Generate appropriate conversation ending."""
        try:
            conversation = self.conversation_memory.get(call_id, {})

            ending_prompt = f"""
Generate a polite, professional call ending for this reason: {reason}

Context: This was a {conversation.get('turn_count', 0)} turn conversation.

Keep it under 30 words and sound natural.
"""

            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": ending_prompt}],
                temperature=0.5,
                max_tokens=50
            )

            ending_text = response.choices[0].message.content.strip()

            # Clean up conversation memory
            if call_id in self.conversation_memory:
                del self.conversation_memory[call_id]

            return {
                'text': ending_text,
                'emotion': 'friendly',
                'next_state': ConversationState.ENDED,
                'should_transfer': False,
                'should_end_call': True,
                'confidence': 0.9,
                'response_type': 'ending'
            }

        except Exception as e:
            self.logger.error("Failed to end conversation", error=str(e))
            return {
                'text': "Thank you for your time. Have a great day!",
                'emotion': 'friendly',
                'next_state': ConversationState.ENDED,
                'should_transfer': False,
                'should_end_call': True,
                'confidence': 0.7,
                'response_type': 'fallback_ending'
            }

    async def get_conversation_summary(self, call_id: str) -> Optional[Dict[str, Any]]:
        """Generate conversation summary for records."""
        try:
            conversation = self.conversation_memory.get(call_id)
            if not conversation:
                return None

            messages_text = "\n".join([
                f"{msg['role']}: {msg['content']}"
                for msg in conversation['messages']
            ])

            summary_prompt = f"""
Summarize this phone conversation:

{messages_text}

Provide summary in JSON format:
{{
    "outcome": "successful/unsuccessful/partial",
    "key_points": ["point1", "point2"],
    "customer_sentiment": "positive/negative/neutral",
    "next_actions": ["action1", "action2"],
    "duration_turns": {conversation['turn_count']},
    "notes": "brief summary"
}}
"""

            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": summary_prompt}],
                temperature=0.1,
                max_tokens=300
            )

            summary_text = response.choices[0].message.content
            return json.loads(summary_text)

        except Exception as e:
            self.logger.error("Failed to generate conversation summary", error=str(e))
            return None

    async def health_check(self) -> bool:
        """Check if OpenAI NLP service is available."""
        try:
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": "Hello"}],
                max_tokens=10
            )
            return len(response.choices) > 0

        except Exception as e:
            self.logger.error("NLP health check failed", error=str(e))
            return False


# Global NLP instance
openai_nlp = OpenAINLP()