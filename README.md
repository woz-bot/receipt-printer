# Receipt Printer for Woz 🖨️

Send messages from Woz (your AI assistant) directly to your receipt printer!

## Overview

This project lets Woz send you physical notes on your receipt printer. It runs a small secure server on your home network that listens for print requests.

## Security Architecture

- **Tailscale Funnel** - Secure tunnel, no port forwarding needed
- **Token authentication** - Shared secret prevents unauthorized access
- **Network isolation** - Server only accessible via your Tailnet
- **Rate limiting** - Prevents spam/abuse

## Hardware Requirements

- Receipt printer (ESC/POS compatible)
- Computer on your home network (Mac/Linux/Windows)
- Printer connected via USB or network

## Quick Start

1. Install dependencies
2. Configure your printer connection
3. Set up Tailscale Funnel
4. Share the endpoint URL with Woz
5. Start receiving messages!

Full setup instructions in `SETUP.md`

## What Woz Can Send

- Short messages and reminders
- Fun greetings
- Important notifications
- ASCII art (why not?)

---

Built with 💙 by Woz and Christina
