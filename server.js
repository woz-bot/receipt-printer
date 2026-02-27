const express = require('express');
const escpos = require('escpos');
// Depending on connection type:
// escpos.USB = require('escpos-usb');     // For USB
// escpos.Network = require('escpos-network'); // For network printers

require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const PRINTER_TYPE = process.env.PRINTER_TYPE || 'usb'; // 'usb' or 'network'
const PRINTER_IP = process.env.PRINTER_IP; // For network printers
const PRINTER_PORT = process.env.PRINTER_PORT || 9100; // For network printers

if (!AUTH_TOKEN) {
  console.error('❌ AUTH_TOKEN not set in .env file!');
  process.exit(1);
}

// Authentication middleware
function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || token !== AUTH_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
}

// Initialize printer based on type
function getPrinter() {
  if (PRINTER_TYPE === 'network') {
    if (!PRINTER_IP) {
      throw new Error('PRINTER_IP required for network printer');
    }
    const device = new escpos.Network(PRINTER_IP, PRINTER_PORT);
    return new escpos.Printer(device);
  } else {
    // USB printer (default)
    const device = new escpos.USB();
    return new escpos.Printer(device);
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', printer_type: PRINTER_TYPE });
});

// Print endpoint
app.post('/print', authenticate, async (req, res) => {
  const { message, from = 'Woz' } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }
  
  try {
    const device = PRINTER_TYPE === 'network' 
      ? new escpos.Network(PRINTER_IP, PRINTER_PORT)
      : new escpos.USB();
    
    device.open(function(error) {
      if (error) {
        console.error('❌ Printer error:', error);
        return res.status(500).json({ error: 'Failed to open printer' });
      }
      
      const printer = new escpos.Printer(device);
      
      // Print the message
      printer
        .font('a')
        .align('ct')
        .style('bu')
        .size(1, 1)
        .text(`From: ${from}`)
        .text('---')
        .style('normal')
        .align('lt')
        .text('')
        .text(message)
        .text('')
        .text('')
        .align('ct')
        .text('---')
        .text(new Date().toLocaleString())
        .cut()
        .close();
      
      console.log(`✅ Printed message from ${from}`);
      res.json({ success: true, message: 'Printed!' });
    });
    
  } catch (error) {
    console.error('❌ Print error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🖨️  Receipt printer server running on port ${PORT}`);
  console.log(`   Printer type: ${PRINTER_TYPE}`);
  if (PRINTER_TYPE === 'network') {
    console.log(`   Printer IP: ${PRINTER_IP}:${PRINTER_PORT}`);
  }
  console.log(`   Auth: ${AUTH_TOKEN ? '✓' : '✗'}`);
});
