# AWS S3 Integration Guide for Garmently

## 🚀 Complete Setup Instructions

Your Garmently app is now configured to use AWS S3 for file storage! Here's how to complete the setup:

## Step 1: Create AWS Account & S3 Bucket

1. **Sign up for AWS** at https://aws.amazon.com
2. **Create S3 Bucket:**
   - Go to S3 Console
   - Click "Create bucket"
   - Bucket name: `garmently-media` (or your preferred name)
   - Region: `us-east-1` (or your preferred region)
   - **Uncheck "Block all public access"** (for public image access)
   - Click "Create bucket"

## Step 2: Configure Bucket Permissions

### Bucket Policy (for public read access to images):
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::garmently-media/*"
        }
    ]
}
```

### CORS Configuration:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["http://localhost:3000", "http://localhost:8000"],
        "ExposeHeaders": []
    }
]
```

## Step 3: Create IAM User for Django

1. **Go to IAM Console** → Users → Create User
2. **Username:** `garmently-django`
3. **Attach policies:** `AmazonS3FullAccess` (or create custom policy)
4. **Create Access Keys:**
   - Go to Security credentials
   - Create access key
   - Choose "Application running outside AWS"
   - **Copy Access Key ID and Secret Access Key**

## Step 4: Update Environment Variables

Edit `backend/.env` file:
```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_actual_access_key_id
AWS_SECRET_ACCESS_KEY=your_actual_secret_access_key
AWS_STORAGE_BUCKET_NAME=garmently-media
AWS_S3_REGION_NAME=us-east-1

# Django Secret Key
SECRET_KEY=django-insecure-^*84k3*3y_ocws*-)h)70l0$-l*edcguxiujz(*)+b=y-wn^j5
```

## Step 5: Test S3 Integration

### Django Admin Setup:
```bash
# Create superuser to access admin
cd backend
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### Admin Interface:
- Go to `http://localhost:8000/admin`
- Login with superuser credentials
- Add Categories and Garments with images
- Images will be uploaded to S3 automatically!

## Step 6: API Endpoints Available

```
GET  /api/categories/          - List all categories
POST /api/categories/          - Create category
GET  /api/garments-api/        - List all garments
POST /api/garments-api/        - Create garment (with image upload)
GET  /api/garments-api/{id}/   - Get specific garment
PUT  /api/garments-api/{id}/   - Update garment
DELETE /api/garments-api/{id}/ - Delete garment
GET  /api/outfits/             - List all outfits
POST /api/outfits/             - Create outfit
```

## Step 7: Frontend Image Upload

The frontend now includes:
- ✅ **ImageUpload component** for drag-and-drop uploads
- ✅ **S3 URL display** for uploaded images
- ✅ **Preview functionality** for selected images

## 🔒 Security Best Practices

1. **Environment Variables:** Never commit `.env` files
2. **IAM Permissions:** Use least privilege principle
3. **Bucket Policies:** Restrict access as needed
4. **CORS:** Only allow required origins

## 🚀 What's Now Possible

- ✅ **Image Uploads** to S3 via Django API
- ✅ **Automatic Image URLs** from S3
- ✅ **Scalable File Storage** (no local storage limits)
- ✅ **Fast Image Delivery** via S3 CDN
- ✅ **Professional File Management**

## 📱 Next Steps

1. Complete AWS setup with your credentials
2. Test image uploads through Django admin
3. Integrate ImageUpload component in your inventory
4. Add image editing capabilities
5. Implement image optimization

Your Garmently app is now enterprise-ready with AWS S3 integration! 🎉