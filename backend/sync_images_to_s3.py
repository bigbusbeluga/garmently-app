"""
Script to upload existing local images to S3 bucket.
Run this after configuring S3 storage to sync local files to AWS.
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'garmently_backend.settings')
django.setup()

import boto3
from django.conf import settings
from api.models import Garment

def sync_images_to_s3():
    """Upload all local images to S3 and update the database."""
    
    if not settings.USE_S3:
        print("ERROR: S3 storage is not enabled in settings.")
        print("Please set USE_S3 = True in settings.py")
        return
    
    # Initialize S3 client
    s3_client = boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME
    )
    
    bucket_name = settings.AWS_STORAGE_BUCKET_NAME
    media_root = os.path.join(settings.BASE_DIR, 'media')
    
    print(f"Starting image sync to S3 bucket: {bucket_name}")
    print(f"Scanning directory: {media_root}")
    print("-" * 60)
    
    uploaded_count = 0
    skipped_count = 0
    error_count = 0
    
    # Walk through media directory
    for root, dirs, files in os.walk(media_root):
        for filename in files:
            # Skip non-image files
            if not filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
                continue
                
            local_path = os.path.join(root, filename)
            
            # Get relative path from media root
            relative_path = os.path.relpath(local_path, media_root)
            s3_key = relative_path.replace('\\', '/')  # Use forward slashes for S3
            
            try:
                # Check if file already exists in S3
                try:
                    s3_client.head_object(Bucket=bucket_name, Key=s3_key)
                    print(f"⏭️  SKIP: {s3_key} (already exists)")
                    skipped_count += 1
                    continue
                except:
                    pass  # File doesn't exist, proceed with upload
                
                # Upload to S3 (bucket policy handles public access)
                with open(local_path, 'rb') as file_data:
                    s3_client.put_object(
                        Bucket=bucket_name,
                        Key=s3_key,
                        Body=file_data,
                        ContentType=get_content_type(filename),
                        CacheControl='max-age=86400'
                    )
                
                print(f"✅ UPLOADED: {s3_key}")
                uploaded_count += 1
                
            except Exception as e:
                print(f"❌ ERROR uploading {s3_key}: {str(e)}")
                error_count += 1
    
    print("-" * 60)
    print(f"✅ Uploaded: {uploaded_count}")
    print(f"⏭️  Skipped: {skipped_count}")
    print(f"❌ Errors: {error_count}")
    print("-" * 60)
    
    # Verify all garment images are accessible
    print("\nVerifying garment image URLs...")
    garments = Garment.objects.all()
    
    for garment in garments:
        if garment.image:
            print(f"  {garment.name}: {garment.image.url}")
    
    print("\nSync complete! Images should now be visible in your application.")

def get_content_type(filename):
    """Return the MIME type for a file based on its extension."""
    ext = filename.lower().split('.')[-1]
    content_types = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
    }
    return content_types.get(ext, 'application/octet-stream')

if __name__ == '__main__':
    sync_images_to_s3()
