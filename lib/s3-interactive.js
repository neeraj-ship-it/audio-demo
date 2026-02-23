// ═══════════════════════════════════════════════════════
// S3 Storage for Interactive Stories + User Progress
// Pattern from s3-storage.js - persistent JSON on S3
// ═══════════════════════════════════════════════════════

const AWS = require('aws-sdk')

const s3 = new AWS.S3({
  accessKeyId: (process.env.AWS_ACCESS_KEY_ID || '').trim(),
  secretAccessKey: (process.env.AWS_SECRET_ACCESS_KEY || '').trim(),
  region: (process.env.AWS_REGION || 'ap-south-1').trim()
})

const BUCKET = (process.env.AWS_S3_BUCKET || 'stagefm-audio').trim()
const INTERACTIVE_STORIES_KEY = 'data/interactive-stories-live.json'
const INTERACTIVE_PROGRESS_PREFIX = 'data/interactive-progress/'

/**
 * Read interactive stories from S3
 */
async function readInteractiveStories() {
  try {
    const result = await s3.getObject({ Bucket: BUCKET, Key: INTERACTIVE_STORIES_KEY }).promise()
    const data = JSON.parse(result.Body.toString('utf-8'))
    return data.stories || []
  } catch (err) {
    if (err.code === 'NoSuchKey' || err.code === 'AccessDenied') {
      return []
    }
    console.error('S3 interactive read error:', err.message)
    return []
  }
}

/**
 * Write interactive stories to S3
 */
async function writeInteractiveStories(stories) {
  const body = JSON.stringify({ stories, updatedAt: new Date().toISOString() }, null, 2)
  await s3.putObject({
    Bucket: BUCKET,
    Key: INTERACTIVE_STORIES_KEY,
    Body: body,
    ContentType: 'application/json'
  }).promise()
}

/**
 * Add a new interactive story to S3
 */
async function addInteractiveStory(story) {
  const stories = await readInteractiveStories()
  stories.unshift(story)
  await writeInteractiveStories(stories)
  return story
}

/**
 * Read user progress for a specific story from S3
 */
async function readProgress(userId, storyId) {
  const key = `${INTERACTIVE_PROGRESS_PREFIX}${userId}/${storyId}.json`
  try {
    const result = await s3.getObject({ Bucket: BUCKET, Key: key }).promise()
    return JSON.parse(result.Body.toString('utf-8'))
  } catch (err) {
    if (err.code === 'NoSuchKey' || err.code === 'AccessDenied') {
      return null
    }
    console.error('S3 progress read error:', err.message)
    return null
  }
}

/**
 * Save user progress for a specific story to S3
 */
async function saveProgress(userId, storyId, progress) {
  const key = `${INTERACTIVE_PROGRESS_PREFIX}${userId}/${storyId}.json`
  const body = JSON.stringify({
    ...progress,
    userId,
    storyId,
    updatedAt: new Date().toISOString()
  }, null, 2)
  await s3.putObject({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: 'application/json'
  }).promise()
}

/**
 * Upload scene audio to S3
 */
async function uploadSceneAudio(buffer, storyId, sceneId) {
  const key = `audio/interactive/${storyId}/${sceneId}.mp3`
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
 * Upload scene image to S3
 */
async function uploadSceneImage(buffer, storyId, sceneId) {
  const key = `thumbnails/interactive/${storyId}/${sceneId}.jpg`
  const result = await s3.upload({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg',
    CacheControl: 'max-age=31536000'
  }).promise()
  return result.Location
}

module.exports = {
  readInteractiveStories,
  writeInteractiveStories,
  addInteractiveStory,
  readProgress,
  saveProgress,
  uploadSceneAudio,
  uploadSceneImage
}
