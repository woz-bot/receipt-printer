const crypto = require('crypto');
const fetch = require('node-fetch');

// Simple in-memory rate limiting (use Redis in production for multiple instances)
const rateLimits = new Map();
const RATE_LIMIT_PER_DAY = 5; // Max prints per sender per day

// Content limits to prevent abuse
const MAX_TEXT_LENGTH = 500; // Characters (shorter than before - prevents mile-long prints!)
const MAX_IMAGES_PER_EMAIL = 2; // Images per email
const MAX_IMAGE_SIZE_MB = 5; // MB per image
const MAX_TOTAL_EMAIL_SIZE_MB = 10; // Total email size

// Inappropriate content keywords (basic filter - could use AI moderation API)
const BLOCKED_KEYWORDS = [
  // Add patterns for scary/inappropriate content
  'kill', 'death', 'die', 'murder', 'suicide',
  'hate', 'racist', 'slur',
  // Add more as needed
];

function getRateLimitKey(email) {
  const today = new Date().toISOString().split('T')[0];
  return `${email}:${today}`;
}

function checkRateLimit(senderEmail) {
  const key = getRateLimitKey(senderEmail);
  const count = rateLimits.get(key) || 0;

  if (count >= RATE_LIMIT_PER_DAY) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: RATE_LIMIT_PER_DAY - count };
}

function incrementRateLimit(senderEmail) {
  const key = getRateLimitKey(senderEmail);
  const count = rateLimits.get(key) || 0;
  rateLimits.set(key, count + 1);
}

function cleanupOldRateLimits() {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  for (const [key] of rateLimits) {
    if (key.includes(yesterday) || key.includes(':' + yesterday)) {
      rateLimits.delete(key);
    }
  }
}

// Run cleanup every hour
setInterval(cleanupOldRateLimits, 60 * 60 * 1000);

function moderateContent(text) {
  const lowerText = text.toLowerCase();

  // Check for blocked keywords
  for (const keyword of BLOCKED_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return {
        allowed: false,
        reason: 'Content contains inappropriate language'
      };
    }
  }

  return { allowed: true };
}

function validateImages(attachments) {
  if (!attachments || attachments.length === 0) {
    return { allowed: true };
  }

  const imageAttachments = attachments.filter(a =>
    a.content_type?.startsWith('image/')
  );

  // Check number of images
  if (imageAttachments.length > MAX_IMAGES_PER_EMAIL) {
    return {
      allowed: false,
      reason: `Too many images (max ${MAX_IMAGES_PER_EMAIL} per email)`
    };
  }

  // Check individual image sizes
  for (const img of imageAttachments) {
    const sizeInMB = img.size / (1024 * 1024);
    if (sizeInMB > MAX_IMAGE_SIZE_MB) {
      return {
        allowed: false,
        reason: `Image too large (max ${MAX_IMAGE_SIZE_MB}MB per image)`
      };
    }
  }

  // Check total size
  const totalSize = imageAttachments.reduce((sum, img) => sum + img.size, 0);
  const totalSizeMB = totalSize / (1024 * 1024);

  if (totalSizeMB > MAX_TOTAL_EMAIL_SIZE_MB) {
    return {
      allowed: false,
      reason: `Total email too large (max ${MAX_TOTAL_EMAIL_SIZE_MB}MB)`
    };
  }

  return { allowed: true };
}

async function verifyWebhookSignature(req, secret) {
  const svixId = req.headers['svix-id'];
  const svixTimestamp = req.headers['svix-timestamp'];
  const svixSignature = req.headers['svix-signature'];

  if (!svixId || !svixTimestamp || !svixSignature) {
    return false;
  }

  const body = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);
  const signedContent = `${svixId}.${svixTimestamp}.${body}`;
  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const expectedSignature = crypto
    .createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64');

  const signatures = svixSignature.split(' ');
  for (const sig of signatures) {
    const [version, signature] = sig.split(',');
    if (version === 'v1' && signature === expectedSignature) {
      return true;
    }
  }

  return false;
}

async function moderateImage(imageBuffer) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    // No API key configured - skip moderation
    // You could also make this fail-closed (reject all images without moderation)
    console.warn('⚠️  No OPENAI_API_KEY - skipping image moderation');
    return { allowed: true };
  }

  try {
    // Convert image to base64
    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;

    // Use OpenAI Vision API to check content
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Is this image appropriate for printing on a receipt printer that might be seen by anyone? Answer ONLY "safe" or "unsafe". Consider: violence, gore, nudity, hate symbols, disturbing content, inappropriate language visible in the image. Be strict.'
              },
              {
                type: 'image_url',
                image_url: { url: dataUrl }
              }
            ]
          }
        ],
        max_tokens: 10
      })
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      // Fail open or fail closed? Let's fail closed (reject) for safety
      return {
        allowed: false,
        reason: 'Unable to verify image safety'
      };
    }

    const result = await response.json();
    const answer = result.choices[0].message.content.toLowerCase().trim();

    if (answer.includes('unsafe')) {
      return {
        allowed: false,
        reason: 'Image contains inappropriate content'
      };
    }

    return { allowed: true };

  } catch (error) {
    console.error('Error moderating image:', error);
    // Fail closed for safety
    return {
      allowed: false,
      reason: 'Unable to verify image safety'
    };
  }
}

module.exports = {
  checkRateLimit,
  incrementRateLimit,
  moderateContent,
  moderateImage,
  validateImages,
  verifyWebhookSignature,
  RATE_LIMIT_PER_DAY,
  MAX_TEXT_LENGTH,
  MAX_IMAGES_PER_EMAIL,
  MAX_IMAGE_SIZE_MB
};
