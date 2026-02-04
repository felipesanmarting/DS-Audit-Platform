/**
 * Enhanced Features for Design Token Inspector
 * - Copy individual tokens
 * - Download assets (individual and grouped)
 * - Group tokens by category
 * - Motion animation demos
 */

// ===== COPY TOKEN FUNCTIONALITY =====

function copyTokenValue(value, button) {
    navigator.clipboard.writeText(value).then(() => {
        // Visual feedback - change icon to checkmark
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i data-lucide="check"></i>';
        button.style.color = 'var(--color-accent-success)';

        // Re-initialize Lucide icons for the new icon
        if (window.lucide) {
            window.lucide.createIcons();
        }

        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.color = '';
            // Re-initialize Lucide icons again
            if (window.lucide) {
                window.lucide.createIcons();
            }
        }, 1500);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert(t('copyFailed') || 'Failed to copy');
    });
}

// ===== ASSET DOWNLOAD FUNCTIONALITY =====

function getAssetExtension(url) {
    try {
        const pathname = new URL(url).pathname;
        const ext = pathname.split('.').pop().toLowerCase();
        return ext || 'other';
    } catch {
        return 'other';
    }
}

function isIconAsset(asset) {
    const name = (asset.name || '').toLowerCase();
    const value = (asset.value || '').toLowerCase();

    // Check for icon keywords in name or value
    const iconKeywords = ['icon', 'logo', 'symbol', 'badge', 'avatar'];
    return iconKeywords.some(keyword => name.includes(keyword) || value.includes(keyword));
}

function downloadAsset(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || url.split('/').pop();
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function downloadFilteredAssets(filter) {
    const allAssets = AppState.tokenData.assets || [];

    let filteredAssets = allAssets;

    if (filter === 'icons') {
        filteredAssets = allAssets.filter(asset => isIconAsset(asset));
    } else if (filter !== 'all') {
        filteredAssets = allAssets.filter(asset => {
            const ext = getAssetExtension(asset.value);
            return ext === filter || (filter === 'jpg' && ext === 'jpeg');
        });
    }

    if (filteredAssets.length === 0) {
        alert(t('noAssetsToDownload') || `No ${filter} assets found`);
        return;
    }

    // Download each asset with a small delay to avoid overwhelming the browser
    filteredAssets.forEach((asset, index) => {
        setTimeout(() => {
            const ext = getAssetExtension(asset.value);
            const filename = `${asset.name || `asset-${index + 1}`}.${ext}`;
            downloadAsset(asset.value, filename);
        }, index * 300); // 300ms delay between downloads
    });

    console.log(`✅ Downloaded ${filteredAssets.length} ${filter} assets`);
}

// ===== GROUPING TOKENS BY CATEGORY =====

function sortTokens(tokens) {
    // Sort tokens alphabetically by name
    return tokens.sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
    });
}

function groupTokensBySubcategory(tokens) {
    const grouped = {};

    tokens.forEach(token => {
        const category = token.category || 'other';
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push(token);
    });

    // Sort tokens within each group
    Object.keys(grouped).forEach(category => {
        grouped[category] = sortTokens(grouped[category]);
    });

    return grouped;
}

// ===== MOTION ANIMATION DEMO =====

function createMotionDemo(motionToken) {
    const container = document.createElement('div');
    container.className = 'motion-demo';

    const element = document.createElement('div');
    element.className = 'motion-demo-element';

    const playBtn = document.createElement('button');
    playBtn.className = 'motion-demo-play-btn';
    playBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M3 2l10 6-10 6V2z"/></svg>`;
    playBtn.title = 'Play animation';

    container.appendChild(element);
    container.appendChild(playBtn);

    // Parse the animation/transition value
    let animationStyle = {};
    if (motionToken.value.includes('transition')) {
        animationStyle.transition = motionToken.value;
    } else {
        animationStyle.animation = motionToken.value;
    }

    // Play animation on button click
    playBtn.addEventListener('click', () => {
        playBtn.classList.add('playing');
        element.style.left = '0';

        // Apply the animation
        Object.assign(element.style, animationStyle);

        // Trigger animation
        setTimeout(() => {
            element.style.left = 'calc(100% - 40px)';
        }, 50);

        // Reset after animation
        setTimeout(() => {
            element.style.left = '0';
            element.style.transition = '';
            element.style.animation = '';
            playBtn.classList.remove('playing');
        }, 3000);
    });

    return container;
}

