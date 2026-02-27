# Email Printing Setup

Enable anyone to send messages to your receipt printer via email at **hi@print.sillysoftware.club**!

## Features

✅ **Rate limiting**: 3 prints per person per day
✅ **Content moderation**: Automatic filtering of inappropriate content  
✅ **Image printing**: Attach photos (auto-dithered for thermal printing)
✅ **Auto-replies**: Senders get confirmation emails
✅ **Secure**: Webhook signature verification

## Prerequisites

- Resend account with verified domain
- Printer server running (see SETUP.md)
- Tailscale Funnel or ngrok for webhook URL

## Step 1: Get Resend API Key

1. Go to https://resend.com/api-keys
2. Create a new API key
3. Copy it to your `.env` file:

```bash
RESEND_API_KEY=re_your_key_here
```

## Step 2: Configure Inbound Email

1. Go to https://resend.com/emails/receiving
2. Click "Add Inbound Rule"
3. Configure:
   - **Email address**: `hi@print.sillysoftware.club`
   - **Forward to webhook**: Your Tailscale Funnel URL + `/webhook/email`
   - Example: `https://your-machine.tailnet.ts.net/webhook/email`
4. Save and copy the **Signing Secret**
5. Add to `.env`:

```bash
RESEND_WEBHOOK_SECRET=whsec_your_secret_here
```

## Step 3: DNS Configuration

For `print.sillysoftware.club` to receive emails, add these DNS records:

```
Type: MX
Name: print
Value: in.resend.com
Priority: 10

Type: TXT  
Name: print
Value: v=spf1 include:_spf.resend.com ~all
```

## Step 4: Add OpenAI API Key (Image Moderation)

**⚠️ Highly recommended for security!**

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add to `.env`:

```bash
OPENAI_API_KEY=sk-your_key_here
```

**What it does:**
- Automatically checks every image for inappropriate content
- Blocks images with: violence, gore, nudity, hate symbols, disturbing content
- Uses GPT-4o-mini Vision to analyze images before printing

**Without it:**
- ⚠️ Images won't be moderated (security risk!)
- Server will log a warning but continue to function
- Text-only printing will still work fine

## Step 5: Restart Server

```bash
pm2 restart receipt-printer
# or
npm start
```

Test that email is enabled:

```bash
curl http://localhost:3001/health
# Should show email: true
```

## Step 6: Send Test Email

Email **hi@print.sillysoftware.club** with a message:

```
Subject: Test!
Body: Hello from my first email print!
```

You should:
1. Hear your printer print the message
2. Receive a confirmation email back

## Security Features

### Rate Limiting

Each email address can send **3 prints per day**. If exceeded:
- Print is rejected
- Sender receives "limit reached" email
- Resets at midnight UTC

### Content Limits

To prevent abuse and mile-long prints:
- **Text**: Max 500 characters per message
- **Images**: Max 2 images per email
- **Image size**: Max 5MB per image
- **Total email size**: Max 10MB

Violators receive an explanation email with the limits.

### Content Moderation

**Text** is automatically filtered for:
- Inappropriate language
- Scary/violent content

**Images** are moderated using AI (if OpenAI API key is configured):
- Violence, gore, weapons
- Nudity or sexual content
- Hate symbols
- Disturbing or graphic content
- Visible inappropriate text in images

Blocked senders receive an explanation email.

### Webhook Verification

All incoming webhooks are cryptographically verified using the Resend signing secret. Invalid requests are rejected.

## Customization

### Change Rate Limit

Edit `email-handler.js`:

```javascript
const RATE_LIMIT_PER_DAY = 5; // Change from 3 to 5
```

### Adjust Content Limits

Edit the limits in `email-handler.js`:

```javascript
const MAX_TEXT_LENGTH = 500;         // Characters
const MAX_IMAGES_PER_EMAIL = 2;      // Images per email
const MAX_IMAGE_SIZE_MB = 5;         // MB per image
const MAX_TOTAL_EMAIL_SIZE_MB = 10;  // Total email size
```

### Update Content Filter

Edit the `BLOCKED_KEYWORDS` array in `email-handler.js`:

```javascript
const BLOCKED_KEYWORDS = [
  'badword1',
  'badword2',
  // Add more...
];
```

### Advanced: AI Content Moderation

For more sophisticated filtering, integrate OpenAI Moderation API:

```javascript
// In email-handler.js
async function moderateContent(text) {
  const response = await fetch('https://api.openai.com/v1/moderations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ input: text })
  });
  
  const result = await response.json();
  const flagged = result.results[0].flagged;
  
  if (flagged) {
    return { allowed: false, reason: 'Content flagged by moderation' };
  }
  
  return { allowed: true };
}
```

## Monitoring

Check logs to see email printing activity:

```bash
pm2 logs receipt-printer
```

Look for:
- `📧 Email received from: ...`
- `✅ Printed email from ...`
- `⏱️ Rate limit exceeded for ...`
- `🚫 Content blocked: ...`

## Troubleshooting

### Emails not arriving

1. Check DNS records are correct
2. Verify webhook URL is accessible:
   ```bash
   curl https://your-machine.tailnet.ts.net/health
   ```
3. Check Resend dashboard for delivery errors

### Webhook signature failures

- Ensure `RESEND_WEBHOOK_SECRET` matches the value in Resend dashboard
- Restart server after updating .env

### Rate limit not working

Rate limits are stored in memory. If you restart the server, limits reset. For persistent limits across restarts, use Redis:

```javascript
// TODO: Add Redis integration example
```

## Example Messages

**Simple text:**
```
Subject: Reminder
Body: Don't forget to water the plants! 🌱
```

**With emojis:**
```
Subject: 🎉 Party Time!
Body: The party starts at 7pm. See you there!
```

**Multi-line:**
```
Subject: Shopping List
Body:
- Milk
- Eggs
- Bread
- Coffee
```

**With images:**
Attach any image (JPG, PNG, GIF) to your email. The system will:
1. Automatically resize to fit printer width (576px / 80mm)
2. Convert to grayscale
3. Apply Floyd-Steinberg dithering for clean thermal printing
4. Print with your message

**Tips for best image results:**
- High contrast images work best
- Photos with clear subjects print better than busy backgrounds
- Logos and line art look great
- Max file size: 5MB per image

---

Questions? Email woz@claw.waybackstore.com! 📧🖨️
