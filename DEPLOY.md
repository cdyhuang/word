# Sharing Lead Word with colleagues

The game is a static site (HTML, CSS, JS, JSON). Deploy it to any host that serves files; no server or database required.

## Option 1: GitHub Pages (free) — recommended for sharing

### Step 1: Put the project on GitHub

1. **Create a new repo** on [github.com](https://github.com): click **+** → **New repository**.
   - Name it something like `lead-word` (the name will be in the URL).
   - Choose **Public**, leave "Add a README" unchecked if the project already has files.
   - Click **Create repository**.

2. **Push this folder to the repo** (from your machine, in the project folder):

   ```bash
   cd "/Users/carol/Word game"
   git init
   git add .
   git commit -m "Add Lead Word game"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/lead-word.git
   git push -u origin main
   ```

   Replace `YOUR_USERNAME` with your GitHub username and `lead-word` with your repo name if different.

### Step 2: Turn on GitHub Pages

1. In the repo on GitHub, go to **Settings** → **Pages** (left sidebar).
2. Under **Build and deployment**:
   - **Source:** Deploy from a branch
   - **Branch:** `main` (or `master`)
   - **Folder:** `/ (root)`
3. Click **Save**. Wait a minute or two.

### Step 3: Get your link and share it

Your game will be at:

**`https://YOUR_USERNAME.github.io/lead-word/`**

(Use your GitHub username and your repo name.) Share that link with colleagues—they can open it in a browser and play. No login required.

### If the game doesn't load (blank or broken)

- Wait 2–3 minutes after enabling Pages and refresh.
- If it's still broken, the site may need a base path. In `index.html`, inside `<head>`, add this line (use your actual repo name):

  ```html
  <base href="/lead-word/">
  ```

  Then commit and push; Pages will redeploy.

## Option 2: Netlify (free)

1. Go to [netlify.com](https://netlify.com) and sign in (GitHub is fine).

2. **Add new site** → **Import an existing project** → connect your Git provider and choose the repo, or **Deploy manually** by dragging the project folder (with `index.html` at the root) into the Netlify drop zone.

3. **Build settings** (if you use Git):  
   - Build command: leave empty  
   - Publish directory: `/` (root)

4. Netlify will give you a URL like `https://random-name-123.netlify.app`. You can change it under **Domain settings** (e.g. `lead-word.netlify.app`).

5. **Share that URL** with colleagues.

## Option 3: Vercel (free)

1. **Sign in:** Go to [vercel.com](https://vercel.com) and sign in (GitHub, GitLab, or Bitbucket).

2. **Import the project:**
   - Click **Add New…** → **Project**.
   - **Import Git Repository:** connect your account if needed, then select the repo that contains Lead Word (or **Import** a new one).
   - If you don't use Git: choose **Deploy** and drag your project folder (the one with `index.html` at the root) into the upload area.

3. **Configure (if the import screen shows settings):**
   - **Framework Preset:** leave as "Other" or "None."
   - **Build Command:** leave empty (no build step).
   - **Output Directory:** leave as `.` or `./` (root).
   - **Install Command:** leave empty.
   - Click **Deploy**.

4. **Wait for the deploy** (usually under a minute). Vercel will show a URL like `https://lead-word-xxxx.vercel.app`.

5. **Share the URL** with colleagues. You can change the project name under **Settings → General → Project Name** to get a cleaner URL (e.g. `lead-word.vercel.app`).

6. **Future updates:** If you connected a Git repo, push changes to your default branch; Vercel will redeploy automatically.

## After deploying

- **Share the link** in Slack, email, or internal tools so colleagues can open it in a browser.
- **Bookmark** the URL for quick access.
- Stats are stored in each user's browser (localStorage), so no account or server is required.
