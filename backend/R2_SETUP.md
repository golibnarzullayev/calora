# Cloudflare R2 Setup Guide

This guide explains how to set up Cloudflare R2 for file uploads in the Calories Calculator backend.

## What is Cloudflare R2?

Cloudflare R2 is an S3-compatible object storage service that allows you to store and serve files. It's ideal for storing meal images uploaded by users.

## Setup Steps

### 1. Create a Cloudflare Account
- Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
- Sign up or log in to your account

### 2. Create an R2 Bucket
- Navigate to **R2** in the left sidebar
- Click **Create bucket**
- Enter bucket name: `meals` (or your preferred name)
- Click **Create bucket**

### 3. Create API Token
- In R2, click **Settings**
- Scroll to **API Tokens**
- Click **Create API Token**
- Choose **Edit** permissions
- Copy the following credentials:
  - **Account ID** - Your Cloudflare Account ID
  - **Access Key ID** - R2 API Token Access Key
  - **Secret Access Key** - R2 API Token Secret Key

### 4. Set Up Custom Domain (Optional but Recommended)
- In R2 bucket settings, click **Settings**
- Under **Custom Domain**, add your domain (e.g., `r2.yourdomain.com`)
- This allows public access to your files with a custom URL

### 5. Configure Environment Variables
Add the following to your `.env` file:

```env
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=meals
CLOUDFLARE_R2_PUBLIC_URL=https://your-bucket-name.your-domain.com
```

### 6. Make Bucket Public (Optional)
If you want public access to files:
- Go to R2 bucket settings
- Click **Settings**
- Under **Public access**, enable public access
- Configure CORS if needed

## How It Works

1. User uploads an image in the frontend
2. Image is sent to backend as FormData
3. Backend receives the image and temporarily stores it locally
4. Gemini AI analyzes the image to detect food
5. If valid, image is uploaded to Cloudflare R2
6. Local file is deleted after successful upload
7. R2 URL is stored in the database
8. Frontend displays the image from R2 URL

## File Structure in R2

Files are organized as:
```
meals/
  ├── user_id_1/
  │   ├── 1709384400000-meal1.jpg
  │   └── 1709384500000-meal2.jpg
  └── user_id_2/
      └── 1709384600000-meal3.jpg
```

## Cost Considerations

Cloudflare R2 pricing:
- **Storage**: $0.015 per GB per month
- **Class A Operations**: $4.50 per million requests
- **Class B Operations**: $0.36 per million requests
- **Egress**: Free (first 1GB per day free, then $0.02 per GB)

## Troubleshooting

### "Missing Cloudflare R2 configuration"
- Ensure all environment variables are set correctly
- Check that `CLOUDFLARE_ACCOUNT_ID` is your actual account ID (not bucket name)

### "Failed to upload file to R2"
- Verify API credentials are correct
- Check that bucket exists and is accessible
- Ensure bucket name matches `CLOUDFLARE_R2_BUCKET_NAME`

### Images not loading
- Verify `CLOUDFLARE_R2_PUBLIC_URL` is correct
- Check bucket public access settings
- Ensure CORS is configured if accessing from different domain

## Security Best Practices

1. **Never commit credentials** - Use `.env` file (in `.gitignore`)
2. **Rotate API tokens** - Periodically update R2 credentials
3. **Restrict permissions** - Use minimal required permissions for API token
4. **Enable CORS** - Only allow requests from your domain
5. **Use HTTPS** - Always use HTTPS for file transfers

## Testing

To test R2 uploads:
1. Start the backend server
2. Upload a meal image from the frontend
3. Check backend logs for R2 upload confirmation
4. Verify image URL in database
5. Open image URL in browser to confirm accessibility
