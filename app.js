/* ================================================
   DESIGN TOKEN INSPECTOR - CORE LOGIC
   Professional Web-to-Design System Extraction Tool
   ================================================ */

/**
 * Global State Management
 */
window.AppState = {
    extractedTokens: {
        colors: new Set(),
        typography: new Set(),
        spacing: new Set(),
        assets: new Set(),
        effects: new Set(),
        motion: new Set()
    },
    tokenData: [],
    currentCategory: 'colors',
    analyzedElements: 0,
    currentLanguage: localStorage.getItem('language') || 'es',  // Default to Spanish
    currentTheme: localStorage.getItem('theme') || 'dark'       // Default to dark
};

// Local alias for convenience
const AppState = window.AppState;

/**
 * DOM Element Cache
 */
const DOM = {
    // Input elements
    currentPageMode: null,
    urlMode: null,
    bookmarkletMode: null,
    analyzeCurrentBtn: null,
    analyzeUrlBtn: null,
    urlInput: null,
    proxyInput: null,

    // Dashboard elements
    dashboardSection: null,
    tokenGrid: null,
    categoryTabs: null,

    // Modal elements
    exportModal: null,
    modalClose: null,

    // Utility elements
    loadingOverlay: null,
    headerStats: null
};

/**
 * Initialize the application
 */
function init() {
    cacheDOMElements();
    attachEventListeners();
    initializeLanguage();
    initializeTheme();

    // Initialize enhanced features if available
    if (window.EnhancedFeatures && window.EnhancedFeatures.attachEnhancedEventListeners) {
        window.EnhancedFeatures.attachEnhancedEventListeners();
    }

    console.log('🎨 Design Token Inspector initialized');
}

/**
 * Cache all DOM elements for better performance
 */
function cacheDOMElements() {
    // Input elements
    DOM.currentPageMode = document.getElementById('currentPageMode');
    DOM.urlMode = document.getElementById('urlMode');
    DOM.bookmarkletMode = document.getElementById('bookmarkletMode');
    DOM.analyzeCurrentBtn = document.getElementById('analyzeCurrentBtn');
    DOM.analyzeUrlBtn = document.getElementById('analyzeUrlBtn');
    DOM.urlInput = document.getElementById('urlInput');
    DOM.proxyInput = document.getElementById('proxyInput');

    // Dashboard elements
    DOM.dashboardSection = document.getElementById('dashboardSection');
    DOM.tokenGrid = document.getElementById('tokenGrid');
    DOM.categoryTabs = document.getElementById('categoryTabs');

    // Modal elements
    DOM.exportModal = document.getElementById('exportModal');
    DOM.modalClose = document.getElementById('modalClose');

    // Utility elements
    DOM.loadingOverlay = document.getElementById('loadingOverlay');
    DOM.headerStats = document.getElementById('headerStats');
}

/**
 * Attach all event listeners
 */
function attachEventListeners() {
    // Analyze button
    DOM.analyzeUrlBtn.addEventListener('click', analyzeExternalURL);

    // Dashboard buttons
    document.getElementById('exportBtn')?.addEventListener('click', openExportModal);
    document.getElementById('clearBtn')?.addEventListener('click', clearTokens);

    // Category tabs
    DOM.categoryTabs.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', handleCategoryChange);
    });

    // Modal controls
    DOM.modalClose.addEventListener('click', closeExportModal);
    DOM.exportModal.addEventListener('click', (e) => {
        if (e.target === DOM.exportModal) closeExportModal();
    });

    // Export format buttons
    document.querySelectorAll('.export-option').forEach(btn => {
        btn.addEventListener('click', handleExport);
    });

    // Language toggle
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', handleLanguageChange);
    });

    // Theme toggle
    document.getElementById('themeToggle')?.addEventListener('click', handleThemeToggle);

    // Download buttons
    document.getElementById('downloadCategoryBtn')?.addEventListener('click', downloadCurrentCategory);
    document.getElementById('downloadAllBtn')?.addEventListener('click', downloadAllTokens);

    // Enter key on URL input
    DOM.urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            analyzeExternalURL();
        }
    });
}

/**
 * Analyze an external URL with automatic CORS proxy fallback
 */
