# 🚀 Quick Start Guide

Welcome to the **Design Token Inspector**! This guide will get you up and running in less than 5 minutes.

## 📦 What You Have

Your project contains:

```
design-token-inspector/
├── index.html              # Main application
├── styles.css              # Professional dark mode styles
├── app.js                  # Token extraction engine
├── README.md               # Full documentation
├── TECHNICAL_GUIDE.md      # Implementation details
└── examples/               # Example exports
    ├── example-w3c-tokens.json
    └── example-tokens.css
```

## ⚡ Quick Start (3 Steps)

### Step 1: Open the Inspector

**Option A: Direct File Open**
```bash
# Simply double-click index.html in your file explorer
# Or use the command line:
open index.html
```

**Option B: Local Server (Recommended)**
```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

Then open: `http://localhost:8000`

### Step 2: Analyze a Page

**Try it now:**
1. The inspector should now be open in your browser
2. Click the **"Analyze Current Page"** button (default mode)
3. Watch as design tokens are extracted!

You should see:
- ✅ Color tokens (backgrounds, text, borders)
- ✅ Typography tokens (fonts, sizes, weights)
- ✅ Spacing tokens (padding, margins, gaps)
- ✅ Effects tokens (shadows)
- ✅ Motion tokens (transitions)
- ✅ Asset tokens (images, SVGs)

### Step 3: Export Tokens

1. Click the **"Export Tokens"** button
2. Choose your format:
   - **W3C JSON** → For design token standards
   - **CSS Variables** → For immediate use in CSS
   - **JavaScript** → For use in JS projects
   - **Figma Tokens** → For Figma plugins

3. The file will download automatically!

## 🎯 What to Try Next

### Analyze Your Own Website

**Method 1: Bookmarklet (Easiest)**

1. In the inspector, click the **"Bookmarklet"** tab
2. Drag the **"📊 Inspect Design Tokens"** button to your bookmarks bar
3. Go to **any website** (e.g., https://github.com, https://stripe.com)
4. Click the bookmarklet in your bookmarks bar
5. Watch the tokens get extracted!

**Method 2: URL Input (Requires CORS Proxy)**

1. Click the **"External URL"** tab
2. Enter a URL (e.g., `https://example.com`)
3. Add a CORS proxy: `https://cors-anywhere.herokuapp.com/`
4. Click **"Analyze URL"**

> **Note:** CORS restrictions may block direct URL analysis. The bookmarklet is the most reliable method.

## 📊 Understanding the Dashboard

### Header Stats
- **Tokens**: Total number of unique design tokens found
- **Elements**: Number of DOM elements analyzed

### Category Tabs
Filter tokens by type:
- **All Tokens**: Everything extracted
- **Colors**: All color values
- **Typography**: Fonts, sizes, weights
- **Spacing**: Padding, margins, gaps
- **Assets**: Images, SVGs, fonts
- **Effects**: Shadows and filters
- **Motion**: Transitions and animations

### Token Cards
Each card shows:
- **Category badge**: Type of token (e.g., "font-size")
- **Visual preview**: What the token looks like
- **Token name**: Auto-generated semantic name
- **Token value**: The actual CSS value

## 🎨 Example Use Cases

### Case 1: Document Your Design System

```bash
# 1. Analyze your production site
# 2. Export as W3C JSON
# 3. Use as design system documentation
```

### Case 2: Migrate to CSS Variables

```bash
# 1. Analyze existing site
# 2. Export as CSS Variables
# 3. Replace hardcoded values with variables
```

### Case 3: Import to Figma

```bash
# 1. Analyze your site
# 2. Export as Figma Tokens
# 3. Use Figma Tokens plugin to import
```

### Case 4: Competitor Analysis

```bash
# 1. Use bookmarklet on competitor site
# 2. Export tokens
# 3. Analyze their design patterns
```

## 🛠️ Troubleshooting

### Issue: "CORS Error" when analyzing URL

**Solution:** Use one of these methods:
1. **Bookmarklet** (easiest) - bypasses CORS completely
2. **CORS Proxy** - Add `https://cors-anywhere.herokuapp.com/` to proxy field
3. **Browser Extension** - Install a CORS unblocker (dev only)
4. **Analyze Current Page** - Open the site in a new tab and analyze it

### Issue: No tokens found

**Possible causes:**
1. Page has no content
2. Page uses shadow DOM (not supported yet)
3. Styles loaded from cross-origin stylesheet (CORS blocked)

**Solution:**
- Try the bookmarklet method
- Check browser console for errors

### Issue: Some tokens missing

**Known limitations:**
- Analysis limited to 1000 elements (for performance)
- Cannot access cross-origin stylesheets
- Pseudo-elements (::before, ::after) not supported
- Dynamic content may not be captured

## 📚 Learn More

### Next Steps

1. **Read the full README.md** for comprehensive documentation
2. **Check TECHNICAL_GUIDE.md** for implementation details
3. **Explore the examples/** folder for output samples

### Key Concepts

- **Design Tokens**: Named entities that store design decisions
- **W3C Format**: Community standard for design tokens
- **CSS Custom Properties**: Native CSS variables
- **Computed Styles**: Final calculated CSS values

### Resources

- [W3C Design Tokens Spec](https://design-tokens.github.io/community-group/format/)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Design Systems Handbook](https://www.designbetter.co/design-systems-handbook)

## 🎉 You're All Set!

You now know how to:
- ✅ Launch the inspector
- ✅ Analyze pages
- ✅ Export tokens in multiple formats
- ✅ Use the bookmarklet
- ✅ Troubleshoot common issues

**Happy token hunting! 🚀**

---

## Quick Reference

### Keyboard Shortcuts
- `ESC` - Close export modal
- `Ctrl/Cmd + Shift + I` - Open browser DevTools (to debug)

### Command Line

```bash
# Serve the application
python3 -m http.server 8000

# Or with Node
npx serve

# Access at
http://localhost:8000
```

### Files Generated

When you export, you'll get files like:
- `design-tokens.json` (W3C format)
- `design-tokens.css` (CSS variables)
- `design-tokens.js` (JavaScript module)
- `figma-tokens.json` (Figma plugin format)

### Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Analysis | ✅ 90+ | ✅ 88+ | ✅ 14+ | ✅ 90+ |
| Export | ✅ | ✅ | ✅ | ✅ |
| Bookmarklet | ✅ | ✅ | ✅ | ✅ |

---

**Need help?** Check the README.md or TECHNICAL_GUIDE.md for more details!
