# WHMCS to Zoho Books Invoice Sync

Automated workflow to sync paid invoices from WHMCS to Zoho Books using Astro and Cloudflare Pages.

## 🎯 Features

- ✅ Receives webhook data from WHMCS when invoices are paid
- 📊 Logs all incoming webhook data for debugging
- 🔄 (Coming soon) Creates invoices in Zoho Books automatically
- 🚀 Deployed on Cloudflare Pages (serverless)
- 📱 Dashboard to monitor webhook activity

## 📋 Prerequisites

- WHMCS installation with admin access
- Cloudflare account (free tier works)
- GitHub account
- Node.js 18+ (for local development)

## 🚀 Quick Start

### 1. Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:4321` to see the dashboard.

### 2. Deploy to Cloudflare Pages

#### Option A: Via GitHub (Recommended)

1. Push this code to a GitHub repository
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
3. Navigate to **Pages** → **Create a project**
4. Connect your GitHub repository
5. Use these build settings:
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. Click **Save and Deploy**

#### Option B: Via CLI

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
npm run build
wrangler pages deploy dist
```

### 3. Configure WHMCS Hook

1. Copy the PHP hook to WHMCS:
   ```
   /path/to/whmcs/includes/hooks/astro_webhook.php
   ```

2. Edit the webhook URL (line 96):
   ```php
   $webhookUrl = 'https://your-project.pages.dev/api/whmcs-webhook';
   ```

3. Set permissions:
   ```bash
   chmod 644 astro_webhook.php
   ```

## 🧪 Testing

Visit: `https://your-project.pages.dev/api/whmcs-webhook`

Test in WHMCS:
1. Create test invoice
2. Mark as paid
3. Check logs in both systems

## 📂 Project Structure

```
whmcs-zoho-sync/
├── src/
│   └── pages/
│       ├── index.astro              # Dashboard
│       └── api/
│           └── whmcs-webhook.ts     # Webhook endpoint
├── astro.config.mjs
├── package.json
└── README.md
```

## 🗺️ Next Steps

1. ✅ Deploy to Cloudflare Pages
2. ✅ Configure WHMCS hook
3. ✅ Test webhook reception
4. ⏳ Add Zoho Books integration
5. ⏳ Store webhook history

## 📚 Resources

- [Astro Docs](https://docs.astro.build)
- [Cloudflare Pages](https://developers.cloudflare.com/pages)
- [WHMCS Hooks](https://developers.whmcs.com/hooks/)
- [Zoho Books API](https://www.zoho.com/books/api/v3/)

---

**Status:** ✅ Phase 1 Complete - Ready for testing
