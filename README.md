# StreamFlix — Netflix-Style UI Clone

A responsive streaming-service front end built with vanilla **HTML, CSS, and JavaScript** — no frameworks, no build step. Designed to demonstrate front-end fundamentals (responsive layout, DOM rendering, component-style CSS, accessibility) and static-site deployment on AWS.

> Demo project only — not affiliated with or endorsed by Netflix. All titles, posters, and cast names are fictional placeholders.

## Features

- Responsive nav header that gains a solid background on scroll
- Full-bleed hero banner with a call-to-action row (Play / More Info)
- Horizontally scrolling content rows, rendered dynamically from a JS data set
- Hover-to-preview card interaction (desktop) with graceful fallback on touch
- Click-through detail modal (synopsis, cast, genres, match %)
- Live client-side title search with debounce
- Fully responsive down to small mobile screens, keyboard-navigable, respects `prefers-reduced-motion`

## Project structure

```
netflix-clone/
├── index.html        # Markup: header, hero, row containers, modal
├── css/
│   └── style.css      # Design tokens, layout, responsive rules, animations
├── js/
│   └── script.js       # Mock catalogue data + rendering, search, modal logic
└── README.md
```

## Run locally

No build tools required. From the project folder:

```bash
# Option 1: just open it
open index.html

# Option 2: serve it (recommended, avoids any file:// quirks)
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Deploying to AWS S3 + CloudFront

This mirrors a typical static-site deployment pipeline for scalable, low-cost global hosting.

### 1. Create and configure the S3 bucket

```bash
aws s3 mb s3://your-streamflix-bucket --region us-east-1

aws s3 website s3://your-streamflix-bucket \
  --index-document index.html \
  --error-document index.html
```

### 2. Upload the site

```bash
aws s3 sync . s3://your-streamflix-bucket \
  --exclude "README.md" \
  --exclude ".git/*" \
  --cache-control "max-age=86400"
```

### 3. Lock the bucket down (recommended) and front it with CloudFront

Keep the bucket **private** and let CloudFront access it via an Origin Access Control (OAC), rather than making the bucket public:

```bash
aws cloudfront create-distribution \
  --origin-domain-name your-streamflix-bucket.s3.amazonaws.com \
  --default-root-object index.html
```

In the AWS Console (CloudFront → your distribution):
- Set the S3 origin's **Origin Access Control** to restrict direct S3 access
- Update the bucket policy to allow only the CloudFront distribution (the console offers to generate this policy automatically)
- Set the **default root object** to `index.html`
- Add a **custom error response**: 403/404 → `/index.html`, HTTP 200 (useful if you later add client-side routing)
- Enable **compression** and a long **TTL** for `/css/*` and `/js/*`, shorter TTL for `/index.html`

### 4. Invalidate the cache after future updates

```bash
aws s3 sync . s3://your-streamflix-bucket --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### 5. (Optional) Custom domain + HTTPS

- Request a certificate in **AWS Certificate Manager** (must be in `us-east-1` for CloudFront)
- Attach it to the CloudFront distribution as an **Alternate Domain Name (CNAME)**
- Point your domain's DNS (e.g., Route 53) at the CloudFront distribution via an A/ALIAS record

## Tech notes

- Layout: CSS Grid/Flexbox, `clamp()` for fluid type and spacing, no external CSS framework
- Fonts: Google Fonts (Bebas Neue for display type, Inter for UI text)
- Icons: inline SVG (no icon font dependency)
- Data: rendered from an in-memory mock catalogue in `script.js` — swap this for a real API/CMS call if extending the project