// ===== ENHANCED RENDERING FUNCTIONS =====

function renderEnhancedTokens(category = 'all') {
    const tokenGrid = document.getElementById('tokenGrid');
    const currentCategory = category === 'all' ? 'all' : category;

    let tokensToRender = [];

    if (currentCategory === 'all') {
        // Combine all tokens
        Object.values(AppState.tokenData).forEach(categoryTokens => {
            if (Array.isArray(categoryTokens)) {
                tokensToRender = tokensToRender.concat(categoryTokens);
            }
        });
    } else {
        tokensToRender = AppState.tokenData[currentCategory] || [];
    }

    if (tokensToRender.length === 0) {
        tokenGrid.innerHTML = `
            <div class="empty-state">
                <h3>${t('noTokensFound')}</h3>
                <p>${t('tryAnalyzing')}</p>
            </div>
        `;
        return;
    }

    // Group tokens if colors, typography, or spacing
    const shouldGroup = ['colors', 'typography', 'spacing'].includes(currentCategory);

    if (shouldGroup) {
        renderGroupedTokens(tokensToRender, currentCategory, tokenGrid);
    } else if (currentCategory === 'assets') {
        renderAssetGrid(tokensToRender, tokenGrid);
    } else {
        renderFlatTokens(tokensToRender, tokenGrid);
    }
}

function renderAssetGrid(tokens, container) {
    container.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'asset-grid';

    tokens.forEach(token => {
        grid.appendChild(createAssetCard(token));
    });

    container.appendChild(grid);

    // Initialize icons
    setTimeout(() => {
        if (window.lucide) window.lucide.createIcons();
    }, 0);
}

function createAssetCard(token) {
    const card = document.createElement('div');
    card.className = 'asset-card';

    let ext = 'OTHER';
    let isSvgContent = false;

    if (token.category === 'svg') {
        ext = 'SVG';
        isSvgContent = true;
    } else if (token.category === 'font') {
        ext = token.attributes?.format?.toUpperCase() || 'FONT';
    } else if (token.category === 'image' || (token.value && token.value.startsWith('data:image'))) {
        ext = getAssetExtension(token.value).toUpperCase();
        if (ext === 'OTHER' && token.value.includes('data:image/svg')) ext = 'SVG';
        if (ext === 'OTHER' && token.value.includes('data:image/png')) ext = 'PNG';
        if (ext === 'OTHER' && token.value.includes('data:image/jpeg')) ext = 'JPG';
    }

    const isImage = ['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF'].includes(ext);

    let previewHTML = '';

    if (isSvgContent) {
        // Render inline SVG with responsive style
        previewHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">${token.value.replace('<svg', '<svg style="max-width:100%;max-height:100%;"')}</div>`;
    } else if (ext === 'SVG' && !isSvgContent) {
        previewHTML = `<img src="${token.value}" class="asset-preview-image" alt="${token.name}">`;
    } else if (isImage) {
        previewHTML = `<img src="${token.value}" class="asset-preview-image" alt="${token.name}">`;
    } else if (token.category === 'font') {
        previewHTML = `<div class="asset-placeholder" style="font-size:3rem;font-weight:bold;color:var(--color-text-primary);">Aa</div>`;
    } else {
        previewHTML = `<div class="asset-placeholder" style="font-size:1.5rem;font-weight:bold;color:var(--color-text-tertiary);">${ext}</div>`;
    }

    card.innerHTML = `
        <div class="asset-preview-container">
            ${previewHTML}
            <span class="asset-type-badge ${ext.toLowerCase()}">${ext}</span>
        </div>
        <div class="asset-info">
            <div class="asset-name" title="${token.name}">${token.name || 'Unnamed Asset'}</div>
            <div class="asset-meta">
                 <button class="token-copy-btn" title="Copy Code/URL">
                    <i data-lucide="copy"></i>
                </button>
                <button class="token-copy-btn" title="Download">
                    <i data-lucide="download"></i>
                </button>
            </div>
        </div>
    `;

    // Add event listeners manually to avoid inline onclick issues with scope
    const copyBtn = card.querySelector('.token-copy-btn[title="Copy Code/URL"]');
    copyBtn.addEventListener('click', () => copyTokenValue(token.value, copyBtn));

    const downloadBtn = card.querySelector('.token-copy-btn[title="Download"]');
    // If it's inline SVG content, we need to create a blob to download
    if (isSvgContent) {
        downloadBtn.addEventListener('click', () => {
            const blob = new Blob([token.value], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            downloadAsset(url, (token.name || 'icon') + '.svg');
        });
    } else {
        downloadBtn.addEventListener('click', () => downloadAsset(token.value, token.name));
    }

    return card;
}

function renderGroupedTokens(tokens, category, container) {
    const grouped = groupTokensBySubcategory(tokens);
    container.innerHTML = '';

    // Render each group as a table
    Object.entries(grouped).forEach(([subcategory, groupTokens]) => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'token-group';

        const header = document.createElement('h3');
        header.className = 'token-group-header';
        header.textContent = subcategory;

        const table = createTokenTable(groupTokens, category);

        groupDiv.appendChild(header);
        groupDiv.appendChild(table);
        container.appendChild(groupDiv);
    });
}

