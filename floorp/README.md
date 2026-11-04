# Better-Sidebery for Floorp

The ultimate tab management setup for **Floorp Browser**, merging the deep tree nesting, multi-panel workspaces, and container isolation of Sidebery with Floorp's sleek native aesthetics, auto-collapsing icon strip, and Zen Mode.

---

## What This Package Delivers

1. **Auto-Shrink to Icons & Expand on Hover**:
   - Docks as a compact $48\text{px}$ favicon rail showing container accents and status marks.
   - Smoothly expands to $260\text{px}$ on hover, floating over web content without reflowing the page.
2. **Floorp Zen Mode Support**:
   - Overrides Floorp's default sidebar suppression during Zen Mode.
   - Hooks into Floorp's native edge-detection (`:root[zenmode-reveal-side]`) to slide out as a floating drawer on edge hover.
3. **Tab Previews (Peek Cards)**:
   - Live hovering thumbnail cards with rounded borders, page titles, and URLs.

---

## Quick Setup Instructions

### Step 1: Install Better-Sidebery
1. Build or download the extension package:
   ```bash
   npm run build
   ```
2. In Floorp, navigate to `about:debugging#/runtime/this-firefox`.
3. Click **"Load Temporary Add-on..."** and select `addon/manifest.json` (or the packaged zip in `dist/sidebery-5.2.0.zip`).
4. Open the Sidebery sidebar (`Cmd + B` / `Ctrl + B`).

### Step 2: Apply the Floorp Integration (1-Click)
Run the automated setup script from the project folder:
```bash
npm run setup:floorp
```
*(Or run `bash floorp/install.sh` directly)*.

The script automatically locates your active Floorp profile, creates the `chrome/` directory, backs up any existing `userChrome.css`, and installs the companion styles. Then simply restart Floorp!

---

## Floorp Zen Mode Usage

- Toggle Zen Mode in Floorp (via toolbar icon or shortcut).
- The entire browser chrome (URL bar, bookmark toolbar, and sidebar) disappears for a completely clean, distraction-free view.
- To access your tabs, simply move your mouse to the left screen edge — Sidebery will smoothly slide out over the page. Moving your cursor away slides it back out of view.

