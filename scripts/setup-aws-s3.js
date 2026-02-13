#!/usr/bin/env node

// ═══════════════════════════════════════════════════════
// AWS S3 BUCKET SETUP SCRIPT
// ═══════════════════════════════════════════════════════
// Usage: node scripts/setup-aws-s3.js
// ═══════════════════════════════════════════════════════

require('dotenv').config({ path: '.env.local' });
const AWS = require('aws-sdk');

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'stagefm-audio';
const REGION = process.env.AWS_REGION || 'ap-south-1';

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: REGION
});

async function setupS3Bucket() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🪣 AWS S3 BUCKET SETUP');
  console.log('═══════════════════════════════════════════════════════\n');

  // Check credentials
  if (!process.env.AWS_ACCESS_KEY_ID) {
    console.error('❌ Error: AWS_ACCESS_KEY_ID not found in .env.local');
    process.exit(1);
  }

  console.log('✅ AWS Credentials found');
  console.log(`📦 Bucket Name: ${BUCKET_NAME}`);
  console.log(`🌍 Region: ${REGION}\n`);

  try {
    // Check if bucket exists
    console.log('🔍 Checking if bucket exists...');
    await s3.headBucket({ Bucket: BUCKET_NAME }).promise();
    console.log('✅ Bucket already exists!\n');

    // List existing files
    console.log('📁 Listing existing files...');
    const files = await s3.listObjectsV2({ Bucket: BUCKET_NAME, MaxKeys: 5 }).promise();

    if (files.Contents && files.Contents.length > 0) {
      console.log(`Found ${files.KeyCount} files. Sample:`);
      files.Contents.slice(0, 5).forEach(file => {
        console.log(`  - ${file.Key} (${(file.Size / 1024).toFixed(2)} KB)`);
      });
    } else {
      console.log('No files found yet.');
    }

  } catch (error) {
    if (error.statusCode === 404) {
      // Bucket doesn't exist, create it
      console.log('📦 Bucket not found. Creating...\n');

      try {
        await s3.createBucket({
          Bucket: BUCKET_NAME,
          CreateBucketConfiguration: {
            LocationConstraint: REGION
          }
        }).promise();

        console.log('✅ Bucket created successfully!\n');

        // Try to set bucket policy for public read access (may fail if Block Public Access is enabled)
        try {
          console.log('🔓 Setting public read policy...');
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

          console.log('✅ Public read policy set!\n');
        } catch (policyError) {
          console.log('⚠️  Could not set public policy (Block Public Access may be enabled)');
          console.log('   Files will use signed URLs instead.\n');
        }

        // Enable CORS
        try {
          console.log('🌐 Setting CORS policy...');
          const corsConfiguration = {
            CORSRules: [
              {
                AllowedOrigins: ['*'],
                AllowedMethods: ['GET', 'HEAD'],
                AllowedHeaders: ['*'],
                MaxAgeSeconds: 3000
              }
            ]
          };

          await s3.putBucketCors({
            Bucket: BUCKET_NAME,
            CORSConfiguration: corsConfiguration
          }).promise();

          console.log('✅ CORS policy set!\n');
        } catch (corsError) {
          console.log('⚠️  Could not set CORS policy\n');
        }

      } catch (createError) {
        console.error('❌ Error creating bucket:', createError.message);
        process.exit(1);
      }

    } else {
      console.error('❌ Error checking bucket:', error.message);
      process.exit(1);
    }
  }

  // Test upload
  console.log('🧪 Testing upload...');
  try {
    const testKey = `test/${Date.now()}-test.txt`;
    const testContent = 'Stage FM - Test Upload';

    await s3.putObject({
      Bucket: BUCKET_NAME,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain'
    }).promise();

    const testUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${testKey}`;
    console.log('✅ Test upload successful!');
    console.log(`📎 Test file URL: ${testUrl}\n`);

    // Delete test file
    await s3.deleteObject({
      Bucket: BUCKET_NAME,
      Key: testKey
    }).promise();
    console.log('🗑️  Test file deleted.\n');

  } catch (testError) {
    console.error('❌ Test upload failed:', testError.message);
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log('✨ AWS S3 SETUP COMPLETE!');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('📝 Bucket Details:');
  console.log(`   Name: ${BUCKET_NAME}`);
  console.log(`   Region: ${REGION}`);
  console.log(`   URL: https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/\n`);

  console.log('✅ Ready to produce premium stories!');
  console.log('   Run: npm run produce-premium\n');
}

// Run setup
setupS3Bucket().catch(console.error);
