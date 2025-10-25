"""
Test script to verify Zoho Mail SMTP configuration.
Run this before starting your application to ensure email is working.

Usage:
    python test_zoho_email.py
"""

import asyncio
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# ✅ UPDATE THESE WITH YOUR ZOHO CREDENTIALS
SMTP_HOST = "smtp.zoho.com"
SMTP_PORT = 587  # Try 465 if this doesn't work
SMTP_USER = "your-email@yourdomain.com"
SMTP_PASSWORD = "your-password"


async def test_smtp_connection():
    """Test basic SMTP connection."""
    print("Testing SMTP connection...")
    try:
        # Try to connect
        server = aiosmtplib.SMTP(hostname=SMTP_HOST, port=SMTP_PORT)
        await server.connect()
        await server.starttls()
        await server.login(SMTP_USER, SMTP_PASSWORD)
        await server.quit()

        print("✅ SMTP connection successful!")
        return True
    except Exception as e:
        print(f"❌ SMTP connection failed: {e}")
        return False


async def send_test_email():
    """Send a test email with verification code."""
    print("\nSending test email...")

    message = MIMEMultipart("alternative")
    message["Subject"] = "Test Email - Smartkode AI Verification"
    message["From"] = f"Smartkode AI <{SMTP_USER}>"
    message["To"] = SMTP_USER  # Send to yourself

    # HTML content
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 8px 8px 0 0;
                margin: -40px -40px 30px -40px;
            }
            .code-box {
                background: #f0f9ff;
                border: 2px solid #3b82f6;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                margin: 30px 0;
            }
            .code {
                font-size: 36px;
                font-weight: bold;
                color: #2563eb;
                letter-spacing: 8px;
                font-family: 'Courier New', monospace;
            }
            .success {
                color: #10b981;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin:0;">Smartkode AI</h1>
                <p style="margin:10px 0 0 0;">Email Configuration Test</p>
            </div>

            <h2 class="success">✅ Email Configuration Successful!</h2>

            <p>Congratulations! Your Zoho Mail SMTP is configured correctly.</p>

            <div class="code-box">
                <p style="margin:0; font-size:14px; color:#64748b; margin-bottom:10px;">
                    Sample Verification Code:
                </p>
                <div class="code">123456</div>
                <p style="margin:10px 0 0 0; font-size:12px; color:#94a3b8;">
                    This is a test code
                </p>
            </div>

            <p>Your email system is ready to send:</p>
            <ul>
                <li>Verification codes during registration</li>
                <li>Welcome emails after verification</li>
                <li>Password reset emails</li>
                <li>System notifications</li>
            </ul>

            <hr style="border:none; border-top:1px solid #e2e8f0; margin:30px 0;">

            <p style="color:#64748b; font-size:14px;">
                <strong>Configuration Details:</strong><br>
                Host: {host}<br>
                Port: {port}<br>
                From: {from_email}
            </p>
        </div>
    </body>
    </html>
    """.format(host=SMTP_HOST, port=SMTP_PORT, from_email=SMTP_USER)

    # Plain text fallback
    text = f"""
    Email Configuration Test - Smartkode AI

    ✅ Email Configuration Successful!

    Your Zoho Mail SMTP is configured correctly.

    Sample Verification Code: 123456

    Configuration Details:
    Host: {SMTP_HOST}
    Port: {SMTP_PORT}
    From: {SMTP_USER}

    Your email system is ready!
    """

    message.attach(MIMEText(text, "plain"))
    message.attach(MIMEText(html, "html"))

    try:
        if SMTP_PORT == 587:
            # STARTTLS
            await aiosmtplib.send(
                message,
                hostname=SMTP_HOST,
                port=SMTP_PORT,
                username=SMTP_USER,
                password=SMTP_PASSWORD,
                start_tls=True,
                use_tls=False
            )
        elif SMTP_PORT == 465:
            # SSL/TLS
            await aiosmtplib.send(
                message,
                hostname=SMTP_HOST,
                port=SMTP_PORT,
                username=SMTP_USER,
                password=SMTP_PASSWORD,
                start_tls=False,
                use_tls=True
            )

        print(f"✅ Test email sent successfully!")
        print(f"📧 Check your inbox: {SMTP_USER}")
        return True

    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        return False


async def main():
    """Run all tests."""
    print("=" * 60)
    print("Zoho Mail SMTP Configuration Test")
    print("=" * 60)
    print(f"\nHost: {SMTP_HOST}")
    print(f"Port: {SMTP_PORT}")
    print(f"User: {SMTP_USER}")
    print("=" * 60)

    # Test 1: Connection
    connection_ok = await test_smtp_connection()

    if not connection_ok:
        print("\n" + "=" * 60)
        print("💡 TROUBLESHOOTING TIPS:")
        print("=" * 60)
        print("1. Verify your email and password are correct")
        print("2. Enable IMAP/SMTP in Zoho Mail settings:")
        print("   - Login to Zoho Mail")
        print("   - Settings → Mail Accounts → Your Account")
        print("   - Enable 'IMAP/POP Access'")
        print("3. Try port 465 instead of 587")
        print("4. Check firewall/antivirus settings")
        print("5. If using custom domain, verify domain is active")
        print("=" * 60)
        return

    # Test 2: Send Email
    email_sent = await send_test_email()

    if email_sent:
        print("\n" + "=" * 60)
        print("🎉 ALL TESTS PASSED!")
        print("=" * 60)
        print("Your Zoho Mail configuration is working correctly.")
        print("You can now start your application.")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("⚠️  Connection OK but email send failed")
        print("=" * 60)
        print("Check the error message above for details.")
        print("=" * 60)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")