# 🚀 Flash N Frame — Complete Setup Guide
### Zero coding experience needed. Follow each step exactly.

---

## What you'll set up (all FREE):
| Service | What it does | Time |
|---|---|---|
| **Supabase** | Stores your photo data (database) | 5 min |
| **Cloudinary** | Stores your actual image files | 3 min |
| **GitHub** | Holds your code online | 5 min |
| **Netlify** | Makes it a live website | 3 min |

**Total time: ~20 minutes**

---

## STEP 1 — Set up Supabase (your database)

1. Go to **https://supabase.com** → click **"Start your project"**
2. Sign up with Google
3. Click **"New Project"** → name it `flash-nframe` → set a database password → click Create
4. Wait ~1 minute for it to set up
5. In the left sidebar, click **"SQL Editor"**
6. Copy and paste this SQL, then click **"Run"**:

```sql
create table photos (
  id uuid default gen_random_uuid() primary key,
  url text not null,
  title text not null,
  tag text not null default 'Street',
  public_id text,
  created_at timestamptz default now()
);

-- Allow anyone to read photos (your website visitors)
alter table photos enable row level security;
create policy "Public read" on photos for select using (true);
create policy "Public insert" on photos for insert with check (true);
create policy "Public delete" on photos for delete using (true);
```

7. Go to **Settings → API** (left sidebar)
8. Copy these two values — you'll need them soon:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

---

## STEP 2 — Set up Cloudinary (image storage)

1. Go to **https://cloudinary.com** → click **"Sign up for free"**
2. Fill in the form and verify your email
3. Once logged in, go to your **Dashboard**
4. Copy your **Cloud Name** (shown at the top — e.g. `dxyz123abc`)
5. In the left sidebar go to **Settings → Upload**
6. Scroll down to **"Upload presets"**
7. Click **"Add upload preset"**:
   - Set **Signing Mode** to **"Unsigned"**
   - Set **Folder** to `flash_nframe`
   - Click **Save**
8. Copy the **preset name** (e.g. `ml_default` or whatever it generated)

---

## STEP 3 — Add your keys to the code

Open these two files and fill in your keys:

### In `src/Portfolio.jsx` (lines 4-5):
```js
const SUPABASE_URL  = "https://YOUR-PROJECT.supabase.co";
const SUPABASE_ANON = "eyJhbGci...your anon key...";
```

### In `src/Admin.jsx` (lines 4-7):
```js
const SUPABASE_URL      = "https://YOUR-PROJECT.supabase.co";
const SUPABASE_ANON     = "eyJhbGci...your anon key...";
const CLOUDINARY_NAME   = "your-cloud-name";
const CLOUDINARY_PRESET = "your-upload-preset-name";
const ADMIN_PASSWORD    = "choose-a-strong-password"; // ← CHANGE THIS!
```

---

## STEP 4 — Put code on GitHub

1. Go to **https://github.com** → sign up / log in
2. Click the **+** icon → **"New repository"**
3. Name it `flash-nframe` → set to **Public** → click **"Create repository"**
4. Install **GitHub Desktop** from https://desktop.github.com (easiest for beginners)
5. Open GitHub Desktop → **File → Add Local Repository** → select your `flash-nframe` folder
6. Click **"Publish repository"** → select your `flash-nframe` repo
7. Click **"Push origin"** ✓

---

## STEP 5 — Deploy to Netlify (make it live!)

1. Go to **https://netlify.com** → sign up with GitHub
2. Click **"Add new site" → "Import an existing project"**
3. Choose **GitHub** → select `flash-nframe`
4. Set these build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click **"Deploy site"**
6. Wait ~1 minute → your site is LIVE at a URL like `https://random-name.netlify.app`

### 🎉 Optional: Set a custom domain
- In Netlify → **Domain settings** → **"Add custom domain"**
- Buy a domain at **Namecheap.com** (~$10/year) and point it to Netlify

---

## HOW TO USE THE ADMIN PANEL

1. Go to **your-site.netlify.app/admin**
2. Enter your password (whatever you set in `ADMIN_PASSWORD`)
3. **Drag & drop a photo** or click to browse
4. Add a title and pick a category
5. Click **"Upload Photo →"**
6. It appears on your portfolio **instantly!** ✓

To **delete** a photo: hover over it in the admin grid → click the **×** button

---

## TROUBLESHOOTING

| Problem | Fix |
|---|---|
| Photos not showing | Check your Supabase URL and anon key are correct |
| Upload fails | Check your Cloudinary cloud name and preset name |
| Can't access /admin | Make sure the `_redirects` file is in the `public/` folder |
| Site not building | Check you ran `npm install` before `npm run build` |

---

## QUICK REFERENCE

| URL | What it is |
|---|---|
| `yoursite.netlify.app` | Your public portfolio |
| `yoursite.netlify.app/admin` | Your secret upload panel |

**Your admin password:** Whatever you set in `ADMIN_PASSWORD` in `Admin.jsx`

---

*Built with React + Supabase + Cloudinary + Netlify*
