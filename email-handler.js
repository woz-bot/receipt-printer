const crypto = require('crypto');

// Simple in-memory rate limiting (use Redis in production for multiple instances)
const rateLimits = new Map();
const RATE_LIMIT_PER_DAY = 3; // Max prints per sender per day

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
  
  // Check length (prevent mile-long prints!)
  if (text.length > MAX_TEXT_LENGTH) {
    return {
      allowed: false,
      reason: `Message too long (max ${MAX_TEXT_LENGTH} characters)`
    };
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
  
  const signedContent = `${svixId}.${svixTimestamp}.${JSON.stringify(req.body)}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
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

module.exports = {
  checkRateLimit,
  incrementRateLimit,
  moderateContent,
  validateImages,
  verifyWebhookSignature,
  RATE_LIMIT_PER_DAY,
  MAX_TEXT_LENGTH,
  MAX_IMAGES_PER_EMAIL,
  MAX_IMAGE_SIZE_MB
};
