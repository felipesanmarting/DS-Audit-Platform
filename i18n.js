/* ================================================
   INTERNATIONALIZATION (i18n)
   Spanish and English Translations
   ================================================ */

const translations = {
    es: {
        // Header
        language: 'Idioma',
        theme: 'Tema',
        tokens: 'Tokens',
        elements: 'Elementos',

        // Main Title
        appTitle: 'Auditoría de tokens',
        appTagline: 'Extrae, Analiza y Exporta Sistemas de Diseño',

        // Input Section
        targetConfig: 'Configuración de Destino',
        currentPage: 'Página Actual',
        externalURL: 'URL Externa',
        bookmarklet: 'Bookmarklet',

        // Current Page Mode
        analyzingCurrentPage: 'Analizando la página actual (esta herramienta de inspección)',
        analyzeCurrentPageBtn: 'Analizar Página Actual',

        // URL Mode
        corsWarning: 'Pueden aplicarse restricciones CORS. Usa un proxy o bookmarklet para sitios externos.',
        targetURL: 'Ingresa URL de destino',
        corsProxy: 'Proxy CORS (opcional)',
        analyzeURLBtn: 'Analizar URL',

        // Bookmarklet Mode
        bypassCORS: 'Evita CORS ejecutando el inspector directamente en cualquier página',
        dragBookmarklet: 'Arrastra este botón a tu barra de marcadores, luego haz clic en cualquier sitio web:',
        inspectTokens: '📊 Inspeccionar Tokens de Diseño',
        copyBookmarkletHelp: 'Haz clic en el botón a continuación para copiar el código del bookmarklet a tu portapapeles:',
        copyBookmarkletBtn: 'Copiar Código del Bookmarklet',

        // Dashboard
        extractedTokens: 'Tokens de Diseño Extraídos',
        clearBtn: 'Limpiar',
        exportBtn: 'Exportar Tokens',

        // Category Tabs
        colors: 'Colors',
        typography: 'Typography',
        spacing: 'Spacing',
        borderRadius: 'Border radii',
        assets: 'Assets',
        effects: 'Shadows',
        motion: 'Motion',

        // Export Modal
        exportTitle: 'Exportar Tokens de Diseño',
        w3cJSON: 'W3C JSON',
        w3cJSONDesc: 'Formato del Grupo Comunitario de Tokens de Diseño',
        cssVariables: 'Variables CSS',
        cssVariablesDesc: 'Propiedades Personalizadas CSS (:root)',
        javascript: 'JavaScript',
        javascriptDesc: 'Exportación de Módulo ES6',
        figmaTokens: 'Tokens Figma',
        figmaTokensDesc: 'JSON para plugins de Figma',

        // Loading
        analyzingTokens: 'Analizando tokens de diseño...',

        // Messages
        noTokensFound: 'No se encontraron tokens',
        tryAnalyzing: 'Intenta analizar una página o cambia a una categoría diferente',
        noTokensToExport: 'No hay tokens para exportar. Por favor, analiza una página primero.',
        clearConfirm: '¿Estás seguro de que quieres borrar todos los tokens extraídos?',
        bookmarkletCopied: 'Código del bookmarklet copiado al portapapeles!\n\nAhora puedes:\n1. Crear un nuevo marcador\n2. Pegar este código como URL\n3. Hacer clic en el marcador en cualquier página para analizarla',
        copyFailed: 'Error al copiar al portapapeles. Por favor, inténtalo de nuevo.',
        errorAnalyzingPage: 'Error al analizar la página. Revisa la consola para más detalles.',
        pleaseEnterURL: 'Por favor, ingresa una URL válida',

        // Alert Dialog
        alertDialogTitle: '¿Estás seguro?',
        alertDialogDescription: 'Esta acción no se puede deshacer. Se eliminarán todos los tokens extraídos de la sesión actual.',
        alertDialogCancel: 'Cancelar',
        alertDialogConfirm: 'Eliminar',

        // CORS Error
        corsErrorTitle: 'Error CORS',
        corsErrorMessage: 'No se puede obtener la URL directamente.\\n\\nSoluciones:\\n1. Usa el modo bookmarklet en su lugar\\n2. Agrega una URL de proxy CORS\\n3. Instala una extensión del navegador para evitar CORS',
        corsErrorAllProxiesFailed: 'No se pudo acceder a la URL después de intentar con múltiples métodos.\\n\\nVerifica que:\\n1. La URL sea correcta y esté accesible\\n2. El sitio web esté funcionando\\n3. No haya problemas de red',
        // Token Categories (for display)
        background: 'fondo',
        text: 'texto',
        border: 'borde',
        'font-size': 'tamaño-fuente',
        'font-family': 'familia-fuente',
        'font-weight': 'peso-fuente',
        'line-height': 'altura-línea',
        'letter-spacing': 'espaciado-letras',
        'text-shadow': 'sombra-texto',
        padding: 'relleno',
        margin: 'margen',
        gap: 'espacio',
        'border-radius': 'radio-borde',
        'box-shadow': 'sombra-caja',
        'transition-duration': 'duración-transición',
        'transition-timing-function': 'función-temporización',
        keyframes: 'cuadros-clave',
        image: 'imagen',
        svg: 'svg',
        'font-face': 'fuente-personalizada'
    },

    en: {
        // Header
        language: 'Language',
        theme: 'Theme',
        tokens: 'Tokens',
        elements: 'Elements',

        // Main Title
        appTitle: 'Token Audit',
        appTagline: 'Extract, Analyze, Export Design Systems',

        // Input Section
        targetConfig: 'Target Configuration',
        currentPage: 'Current Page',
        externalURL: 'External URL',
        bookmarklet: 'Bookmarklet',

        // Current Page Mode
        analyzingCurrentPage: 'Analyzing the current page (this inspector tool)',
        analyzeCurrentPageBtn: 'Analyze Current Page',

        // URL Mode
        corsWarning: 'CORS restrictions may apply. Use a proxy or bookmarklet for external sites.',
        targetURL: 'Enter target URL',
        corsProxy: 'CORS Proxy (optional)',
        analyzeURLBtn: 'Analyze URL',

        // Bookmarklet Mode
        bypassCORS: 'Bypass CORS by running the inspector directly on any page',
        dragBookmarklet: 'Drag this button to your bookmarks bar, then click it on any website:',
        inspectTokens: '📊 Inspect Design Tokens',
        copyBookmarkletHelp: 'Click the button below to copy the bookmarklet code to your clipboard:',
        copyBookmarkletBtn: 'Copy Bookmarklet Code',

        // Dashboard
        extractedTokens: 'Extracted Design Tokens',
        clearBtn: 'Clear',
        exportBtn: 'Export Tokens',

        // Category Tabs
        colors: 'Colors',
        typography: 'Typography',
        spacing: 'Spacing',
        borderRadius: 'Border radii',
        assets: 'Assets',
        effects: 'Shadows',
        motion: 'Motion',

        // Export Modal
        exportTitle: 'Export Design Tokens',
        w3cJSON: 'W3C JSON',
        w3cJSONDesc: 'Design Tokens Community Group format',
        cssVariables: 'CSS Variables',
        cssVariablesDesc: 'CSS Custom Properties (:root)',
        javascript: 'JavaScript',
        javascriptDesc: 'ES6 Module Export',
        figmaTokens: 'Figma Tokens',
        figmaTokensDesc: 'JSON for Figma plugins',

        // Loading
        analyzingTokens: 'Analyzing design tokens...',

        // Messages
        noTokensFound: 'No tokens found',
        tryAnalyzing: 'Try analyzing a page or switch to a different category',
        noTokensToExport: 'No tokens to export. Please analyze a page first.',
        clearConfirm: 'Are you sure you want to clear all extracted tokens?',
        bookmarkletCopied: 'Bookmarklet code copied to clipboard!\n\nYou can now:\n1. Create a new bookmark\n2. Paste this code as the URL\n3. Click the bookmark on any page to analyze it',
        copyFailed: 'Failed to copy to clipboard. Please try again.',
        errorAnalyzingPage: 'Error analyzing page. Check console for details.',
        pleaseEnterURL: 'Please enter a valid URL',

        // Alert Dialog
        alertDialogTitle: 'Are you sure?',
        alertDialogDescription: 'This action cannot be undone. All extracted tokens from the current session will be deleted.',
        alertDialogCancel: 'Cancel',
        alertDialogConfirm: 'Delete',

        // CORS Error
        corsErrorTitle: 'CORS Error',
        corsErrorMessage: 'Unable to fetch the URL directly.\n\nSolutions:\n1. Use the bookmarklet mode instead\n2. Add a CORS proxy URL\n3. Install a browser extension to bypass CORS',
        corsErrorAllProxiesFailed: 'Could not access the URL after trying multiple methods.\\n\\nPlease verify that:\\n1. The URL is correct and accessible\\n2. The website is working\\n3. There are no network issues',

        // Token Categories (for display)
        background: 'background',
        text: 'text',
        border: 'border',
        'font-size': 'font-size',
        'font-family': 'font-family',
        'font-weight': 'font-weight',
        'line-height': 'line-height',
        'letter-spacing': 'letter-spacing',
        'text-shadow': 'text-shadow',
        padding: 'padding',
        margin: 'margin',
        gap: 'gap',
        'border-radius': 'border-radius',
        'box-shadow': 'box-shadow',
        'transition-duration': 'transition-duration',
        'transition-timing-function': 'transition-timing-function',
        keyframes: 'keyframes',
        image: 'image',
        svg: 'svg',
        'font-face': 'font-face'
    }
};

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = translations;
}
