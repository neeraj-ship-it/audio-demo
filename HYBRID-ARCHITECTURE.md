// S3 Upload Utility
const AWS = require('aws-sdk');
const fs = require('fs').promises;
const path = require('path');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1'
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'stagefm-audio';

async function uploadToS3(localFilePath, s3Key) {
  try {
    console.log(`📤 Uploading to S3: ${s3Key}`);

    const fileContent = await fs.readFile(localFilePath);

    const params = {
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileContent,
      ContentType: 'audio/mpeg',
      ACL: 'public-read',
      CacheControl: 'max-age=31536000' // 1 year cache
    };

    const result = await s3.upload(params).promise();
    console.log(`✅ Uploaded: ${result.Location}`);

    // Delete local file to save space
    await fs.unlink(localFilePath);
    console.log(`🗑️  Deleted local file: ${localFilePath}`);

    return result.Location;
  } catch (error) {
    console.error('❌ S3 Upload Error:', error.message);
    throw error;
  }
}

async function deleteFromS3(s3Key) {
  try {
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

module.exports = { uploadToS3, deleteFromS3 };
