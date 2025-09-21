"""OpenAI Text-to-Speech implementation."""

import asyncio
import tempfile
from typing import Optional, Dict, Any, AsyncGenerator, Literal
from pathlib import Path
import io

from openai import AsyncOpenAI
import httpx

from ..utils.config import get_settings
from ..utils.logger import LoggerMixin
from ..utils.exceptions import TTSError

settings = get_settings()


class OpenAITTS(LoggerMixin):
    """OpenAI Text-to-Speech service for human-like voice generation."""

    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.external_apis.openai_api_key)
        self.model = "tts-1-hd"  # High-definition model for better quality

        # Available voices - these sound very human-like
        self.voices = {
            'alloy': 'Neutral, balanced voice',
            'echo': 'Male, clear and professional',
            'fable': 'British accent, storytelling',
            'onyx': 'Deep male voice, authoritative',
            'nova': 'Young female, energetic',
            'shimmer': 'Soft female, gentle and warm'
        }

    async def synthesize_speech(
            self,
            text: str,
            voice: Literal["alloy", "echo", "fable", "onyx", "nova", "shimmer"] = "nova",
            response_format: Literal["mp3", "opus", "aac", "flac", "wav", "pcm"] = "mp3",
            speed: float = 1.0
    ) -> bytes:
        """
        Generate speech from text using OpenAI TTS.

        Args:
            text: Text to convert to speech
            voice: Voice model to use
            response_format: Audio format
            speed: Speech speed (0.25 to 4.0)

        Returns:
            Audio data as bytes
        """
        try:
            # Validate inputs
            if not text.strip():
                raise TTSError("Text cannot be empty")

            if len(text) > 4096:
                self.logger.warning("Text truncated to 4096 characters")
                text = text[:4096]

            if not 0.25 <= speed <= 4.0:
                speed = max(0.25, min(4.0, speed))

            # Generate speech
            response = await self.client.audio.speech.create(
                model=self.model,
                voice=voice,
                input=text,
                response_format=response_format,
                speed=speed
            )

            # Get audio data
            audio_data = b""
            async for chunk in response.iter_bytes():
                audio_data += chunk

            self.logger.info(
                "Speech synthesized successfully",
                text_length=len(text),
                voice=voice,
                format=response_format,
                audio_size=len(audio_data)
            )

            return audio_data

        except Exception as e:
            self.logger.error("Speech synthesis failed", error=str(e), text=text[:50])
            raise TTSError(f"Failed to synthesize speech: {str(e)}")

    async def synthesize_streaming(
            self,
            text: str,
            voice: Literal["alloy", "echo", "fable", "onyx", "nova", "shimmer"] = "nova",
            chunk_size: int = 1024
    ) -> AsyncGenerator[bytes, None]:
        """
        Generate streaming speech for real-time playback.

        Args:
            text: Text to convert to speech
            voice: Voice model to use
            chunk_size: Size of audio chunks to yield

        Yields:
            Audio chunks as bytes
        """
        try:
            response = await self.client.audio.speech.create(
                model=self.model,
                voice=voice,
                input=text,
                response_format="mp3",  # Good for streaming
                speed=1.0
            )

            self.logger.info("Starting streaming speech synthesis", text_length=len(text))

            async for chunk in response.iter_bytes(chunk_size):
                yield chunk

        except Exception as e:
            self.logger.error("Streaming speech synthesis failed", error=str(e))
            raise TTSError(f"Streaming synthesis failed: {str(e)}")

    async def synthesize_with_emotions(
            self,
            text: str,
            emotion: str = "neutral",
            voice: str = "nova",
            speed: float = 1.0
    ) -> bytes:
        """
        Synthesize speech with emotional context using prompt engineering.

        Args:
            text: Text to speak
            emotion: Emotion to convey (happy, sad, excited, calm, etc.)
            voice: Voice model
            speed: Speech speed

        Returns:
            Audio data with emotional inflection
        """
        # Add emotional context to the text
        emotional_prompts = {
            "happy": "Say this with joy and enthusiasm: ",
            "sad": "Say this with a gentle, sorrowful tone: ",
            "excited": "Say this with high energy and excitement: ",
            "calm": "Say this in a peaceful, relaxed manner: ",
            "professional": "Say this in a clear, professional tone: ",
            "friendly": "Say this in a warm, friendly way: ",
            "urgent": "Say this with urgency and importance: ",
            "empathetic": "Say this with compassion and understanding: "
        }

        prompt = emotional_prompts.get(emotion.lower(), "")
        enhanced_text = f"{prompt}{text}" if prompt else text

        return await self.synthesize_speech(
            text=enhanced_text,
            voice=voice,
            speed=speed
        )

    async def synthesize_conversation_chunks(
            self,
            conversation_parts: list[Dict[str, Any]],
            voice: str = "nova"
    ) -> Dict[str, bytes]:
        """
        Synthesize multiple parts of a conversation with appropriate pacing.

        Args:
            conversation_parts: List of conversation segments with metadata
            voice: Voice to use

        Returns:
            Dictionary mapping part IDs to audio data
        """
        results = {}

        try:
            for i, part in enumerate(conversation_parts):
                text = part.get('text', '')
                emotion = part.get('emotion', 'neutral')
                speed = part.get('speed', 1.0)
                pause_before = part.get('pause_before', 0)

                # Add natural pauses for conversation flow
                if pause_before > 0:
                    silence_text = "..." * max(1, pause_before // 500)  # Rough pause
                    text = f"{silence_text} {text}"

                audio_data = await self.synthesize_with_emotions(
                    text=text,
                    emotion=emotion,
                    voice=voice,
                    speed=speed
                )

                results[f"part_{i}"] = audio_data

            self.logger.info("Conversation chunks synthesized", parts_count=len(results))
            return results

        except Exception as e:
            self.logger.error("Conversation synthesis failed", error=str(e))
            raise TTSError(f"Conversation synthesis failed: {str(e)}")

    async def get_speech_duration(self, text: str, voice: str = "nova", speed: float = 1.0) -> float:
        """
        Estimate speech duration without generating audio.

        Args:
            text: Text to estimate
            voice: Voice model
            speed: Speech speed

        Returns:
            Estimated duration in seconds
        """
        try:
            # Rough estimation: average speaking rate is ~150 words per minute
            word_count = len(text.split())
            base_duration = (word_count / 150) * 60  # Convert to seconds

            # Adjust for speed
            estimated_duration = base_duration / speed

            # Add buffer for natural pauses and pronunciation
            estimated_duration *= 1.2

            return max(1.0, estimated_duration)  # Minimum 1 second

        except Exception:
            return 5.0  # Default fallback

    async def save_audio_to_file(
            self,
            audio_data: bytes,
            filename: str,
            format: str = "mp3"
    ) -> Path:
        """
        Save audio data to file.

        Args:
            audio_data: Audio bytes
            filename: Output filename
            format: Audio format

        Returns:
            Path to saved file
        """
        try:
            file_path = Path(filename)
            file_path.parent.mkdir(parents=True, exist_ok=True)

            with open(file_path, 'wb') as f:
                f.write(audio_data)

            self.logger.info("Audio saved to file", filepath=str(file_path), size=len(audio_data))
            return file_path

        except Exception as e:
            self.logger.error("Failed to save audio file", error=str(e))
            raise TTSError(f"Failed to save audio: {str(e)}")

    async def create_audio_response_for_twilio(
            self,
            text: str,
            voice: str = "nova",
            emotion: str = "friendly"
    ) -> str:
        """
        Create audio response optimized for Twilio phone calls.

        Args:
            text: Text to speak
            voice: Voice model
            emotion: Emotional tone

        Returns:
            URL to audio file for Twilio playback
        """
        try:
            # Generate audio optimized for phone calls
            audio_data = await self.synthesize_with_emotions(
                text=text,
                emotion=emotion,
                voice=voice,
                speed=0.9  # Slightly slower for phone clarity
            )

            # Save to temporary file (in production, upload to S3 or similar)
            temp_file = tempfile.NamedTemporaryFile(
                suffix='.mp3',
                delete=False,
                prefix='tts_'
            )

            temp_file.write(audio_data)
            temp_file.close()

            # In production, you'd upload this to a CDN and return the public URL
            # For now, return the local file path
            file_url = f"file://{temp_file.name}"

            self.logger.info(
                "Audio response created for Twilio",
                text_length=len(text),
                file_url=file_url
            )

            return file_url

        except Exception as e:
            self.logger.error("Failed to create Twilio audio response", error=str(e))
            raise TTSError(f"Failed to create audio response: {str(e)}")

    def get_voice_info(self) -> Dict[str, str]:
        """Get information about available voices."""
        return self.voices.copy()

    async def health_check(self) -> bool:
        """Check if OpenAI TTS service is available."""
        try:
            # Test with minimal text
            test_audio = await self.synthesize_speech(
                text="Hello",
                voice="nova"
            )
            return len(test_audio) > 0

        except Exception as e:
            self.logger.error("TTS health check failed", error=str(e))
            return False


# Global TTS instance
openai_tts = OpenAITTS()