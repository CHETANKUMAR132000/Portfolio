# Chetan A M — AI Engineer Portfolio

A 3D-themed personal portfolio site built as a static site. Three.js powers the animated background (particle field + floating wireframe geometry); the rest is hand-written HTML, CSS, and vanilla JS.

## Files

```
index.html      Main page
styles.css      All styling (dark theme, glassmorphism, gradients)
script.js       Three.js scene, scroll reveal, 3D card tilt
render.yaml     Render Static Site config
```

No build step. No dependencies to install. Open `index.html` directly to preview.

## Local preview

Just open `index.html` in any browser. Or run a tiny local server:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Deploy to Render

### Option A — One-click via `render.yaml` (Blueprint)

1. Push this folder to a GitHub repo.
2. Go to https://dashboard.render.com → **New** → **Blueprint**.
3. Connect the repo. Render reads `render.yaml` and creates a free **Static Site**.
4. Click **Apply**. You'll get a URL like `https://chetan-portfolio.onrender.com`.

### Option B — Manual Static Site

1. Push this folder to GitHub.
2. Render dashboard → **New** → **Static Site**.
3. Connect the repo, then set:
   - **Build Command:** *(leave empty)*
   - **Publish Directory:** `.`
4. **Create Static Site**.

Both options give you HTTPS and a free `*.onrender.com` URL.

## Add to LinkedIn

Once deployed, go to LinkedIn → **Edit Profile** → add the URL under:

- **Contact info** → **Website** (label it "Portfolio").
- Or in the **Featured** section as a link with a custom thumbnail.

## Customization quick reference

- **Colors:** edit the `:root` block in `styles.css` (`--accent-1`, `--accent-2`, etc.).
- **Content:** edit `index.html` directly — sections are clearly commented.
- **3D shapes:** in `script.js`, edit the `createShape(...)` calls to swap geometry / colors / positions.
- **Particle count / colors:** `script.js` → `particleCount` and `palette`.
