# Hugging Face API Setup Guide

## Overview

The app uses Hugging Face Inference API for face verification in matrimonial profile photos. This ensures that uploaded photos contain a clearly visible face.

---

## How to Get Your Hugging Face API Key

### Step 1: Create a Hugging Face Account

1. Go to [Hugging Face](https://huggingface.co/)
2. Click **Sign Up** in the top right corner
3. Create an account using:
   - Email
   - Google account
   - GitHub account
   - Or other supported methods

### Step 2: Generate an Access Token

1. Once logged in, click on your **profile icon** (top right)
2. Select **Settings** from the dropdown menu
3. In the left sidebar, click **Access Tokens**
4. Click **New Token** button
5. Configure your token:
   - **Name:** `Bhatia-Buzz-Face-Verification` (or any name you prefer)
   - **Type:** Select **Read** (sufficient for Inference API)
   - **Expiration:** Choose based on your needs:
     - **No expiration** (recommended for production)
     - **Custom date** (for testing)
6. Click **Generate Token**
7. **IMPORTANT:** Copy the token immediately - you won't be able to see it again!
   - It will look like: `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 3: Add Token to Your Project

#### Option A: Environment Variable (Recommended)

1. Open your `.env` file in the project root
2. Add the following line:
   ```env
   EXPO_PUBLIC_HUGGING_FACE_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. Replace `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` with your actual token
4. Save the file
5. Restart your Expo development server

#### Option B: Direct Configuration (Not Recommended for Production)

You can also add it directly in `src/constants/config.ts`:
```typescript
export const huggingFaceConfig = {
  apiToken: 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Your token here
  // ...
};
```

**⚠️ Warning:** Never commit your API token to version control!

---

## Free Tier Limits

### Hugging Face Free Tier:
- **Rate Limit:** ~30 requests per minute (varies)
- **Model Loading:** First request may take 10-20 seconds (model needs to load)
- **Subsequent Requests:** Usually faster (model stays loaded for a while)
- **Cost:** Free for reasonable usage

### Paid Plans (if needed):
- **Pro Plan:** $9/month - Higher rate limits, priority access
- **Enterprise:** Custom pricing - Dedicated resources

For most apps, the free tier is sufficient.

---

## How It Works

### Face Verification Process:

1. **User selects photo** from gallery
2. **Image is converted** to base64 format
3. **Sent to Hugging Face API** with face detection model
4. **API returns:**
   - Number of faces detected
   - Face bounding boxes
   - Confidence scores
5. **App validates:**
   - Exactly one face detected
   - Confidence score above threshold (0.5)
   - Face is reasonably visible
6. **Photo is accepted or rejected** with user feedback

### Model Used:
- **Model:** `HamedSarraf/Face-Detection`
- **Type:** Face Detection
- **Purpose:** Detects faces in images
- **Output:** Bounding boxes and confidence scores

---

## Testing Your API Key

### Quick Test:

1. Add your token to `.env`:
   ```env
   EXPO_PUBLIC_HUGGING_FACE_TOKEN=your_token_here
   ```

2. Restart the app:
   ```bash
   pnpm start
   ```

3. Navigate to **Matrimonial** → **Create Profile**
4. Try uploading a photo
5. You should see "Verifying..." message
6. If successful, you'll see "Photo verified and added successfully!"

### Troubleshooting:

#### Error: "Invalid API token"
- ✅ Check that your token is correct
- ✅ Ensure token has **Read** permissions
- ✅ Verify token hasn't expired (if you set expiration)

#### Error: "Service temporarily unavailable" (503)
- ⏳ Model is loading (first request takes 10-20 seconds)
- ✅ Wait a moment and try again
- ✅ This is normal for free tier

#### Error: "Request timed out"
- ✅ Check your internet connection
- ✅ Try again (model might be loading)
- ✅ Consider increasing timeout in code if needed

#### Error: "No face detected"
- ✅ Ensure photo has a clear face
- ✅ Check lighting in photo
- ✅ Try a different photo
- ✅ Face should be facing camera

---

## Security Best Practices

### ✅ DO:
- Store API token in `.env` file
- Add `.env` to `.gitignore` (should already be there)
- Use environment variables in production
- Rotate tokens periodically
- Use **Read** permission (not Write) for tokens

### ❌ DON'T:
- Commit API tokens to Git
- Share tokens publicly
- Use Write permissions unless needed
- Hardcode tokens in source code

---

## Alternative Models

If the default model doesn't work well, you can try:

1. **`facebook/detr-resnet-50`** - General object detection (can detect faces)
2. **`microsoft/table-transformer-structure-recognition`** - Not for faces, but example
3. **Custom models** - Train your own or use community models

To change the model, update `src/constants/config.ts`:
```typescript
export const huggingFaceConfig = {
  modelName: 'facebook/detr-resnet-50', // Change model here
  // ...
};
```

---

## Cost Considerations

### Free Tier:
- ✅ **Free** for reasonable usage
- ✅ Good for development and small apps
- ⚠️ Rate limits may apply during high traffic

### If You Need More:
- **Pro Plan:** $9/month
- **Enterprise:** Custom pricing
- Consider caching results to reduce API calls

---

## API Response Format

The face detection API returns:
```json
[
  {
    "xmin": 100,
    "ymin": 150,
    "xmax": 300,
    "ymax": 350,
    "score": 0.95,
    "label": "face"
  }
]
```

Our code handles various response formats for compatibility.

---

## Next Steps

1. ✅ Get your Hugging Face API token
2. ✅ Add it to `.env` file
3. ✅ Test face verification
4. ✅ Deploy with environment variable in production

---

## Production Deployment

### For Expo/EAS Build:

1. Add environment variable in `eas.json`:
   ```json
   {
     "build": {
       "production": {
         "env": {
           "EXPO_PUBLIC_HUGGING_FACE_TOKEN": "your_token_here"
         }
       }
     }
   }
   ```

2. Or use EAS Secrets:
   ```bash
   eas secret:create --scope project --name EXPO_PUBLIC_HUGGING_FACE_TOKEN --value your_token_here
   ```

### For Other Platforms:

- **React Native:** Use `react-native-config` or similar
- **Web:** Ensure environment variable is accessible
- **Native:** Use platform-specific config files

---

## Support

- **Hugging Face Docs:** https://huggingface.co/docs/api-inference
- **Hugging Face Models:** https://huggingface.co/models?pipeline_tag=object-detection
- **API Status:** https://status.huggingface.co/

---

*Last Updated: [Current Date]*
