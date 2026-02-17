// ═══════════════════════════════════════════════════════
// S3 JSON Storage - Persistent story metadata on S3
// Used by cron jobs since Vercel serverless FS is ephemeral
// ═══════════════════════════════════════════════════════

const AWS = require('aws-sdk')

const s3 = new AWS.S3({
  accessKeyId: (process.env.AWS_ACCESS_KEY_ID || '').trim(),
  secretAccessKey: (process.env.AWS_SECRET_ACCESS_KEY || '').trim(),
  region: (process.env.AWS_REGION || 'ap-south-1').trim()
})

const BUCKET = (process.env.AWS_S3_BUCKET || 'stagefm-audio').trim()
const STORIES_KEY = 'data/stories-live.json'

/**
 * Read stories-live.json from S3
 * Returns array of stories generated at runtime by cron
 */
async function readLiveStories() {
  try {
    const result = await s3.getObject({ Bucket: BUCKET, Key: STORIES_KEY }).promise()
    const data = JSON.parse(result.Body.toString('utf-8'))
    return data.stories || []
  } catch (err) {
    if (err.code === 'NoSuchKey' || err.code === 'AccessDenied') {
      return [] // File doesn't exist yet
    }
    console.error('S3 read error:', err.message)
    return []
  }
}

/**
 * Write stories-live.json to S3
 */
async function writeLiveStories(stories) {
  const body = JSON.stringify({ stories, updatedAt: new Date().toISOString() }, null, 2)
  await s3.putObject({
    Bucket: BUCKET,
    Key: STORIES_KEY,
    Body: body,
    ContentType: 'application/json',
    ACL: 'public-read'
  }).promise()
}

/**
 * Add a new story to the live store
 */
async function addLiveStory(story) {
  const stories = await readLiveStories()
  stories.unshift(story) // newest first
  await writeLiveStories(stories)
  return story
}

/**
 * Upload audio buffer to S3 and return public URL
 */
async function uploadAudioBuffer(buffer, fileName) {
  const key = `audio/${fileName}`
  const result = await s3.upload({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'audio/mpeg',

    CacheControl: 'max-age=31536000'
  }).promise()
  return result.Location
}

/**
 * Upload image buffer to S3 and return public URL
 */
async function uploadImageBuffer(buffer, fileName) {
  const key = `thumbnails/${fileName}`
  const result = await s3.upload({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg',

    CacheControl: 'max-age=31536000'
  }).promise()
  return result.Location
}

/**
 * Generate a presigned URL for an S3 object (6 hour expiry)
 * Parses the S3 URL to extract bucket and key
 */
function getPresignedUrl(s3Url) {
  const pattern = /^https:\/\/([^.]+)\.s3[.-]([^.]+)\.amazonaws\.com\/(.+)$/
  const match = s3Url.match(pattern)
  if (!match) return s3Url // Return as-is if not a valid S3 URL

  const [, bucket, , key] = match
  return s3.getSignedUrl('getObject', {
    Bucket: bucket,
    Key: decodeURIComponent(key),
    Expires: 6 * 60 * 60 // 6 hours
  })
}

module.exports = {
  readLiveStories,
  writeLiveStories,
  addLiveStory,
  uploadAudioBuffer,
  uploadImageBuffer,
  getPresignedUrl
}