async function analyzeExternalURL() {
    let url = DOM.urlInput.value.trim();

    if (!url) {
        alert(t('pleaseEnterURL'));
        return;
    }

    // Normalize URL - add https:// if no protocol specified
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        // Check if starts with www. or is a domain pattern
        if (url.startsWith('www.') || /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}/.test(url)) {
            url = 'https://' + url;
        }
    }

    // Force HTTPS instead of HTTP (Mixed Content fix)
    if (url.startsWith('http://')) {
        url = url.replace('http://', 'https://');
    }

    // Update input field with normalized URL
    DOM.urlInput.value = url;

    // Attempt to load favicon
    try {
        const urlObj = new URL(url);
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
        const faviconImg = document.getElementById('targetFavicon');
        const faviconContainer = document.getElementById('faviconContainer');
        if (faviconImg && faviconContainer) {
            faviconImg.src = faviconUrl;
            faviconContainer.style.display = 'flex';
        }
    } catch (e) {
        // invalid url, will fail later
    }

    showLoading(true);

    // List of CORS proxy services to try as fallback
    const corsProxies = [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
        'https://api.codetabs.com/v1/proxy?quest='
    ];

    let lastError = null;
    let currentAttempt = 0;

    // Try direct fetch first, then proxies
    const attemptUrls = [url, ...corsProxies.map(proxy => proxy + encodeURIComponent(url))];

    for (const fetchUrl of attemptUrls) {
        try {
            console.log(`🔄 Attempting to fetch: ${currentAttempt === 0 ? 'Direct' : 'Via proxy ' + currentAttempt}...`);

            // Fetch the HTML with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

            const response = await fetch(fetchUrl, {
                signal: controller.signal,
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const html = await response.text();

            // Parse HTML into a temporary DOM
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Convert relative URLs to absolute URLs
            const baseURL = new URL(url);
            convertRelativeURLs(doc, baseURL);

            // Create a hidden iframe to properly compute styles
            const iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.left = '-9999px';
            iframe.style.width = '1280px';
            iframe.style.height = '1024px';
            document.body.appendChild(iframe);

            // Write the HTML into the iframe
            iframe.contentDocument.open();
            iframe.contentDocument.write(doc.documentElement.outerHTML);
            iframe.contentDocument.close();

            // Wait for iframe to load
            await new Promise(resolve => {
                if (iframe.contentDocument.readyState === 'complete') {
                    resolve();
                } else {
                    iframe.onload = resolve;
                }
            });

            // Give a moment for styles to be applied
            await new Promise(resolve => setTimeout(resolve, 500));

            // Reset state
            resetTokens();

            // Extract tokens from the iframe document body
            const tokens = await extractDesignTokens(iframe.contentDocument.body, iframe.contentWindow);

            // Clean up iframe
            document.body.removeChild(iframe);

            // Filter tokens based on checkboxes
            const selectedTypes = Array.from(document.querySelectorAll('input[name="extractType"]:checked')).map(cb => cb.value);

            // Filter the extracted tokens object
            const filteredTokens = {};
            Object.keys(tokens).forEach(key => {
                if (selectedTypes.includes(key)) {
                    filteredTokens[key] = tokens[key];
                }
            });

            // Process and display tokens
            processTokens(filteredTokens);

            // Use enhanced rendering if available, otherwise fallback to basic rendering
            if (typeof window.EnhancedFeatures !== 'undefined') {
                window.EnhancedFeatures.renderEnhancedTokens(AppState.currentCategory);
                window.EnhancedFeatures.attachEnhancedEventListeners();
            } else {
                renderTokens();
            }

            showDashboard();
            updateStats();

            console.log(`✅ URL analysis complete ${currentAttempt > 0 ? '(via proxy)' : '(direct)'}`, AppState.tokenData);
            showLoading(false);
            return; // Success! Exit function

        } catch (error) {
            lastError = error;
            currentAttempt++;

            // If this wasn't the last attempt, continue to next proxy
            if (currentAttempt < attemptUrls.length) {
                console.log(`⚠️ Attempt ${currentAttempt} failed, trying next method...`);
                continue;
            }
        }
    }

    // All attempts failed
    console.error('❌ All fetch attempts failed:', lastError);
    showLoading(false);

    // Show user-friendly error message
    const errorMsg = `⚠️ No se pudo acceder a "${url}"

Este sitio tiene protección anti-bot (Cloudflare) que bloquea el análisis remoto.

Soluciones:
1. Prueba con otro sitio (ej: wikipedia.org, github.com)
2. Abre el sitio directamente y usa las DevTools del navegador
3. Algunos sitios simplemente no permiten acceso externo`;

    alert(errorMsg);
}

/**
 * Convert relative URLs to absolute URLs in a document
 */
function convertRelativeURLs(doc, baseURL) {
    // Convert image srcs
    doc.querySelectorAll('img[src]').forEach(img => {
        try {
            const originalSrc = img.getAttribute('src');
            if (originalSrc) {
                const absoluteURL = new URL(originalSrc, baseURL).href;
                img.setAttribute('src', absoluteURL);
            }
        } catch (e) {
            // Invalid URL, skip
        }
    });

    // Convert link hrefs (stylesheets, etc)
    doc.querySelectorAll('link[href]').forEach(link => {
        try {
            const originalHref = link.getAttribute('href');
            if (originalHref) {
                const absoluteURL = new URL(originalHref, baseURL).href;
                link.setAttribute('href', absoluteURL);
            }
        } catch (e) {
            // Invalid URL, skip
        }
    });

    // Convert script srcs
    doc.querySelectorAll('script[src]').forEach(script => {
        try {
            const originalSrc = script.getAttribute('src');
            if (originalSrc) {
                const absoluteURL = new URL(originalSrc, baseURL).href;
                script.setAttribute('src', absoluteURL);
            }
        } catch (e) {
            // Invalid URL, skip
        }
    });
}

/**
 * Extract design tokens from a DOM element tree
 * @param {Element} rootElement - The root element to analyze
 * @param {Window} targetWindow - The window context to use for getComputedStyle
 * @returns {Object} - Extracted token data
 */
async function extractDesignTokens(rootElement, targetWindow = window) {
    const tokens = {
        colors: [],
        typography: [],
        spacing: [],
        assets: [],
        effects: [],
        motion: []
    };

    // Get all elements (limit to avoid performance issues)
    const allElements = rootElement.querySelectorAll('*');
    const elements = Array.from(allElements).slice(0, 1000); // Limit to 1000 elements

    AppState.analyzedElements = elements.length;

    // Use a Set to track unique values
    const uniqueColors = new Set();
    const uniqueFonts = new Set();
    const uniqueSpacing = new Set();
    const uniqueEffects = new Set();
    const uniqueMotion = new Set();

    // Iterate through elements
    for (const element of elements) {
        const computed = targetWindow.getComputedStyle(element);

        // Extract Colors
        extractColor(computed.backgroundColor, 'background', uniqueColors, tokens.colors);
        extractColor(computed.color, 'text', uniqueColors, tokens.colors);
        extractColor(computed.borderColor, 'border', uniqueColors, tokens.colors);

        // Extract Typography
        extractTypography(computed, uniqueFonts, tokens.typography);

        // Extract Spacing
        extractSpacing(computed, uniqueSpacing, tokens.spacing);

        // Extract Effects
        extractEffects(computed, uniqueEffects, tokens.effects);

        // Extract Motion
        extractMotion(computed, uniqueMotion, tokens.motion);

        // Extract Assets (images, SVGs)
        extractAssets(element, tokens.assets);
    }

    // Extract @font-face declarations
    extractFontFaces(tokens.assets);

    // Extract complete text styles
    extractTextStyles(rootElement, targetWindow, tokens.typography);

    // Extract @keyframes animations
    extractKeyframes(tokens.motion);

    return tokens;
}

/**
 * Extract color values
 */
function extractColor(colorValue, type, uniqueSet, tokenArray) {
    if (!colorValue || colorValue === 'rgba(0, 0, 0, 0)' || colorValue === 'transparent') {
        return;
    }

    const key = `${type}-${colorValue}`;
    if (!uniqueSet.has(key)) {
        uniqueSet.add(key);
        tokenArray.push({
            type: 'colors',
            category: type,
            value: colorValue,
            name: generateColorName(colorValue, type)
        });
    }
}

/**
 * Extract typography values
 */
function extractTypography(computed, uniqueSet, tokenArray) {
    const fontSize = computed.fontSize;
    const fontFamily = computed.fontFamily;
    const fontWeight = computed.fontWeight;
    const lineHeight = computed.lineHeight;
    const letterSpacing = computed.letterSpacing;
    const textShadow = computed.textShadow;

    // Font size
    if (fontSize && !uniqueSet.has(`size-${fontSize}`)) {
        uniqueSet.add(`size-${fontSize}`);
        tokenArray.push({
            type: 'typography',
            category: 'font-size',
            value: fontSize,
            name: `font-size-${fontSize.replace(/[^a-z0-9]/gi, '-')}`
        });
    }

    // Font family
    if (fontFamily && !uniqueSet.has(`family-${fontFamily}`)) {
        uniqueSet.add(`family-${fontFamily}`);
        tokenArray.push({
            type: 'typography',
            category: 'font-family',
            value: fontFamily,
            name: generateFontFamilyName(fontFamily)
        });
    }

    // Font weight
    if (fontWeight && !uniqueSet.has(`weight-${fontWeight}`)) {
        uniqueSet.add(`weight-${fontWeight}`);
        tokenArray.push({
            type: 'typography',
            category: 'font-weight',
            value: fontWeight,
            name: `font-weight-${getFontWeightName(fontWeight)}`
        });
    }

    // Line height
    if (lineHeight && lineHeight !== 'normal' && !uniqueSet.has(`line-height-${lineHeight}`)) {
        uniqueSet.add(`line-height-${lineHeight}`);
        tokenArray.push({
            type: 'typography',
            category: 'line-height',
            value: lineHeight,
            name: `line-height-${lineHeight.replace(/[^a-z0-9]/gi, '-')}`
        });
    }

    // Letter spacing
    if (letterSpacing && letterSpacing !== 'normal' && !uniqueSet.has(`letter-spacing-${letterSpacing}`)) {
        uniqueSet.add(`letter-spacing-${letterSpacing}`);
        tokenArray.push({
            type: 'typography',
            category: 'letter-spacing',
            value: letterSpacing,
            name: `letter-spacing-${letterSpacing.replace(/[^a-z0-9]/gi, '-')}`
        });
    }

    // Text shadow
    if (textShadow && textShadow !== 'none' && !uniqueSet.has(`text-shadow-${textShadow}`)) {
        uniqueSet.add(`text-shadow-${textShadow}`);
        tokenArray.push({
            type: 'typography',
            category: 'text-shadow',
            value: textShadow,
            name: 'text-shadow'
        });
    }
}

/**
 * Extract spacing values
 */
function extractSpacing(computed, uniqueSet, tokenArray) {
    const properties = ['padding', 'margin', 'gap'];
    const sides = ['Top', 'Right', 'Bottom', 'Left'];

    properties.forEach(prop => {
        if (prop === 'gap') {
            const gapValue = computed.gap;
            if (gapValue && gapValue !== 'normal' && gapValue !== '0px' && !uniqueSet.has(`gap-${gapValue}`)) {
                uniqueSet.add(`gap-${gapValue}`);
                tokenArray.push({
                    type: 'spacing',
                    category: 'gap',
                    value: gapValue,
                    name: `gap-${gapValue.replace(/[^a-z0-9]/gi, '-')}`
                });
            }
        } else {
            sides.forEach(side => {
                const propName = `${prop}${side}`;
                const value = computed[propName];

                if (value && value !== '0px' && !uniqueSet.has(`${propName}-${value}`)) {
                    uniqueSet.add(`${propName}-${value}`);
                    tokenArray.push({
                        type: 'spacing',
                        category: prop,
                        value: value,
                        name: `${prop}-${side.toLowerCase()}-${value.replace(/[^a-z0-9]/gi, '-')}`
                    });
                }
            });
        }
    });

    // Border radius
    const borderRadius = computed.borderRadius;
    if (borderRadius && borderRadius !== '0px' && !uniqueSet.has(`radius-${borderRadius}`)) {
        uniqueSet.add(`radius-${borderRadius}`);
        tokenArray.push({
            type: 'spacing',
            category: 'border-radius',
            value: borderRadius,
            name: `radius-${borderRadius.replace(/[^a-z0-9]/gi, '-')}`
        });
    }
}

/**
 * Extract effects (shadows)
 */
function extractEffects(computed, uniqueSet, tokenArray) {
    const boxShadow = computed.boxShadow;

    if (boxShadow && boxShadow !== 'none' && !uniqueSet.has(boxShadow)) {
        uniqueSet.add(boxShadow);
        tokenArray.push({
            type: 'effects',
            category: 'box-shadow',
            value: boxShadow,
            name: 'shadow'
        });
    }
}

/**
 * Extract motion/animation values
 */
function extractMotion(computed, uniqueSet, tokenArray) {
    // Transitions
    const transitionDuration = computed.transitionDuration;
    const transitionTimingFunction = computed.transitionTimingFunction;

    if (transitionDuration && transitionDuration !== '0s' && !uniqueSet.has(`duration-${transitionDuration}`)) {
        uniqueSet.add(`duration-${transitionDuration}`);
        tokenArray.push({
            type: 'motion',
            category: 'transition-duration',
            value: transitionDuration,
            name: `duration-${transitionDuration.replace(/[^a-z0-9]/gi, '-')}`
        });
    }

    if (transitionTimingFunction && transitionTimingFunction !== 'ease' && !uniqueSet.has(`timing-${transitionTimingFunction}`)) {
        uniqueSet.add(`timing-${transitionTimingFunction}`);
        tokenArray.push({
            type: 'motion',
            category: 'transition-timing',
            value: transitionTimingFunction,
            name: 'bezier'
        });
    }

    // Animations
    const animationDuration = computed.animationDuration;
    const animationTimingFunction = computed.animationTimingFunction;
    const animationName = computed.animationName;

    if (animationDuration && animationDuration !== '0s' && !uniqueSet.has(`anim-duration-${animationDuration}`)) {
        uniqueSet.add(`anim-duration-${animationDuration}`);
        tokenArray.push({
            type: 'motion',
            category: 'animation-duration',
            value: animationDuration,
            name: `anim-duration-${animationDuration.replace(/[^a-z0-9]/gi, '-')}`
        });
    }

    if (animationName && animationName !== 'none' && !uniqueSet.has(`anim-name-${animationName}`)) {
        uniqueSet.add(`anim-name-${animationName}`);
        tokenArray.push({
            type: 'motion',
            category: 'animation-name',
            value: animationName,
            name: animationName
        });
    }
}

/**
 * Extract assets (images, SVGs)
 */
function extractAssets(element, tokenArray) {
    // Extract images
    if (element.tagName === 'IMG') {
        tokenArray.push({
            type: 'assets',
            category: 'image',
            value: element.src,
            name: element.alt || 'image',
            attributes: {
                width: element.width,
                height: element.height,
                alt: element.alt
            }
        });
    }

    // Extract SVGs
    if (element.tagName === 'SVG') {
        const svgContent = element.outerHTML;
        tokenArray.push({
            type: 'assets',
            category: 'svg',
            value: svgContent,
            name: element.id || 'svg-icon',
            attributes: {
                width: element.getAttribute('width'),
                height: element.getAttribute('height'),
                viewBox: element.getAttribute('viewBox')
            }
        });
    }
}

/**
 * Extract complete text styles from semantic elements
 */
function extractTextStyles(root, window, tokenArray) {
    const tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'small', 'blockquote', 'a', 'button', 'label'];
    const seen = new Set();

    tags.forEach(tag => {
        const elements = root.querySelectorAll(tag);
        // Take samples
        Array.from(elements).slice(0, 3).forEach((el, index) => {
            const style = window.getComputedStyle(el);
            const signature = `${style.fontSize}-${style.fontWeight}-${style.lineHeight}-${style.fontFamily}`;

            if (!seen.has(signature)) {
                seen.add(signature);

                let name = tag.toUpperCase();
                if (elements.length > 1 && index > 0) name += ` (Var ${index + 1})`;

                tokenArray.push({
                    type: 'typography',
                    category: 'text-style',
                    name: name,
                    value: style.fontFamily,
                    attributes: {
                        fontSize: style.fontSize,
                        fontWeight: style.fontWeight,
                        lineHeight: style.lineHeight,
                        letterSpacing: style.letterSpacing,
                        fontFamily: style.fontFamily,
                        color: style.color
                    }
                });
            }
        });
    });
}

