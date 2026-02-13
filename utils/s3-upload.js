// 📤 AWS S3 Upload Utility for Audio Files
const AWS = require('aws-sdk');
const fs = require('fs').promises;
const path = require('path');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1'
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'stagefm-audio';

/**
 * Upload audio file to S3 and return public URL
 * @param {string} localFilePath - Local path to MP3 file
 * @param {string} fileName - Desired filename in S3
 * @returns {Promise<string>} - Public S3 URL
 */
async function uploadToS3(localFilePath, fileName) {
  try {
    console.log(`\n📤 Uploading to S3: ${fileName}`);

    // Read file
    const fileContent = await fs.readFile(localFilePath);
    const s3Key = `audio/${fileName}`;

    // Upload parameters
    const params = {
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileContent,
      ContentType: 'audio/mpeg',
      ACL: 'public-read',
      CacheControl: 'max-age=31536000', // 1 year cache
      Metadata: {
        'uploaded-at': new Date().toISOString(),
        'generated-by': 'stagefm-automation'
      }
    };

    // Upload to S3
    const result = await s3.upload(params).promise();
    console.log(`✅ S3 Upload Success: ${result.Location}`);

    // Delete local file to save disk space
    try {
      await fs.unlink(localFilePath);
      console.log(`🗑️  Deleted local file: ${localFilePath}`);
    } catch (err) {
      console.log(`⚠️  Could not delete local file: ${err.message}`);
    }

    return result.Location;
  } catch (error) {
    console.error(`❌ S3 Upload Failed: ${error.message}`);
    throw error;
  }
}

/**
 * Delete file from S3
 * @param {string} s3Url - Full S3 URL or just the key
 */
async function deleteFromS3(s3Url) {
  try {
    // Extract key from URL if full URL provided
    const s3Key = s3Url.includes('amazonaws.com')
      ? s3Url.split('.com/')[1]
      : s3Url;

    const params = {
      Bucket: BUCKET_NAME,
      Key: s3Key
    };

    await s3.deleteObject(params).promise();
    console.log(`🗑️  Deleted from S3: ${s3Key}`);
    return true;
  } catch (error) {
    console.error(`❌ S3 Delete Failed: ${error.message}`);
    throw error;
  }
}

/**
 * List all audio files in S3
 * @returns {Promise<Array>} - Array of file objects
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
      fileName: item.Key.split('/').pop(),
      size: item.Size,
      sizeInMB: (item.Size / (1024 * 1024)).toFixed(2),
      lastModified: item.LastModified,
      url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${item.Key}`
    }));
  } catch (error) {
    console.error(`❌ S3 List Failed: ${error.message}`);
    throw error;
  }
}

/**
 * Check if S3 is configured and accessible
 * @returns {Promise<boolean>}
 */
async function checkS3Connection() {
  try {
    console.log('\n🔍 Checking S3 connection...');

    const params = {
      Bucket: BUCKET_NAME,
      MaxKeys: 1
    };

    await s3.listObjectsV2(params).promise();
    console.log('✅ S3 connection successful!');
    return true;
  } catch (error) {
    console.error('❌ S3 connection failed:', error.message);
    return false;
  }
}

module.exports = {
  uploadToS3,
  deleteFromS3,
  listAudioFiles,
  checkS3Connection
};
