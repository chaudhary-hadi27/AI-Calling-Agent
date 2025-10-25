"""Email service for sending verification codes and notifications."""

import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import random
import string

from ..utils.config import get_settings
from ..utils.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()


class EmailService:
    """Email service for Zoho Mail."""

    def __init__(self):
        self.smtp_host = settings.smtp.host
        self.smtp_port = settings.smtp.port
        self.smtp_user = settings.smtp.user
        self.smtp_password = settings.smtp.password
        self.from_email = settings.smtp.from_email
        self.from_name = settings.smtp.from_name

    async def send_email(
            self,
            to_email: str,
            subject: str,
            html_body: str,
            text_body: Optional[str] = None
    ) -> bool:
        """Send email via SMTP (Zoho Mail)."""
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{self.from_name} <{self.from_email}>"
            message["To"] = to_email

            # Add text and HTML parts
            if text_body:
                part1 = MIMEText(text_body, "plain")
                message.attach(part1)

            part2 = MIMEText(html_body, "html")
            message.attach(part2)

            # Send email based on port configuration
            if self.smtp_port == 587:
                # Port 587 - STARTTLS (Recommended for Zoho)
                await aiosmtplib.send(
                    message,
                    hostname=self.smtp_host,
                    port=self.smtp_port,
                    username=self.smtp_user,
                    password=self.smtp_password,
                    start_tls=True,
                    use_tls=False
                )
            elif self.smtp_port == 465:
                # Port 465 - SSL/TLS (Alternative)
                await aiosmtplib.send(
                    message,
                    hostname=self.smtp_host,
                    port=self.smtp_port,
                    username=self.smtp_user,
                    password=self.smtp_password,
                    start_tls=False,
                    use_tls=True
                )
            else:
                # Other ports - default
                await aiosmtplib.send(
                    message,
                    hostname=self.smtp_host,
                    port=self.smtp_port,
                    username=self.smtp_user,
                    password=self.smtp_password
                )

            logger.info("Email sent successfully", to=to_email, subject=subject)
            return True

        except Exception as e:
            logger.error("Failed to send email", to=to_email, error=str(e))
            return False

    def generate_verification_code(self, length: int = 6) -> str:
        """Generate random 6-digit verification code."""
        return ''.join(random.choices(string.digits, k=length))

    async def send_verification_code(
            self,
            email: str,
            code: str,
            user_name: Optional[str] = None
    ) -> bool:
        """Send email verification code."""

        subject = "Verify Your Email - Smartkode AI"

        # HTML email template
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }}
                .container {{
                    max-width: 600px;
                    margin: 40px auto;
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }}
                .header {{
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    padding: 40px 20px;
                    text-align: center;
                }}
                .content {{
                    padding: 40px 30px;
                }}
                .code-box {{
                    background: #f0f9ff;
                    border: 2px solid #3b82f6;
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                    margin: 30px 0;
                }}
                .code {{
                    font-size: 36px;
                    font-weight: bold;
                    color: #2563eb;
                    letter-spacing: 8px;
                    font-family: 'Courier New', monospace;
                }}
                .footer {{
                    background: #f8fafc;
                    padding: 20px;
                    text-align: center;
                    font-size: 14px;
                    color: #64748b;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin:0;">Smartkode AI</h1>
                    <p style="margin:10px 0 0 0;">Verify Your Email Address</p>
                </div>

                <div class="content">
                    <h2 style="color:#1e293b; margin-top:0;">
                        Hello{" " + user_name if user_name else ""}! 👋
                    </h2>

                    <p style="color:#475569; font-size:16px;">
                        Thank you for signing up with Smartkode AI! To complete your registration, 
                        please verify your email address by entering the code below:
                    </p>

                    <div class="code-box">
                        <p style="margin:0; font-size:14px; color:#64748b; margin-bottom:10px;">
                            Your Verification Code:
                        </p>
                        <div class="code">{code}</div>
                        <p style="margin:10px 0 0 0; font-size:12px; color:#94a3b8;">
                            Valid for 10 minutes
                        </p>
                    </div>

                    <p style="color:#475569; font-size:14px;">
                        <strong>Security Note:</strong> If you didn't create an account with Smartkode AI, 
                        please ignore this email. Your account will not be activated without verification.
                    </p>

                    <hr style="border:none; border-top:1px solid #e2e8f0; margin:30px 0;">

                    <p style="color:#64748b; font-size:14px; margin:0;">
                        Need help? Contact us at 
                        <a href="mailto:support@smartkode.io" style="color:#3b82f6;">
                            support@smartkode.io
                        </a>
                    </p>
                </div>

                <div class="footer">
                    <p style="margin:0;">
                        © 2025 Smartkode AI. All rights reserved.
                    </p>
                    <p style="margin:10px 0 0 0; font-size:12px;">
                        Enterprise AI Calling Platform
                    </p>
                </div>
            </div>
        </body>
        </html>
        """

        # Plain text fallback
        text_body = f"""
        Hello{" " + user_name if user_name else ""}!

        Thank you for signing up with Smartkode AI!

        Your verification code is: {code}

        This code will expire in 10 minutes.

        If you didn't create an account, please ignore this email.

        Need help? Contact us at support@smartkode.io

        © 2025 Smartkode AI
        """

        return await self.send_email(
            to_email=email,
            subject=subject,
            html_body=html_body,
            text_body=text_body
        )

    async def send_welcome_email(self, email: str, user_name: str) -> bool:
        """Send welcome email after successful verification."""

        subject = "Welcome to Smartkode AI! 🎉"

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }}
                .header {{
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    padding: 40px 20px;
                    text-align: center;
                }}
                .content {{
                    padding: 40px 30px;
                }}
                .button {{
                    display: inline-block;
                    background: #3b82f6;
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 6px;
                    margin-top: 20px;
                }}
                .footer {{
                    background: #f8fafc;
                    padding: 20px;
                    text-align: center;
                    font-size: 14px;
                    color: #64748b;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin:0;">Welcome to Smartkode AI!</h1>
                    <p style="margin:10px 0 0 0;">Your account is now active</p>
                </div>
                <div class="content">
                    <h2 style="color:#1e293b; margin-top:0;">Hi {user_name}! 👋</h2>

                    <p style="color:#475569; font-size:16px;">
                        Your email has been successfully verified! You can now access all features 
                        of our AI Calling Platform.
                    </p>

                    <p style="color:#475569; font-size:16px;">
                        Here's what you can do next:
                    </p>

                    <ul style="color:#475569; font-size:16px;">
                        <li>Create your first campaign</li>
                        <li>Import contacts</li>
                        <li>Start making AI-powered calls</li>
                        <li>View analytics and reports</li>
                    </ul>

                    <div style="text-align:center; margin-top:30px;">
                        <a href="https://yourapp.com/dashboard" class="button">
                            Go to Dashboard
                        </a>
                    </div>

                    <hr style="border:none; border-top:1px solid #e2e8f0; margin:30px 0;">

                    <p style="color:#64748b; font-size:14px; margin:0;">
                        Need help getting started? Check our 
                        <a href="https://yourapp.com/docs" style="color:#3b82f6;">documentation</a>
                        or contact us at 
                        <a href="mailto:support@smartkode.io" style="color:#3b82f6;">
                            support@smartkode.io
                        </a>
                    </p>
                </div>

                <div class="footer">
                    <p style="margin:0;">
                        © 2025 Smartkode AI. All rights reserved.
                    </p>
                    <p style="margin:10px 0 0 0; font-size:12px;">
                        Enterprise AI Calling Platform
                    </p>
                </div>
            </div>
        </body>
        </html>
        """

        text_body = f"""
        Welcome to Smartkode AI!

        Hi {user_name}!

        Your email has been successfully verified! You can now access all features of our AI Calling Platform.

        Here's what you can do next:
        - Create your first campaign
        - Import contacts
        - Start making AI-powered calls
        - View analytics and reports

        Visit your dashboard: https://yourapp.com/dashboard

        Need help? Contact us at support@smartkode.io

        © 2025 Smartkode AI
        """

        return await self.send_email(
            to_email=email,
            subject=subject,
            html_body=html_body,
            text_body=text_body
        )


# Singleton instance
email_service = EmailService()