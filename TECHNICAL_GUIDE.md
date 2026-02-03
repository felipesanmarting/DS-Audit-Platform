# Technical Implementation Guide

## Overview

This document provides a deep dive into the technical implementation of the Design Token Inspector.

## Architecture Patterns

### 1. State Management

The application uses a centralized state object to manage all extracted tokens and UI state:

```javascript
const AppState = {
    extractedTokens: {
        colors: new Set(),
        typography: new Set(),
        spacing: new Set(),
        assets: new Set(),
        effects: new Set(),
        motion: new Set()
    },
    tokenData: [],
    currentCategory: 'all',
    analyzedElements: 0
};
```

**Why Sets?**
- O(1) lookup time for duplicate checking
- Automatic deduplication
- Memory efficient for large token collections

### 2. Performance Optimization

#### DOM Caching
All frequently accessed DOM elements are cached on initialization:

```javascript
function cacheDOMElements() {
    DOM.analyzeCurrentBtn = document.getElementById('analyzeCurrentBtn');
    // ... more elements
}
```

**Benefit**: Reduces repeated `getElementById()` calls from O(n) to O(1).

#### Element Limiting
Analysis is limited to 1000 elements to prevent performance degradation:

```javascript
const elements = Array.from(allElements).slice(0, 1000);
```

**Trade-off**: Comprehensive analysis vs. speed. For production, consider:
- Progressive loading
- Web Workers for background processing
- IndexedDB for caching results

### 3. Token Extraction Algorithm

#### Core Process

```
1. Traverse DOM tree
2. For each element:
   a. Get computed styles
   b. Extract relevant properties
   c. Check for duplicates using Set
   d. Store unique tokens
3. Extract global CSS rules (@font-face, @keyframes)
4. Process and format tokens
5. Render in UI
```

#### Example: Color Extraction

```javascript
function extractColor(colorValue, type, uniqueSet, tokenArray) {
    // Skip transparent/invalid colors
    if (!colorValue || colorValue === 'rgba(0, 0, 0, 0)') {
        return;
    }
    
    // Create unique key
    const key = `${type}-${colorValue}`;
    
    // Check for duplicates
    if (!uniqueSet.has(key)) {
        uniqueSet.add(key);
        tokenArray.push({
            type: 'color',
            category: type,
            value: colorValue,
            name: generateColorName(colorValue, type)
        });
    }
}
```

**Key Features:**
- Skips transparent colors
- Generates semantic names
- Uses composite key for uniqueness

### 4. CORS Handling Strategy

#### Problem
```
Origin A (inspector) → fetch() → Origin B (target site)
                     ↓
                  CORS Error
```

#### Solutions Implemented

**1. Bookmarklet Approach**
```javascript
// Runs on target page's origin
javascript:(function(){
    // Load inspector script
    const script = document.createElement('script');
    script.src = 'inspector-url/app.js';
    document.body.appendChild(script);
})();
```

**2. Proxy Approach**
```javascript
const fetchURL = proxy ? `${proxy}${url}` : url;
const response = await fetch(fetchURL);
```

**3. DOMParser for Safe Parsing**
```javascript
const parser = new DOMParser();
const doc = parser.parseFromString(html, 'text/html');
const tokens = await extractDesignTokens(doc.body);
```

### 5. Export System Architecture

#### Format Mapping

```javascript
Token Object → Format Converter → Output Format

{                    ↓                W3C JSON
  type: 'color',     ↓                CSS Variables
  value: '#667eea',  ↓                JavaScript
  name: 'primary'    ↓                Figma Tokens
}
```

#### W3C JSON Structure

```javascript
{
  "token-group": {
    "token-name": {
      "$value": "...",    // Required
      "$type": "...",     // Required
      "$description": "..." // Optional
    }
  }
}
```

#### Type Mapping Logic

```javascript
function mapToW3CType(type, category) {
    const mapping = {
        'colors': 'color',
        'typography': category.includes('size') ? 'dimension' 
                    : category.includes('family') ? 'fontFamily' 
                    : 'fontWeight',
        'spacing': 'dimension',
        'effects': 'shadow',
        'motion': 'duration'
    };
    return mapping[type] || 'string';
}
```

