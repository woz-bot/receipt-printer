#!/usr/bin/env node
/**
 * Utility for Woz to send messages to Christina's receipt printer
 * Usage: node send-message.js "Hello Christina!"
 */

require('dotenv').config({ path: '/home/ubuntu/.openclaw/workspace/projects/receipt-printer/.env.woz' });

const message = process.argv[2];

if (!message) {
  console.error('Usage: node send-message.js "Your message here"');
  process.exit(1);
}

if (!process.env.PRINTER_URL || !process.env.PRINTER_TOKEN) {
  console.error('Missing PRINTER_URL or PRINTER_TOKEN in .env.woz');
  process.exit(1);
}

async function sendMessage() {
  try {
    const response = await fetch(`${process.env.PRINTER_URL}/print`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PRINTER_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        from: 'Woz'
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }
    
    const result = await response.json();
    console.log('✅ Message sent to printer!');
    console.log(`   "${message}"`);
    
  } catch (error) {
    console.error('❌ Failed to send message:', error.message);
    process.exit(1);
  }
}

sendMessage();
