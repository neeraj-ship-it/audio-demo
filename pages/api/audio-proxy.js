// ═══════════════════════════════════════════════════════
// AUDIO PROXY - Stream audio from private S3 bucket
// ═══════════════════════════════════════════════════════

const AWS = require('aws-sdk');
const { apiLimiter } = require('../../lib/rateLimit');

export default async function handler(req, res) {
  if (!apiLimiter(req, res)) return;

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'Missing URL parameter' });
    }

    // Validate URL scheme - HTTPS only
    if (!url.startsWith('https://')) {
      return res.status(400).json({ error: 'Only HTTPS URLs are allowed' });
    }

    // Parse S3 URL to extract bucket and key
    // Format: https://bucket-name.s3.region.amazonaws.com/key
    const s3UrlPattern = /^https:\/\/([a-z0-9][a-z0-9.-]{1,61}[a-z0-9])\.s3\.([a-z0-9-]+)\.amazonaws\.com\/(.+)$/;
    const match = url.match(s3UrlPattern);

    if (!match) {
      return res.status(400).json({ error: 'Invalid S3 URL format' });
    }

    const [, bucket, region, key] = match;

    // Whitelist allowed S3 buckets
    const allowedBuckets = (process.env.ALLOWED_S3_BUCKETS || '').split(',').map(b => b.trim()).filter(Boolean);
    if (allowedBuckets.length > 0 && !allowedBuckets.includes(bucket)) {
      console.warn(`Blocked audio-proxy request for unauthorized bucket: ${bucket}`);
      return res.status(403).json({ error: 'Unauthorized bucket' });
    }

    // Validate key - prevent path traversal
    const decodedKey = decodeURIComponent(key);
    if (decodedKey.includes('..') || decodedKey.includes('\0')) {
      return res.status(400).json({ error: 'Invalid key' });
    }

    // Configure AWS S3
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || region
    });

    // Get object from S3
    const params = {
      Bucket: bucket,
      Key: decodeURIComponent(key)
    };

    const s3Object = await s3.getObject(params).promise();

    // Set appropriate headers
    res.setHeader('Content-Type', s3Object.ContentType || 'audio/mpeg');
    res.setHeader('Content-Length', s3Object.ContentLength);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // Stream the audio
    res.status(200).send(s3Object.Body);

  } catch (error) {
    console.error('Audio proxy error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch audio'
    });
  }
}

export const config = {
  api: {
    responseLimit: '50mb' // Allow large audio files
  }
};
