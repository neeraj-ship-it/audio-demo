// ═══════════════════════════════════════════════════════
// AWS S3 STORAGE INTEGRATION
// ═══════════════════════════════════════════════════════

const AWS = require('aws-sdk');

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1'
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'stagefm-audio';

// ═══════════════════════════════════════════════════════
// UPLOAD AUDIO TO S3
// ═══════════════════════════════════════════════════════

export async function uploadAudioToS3(buffer, filename) {
  try {
    const key = `audio/${Date.now()}-${filename}.mp3`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: 'audio/mpeg'
    };

    const result = await s3.upload(params).promise();

    console.log(`✅ Uploaded to S3: ${result.Location}`);
    return result.Location;

  } catch (error) {
    console.error('❌ S3 Upload Error:', error.message);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════
// UPLOAD IMAGE TO S3
// ═══════════════════════════════════════════════════════

export async function uploadImageToS3(buffer, filename) {
  try {
    const key = `images/${Date.now()}-${filename}.jpg`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg'
    };

    const result = await s3.upload(params).promise();

    console.log(`✅ Uploaded image to S3: ${result.Location}`);
    return result.Location;

  } catch (error) {
    console.error('❌ S3 Image Upload Error:', error.message);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════
// DELETE FILE FROM S3
// ═══════════════════════════════════════════════════════

export async function deleteFileFromS3(fileUrl) {
  try {
    // Extract key from URL
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // Remove leading /

    const params = {
      Bucket: BUCKET_NAME,
      Key: key
    };

    await s3.deleteObject(params).promise();

    console.log(`✅ Deleted from S3: ${key}`);
    return true;

  } catch (error) {
    console.error('❌ S3 Delete Error:', error.message);
    return false;
  }
}

// ═══════════════════════════════════════════════════════
// CREATE S3 BUCKET (IF NOT EXISTS)
// ═══════════════════════════════════════════════════════

export async function createBucketIfNotExists() {
  try {
    // Check if bucket exists
    await s3.headBucket({ Bucket: BUCKET_NAME }).promise();
    console.log(`✅ S3 Bucket exists: ${BUCKET_NAME}`);
    return true;

  } catch (error) {
    if (error.statusCode === 404) {
      // Bucket doesn't exist, create it
      console.log(`📦 Creating S3 bucket: ${BUCKET_NAME}`);

      await s3.createBucket({
        Bucket: BUCKET_NAME,
        ACL: 'public-read'
      }).promise();

      // Set bucket policy for public read access
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'PublicReadGetObject',
            Effect: 'Allow',
            Principal: '*',
            Action: 's3:GetObject',
            Resource: `arn:aws:s3:::${BUCKET_NAME}/*`
          }
        ]
      };

      await s3.putBucketPolicy({
        Bucket: BUCKET_NAME,
        Policy: JSON.stringify(policy)
      }).promise();

      console.log(`✅ S3 Bucket created: ${BUCKET_NAME}`);
      return true;

    } else {
      console.error('❌ S3 Error:', error.message);
      throw error;
    }
  }
}

// ═══════════════════════════════════════════════════════
// LIST FILES IN BUCKET
// ═══════════════════════════════════════════════════════

export async function listFilesInBucket(prefix = '') {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Prefix: prefix
    };

    const result = await s3.listObjectsV2(params).promise();

    return result.Contents || [];

  } catch (error) {
    console.error('❌ S3 List Error:', error.message);
    return [];
  }
}

// ═══════════════════════════════════════════════════════
// GET FILE URL
// ═══════════════════════════════════════════════════════

export function getS3Url(key) {
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

module.exports = {
  uploadAudioToS3,
  uploadImageToS3,
  deleteFileFromS3,
  createBucketIfNotExists,
  listFilesInBucket,
  getS3Url
};