/**
 * Extract @font-face declarations
 */
function extractFontFaces(tokenArray) {
    const styleSheets = Array.from(document.styleSheets);

    styleSheets.forEach(sheet => {
        try {
            const rules = Array.from(sheet.cssRules || sheet.rules || []);
            rules.forEach(rule => {
                if (rule instanceof CSSFontFaceRule) {
                    const fontFamily = rule.style.fontFamily.replace(/['"]/g, '');
                    const src = rule.style.src;

                    const urlMatch = src.match(/url\(['"]?([^'"]+)['"]?\)/);

                    if (urlMatch && urlMatch[1]) {
                        const url = urlMatch[1];
                        const ext = url.split('.').pop().split(/[?#]/)[0].toLowerCase();

                        tokenArray.push({
                            type: 'assets',
                            category: 'font',
                            value: url,
                            name: `${fontFamily} (${ext})`,
                            attributes: { format: ext }
                        });
                    }
                }
            });
        } catch (e) {
            // CORS or generic error
        }
    });
}

/**
 * Extract @keyframes animations
 */
function extractKeyframes(tokenArray) {
    const styleSheets = Array.from(document.styleSheets);

    styleSheets.forEach(sheet => {
        try {
            const rules = Array.from(sheet.cssRules || sheet.rules || []);
            rules.forEach(rule => {
                if (rule instanceof CSSKeyframesRule) {
                    const keyframes = Array.from(rule.cssRules).map(kf => ({
                        keyText: kf.keyText,
                        style: kf.style.cssText
                    }));

                    tokenArray.push({
                        type: 'motion',
                        category: 'keyframes',
                        value: JSON.stringify(keyframes),
                        name: rule.name,
                        attributes: {
                            keyframesCount: keyframes.length
                        }
                    });
                }
            });
        } catch (e) {
            // Skip stylesheets we can't access due to CORS
            console.warn('Cannot access stylesheet:', sheet.href, e);
        }
    });
}

/**
 * Process extracted tokens for display
 */
function processTokens(tokens) {
    // Initialize tokenData as an object with categories
    AppState.tokenData = {
        colors: [],
        typography: [],
        spacing: [],
        assets: [],
        effects: [],
        motion: []
    };

    let totalTokens = 0;

    // Organize tokens by category
    Object.keys(tokens).forEach(category => {
        if (AppState.tokenData.hasOwnProperty(category)) {
            AppState.tokenData[category] = tokens[category].map(token => ({
                ...token,
                id: generateTokenId()
            }));
            totalTokens += AppState.tokenData[category].length;
        }
    });

    console.log(`📊 Processed ${totalTokens} design tokens`, AppState.tokenData);
}

/**
 * Render tokens in the grid
 */
function renderTokens() {
    let filteredTokens = [];

    if (AppState.currentCategory === 'all') {
        // Combine all tokens from all categories
        Object.values(AppState.tokenData).forEach(category => {
            if (Array.isArray(category)) {
                filteredTokens = filteredTokens.concat(category);
            }
        });
    } else {
        // Get tokens for specific category
        filteredTokens = AppState.tokenData[AppState.currentCategory] || [];
    }

    DOM.tokenGrid.innerHTML = '';

    if (filteredTokens.length === 0) {
        DOM.tokenGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--color-text-tertiary);">
                <p style="font-size: 1.125rem; margin-bottom: 0.5rem;">No tokens found</p>
                <p style="font-size: 0.875rem;">Try analyzing a page or switch to a different category</p>
            </div>
        `;
        return;
    }

    filteredTokens.forEach(token => {
        const card = createTokenCard(token);
        DOM.tokenGrid.appendChild(card);
    });
}

/**
 * Create a token card element
 */
function createTokenCard(token) {
    const card = document.createElement('div');
    card.className = 'token-card';
    card.dataset.category = token.type;

    const preview = createTokenPreview(token);

    card.innerHTML = `
        <div class="token-header">
            <span class="token-category">${token.category}</span>
        </div>
        <div class="token-preview">
            ${preview}
        </div>
        <div class="token-details">
            <div class="token-name">${token.name}</div>
            <div class="token-value">${truncateValue(token.value)}</div>
        </div>
    `;

    return card;
}

/**
 * Create token preview based on type
 */
function createTokenPreview(token) {
    switch (token.type) {
        case 'colors':
            return `<div class="color-swatch" style="background: ${token.value};"></div>`;

        case 'typography':
            if (token.category === 'font-family') {
                return `<div class="typography-specimen" style="font-family: ${token.value};">Aa Bb Cc</div>`;
            } else if (token.category.includes('size')) {
                return `<div class="typography-specimen" style="font-size: ${token.value};">Aa</div>`;
            } else if (token.category.includes('weight')) {
                return `<div class="typography-specimen" style="font-weight: ${token.value};">Aa Bb Cc</div>`;
            }
            return `<div class="typography-specimen">${token.value}</div>`;

        case 'spacing':
            return `<div class="spacing-visual" style="width: ${token.value}; height: ${token.value};"></div>`;

        case 'effects':
            return `<div style="width: 60px; height: 60px; background: var(--color-accent-primary); border-radius: 8px; box-shadow: ${token.value};"></div>`;

        case 'motion':
            if (token.category === 'transition-duration') {
                return `<div style="animation: pulse ${token.value} infinite;">⚡</div>`;
            }
            return `<div style="font-size: 2rem;">🎬</div>`;

        case 'assets':
            if (token.category === 'image') {
                return `<img src="${token.value}" alt="${token.name}" style="max-width: 100%; max-height: 80px; object-fit: contain;">`;
            } else if (token.category === 'svg') {
                return token.value;
            } else if (token.category === 'font-face') {
                return `<div style="font-size: 2rem;">📝</div>`;
            }
            return `<div>📦</div>`;

        default:
            return `<div>${token.value}</div>`;
    }
}

/**
 * Handle category tab change
 */
function handleCategoryChange(e) {
    const category = e.target.dataset.category;

    // Update active tab
    DOM.categoryTabs.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');

    // Update current category
    AppState.currentCategory = category;

    // Re-render tokens with enhanced features
    if (typeof window.EnhancedFeatures !== 'undefined') {
        window.EnhancedFeatures.renderEnhancedTokens(category);
        window.EnhancedFeatures.attachEnhancedEventListeners();
    } else {
        renderTokens();
    }
}

/**
 * Open export modal
 */
function openExportModal() {
    // Count total tokens across all categories
    let totalTokens = 0;
    Object.values(AppState.tokenData).forEach(category => {
        if (Array.isArray(category)) {
            totalTokens += category.length;
        }
    });

    if (totalTokens === 0) {
        alert(t('noTokensToExport'));
        return;
    }

    DOM.exportModal.classList.add('active');
}

/**
 * Close export modal
 */
function closeExportModal() {
    DOM.exportModal.classList.remove('active');
}

/**
 * Handle export in different formats
 */
function handleExport(e) {
    const format = e.currentTarget.dataset.format;

    let exportData;
    let filename;
    let mimeType = 'application/json';

    switch (format) {
        case 'json':
            exportData = exportAsW3CJSON();
            filename = 'design-tokens.json';
            break;

        case 'css':
            exportData = exportAsCSS();
            filename = 'design-tokens.css';
            mimeType = 'text/css';
            break;

        case 'js':
            exportData = exportAsJavaScript();
            filename = 'design-tokens.js';
            mimeType = 'text/javascript';
            break;

        case 'figma':
            exportData = exportAsFigmaTokens();
            filename = 'figma-tokens.json';
            break;

        default:
            console.error('Unknown export format:', format);
            return;
    }

    // Download the file
    downloadFile(exportData, filename, mimeType);

    // Close modal
    closeExportModal();
}

/**
 * Export as W3C Design Tokens JSON
 */
function exportAsW3CJSON() {
    const tokens = {};

    // Iterate over all categories
    Object.keys(AppState.tokenData).forEach(type => {
        const tokensInCategory = AppState.tokenData[type];
        if (Array.isArray(tokensInCategory)) {
            tokensInCategory.forEach(token => {
                if (!tokens[token.type]) {
                    tokens[token.type] = {};
                }

                tokens[token.type][token.name] = {
                    $value: token.value,
                    $type: mapToW3CType(token.type, token.category),
                    $description: `${token.category} token extracted from page`
                };
            });
        }
    });

    return JSON.stringify(tokens, null, 2);
}

/**
 * Export as CSS Custom Properties
 */
function exportAsCSS() {
    let css = ':root {\n';
    css += '  /* Design Tokens extracted by Design Token Inspector */\n';
    css += '  /* https://github.com/your-repo */\n\n';

    const grouped = groupTokensByType();

    Object.keys(grouped).forEach(type => {
        css += `  /* ${type.toUpperCase()} */\n`;
        grouped[type].forEach(token => {
            const cssVarName = `--${token.name}`;
            css += `  ${cssVarName}: ${token.value};\n`;
        });
        css += '\n';
    });

    css += '}';
    return css;
}

/**
 * Export as JavaScript module
 */
function exportAsJavaScript() {
    const grouped = groupTokensByType();

    let js = '// Design Tokens extracted by Design Token Inspector\n';
    js += '// https://github.com/your-repo\n\n';
    js += 'export const designTokens = {\n';

    Object.keys(grouped).forEach((type, index) => {
        js += `  ${type}: {\n`;
        grouped[type].forEach((token, tokenIndex) => {
            const jsKey = token.name.replace(/-/g, '_');
            js += `    ${jsKey}: '${token.value}'`;
            js += tokenIndex < grouped[type].length - 1 ? ',\n' : '\n';
        });
        js += index < Object.keys(grouped).length - 1 ? '  },\n' : '  }\n';
    });

    js += '};\n\n';
    js += 'export default designTokens;';

    return js;
}

/**
 * Export formatted for Figma plugins
 */
function exportAsFigmaTokens() {
    const figmaTokens = {
        global: {}
    };

    // Iterate over all categories
    Object.keys(AppState.tokenData).forEach(category => {
        const tokensInCategory = AppState.tokenData[category];
        if (Array.isArray(tokensInCategory)) {
            tokensInCategory.forEach(token => {
                const tokenCategory = token.type;

                if (!figmaTokens.global[tokenCategory]) {
                    figmaTokens.global[tokenCategory] = {};
                }

                figmaTokens.global[tokenCategory][token.name] = {
                    value: token.value,
                    type: mapToFigmaType(token.type, token.category)
                };
            });
        }
    });

    return JSON.stringify(figmaTokens, null, 2);
}

/**
 * Group tokens by type
 */
function groupTokensByType() {
    const grouped = {};

    // Iterate over all categories
    Object.keys(AppState.tokenData).forEach(type => {
        const tokensInCategory = AppState.tokenData[type];
        if (Array.isArray(tokensInCategory) && tokensInCategory.length > 0) {
            grouped[type] = tokensInCategory;
        }
    });

    return grouped;
}

/**
 * Map token type to W3C type
 */
function mapToW3CType(type, category) {
    const mapping = {
        'colors': 'color',
        'typography': category.includes('size') ? 'dimension' : category.includes('family') ? 'fontFamily' : category.includes('weight') ? 'fontWeight' : 'string',
        'spacing': 'dimension',
        'effects': 'shadow',
        'motion': 'duration',
        'assets': 'string'
    };

    return mapping[type] || 'string';
}

/**
 * Map token type to Figma type
 */
function mapToFigmaType(type, category) {
    const mapping = {
        'colors': 'color',
        'typography': 'typography',
        'spacing': 'spacing',
        'effects': 'boxShadow',
        'motion': 'other',
        'assets': 'other'
    };

    return mapping[type] || 'other';
}

/**
 * Clear all tokens
 */
function clearTokens() {
    if (confirm('Are you sure you want to clear all extracted tokens?')) {
        resetTokens();
        DOM.tokenGrid.innerHTML = '';
        DOM.dashboardSection.style.display = 'none';
        updateStats();
    }
}

/**
 * Reset token state
 */
function resetTokens() {
    AppState.tokenData = [];
    AppState.analyzedElements = 0;
    AppState.currentCategory = 'all';

    // Reset category tab
    DOM.categoryTabs.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    DOM.categoryTabs.querySelector('[data-category="all"]').classList.add('active');
}

/**
 * Show/hide dashboard
 */
function showDashboard() {
    DOM.dashboardSection.style.display = 'block';
}

/**
 * Show/hide loading overlay
 */
function showLoading(show) {
    if (show) {
        DOM.loadingOverlay.classList.add('active');
    } else {
        DOM.loadingOverlay.classList.remove('active');
    }
}

/**
 * Update header stats
 */
function updateStats() {
    // Get new dashboard stats elements
    const tokenCount = document.getElementById('tokenCount');
    const elementCount = document.getElementById('elementCount');

    // Count total tokens across all categories
    let totalTokens = 0;
    Object.values(AppState.tokenData).forEach(category => {
        if (Array.isArray(category)) {
            totalTokens += category.length;
        }
    });

    if (tokenCount) {
        tokenCount.textContent = totalTokens;
    }

    if (elementCount) {
        elementCount.textContent = AppState.analyzedElements;
    }
}


/**
 * Download a file
 */
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);

    console.log(`📥 Downloaded: ${filename}`);
}

/**
 * Download current category tokens as JSON
 */
function downloadCurrentCategory() {
    const category = AppState.currentCategory;
    const tokens = AppState.tokenData[category] || [];

    if (tokens.length === 0) {
        alert('No tokens in current category to download.');
        return;
    }

    const exportData = {
        category: category,
        count: tokens.length,
        tokens: tokens.map(t => ({
            name: t.name,
            value: t.value,
            type: t.type,
            category: t.category
        }))
    };

    const content = JSON.stringify(exportData, null, 2);
    downloadFile(content, `${category}-tokens.json`, 'application/json');
}

/**
 * Download all tokens as JSON
 */
function downloadAllTokens() {
    const allTokens = {};
    let totalCount = 0;

    Object.keys(AppState.tokenData).forEach(type => {
        const tokens = AppState.tokenData[type];
        if (Array.isArray(tokens) && tokens.length > 0) {
            allTokens[type] = tokens.map(t => ({
                name: t.name,
                value: t.value,
                type: t.type,
                category: t.category
            }));
            totalCount += tokens.length;
        }
    });

    if (totalCount === 0) {
        alert('No tokens to download. Please analyze a page first.');
        return;
    }

    const exportData = {
        totalCount: totalCount,
        tokens: allTokens
    };

    const content = JSON.stringify(exportData, null, 2);
    downloadFile(content, 'all-design-tokens.json', 'application/json');
}

/**
 * Utility: Generate unique token ID
 */
function generateTokenId() {
    return `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Utility: Generate color name from value
 */
function generateColorName(color, type) {
    // Convert rgb/rgba to hex if possible
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (rgbMatch) {
        const [, r, g, b] = rgbMatch;
        const hex = `#${((1 << 24) + (parseInt(r) << 16) + (parseInt(g) << 8) + parseInt(b)).toString(16).slice(1)}`;
        return `color-${type}-${hex.replace('#', '')}`;
    }

    return `color-${type}-${color.replace(/[^a-z0-9]/gi, '-')}`;
}

/**
 * Utility: Generate font family name
 */
function generateFontFamilyName(fontFamily) {
    const cleanName = fontFamily
        .split(',')[0]
        .replace(/['"]/g, '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');

    return `font-family-${cleanName}`;
}

/**
 * Utility: Get font weight name
 */
function getFontWeightName(weight) {
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

    return weights[weight] || weight;
}

/**
 * Utility: Truncate long values
 */
function truncateValue(value, maxLength = 60) {
    if (typeof value !== 'string') {
        value = String(value);
    }

    return value.length > maxLength ? value.substring(0, maxLength) + '...' : value;
}

/* ================================================
   INTERNATIONALIZATION (i18n) FUNCTIONS
   ================================================ */

/**
 * Initialize language on page load
 */
function initializeLanguage() {
    // Apply the saved language
    applyLanguage(AppState.currentLanguage);

    // Update active language button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === AppState.currentLanguage) {
            btn.classList.add('active');
        }
    });
}

/**
 * Handle language change
 */
function handleLanguageChange(e) {
    const newLang = e.target.dataset.lang;

    if (newLang === AppState.currentLanguage) return;

    AppState.currentLanguage = newLang;
    localStorage.setItem('language', newLang);

    // Update button states
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');

    // Apply new language
    applyLanguage(newLang);
}

/**
 * Apply language translations to the page
 */
function applyLanguage(lang) {
    const t = translations[lang];

    if (!t) {
        console.error(`Translation for language "${lang}" not found`);
        return;
    }

    // Translate all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (t[key]) {
            element.textContent = t[key];
        }
    });

    // Update page title
    document.title = `${t.appTitle} | ${t.appTagline}`;


    // Update specific elements
    updateTextContent('.logo-text h1', t.appTitle);
    updateTextContent('.logo-text .tagline', t.appTagline);
    updateTextContent('.input-header h2', t.targetConfig);
    updateTextContent('.stat-label', t.tokens, 0);
    updateTextContent('.stat-label', t.elements, 1);

    // Update URL input
    updateTextContent('label[for="urlInput"]', t.targetURL);
    updateTextContent('#analyzeUrlBtn', t.analyzeURLBtn);

    // Update dashboard
    updateTextContent('.dashboard-header h2', t.extractedTokens);
    updateTextContent('#clearBtn', t.clearBtn);
    updateTextContent('#exportBtn', t.exportBtn);
    // Update category tabs
    updateTextContent('.tab-btn[data-category="all"]', t.allTokens);
    updateTextContent('.tab-btn[data-category="colors"]', t.colors);
    updateTextContent('.tab-btn[data-category="typography"]', t.typography);
    updateTextContent('.tab-btn[data-category="spacing"]', t.spacing);
    updateTextContent('.tab-btn[data-category="assets"]', t.assets);

    // Update banners and buttons
    updateTextContent('#currentPageMode .info-banner span', t.analyzingCurrentPage);
    updateTextContent('#analyzeCurrentBtn', t.analyzeCurrentPageBtn);
    updateTextContent('#urlMode .info-banner span', t.corsWarning);
    updateTextContent('label[for="proxyInput"]', t.corsProxy);
    updateTextContent('#bookmarkletMode .info-banner span', t.bypassCORS);
    updateTextContent('.bookmarklet-instructions', t.dragBookmarklet);
    updateTextContent('#bookmarkletLink', t.inspectTokens);
    updateTextContent('.help-text', t.copyBookmarkletHelp);
    updateTextContent('#copyBookmarkletBtn', t.copyBookmarkletBtn);

    // Update category tabs
    updateTextContent('.tab-btn[data-category="effects"]', t.effects);
    updateTextContent('.tab-btn[data-category="motion"]', t.motion);

    // Update export modal
    updateTextContent('.modal-header h2', t.exportTitle);
    updateTextContent('.export-option[data-format="json"] h3', t.w3cJSON);
    updateTextContent('.export-option[data-format="json"] p', t.w3cJSONDesc);
    updateTextContent('.export-option[data-format="css"] h3', t.cssVariables);
    updateTextContent('.export-option[data-format="css"] p', t.cssVariablesDesc);
    updateTextContent('.export-option[data-format="js"] h3', t.javascript);
    updateTextContent('.export-option[data-format="js"] p', t.javascriptDesc);
    updateTextContent('.export-option[data-format="figma"] h3', t.figmaTokens);
    updateTextContent('.export-option[data-format="figma"] p', t.figmaTokensDesc);

    // Update loading text
    updateTextContent('.loading-text', t.analyzingTokens);
}

/**
 * Helper function to update text content
 */
function updateTextContent(selector, text, index = 0) {
    const elements = document.querySelectorAll(selector);
    if (elements[index]) {
        // Check if this is an icon-only button (should not have text)
        const isIconOnly = elements[index].classList.contains('btn-icon-inline');

        // Preserve icons/SVG in buttons
        const svg = elements[index].querySelector('svg');
        if (svg) {
            elements[index].textContent = '';
            elements[index].appendChild(svg.cloneNode(true));
            // Only add text if it's NOT an icon-only button
            if (!isIconOnly) {
                elements[index].appendChild(document.createTextNode(' ' + text));
            }
        } else {
            elements[index].textContent = text;
        }
    }
}

/**
 * Get translated text for a key
 */
window.t = function t(key) {
    const lang = AppState.currentLanguage;
    return translations[lang]?.[key] || key;
};

/* ================================================
   THEME MANAGEMENT FUNCTIONS
   ================================================ */

/**
 * Initialize theme on page load
 */
function initializeTheme() {
    applyTheme(AppState.currentTheme);
}

/**
 * Handle theme toggle
 */
function handleThemeToggle() {
    const newTheme = AppState.currentTheme === 'dark' ? 'light' : 'dark';
    AppState.currentTheme = newTheme;
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
}

/**
 * Apply theme to the page
 */
function applyTheme(theme) {
    const root = document.documentElement;
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    if (theme === 'light') {
        root.setAttribute('data-theme', 'light');
        sunIcon?.classList.add('hidden');
        moonIcon?.classList.remove('hidden');
    } else {
        root.setAttribute('data-theme', 'dark');
        sunIcon?.classList.remove('hidden');
        moonIcon?.classList.add('hidden');
    }
}


/* ================================================
   INITIALIZE APPLICATION
   ================================================ */

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