## Advanced Techniques

### 1. Dynamic Name Generation

#### Color Names
```javascript
function generateColorName(color, type) {
    // Convert RGB to HEX
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
        const [, r, g, b] = rgbMatch;
        const hex = ((1 << 24) + (parseInt(r) << 16) + 
                     (parseInt(g) << 8) + parseInt(b))
                    .toString(16).slice(1);
        return `color-${type}-${hex}`;
    }
    return `color-${type}-${color.replace(/[^a-z0-9]/gi, '-')}`;
}
```

#### Font Weight Names
```javascript
const weights = {
    '100': 'thin',
    '200': 'extra-light',
    '300': 'light',
    '400': 'normal',
    '500': 'medium',
    '600': 'semibold',
    '700': 'bold',
    '800': 'extra-bold',
    '900': 'black'
};
```

### 2. CSS Rule Extraction

#### Accessing Stylesheets
```javascript
const styleSheets = Array.from(document.styleSheets);

styleSheets.forEach(sheet => {
    try {
        const rules = Array.from(sheet.cssRules || sheet.rules || []);
        // Process rules
    } catch (e) {
        // CORS-protected stylesheet
        console.warn('Cannot access:', sheet.href);
    }
});
```

**Security Note**: Cross-origin stylesheets are inaccessible due to browser security.

#### @font-face Extraction
```javascript
if (rule instanceof CSSFontFaceRule) {
    const fontFamily = rule.style.fontFamily;
    const src = rule.style.src;
    // Store font face token
}
```

#### @keyframes Extraction
```javascript
if (rule instanceof CSSKeyframesRule) {
    const keyframes = Array.from(rule.cssRules).map(kf => ({
        keyText: kf.keyText,  // "0%", "50%", "100%"
        style: kf.style.cssText
    }));
}
```

### 3. Modal Management

```javascript
// Event delegation for closing
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// ESC key support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});
```

### 4. File Download Implementation

```javascript
function downloadFile(content, filename, mimeType) {
    // Create blob
    const blob = new Blob([content], { type: mimeType });
    
    // Create object URL
    const url = URL.createObjectURL(blob);
    
    // Create temporary link
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Trigger download
    link.click();
    
    // Cleanup
    URL.revokeObjectURL(url);
}
```

**Why not `data:` URLs?**
- Object URLs are more performant
- No size limitations
- Better memory management

## CSS Architecture

### Design Token System

The inspector practices what it preaches by using a comprehensive token system:

```css
:root {
    /* Colors */
    --color-bg-primary: #0a0e1a;
    --color-accent-primary: #667eea;
    
    /* Spacing */
    --spacing-md: 1rem;
    
    /* Typography */
    --font-family-primary: 'Inter', sans-serif;
    
    /* Effects */
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
    
    /* Motion */
    --transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### BEM-like Naming Convention

```css
.token-card { }
.token-card__header { }
.token-card__preview { }
.token-card--colors { }
```

**Benefits:**
- Clear component boundaries
- Easy to reason about
- Prevents naming collisions

### Animation Performance

```css
/* GPU-accelerated properties only */
.token-card {
    transition: transform var(--transition-normal),
                opacity var(--transition-normal);
}

.token-card:hover {
    transform: translateY(-4px); /* GPU */
}
```

**Avoid animating:**
- `width`, `height`
- `margin`, `padding`
- `top`, `left`, `right`, `bottom`

**Prefer:**
- `transform`
- `opacity`
- `filter`

## Browser API Usage

### 1. window.getComputedStyle()

```javascript
const computed = window.getComputedStyle(element);

// Get individual properties
const fontSize = computed.fontSize;
const color = computed.color;

// Note: Returns computed values, not authored values
// "16px" not "1rem"
// "rgb(255, 0, 0)" not "#ff0000"
```

### 2. DOMParser

```javascript
const parser = new DOMParser();
const doc = parser.parseFromString(html, 'text/html');

// Safe: Doesn't execute scripts
// Isolated: Separate document context
// Fast: Native parsing
```

### 3. Clipboard API

```javascript
navigator.clipboard.writeText(text)
    .then(() => console.log('Copied!'))
    .catch(err => console.error('Failed:', err));
