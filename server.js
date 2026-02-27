const express = require('express');
const escpos = require('escpos');
const { Resend } = require('resend');
const emailHandler = require('./email-handler');
const imageProcessor = require('./image-processor');

// Depending on connection type:
// escpos.USB = require('escpos-usb');     // For USB
// escpos.Network = require('escpos-network'); // For network printers

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.raw({ type: 'application/json', limit: '10mb' })); // For webhook verification

const PORT = process.env.PORT || 3001;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET;
const PRINTER_TYPE = process.env.PRINTER_TYPE || 'usb'; // 'usb' or 'network'
const PRINTER_IP = process.env.PRINTER_IP; // For network printers
const PRINTER_PORT = process.env.PRINTER_PORT || 9100; // For network printers

if (!AUTH_TOKEN) {
  console.error('❌ AUTH_TOKEN not set in .env file!');
  process.exit(1);
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

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

// Webhook endpoint for Resend inbound emails
app.post('/webhook/email', async (req, res) => {
  // Verify webhook signature
  if (RESEND_WEBHOOK_SECRET) {
    const isValid = await emailHandler.verifyWebhookSignature(req, RESEND_WEBHOOK_SECRET);
    if (!isValid) {
      console.log('❌ Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }
  
  const event = req.body;
  
  if (event.type !== 'email.received') {
    return res.json({ received: true });
  }
  
  const { from, subject, text, html, email_id } = event.data;
  const senderEmail = from.email || from;
  
  console.log(`📧 Email received from: ${senderEmail}`);
  
  // Check rate limit
  const rateCheck = emailHandler.checkRateLimit(senderEmail);
  if (!rateCheck.allowed) {
    console.log(`⏱️  Rate limit exceeded for ${senderEmail}`);
    
    // Send bounce email
    if (resend) {
      await resend.emails.send({
        from: 'Print Bot <hi@print.sillysoftware.club>',
        to: senderEmail,
        subject: 'Print limit reached',
        text: `You've reached your daily print limit of ${emailHandler.RATE_LIMIT_PER_DAY} messages. Try again tomorrow!`
      });
    }
    
    return res.json({ received: true, printed: false, reason: 'rate_limit' });
  }
  
  // Extract message content
  const message = text || html?.replace(/<[^>]*>/g, '') || subject || '';
  
  // Moderate content
  const moderation = emailHandler.moderateContent(message);
  if (!moderation.allowed) {
    console.log(`🚫 Content blocked: ${moderation.reason}`);
    
    // Send rejection email
    if (resend) {
      await resend.emails.send({
        from: 'Print Bot <hi@print.sillysoftware.club>',
        to: senderEmail,
        subject: 'Message not printed',
        text: `Your message couldn't be printed: ${moderation.reason}\n\nPlease send friendly, appropriate content only.`
      });
    }
    
    return res.json({ received: true, printed: false, reason: 'content_filtered' });
  }
  
  // Fetch and validate attachments
  let images = [];
  if (resend && email_id) {
    try {
      const fullEmail = await resend.emails.get(email_id);
      
      // Validate images before processing
      if (fullEmail.attachments && fullEmail.attachments.length > 0) {
        const imageValidation = emailHandler.validateImages(fullEmail.attachments);
        
        if (!imageValidation.allowed) {
          console.log(`🚫 Images blocked: ${imageValidation.reason}`);
          
          // Send rejection email
          await resend.emails.send({
            from: 'Print Bot <hi@print.sillysoftware.club>',
            to: senderEmail,
            subject: 'Images not printed',
            text: `Your message couldn't be printed: ${imageValidation.reason}\n\nLimits:\n- Max ${emailHandler.MAX_IMAGES_PER_EMAIL} images per email\n- Max ${emailHandler.MAX_IMAGE_SIZE_MB}MB per image\n\nPlease try again with smaller/fewer images!`
          });
          
          return res.json({ received: true, printed: false, reason: 'images_too_large' });
        }
        
        // Process image attachments
        for (const attachment of fullEmail.attachments) {
          if (attachment.content_type?.startsWith('image/')) {
            const imageBuffer = Buffer.from(attachment.content, 'base64');
            
            // Moderate image content
            const imageMod = await emailHandler.moderateImage(imageBuffer);
            if (!imageMod.allowed) {
              console.log(`🚫 Image blocked: ${imageMod.reason}`);
              
              // Send rejection email
              await resend.emails.send({
                from: 'Print Bot <hi@print.sillysoftware.club>',
                to: senderEmail,
                subject: 'Image not printed',
                text: `Your image couldn't be printed: ${imageMod.reason}\n\nPlease only send appropriate, safe-for-work images.`
              });
              
              return res.json({ received: true, printed: false, reason: 'image_content_filtered' });
            }
            
            const processedImage = await imageProcessor.processImageForPrinting(imageBuffer);
            images.push(processedImage);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching attachments:', error);
    }
  }
  
  // Print the message
  try {
    const device = PRINTER_TYPE === 'network' 
      ? new escpos.Network(PRINTER_IP, PRINTER_PORT)
      : new escpos.USB();
    
    device.open(function(error) {
      if (error) {
        console.error('❌ Printer error:', error);
        return;
      }
      
      const printer = new escpos.Printer(device);
      
      // Print header
      printer
        .font('a')
        .align('ct')
        .style('bu')
        .size(1, 1)
        .text('New Message!')
        .text('---')
        .style('normal')
        .align('lt')
        .text('')
        .text(`From: ${senderEmail}`)
        .text('');
      
      // Print message text if present
      if (message) {
        printer.text(message).text('');
      }
      
      // Print images if any
      if (images.length > 0) {
        printer.text('').align('ct');
        for (const img of images) {
          printer.image(img.bitmap, img.width, img.height);
          printer.text('');
        }
      }
      
      // Print footer
      printer
        .align('ct')
        .text('---')
        .text(new Date().toLocaleString())
        .text(`${rateCheck.remaining - 1}/${emailHandler.RATE_LIMIT_PER_DAY} prints remaining today`)
        .cut()
        .close();
      
      console.log(`✅ Printed email from ${senderEmail}${images.length > 0 ? ` with ${images.length} image(s)` : ''}`);
    });
    
    // Increment rate limit
    emailHandler.incrementRateLimit(senderEmail);
    
    // Send confirmation email
    if (resend) {
      const imageText = images.length > 0 ? ` with ${images.length} image${images.length > 1 ? 's' : ''}` : '';
      await resend.emails.send({
        from: 'Print Bot <hi@print.sillysoftware.club>',
        to: senderEmail,
        subject: '✅ Message printed!',
        text: `Your message${imageText} was printed successfully!\n\nYou have ${rateCheck.remaining - 1} prints remaining today.\n\nTip: You can attach images to your emails and they'll be printed with dithering!`
      });
    }
    
    res.json({ received: true, printed: true });
    
  } catch (error) {
    console.error('❌ Print error:', error);
    res.status(500).json({ error: 'Print failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🖨️  Receipt printer server running on port ${PORT}`);
  console.log(`   Printer type: ${PRINTER_TYPE}`);
  if (PRINTER_TYPE === 'network') {
    console.log(`   Printer IP: ${PRINTER_IP}:${PRINTER_PORT}`);
  }
  console.log(`   Auth: ${AUTH_TOKEN ? '✓' : '✗'}`);
  console.log(`   Email printing: ${RESEND_API_KEY ? '✓' : '✗'}`);
  if (RESEND_API_KEY) {
    console.log(`   Rate limit: ${emailHandler.RATE_LIMIT_PER_DAY} prints/person/day`);
  }
});
