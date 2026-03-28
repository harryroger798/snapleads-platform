"""Email delivery service using Mailgun API.

Sends license key emails to customers after successful Dodo Payments checkout.
"""
import logging
import os
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import URLError

logger = logging.getLogger(__name__)

MAILGUN_API_KEY = os.environ.get("MAILGUN_API_KEY", "")
MAILGUN_DOMAIN = os.environ.get("MAILGUN_DOMAIN", "getsnapleads.store")
MAILGUN_FROM = os.environ.get("MAILGUN_FROM", "SnapLeads <support@getsnapleads.store>")

MAILGUN_API_URL = f"https://api.mailgun.net/v3/{MAILGUN_DOMAIN}/messages"


def send_license_email(
    to_email: str,
    customer_name: str,
    license_key: str,
    plan: str,
    billing_cycle: str,
    expires_at: str,
) -> bool:
    """Send a license key delivery email to the customer via Mailgun.

    Returns True if the email was accepted by Mailgun, False otherwise.
    """
    if not MAILGUN_API_KEY:
        logger.warning("MAILGUN_API_KEY not set — skipping email delivery")
        return False

    plan_display = plan.capitalize()
    cycle_display = "Monthly" if billing_cycle == "monthly" else "Yearly"
    price_map = {
        ("starter", "monthly"): "$7/mo",
        ("starter", "yearly"): "$59/yr",
        ("pro", "monthly"): "$19/mo",
        ("pro", "yearly"): "$169/yr",
    }
    price = price_map.get((plan, billing_cycle), "")

    subject = f"Your SnapLeads {plan_display} {cycle_display} License Key"

    html_body = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
  <div style="background: #0f172a; border-radius: 12px; padding: 40px 30px; text-align: center;">
    <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 8px;">Welcome to SnapLeads!</h1>
    <p style="color: #94a3b8; font-size: 14px; margin: 0;">Your purchase was successful</p>
  </div>

  <div style="background: #ffffff; border-radius: 12px; padding: 30px; margin-top: 16px; border: 1px solid #e2e8f0;">
    <p style="color: #334155; font-size: 15px; line-height: 1.6;">
      Hi {customer_name or 'there'},
    </p>
    <p style="color: #334155; font-size: 15px; line-height: 1.6;">
      Thank you for purchasing <strong>SnapLeads {plan_display} {cycle_display}</strong> ({price}).
      Here is your license key:
    </p>

    <div style="background: #0f172a; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
      <code style="color: #38bdf8; font-size: 20px; letter-spacing: 2px; font-weight: bold;">{license_key}</code>
    </div>

    <h3 style="color: #0f172a; font-size: 16px; margin: 24px 0 12px;">How to activate:</h3>
    <ol style="color: #334155; font-size: 14px; line-height: 1.8; padding-left: 20px;">
      <li>Download SnapLeads from <a href="https://getsnapleads.store" style="color: #3b82f6;">getsnapleads.store</a></li>
      <li>Open the app — you'll see the License Activation screen</li>
      <li>Paste the license key above and click <strong>Activate License</strong></li>
      <li>Enjoy all {plan_display} features!</li>
    </ol>

    <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin-top: 24px;">
      <p style="color: #64748b; font-size: 13px; margin: 0;">
        <strong>Plan:</strong> {plan_display} {cycle_display}<br>
        <strong>Price:</strong> {price}<br>
        <strong>Valid until:</strong> {expires_at[:10] if expires_at else 'See subscription'}<br>
        <strong>Max devices:</strong> 2
      </p>
    </div>
  </div>

  <div style="text-align: center; margin-top: 16px;">
    <p style="color: #94a3b8; font-size: 12px;">
      Need help? Reply to this email or contact us at support@getsnapleads.store
    </p>
    <p style="color: #94a3b8; font-size: 11px;">
      &copy; 2026 SnapLeads. All rights reserved.
    </p>
  </div>
</body>
</html>"""

    text_body = f"""Welcome to SnapLeads!

Hi {customer_name or 'there'},

Thank you for purchasing SnapLeads {plan_display} {cycle_display} ({price}).

Your license key: {license_key}

How to activate:
1. Download SnapLeads from https://getsnapleads.store
2. Open the app — you'll see the License Activation screen
3. Paste the license key above and click Activate License
4. Enjoy all {plan_display} features!

Plan: {plan_display} {cycle_display}
Price: {price}
Valid until: {expires_at[:10] if expires_at else 'See subscription'}
Max devices: 2

Need help? Reply to this email or contact us at support@getsnapleads.store
"""

    data = urlencode({
        "from": MAILGUN_FROM,
        "to": to_email,
        "subject": subject,
        "text": text_body,
        "html": html_body,
    }).encode("utf-8")

    import base64
    auth_header = "Basic " + base64.b64encode(f"api:{MAILGUN_API_KEY}".encode()).decode()

    req = Request(MAILGUN_API_URL, data=data, method="POST")
    req.add_header("Authorization", auth_header)

    try:
        with urlopen(req, timeout=15) as resp:
            logger.info("License email sent to %s (status=%s)", to_email, resp.status)
            return resp.status == 200
    except URLError as exc:
        logger.error("Failed to send license email to %s: %s", to_email, exc)
        return False
