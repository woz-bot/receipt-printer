const crypto = require('crypto');

// Simple in-memory rate limiting (use Redis in production for multiple instances)
const rateLimits = new Map();
const RATE_LIMIT_PER_DAY = 3; // Max prints per sender per day

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
  
  // Check length (reasonable limit for receipt printer)
  if (text.length > 1000) {
    return {
      allowed: false,
      reason: 'Message too long (max 1000 characters)'
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
  verifyWebhookSignature,
  RATE_LIMIT_PER_DAY
};