function renderFlatTokens(tokens, container) {
    container.innerHTML = '';

    // Sort tokens before rendering
    const sortedTokens = sortTokens([...tokens]);

    // Create a single table for all tokens
    const table = createTokenTable(sortedTokens, tokens[0]?.type || 'all');
    container.appendChild(table);
}

function createTokenTable(tokens, category) {
    const table = document.createElement('table');
    table.className = 'token-table';

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const headers = ['Preview', 'Name', 'Value', 'Copy'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');

    tokens.forEach(token => {
        const row = document.createElement('tr');
        row.className = 'token-row';

        // Preview column
        const previewCell = document.createElement('td');
        previewCell.className = 'token-preview-cell';

        const preview = createDOMTokenPreview(token);

        if (preview) {
            previewCell.appendChild(preview);
        } else {
            console.error('Preview is null/undefined for token:', token);
            const fallbackDiv = document.createElement('div');
            fallbackDiv.textContent = '-'; // Changed from 'NULL' to '-' as per original intent
            fallbackDiv.style.color = 'var(--color-text-tertiary)';
            previewCell.appendChild(fallbackDiv);
        }

        row.appendChild(previewCell);

        // Name column
        const nameCell = document.createElement('td');
        nameCell.className = 'token-name-cell';
        nameCell.textContent = token.name;
        row.appendChild(nameCell);

        // Value column
        const valueCell = document.createElement('td');
        valueCell.className = 'token-value-cell';

        if (token.category === 'text-style' && token.attributes) {
            const attrs = token.attributes;
            valueCell.innerHTML = `
                 <div class="typography-details" style="display:flex; flex-wrap:wrap; gap:8px; font-size:0.8rem; color:var(--color-text-secondary); margin-bottom:4px;">
                     <span title="Font Size">📏 ${attrs.fontSize}</span>
                     <span title="Font Weight">⚖️ ${attrs.fontWeight}</span>
                     <span title="Line Height">↕️ ${attrs.lineHeight}</span>
                 </div>
                 <div style="font-size:0.9rem; font-weight:500;">${token.value}</div>
             `;
        } else {
            valueCell.textContent = token.value;
        }

        // Add font download button if applicable
        if (token.type === 'typography' && (token.category === 'font-family' || token.name.includes('font-family'))) {
            const fontName = token.value.replace(/['"]/g, '').split(',')[0].trim();
            const downloadBtn = document.createElement('a');
            downloadBtn.className = 'font-download-btn';
            downloadBtn.href = `https://fonts.google.com/?query=${encodeURIComponent(fontName)}`;
            downloadBtn.target = '_blank';
            downloadBtn.title = 'Search on Google Fonts';
            downloadBtn.innerHTML = '<i data-lucide="download"></i>';
            valueCell.style.display = 'flex';
            valueCell.style.alignItems = 'center';
            valueCell.style.justifyContent = 'space-between';
            valueCell.appendChild(downloadBtn);
        }

        row.appendChild(valueCell);

        // Copy column
        const copyCell = document.createElement('td');
        copyCell.className = 'token-copy-cell';

        const copyBtn = document.createElement('button');
        copyBtn.className = 'token-copy-btn';
        copyBtn.title = 'Copy value';
        copyBtn.innerHTML = '<i data-lucide="copy"></i>';
        copyBtn.addEventListener('click', () => copyTokenValue(token.value, copyBtn));

        copyCell.appendChild(copyBtn);
        row.appendChild(copyCell);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);

    // Initialize Lucide icons after table is created
    setTimeout(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, 0);

    return table;
}

function createDOMTokenPreview(token) {
    const preview = document.createElement('div');
    preview.className = 'token-preview-mini';

    if (token.type === 'colors') {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch-mini';
        swatch.style.background = token.value;
        preview.appendChild(swatch);
    } else if (token.type === 'typography') {
        const specimen = document.createElement('div');
        specimen.className = 'typography-specimen-mini';
        specimen.textContent = 'Aa';

        if (token.category === 'text-style' && token.attributes) {
            specimen.style.fontFamily = token.attributes.fontFamily;
            specimen.style.fontWeight = token.attributes.fontWeight;
            // Use a reasonable size for preview
            specimen.style.fontSize = '1.2rem';
        } else {
            specimen.style.cssText = `font-family: ${token.value};`;
        }

        preview.appendChild(specimen);
    } else if (token.type === 'spacing') {
        const visual = document.createElement('div');
        visual.className = 'spacing-visual-mini';
        visual.style.width = token.value;
        visual.style.height = '20px';
        visual.style.background = 'var(--color-accent-primary)';
        visual.style.borderRadius = '2px';
        preview.appendChild(visual);
    } else if (token.type === 'assets') {
        if (token.category === 'image') {
            const img = document.createElement('img');
            img.src = token.value;
            img.alt = token.name;
            img.className = 'asset-preview-mini';
            preview.appendChild(img);
        }
    } else if (token.type === 'effects') {
        const effectDemo = document.createElement('div');
        effectDemo.className = 'effect-demo-mini';

        if (token.category && token.category.toLowerCase().includes('shadow')) {
            effectDemo.style.boxShadow = token.value;
            effectDemo.style.background = 'var(--color-bg-primary)';
        } else if (token.category && token.category.toLowerCase().includes('radius')) {
            effectDemo.style.borderRadius = token.value;
            effectDemo.style.background = 'var(--color-accent-primary)';
        } else if (token.category && token.category.toLowerCase().includes('opacity')) {
            effectDemo.style.opacity = token.value;
            effectDemo.style.background = 'var(--color-accent-primary)';
        }

        preview.appendChild(effectDemo);
    } else if (token.type === 'motion') {
        const motionDemo = document.createElement('div');
        motionDemo.className = 'motion-preview-mini';
        motionDemo.style.cssText = `
            width: 24px;
            height: 24px;
            background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
            border-radius: 4px;
            animation: motionPreviewBounce 1.5s ease-in-out infinite;
        `;

        // Apply the actual motion value if it's a duration or timing
        if (token.category && token.category.includes('duration')) {
            motionDemo.style.animationDuration = token.value;
        } else if (token.category && token.category.includes('timing')) {
            motionDemo.style.animationTimingFunction = token.value;
        }

        preview.appendChild(motionDemo);
    } else {
        // Fallback for unknown token types
        const fallback = document.createElement('div');
        fallback.textContent = '•';
        fallback.style.fontSize = '1.5rem';
        fallback.style.color = 'var(--color-text-tertiary)';
        preview.appendChild(fallback);
    }

    return preview;
}

function createEnhancedTokenCard(token) {
    const card = document.createElement('div');
    card.className = 'token-card';

    // Header with category and copy button
    const header = document.createElement('div');
    header.className = 'token-header';

    const category = document.createElement('span');
    category.className = 'token-category';
    category.textContent = token.category || token.type;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'token-copy-btn';
    copyBtn.title = 'Copy value';
    copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2zm0 1a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V4a1 1 0 00-1-1H4z"/><path d="M2 6h1v7h7v1H2V6z"/></svg>`;
    copyBtn.addEventListener('click', () => copyTokenValue(token.value, copyBtn));

    header.appendChild(category);
    header.appendChild(copyBtn);

    // Preview
    const preview = document.createElement('div');
    preview.className = 'token-preview';

    if (token.type === 'colors') {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.background = token.value;
        preview.appendChild(swatch);
    } else if (token.type === 'typography') {
        const specimen = document.createElement('div');
        specimen.className = 'typography-specimen';
        specimen.style.cssText = `font-family: ${token.value};`;
        specimen.textContent = 'Aa';
        preview.appendChild(specimen);
    } else if (token.type === 'spacing') {
        const visual = document.createElement('div');
        visual.className = 'spacing-visual';
        visual.style.width = token.value;
        visual.style.height = '40px';
        preview.appendChild(visual);
    } else if (token.type === 'assets') {
        // Enhanced asset preview
        preview.style.position = 'relative';

        if (token.category === 'image') {
            const img = document.createElement('img');
            img.src = token.value;
            img.alt = token.name;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '80px';
            img.style.objectFit = 'contain';
            preview.appendChild(img);

            // Asset type badge
            const ext = getAssetExtension(token.value);
            const badge = document.createElement('span');
            badge.className = `asset-type-badge ${ext}`;
            if (isIconAsset(token)) {
                badge.classList.add('icon');
                badge.textContent = `${ext.toUpperCase()} Icon`;
            } else {
                badge.textContent = ext.toUpperCase();
            }
            preview.appendChild(badge);
        } else if (token.category === 'svg') {
            const svgContainer = document.createElement('div');
            svgContainer.innerHTML = token.value;
            svgContainer.style.maxWidth = '100%';
            svgContainer.style.maxHeight = '80px';
            preview.appendChild(svgContainer);

            const badge = document.createElement('span');
            badge.className = 'asset-type-badge svg';
            badge.textContent = 'SVG';
            preview.appendChild(badge);
        }
    } else if (token.type === 'effects') {
        // Effects preview
        const effectDemo = document.createElement('div');
        effectDemo.className = 'effect-demo';

        if (token.category && token.category.toLowerCase().includes('shadow')) {
            effectDemo.style.boxShadow = token.value;
            effectDemo.style.width = '80px';
            effectDemo.style.height = '80px';
            effectDemo.style.background = 'var(--color-bg-primary)';
            effectDemo.style.borderRadius = 'var(--radius-md)';
        } else if (token.category && token.category.toLowerCase().includes('radius')) {
            effectDemo.style.borderRadius = token.value;
            effectDemo.style.width = '80px';
            effectDemo.style.height = '80px';
            effectDemo.style.background = 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))';
        } else if (token.category && token.category.toLowerCase().includes('opacity')) {
            effectDemo.style.opacity = token.value;
            effectDemo.style.width = '80px';
            effectDemo.style.height = '80px';
            effectDemo.style.background = 'var(--color-accent-primary)';
            effectDemo.style.borderRadius = 'var(--radius-md)';
        } else {
            // Generic effect preview
            effectDemo.textContent = '✨';
            effectDemo.style.fontSize = '2rem';
        }

        preview.appendChild(effectDemo);
    } else if (token.type === 'motion') {
        // Motion demo
        preview.appendChild(createMotionDemo(token));
    }

    // Details
    const details = document.createElement('div');
    details.className = 'token-details';

    const name = document.createElement('div');
    name.className = 'token-name';
    name.textContent = token.name;

    const value = document.createElement('div');
    value.className = 'token-value';
    value.textContent = token.value;

    details.appendChild(name);
    details.appendChild(value);

    // Add download button for assets
    if (token.type === 'assets' && token.category === 'image') {
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'asset-download-btn';
        downloadBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1v8l3-3 1 1-5 5-5-5 1-1 3 3V1h2zm-6 13h12v1H2v-1z"/></svg> Download`;
        downloadBtn.addEventListener('click', () => {
            const ext = getAssetExtension(token.value);
            const filename = `${token.name}.${ext}`;
            downloadAsset(token.value, filename);
        });
        details.appendChild(downloadBtn);
    }

    card.appendChild(header);
    card.appendChild(preview);
    card.appendChild(details);

    return card;
}

// ===== EVENT HANDLERS =====

function attachEnhancedEventListeners() {
    // Asset filter buttons
    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filter = e.target.dataset.filter;
            downloadFilteredAssets(filter);
        });
    });

    // Show/hide asset controls based on active category
    const categoryTabs = document.querySelectorAll('.tab-btn');
    const assetControls = document.getElementById('assetControls');

    categoryTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            if (category === 'assets') {
                assetControls.classList.remove('hidden');
            } else {
                assetControls.classList.add('hidden');
            }
        });
    });
}

// Export functions for use in main app.js
window.EnhancedFeatures = {
    renderEnhancedTokens,
    attachEnhancedEventListeners,
    copyTokenValue,
    downloadFilteredAssets
};
