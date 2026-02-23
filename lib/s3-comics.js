// ═══════════════════════════════════════════════════════
// S3 Storage for Comic Books + Reading Progress
// Pattern from s3-interactive.js
// ═══════════════════════════════════════════════════════

const AWS = require('aws-sdk')

const s3 = new AWS.S3({
  accessKeyId: (process.env.AWS_ACCESS_KEY_ID || '').trim(),
  secretAccessKey: (process.env.AWS_SECRET_ACCESS_KEY || '').trim(),
  region: (process.env.AWS_REGION || 'ap-south-1').trim()
})

const BUCKET = (process.env.AWS_S3_BUCKET || 'stagefm-audio').trim()
const COMICS_KEY = 'data/comics-live.json'
const COMICS_PROGRESS_PREFIX = 'data/comics-progress/'

/**
 * Read comics from S3
 */
async function readComics() {
  try {
    const result = await s3.getObject({ Bucket: BUCKET, Key: COMICS_KEY }).promise()
    const data = JSON.parse(result.Body.toString('utf-8'))
    return data.comics || []
  } catch (err) {
    if (err.code === 'NoSuchKey' || err.code === 'AccessDenied') {
      return []
    }
    console.error('S3 comics read error:', err.message)
    return []
  }
}

/**
 * Write comics to S3
 */
async function writeComics(comics) {
  const body = JSON.stringify({ comics, updatedAt: new Date().toISOString() }, null, 2)
  await s3.putObject({
    Bucket: BUCKET,
    Key: COMICS_KEY,
    Body: body,
    ContentType: 'application/json'
  }).promise()
}

/**
 * Add a new comic to S3
 */
async function addComic(comic) {
  const comics = await readComics()
  comics.unshift(comic)
  await writeComics(comics)
  return comic
}

/**
 * Read user reading progress for a comic from S3
 */
async function readComicProgress(userId, comicId) {
  const key = `${COMICS_PROGRESS_PREFIX}${userId}/${comicId}.json`
  try {
    const result = await s3.getObject({ Bucket: BUCKET, Key: key }).promise()
    return JSON.parse(result.Body.toString('utf-8'))
  } catch (err) {
    if (err.code === 'NoSuchKey' || err.code === 'AccessDenied') {
      return null
    }
    console.error('S3 comic progress read error:', err.message)
    return null
  }
}

/**
 * Save user reading progress for a comic to S3
 */
async function saveComicProgress(userId, comicId, progress) {
  const key = `${COMICS_PROGRESS_PREFIX}${userId}/${comicId}.json`
  const body = JSON.stringify({
    ...progress,
    userId,
    comicId,
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
 * Upload comic panel image to S3
 */
async function uploadPanelImage(buffer, comicId, panelId) {
  const key = `images/comics/${comicId}/${panelId}.jpg`
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
 * Upload comic panel audio to S3
 */
async function uploadPanelAudio(buffer, comicId, panelId) {
  const key = `audio/comics/${comicId}/${panelId}.mp3`
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
 * Upload comic thumbnail to S3
 */
async function uploadComicThumbnail(buffer, comicId) {
  const key = `thumbnails/comics/${comicId}/cover.jpg`
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
  readComics,
  writeComics,
  addComic,
  readComicProgress,
  saveComicProgress,
  uploadPanelImage,
  uploadPanelAudio,
  uploadComicThumbnail
}