```

**Fallback for older browsers:**
```javascript
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}
```

## Testing Recommendations

### Unit Tests

```javascript
// Example with Jest
describe('extractColor', () => {
    it('should skip transparent colors', () => {
        const uniqueSet = new Set();
        const tokenArray = [];
        
        extractColor('rgba(0, 0, 0, 0)', 'bg', uniqueSet, tokenArray);
        
        expect(tokenArray.length).toBe(0);
    });
    
    it('should deduplicate colors', () => {
        const uniqueSet = new Set();
        const tokenArray = [];
        
        extractColor('rgb(255, 0, 0)', 'bg', uniqueSet, tokenArray);
        extractColor('rgb(255, 0, 0)', 'bg', uniqueSet, tokenArray);
        
        expect(tokenArray.length).toBe(1);
    });
});
```

### Integration Tests

```javascript
// Example with Playwright
test('should analyze current page', async ({ page }) => {
    await page.goto('http://localhost:8000');
    await page.click('#analyzeCurrentBtn');
    
    await page.waitForSelector('.token-card');
    
    const tokenCount = await page.$$eval('.token-card', 
        cards => cards.length
    );
    
    expect(tokenCount).toBeGreaterThan(0);
});
```

### Performance Testing

```javascript
console.time('Token Extraction');
const tokens = await extractDesignTokens(document.body);
console.timeEnd('Token Extraction');

console.log('Memory:', performance.memory.usedJSHeapSize);
```

## Security Considerations

### 1. Content Security Policy (CSP)

If deploying, add CSP headers:

```http
Content-Security-Policy: 
    default-src 'self'; 
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    script-src 'self';
```

### 2. XSS Prevention

The tool uses `textContent` instead of `innerHTML` where possible:

```javascript
// Safe
element.textContent = userInput;

// Unsafe
element.innerHTML = userInput;
```

### 3. Sandboxing External Content

When analyzing external sites, the DOMParser creates an isolated document:

```javascript
const doc = parser.parseFromString(html, 'text/html');
// Scripts won't execute
// No access to window or parent
```

## Deployment

### Static Hosting

Works on any static host:
- GitHub Pages
- Netlify
- Vercel
- AWS S3
- Cloudflare Pages

### Build Optimization (Optional)

For production, consider:

1. **Minification**
```bash
npx terser app.js -o app.min.js
npx csso styles.css -o styles.min.css
npx html-minifier index.html -o index.min.html
```

2. **Compression**
```bash
gzip -9 app.min.js
brotli -9 app.min.js
```

3. **Service Worker** (for offline support)
```javascript
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}
```

## Future Enhancements

### 1. Web Worker for Analysis

```javascript
// main.js
const worker = new Worker('analyzer-worker.js');

worker.postMessage({ 
    type: 'analyze', 
    html: documentHTML 
});

worker.onmessage = (e) => {
    const tokens = e.data.tokens;
    renderTokens(tokens);
};

// analyzer-worker.js
self.onmessage = (e) => {
    if (e.data.type === 'analyze') {
        const tokens = analyzeHTML(e.data.html);
        self.postMessage({ tokens });
    }
};
```

### 2. IndexedDB Caching

```javascript
// Cache analyzed sites
const db = await openDB('token-inspector', 1, {
    upgrade(db) {
        db.createObjectStore('analyses', { keyPath: 'url' });
    }
});

await db.put('analyses', {
    url: targetURL,
    tokens: extractedTokens,
    timestamp: Date.now()
});
```

### 3. Diffing Tool

```javascript
function compareTokens(tokensA, tokensB) {
    return {
        added: tokensB.filter(t => !tokensA.includes(t)),
        removed: tokensA.filter(t => !tokensB.includes(t)),
        changed: tokensA.filter((t, i) => 
            tokensB[i] && t.value !== tokensB[i].value
        )
    };
}
```

## Conclusion

This inspector demonstrates modern web development best practices:

- ✅ Modular architecture
- ✅ Performance optimization
- ✅ Security considerations
- ✅ Accessibility (semantic HTML)
- ✅ Progressive enhancement
- ✅ Clean code organization

Use it as a reference for building professional web tools!
