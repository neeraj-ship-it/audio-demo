// S3 Upload Utility
const AWS = require('aws-sdk');
const fs = require('fs').promises;

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1'
});

async function uploadToS3(localFilePath, s3Key) {
  try {
    const fileContent = await fs.readFile(localFilePath);

    const params = {
      Bucket: process.env.AWS_S3_BUCKET || 'stagefm-audio',
      Key: s3Key,
      Body: fileContent,
      ContentType: 'audio/mpeg',
      ACL: 'public-read'
    };

    const result = await s3.upload(params).promise();
    console.log(`✅ Uploaded to S3: ${result.Location}`);

    return result.Location;
  } catch (error) {
    console.error('❌ S3 Upload Error:', error.message);
    throw error;
  }
}

module.exports = { uploadToS3 };
