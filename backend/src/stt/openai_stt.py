"""OpenAI Whisper Speech-to-Text implementation."""

import asyncio
import tempfile
from typing import Optional, Dict, Any
from pathlib import Path

import httpx
import openai
from openai import AsyncOpenAI

from ..utils.config import get_settings
from ..utils.logger import LoggerMixin
from ..utils.exceptions import STTError

settings = get_settings()


class OpenAISTT(LoggerMixin):
    """OpenAI Whisper Speech-to-Text service."""

    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.external_apis.openai_api_key)
        self.model = "whisper-1"

    async def transcribe_audio(
            self,
            audio_data: bytes,
            language: Optional[str] = None,
            prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Transcribe audio using OpenAI Whisper.

        Args:
            audio_data: Raw audio bytes
            language: Language hint (e.g., 'en', 'es')
            prompt: Context prompt to guide transcription

        Returns:
            Transcription result with text and confidence
        """
        try:
            # Create temporary file for audio data
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                temp_file.write(audio_data)
                temp_file.flush()

                # Transcribe using OpenAI Whisper
                with open(temp_file.name, 'rb') as audio_file:
                    transcript = await self.client.audio.transcriptions.create(
                        model=self.model,
                        file=audio_file,
                        language=language,
                        prompt=prompt,
                        response_format="verbose_json",  # Get detailed response
                        temperature=0.0,  # Deterministic output
                    )

                # Clean up temp file
                Path(temp_file.name).unlink()

            # Extract text and metadata
            result = {
                'text': transcript.text.strip(),
                'language': getattr(transcript, 'language', language),
                'duration': getattr(transcript, 'duration', None),
                'segments': getattr(transcript, 'segments', []),
                'confidence': self._calculate_confidence(transcript),
                'words': getattr(transcript, 'words', [])
            }

            self.logger.info(
                "Audio transcribed successfully",
                text_length=len(result['text']),
                language=result['language'],
                confidence=result['confidence']
            )

            return result

        except openai.APIError as e:
            self.logger.error("OpenAI API error during transcription", error=str(e))
            raise STTError(f"OpenAI transcription failed: {str(e)}")

        except Exception as e:
            self.logger.error("Unexpected error during transcription", error=str(e))
            raise STTError(f"Transcription failed: {str(e)}")

    async def transcribe_from_url(
            self,
            audio_url: str,
            language: Optional[str] = None,
            prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Transcribe audio from URL.

        Args:
            audio_url: URL to audio file
            language: Language hint
            prompt: Context prompt

        Returns:
            Transcription result
        """
        try:
            # Download audio file
            async with httpx.AsyncClient() as client:
                response = await client.get(audio_url)
                response.raise_for_status()
                audio_data = response.content

            return await self.transcribe_audio(audio_data, language, prompt)

        except httpx.HTTPError as e:
            self.logger.error("Failed to download audio from URL", url=audio_url, error=str(e))
            raise STTError(f"Failed to download audio: {str(e)}")

    async def transcribe_streaming(
            self,
            audio_stream,
            language: Optional[str] = None,
            chunk_duration: int = 30
    ):
        """
        Transcribe streaming audio in chunks.

        Args:
            audio_stream: Audio stream generator
            language: Language hint
            chunk_duration: Duration of each chunk in seconds

        Yields:
            Partial transcription results
        """
        buffer = b''

        try:
            async for audio_chunk in audio_stream:
                buffer += audio_chunk

                # Process when buffer reaches target duration
                if len(buffer) >= chunk_duration * 16000 * 2:  # Assuming 16kHz, 16-bit
                    try:
                        result = await self.transcribe_audio(buffer, language)
                        yield result
                        buffer = b''
                    except STTError as e:
                        self.logger.warning("Failed to transcribe chunk", error=str(e))
                        continue

            # Process remaining buffer
            if buffer:
                try:
                    result = await self.transcribe_audio(buffer, language)
                    yield result
                except STTError as e:
                    self.logger.warning("Failed to transcribe final chunk", error=str(e))

        except Exception as e:
            self.logger.error("Error in streaming transcription", error=str(e))
            raise STTError(f"Streaming transcription failed: {str(e)}")

    def _calculate_confidence(self, transcript) -> float:
        """
        Calculate average confidence from Whisper segments.

        Args:
            transcript: Whisper transcript response

        Returns:
            Average confidence score (0.0 to 1.0)
        """
        try:
            segments = getattr(transcript, 'segments', [])
            if not segments:
                return 0.8  # Default confidence for simple transcriptions

            confidences = []
            for segment in segments:
                # Whisper provides avg_logprob and no_speech_prob
                avg_logprob = getattr(segment, 'avg_logprob', -0.5)
                no_speech_prob = getattr(segment, 'no_speech_prob', 0.1)

                # Convert log probability to confidence (rough approximation)
                confidence = max(0.0, min(1.0, (avg_logprob + 1.0) * (1.0 - no_speech_prob)))
                confidences.append(confidence)

            return sum(confidences) / len(confidences) if confidences else 0.8

        except Exception:
            return 0.8  # Default confidence

    async def detect_language(self, audio_data: bytes) -> str:
        """
        Detect language from audio data.

        Args:
            audio_data: Raw audio bytes

        Returns:
            Detected language code
        """
        try:
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                temp_file.write(audio_data)
                temp_file.flush()

                with open(temp_file.name, 'rb') as audio_file:
                    transcript = await self.client.audio.transcriptions.create(
                        model=self.model,
                        file=audio_file,
                        response_format="verbose_json"
                    )

                Path(temp_file.name).unlink()

            detected_language = getattr(transcript, 'language', 'en')

            self.logger.info("Language detected", language=detected_language)

            return detected_language

        except Exception as e:
            self.logger.warning("Language detection failed", error=str(e))
            return 'en'  # Default to English

    async def health_check(self) -> bool:
        """Check if OpenAI STT service is available."""
        try:
            # Test with a small silent audio file
            silent_audio = b'\x00' * 1600  # 0.1 seconds of silence at 16kHz

            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                # Write WAV header + silent audio
                temp_file.write(self._create_wav_header(len(silent_audio)))
                temp_file.write(silent_audio)
                temp_file.flush()

                with open(temp_file.name, 'rb') as audio_file:
                    await self.client.audio.transcriptions.create(
                        model=self.model,
                        file=audio_file,
                        response_format="text"
                    )

                Path(temp_file.name).unlink()

            return True

        except Exception as e:
            self.logger.error("STT health check failed", error=str(e))
            return False

    def _create_wav_header(self, data_length: int, sample_rate: int = 16000) -> bytes:
        """Create WAV file header."""
        return (
                b'RIFF' +
                (data_length + 36).to_bytes(4, 'little') +
                b'WAVE' +
                b'fmt ' +
                (16).to_bytes(4, 'little') +
                (1).to_bytes(2, 'little') +  # PCM format
                (1).to_bytes(2, 'little') +  # Mono
                sample_rate.to_bytes(4, 'little') +
                (sample_rate * 2).to_bytes(4, 'little') +
                (2).to_bytes(2, 'little') +
                (16).to_bytes(2, 'little') +
                b'data' +
                data_length.to_bytes(4, 'little')
        )


# Global STT instance
openai_stt = OpenAISTT()