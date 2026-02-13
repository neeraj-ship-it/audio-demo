// 📤 S3 Upload Utility for Production
const AWS = require('aws-sdk');
const fs = require('fs').promises;
const path = require('path');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1'
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'stagefm-audio';
const CDN_URL = process.env.CDN_URL || `https://${BUCKET_NAME}.s3.ap-south-1.amazonaws.com`;

/**
 * Upload audio file to S3
 * @param {string} localFilePath - Path to local MP3 file
 * @param {string} fileName - Filename for S3 (e.g., 'bhojpuri-story-123.mp3')
 * @returns {Promise<string>} - Public S3 URL
 */
async function uploadAudioToS3(localFilePath, fileName) {
  try {
    console.log(`📤 Uploading to S3: ${fileName}`);

    const fileContent = await fs.readFile(localFilePath);
    const s3Key = `audio/${fileName}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileContent,
      ContentType: 'audio/mpeg',
      ACL: 'public-read',
      CacheControl: 'max-age=31536000', // 1 year
      Metadata: {
        'uploaded-at': new Date().toISOString(),
        'generated-by': 'stagefm-automation'
      }
    };

    const result = await s3.upload(params).promise();
    console.log(`✅ Uploaded: ${result.Location}`);

    // Clean up local file to save disk space
    await fs.unlink(localFilePath);
    console.log(`🗑️  Deleted local file: ${localFilePath}`);

    return result.Location;
  } catch (error) {
    console.error('❌ S3 Upload Error:', error.message);
    throw error;
  }
}

/**
 * Delete audio file from S3
 * @param {string} s3Url - Full S3 URL or just the key
 */
async function deleteAudioFromS3(s3Url) {
  try {
    // Extract key from URL
    const s3Key = s3Url.includes('amazonaws.com')
      ? s3Url.split('.com/')[1]
      : s3Url;

    const params = {
      Bucket: BUCKET_NAME,
      Key: s3Key
    };

    await s3.deleteObject(params).promise();
    console.log(`🗑️  Deleted from S3: ${s3Key}`);
  } catch (error) {
    console.error('❌ S3 Delete Error:', error.message);
    throw error;
  }
}

/**
 * List all audio files in S3
 */
async function listAudioFiles() {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Prefix: 'audio/',
      MaxKeys: 1000
    };

    const result = await s3.listObjectsV2(params).promise();
    return result.Contents.map(item => ({
      key: item.Key,
      size: item.Size,
      lastModified: item.LastModified,
      url: `${CDN_URL}/${item.Key}`
    }));
  } catch (error) {
    console.error('❌ S3 List Error:', error.message);
    throw error;
  }
}

module.exports = {
  uploadAudioToS3,
  deleteAudioFromS3,
  listAudioFiles
};
