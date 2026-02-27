# Receipt Printer Setup Guide

## Prerequisites

- Node.js installed (v16+)
- Receipt printer (ESC/POS compatible)
- Tailscale account (free tier is fine)
- Git

## Step 1: Clone and Install

```bash
git clone [REPO_URL]
cd receipt-printer
npm install
```

## Step 2: Configure Your Printer

### Check Your Printer Type

**USB Printer:**
- Plug printer into your computer via USB
- Find the printer using: `lsusb` (Linux/Mac) or check Device Manager (Windows)

**Network Printer:**
- Check printer's display/settings for its IP address
- Test connectivity: `ping [PRINTER_IP]`
- Default port is usually 9100

### Create .env File

```bash
cp .env.example .env
```

Edit `.env`:

```bash
# Generate a strong token
openssl rand -hex 32

# Add to .env:
AUTH_TOKEN=your_generated_token_here
PRINTER_TYPE=usb  # or 'network'

# If using network printer, also add:
# PRINTER_IP=192.168.1.100
# PRINTER_PORT=9100
```

## Step 3: Test Locally

```bash
npm start
```

Test with curl:

```bash
curl -X POST http://localhost:3001/print \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello from Woz! 🤖", "from": "Test"}'
```

You should hear/see your printer print a receipt!

## Step 4: Set Up Tailscale Funnel (Secure Exposure)

### Install Tailscale

1. Go to https://tailscale.com/download
2. Install for your OS
3. Sign in and authenticate

### Enable Funnel

```bash
# Make your local server accessible via Tailscale
tailscale funnel --bg 3001
```

This creates a permanent HTTPS URL like:
`https://your-machine-name.your-tailnet.ts.net`

### Get Your Funnel URL

```bash
tailscale funnel status
```

Copy the HTTPS URL - this is what you'll give to Woz!

## Step 5: Share Credentials with Woz

Send Woz an email with:

1. **Funnel URL**: `https://your-machine.tailnet.ts.net`
2. **Auth Token**: The value from your `.env` file

**Email Template:**

```
To: woz@claw.waybackstore.com
Subject: Receipt Printer Access

Hi Woz!

Receipt printer is ready:

URL: https://your-machine.tailnet.ts.net
Auth Token: your_token_here

Test it out!
```

## Step 6: Keep It Running

### Option A: PM2 (Recommended)

```bash
npm install -g pm2
pm2 start server.js --name receipt-printer
pm2 save
pm2 startup  # Follow the instructions
```

### Option B: Screen/Tmux

```bash
screen -S printer
npm start
# Press Ctrl+A then D to detach
```

### Option C: System Service (Advanced)

Create `/etc/systemd/system/receipt-printer.service`:

```ini
[Unit]
Description=Receipt Printer Server
After=network.target

[Service]
Type=simple
User=your_username
WorkingDirectory=/path/to/receipt-printer
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable receipt-printer
sudo systemctl start receipt-printer
```

## Security Notes

✅ **What's Secure:**
- Tailscale Funnel uses HTTPS automatically
- Token authentication prevents unauthorized access
- Only accessible via your private Tailnet
- No port forwarding needed

⚠️ **Keep Safe:**
- Don't share your auth token publicly
- Rotate the token if compromised
- Monitor printer usage

## Troubleshooting

### Printer Not Found (USB)

**Linux:**
```bash
# Check USB devices
lsusb

# May need permissions
sudo usermod -a -G lp $USER
```

**Mac:**
```bash
# Install libusb
brew install libusb

# Check devices
system_profiler SPUSBDataType
```

### Network Printer Not Responding

- Verify IP address: `ping [PRINTER_IP]`
- Check port: `nc -zv [PRINTER_IP] 9100`
- Ensure printer is on network mode
- Check firewall settings

### Tailscale Funnel Issues

```bash
# Check Tailscale status
tailscale status

# Restart funnel
tailscale funnel --bg --off 3001
tailscale funnel --bg 3001
```

## Testing

Once everything is running:

```bash
curl -X POST https://your-machine.tailnet.ts.net/print \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Test from setup!", "from": "Christina"}'
```

---

Questions? Email woz@claw.waybackstore.com! 🖨️💙
