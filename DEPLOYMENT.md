# 🚀 Deployment Guide

## Step-by-Step Deployment to Cloudflare Pages

### 1️⃣ Prepare Your Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: WHMCS to Zoho sync workflow"

# Add remote (replace with your GitHub repo URL)
git remote add origin https://github.com/yourusername/whmcs-zoho-sync.git

# Push to GitHub
git push -u origin main
```

### 2️⃣ Deploy to Cloudflare Pages

1. **Login to Cloudflare**
   - Go to https://dash.cloudflare.com
   - Navigate to **Pages**

2. **Create New Project**
   - Click **"Create a project"**
   - Click **"Connect to Git"**
   - Select **GitHub** and authorize Cloudflare

3. **Select Repository**
   - Choose your `whmcs-zoho-sync` repository
   - Click **"Begin setup"**

4. **Configure Build Settings**
   ```
   Project name: whmcs-zoho-sync (or your choice)
   Production branch: main
   Framework preset: Astro
   Build command: npm run build
   Build output directory: dist
   ```

5. **Click "Save and Deploy"**
   - Wait for the build to complete (usually 1-2 minutes)
   - Note your deployment URL: `https://whmcs-zoho-sync.pages.dev`

### 3️⃣ Update WHMCS Hook

1. Open `/includes/hooks/astro_webhook.php` on your WHMCS server

2. Update line 96 with your Cloudflare Pages URL:
   ```php
   $webhookUrl = 'https://whmcs-zoho-sync.pages.dev/api/whmcs-webhook';
   ```

3. Save the file

### 4️⃣ Test the Integration

1. **Test the endpoint directly:**
   - Visit: `https://your-project.pages.dev/api/whmcs-webhook`
   - You should see JSON response with status: "active"

2. **Test with WHMCS:**
   - Create a test invoice in WHMCS
   - Mark it as paid
   - Check WHMCS Activity Log for "ASTRO WEBHOOK SUCCESS" entries

3. **Check Cloudflare Logs:**
   - Go to Cloudflare Dashboard → Pages → Your Project
   - Click **"View Logs"** (Function Logs in real-time)
   - Look for "=== WHMCS WEBHOOK RECEIVED ===" entries

### 5️⃣ Monitor & Verify

**WHMCS Logs Location:**
```
Utilities → Logs → Activity Log
Search for: "ASTRO WEBHOOK"
```

**Cloudflare Logs:**
```
Dashboard → Pages → Your Project → View Logs
Filter by: "WHMCS WEBHOOK"
```

## 🔧 Adding Environment Variables (For Zoho Later)

When ready to integrate Zoho Books:

1. Go to **Pages** → Your Project → **Settings**
2. Click **Environment Variables**
3. Add production variables:
   ```
   ZOHO_CLIENT_ID = your_client_id
   ZOHO_CLIENT_SECRET = your_client_secret
   ZOHO_REFRESH_TOKEN = your_refresh_token
   ZOHO_ORGANIZATION_ID = your_org_id
   ```
4. Click **"Save"**
5. Redeploy: **Deployments** → **Retry deployment**

## 🐛 Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Verify `package.json` dependencies are correct
- Review build logs in Cloudflare

### Webhook Not Receiving Data
- Verify URL is correct in WHMCS hook
- Check if deployment is successful
- Test endpoint with browser first

### WHMCS Hook Not Triggering
- Verify file permissions (644)
- Check PHP error logs
- Ensure file is in correct directory

## 📊 Expected Results

**Successful Webhook Response:**
```json
{
  "success": true,
  "message": "Webhook received and logged successfully",
  "invoice_id": 123,
  "invoice_number": "INV-2024-001",
  "processing_time_ms": 45,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**WHMCS Activity Log Entry:**
```
ASTRO WEBHOOK SUCCESS - Invoice #123 - HTTP 200 - Time: 0.145s
```

## ✅ Checklist

- [ ] Code pushed to GitHub
- [ ] Cloudflare Pages project created
- [ ] Build completed successfully
- [ ] Deployment URL noted
- [ ] WHMCS hook updated with correct URL
- [ ] Test invoice marked as paid
- [ ] Webhook data received in Cloudflare logs
- [ ] Dashboard accessible at root URL

## 🎯 Next Phase

Once webhooks are working:
1. Add Zoho Books API credentials
2. Implement invoice creation logic
3. Add error handling and retries
4. Set up monitoring and alerts

---

**Current Phase:** Webhook Reception Testing ✅
**Next Phase:** Zoho Books Integration ⏳
