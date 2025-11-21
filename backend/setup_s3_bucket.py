"""
Script to configure S3 bucket for public read access and CORS.
Run this once to set up your S3 bucket permissions.
"""
import os
import sys
import json
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'garmently_backend.settings')
django.setup()

import boto3
from django.conf import settings

def setup_s3_bucket():
    """Configure S3 bucket with proper permissions and CORS."""
    
    if not settings.USE_S3:
        print("ERROR: S3 storage is not enabled in settings.")
        print("Please ensure AWS credentials are set in environment variables.")
        return
    
    # Initialize S3 client
    s3_client = boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME
    )
    
    bucket_name = settings.AWS_STORAGE_BUCKET_NAME
    
    print(f"Configuring S3 bucket: {bucket_name}")
    print(f"Region: {settings.AWS_S3_REGION_NAME}")
    print("-" * 60)
    
    # 1. FIRST: Disable Block Public Access settings
    print("\n1. Updating public access block settings (must be done first)...")
    try:
        s3_client.put_public_access_block(
            Bucket=bucket_name,
            PublicAccessBlockConfiguration={
                'BlockPublicAcls': True,  # Keep ACLs blocked
                'IgnorePublicAcls': True,
                'BlockPublicPolicy': False,  # Allow bucket policies
                'RestrictPublicBuckets': False  # Allow public bucket policies
            }
        )
        print("✅ Public access block updated - bucket policies are now allowed")
    except Exception as e:
        print(f"❌ ERROR setting public access block: {str(e)}")
        return
    
    # 2. Set bucket policy for public read access
    print("\n2. Setting bucket policy for public read access...")
    bucket_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": f"arn:aws:s3:::{bucket_name}/*"
            }
        ]
    }
    
    try:
        s3_client.put_bucket_policy(
            Bucket=bucket_name,
            Policy=json.dumps(bucket_policy)
        )
        print("✅ Bucket policy updated - all objects are publicly readable")
    except Exception as e:
        print(f"❌ ERROR setting bucket policy: {str(e)}")
        return
    
    # 3. Configure CORS
    print("\n3. Configuring CORS for frontend access...")
    cors_config = {
        'CORSRules': [
            {
                'AllowedOrigins': [
                    'http://localhost:3000',
                    'http://127.0.0.1:3000',
                    'https://*.amplifyapp.com',  # For production
                ],
                'AllowedMethods': ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                'AllowedHeaders': ['*'],
                'ExposeHeaders': ['ETag'],
                'MaxAgeSeconds': 3600
            }
        ]
    }
    
    try:
        s3_client.put_bucket_cors(
            Bucket=bucket_name,
            CORSConfiguration=cors_config
        )
        print("✅ CORS configuration updated")
    except Exception as e:
        print(f"❌ ERROR setting CORS: {str(e)}")
        return
    
    # 4. Verify configuration
    print("\n4. Verifying bucket configuration...")
    try:
        # Check policy
        policy = s3_client.get_bucket_policy(Bucket=bucket_name)
        print("✅ Bucket policy is active")
        
        # Check CORS
        cors = s3_client.get_bucket_cors(Bucket=bucket_name)
        print("✅ CORS configuration is active")
        
        # Check public access block
        pab = s3_client.get_public_access_block(Bucket=bucket_name)
        config = pab['PublicAccessBlockConfiguration']
        if not config['BlockPublicPolicy'] and not config['RestrictPublicBuckets']:
            print("✅ Public access block allows bucket policies")
        else:
            print("⚠️  Public access block may need adjustment")
            
    except Exception as e:
        print(f"⚠️  Warning during verification: {str(e)}")
    
    print("\n" + "-" * 60)
    print("✅ S3 bucket configuration complete!")
    print(f"\nYour bucket is now configured to:")
    print("  • Allow public read access to all objects")
    print("  • Accept requests from your frontend (localhost:3000)")
    print("  • Not use ACLs (using bucket policy instead)")
    print("\nNext steps:")
    print("  1. Run: python sync_images_to_s3.py")
    print("  2. Refresh your browser")
    print("  3. Upload new images - they'll automatically go to S3")

if __name__ == '__main__':
    setup_s3_bucket()
