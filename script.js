// Elementos del DOM
const body = document.body;
const colorCircle = document.getElementById('colorCircle');
const colorCode = document.getElementById('colorCode');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const historyGrid = document.getElementById('historyGrid');
const clearHistoryBtn = document.getElementById('clearHistory');
const rgbValue = document.getElementById('rgbValue');
const hslValue = document.getElementById('hslValue');
const cmykValue = document.getElementById('cmykValue');
const toast = document.getElementById('toast');
const title = document.querySelector('.title');

// Array para guardar historial de colores
let colorHistory = JSON.parse(localStorage.getItem('colorHistory')) || [];
let currentColor = '#667EEA';

/**
 * Generar un color hexadecimal aleatorio
 */
function generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    
    return color.toUpperCase();
}

/**
 * Convertir HEX a RGB
 */
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Convertir HEX a HSL
 */
function hexToHsl(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    
    return `hsl(${h}, ${s}%, ${l}%)`;
}

/**
 * Convertir HEX a CMYK
 */
function hexToCmyk(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    
    let k = 1 - Math.max(r, g, b);
    let c = (1 - r - k) / (1 - k) || 0;
    let m = (1 - g - k) / (1 - k) || 0;
    let y = (1 - b - k) / (1 - k) || 0;
    
    c = Math.round(c * 100);
    m = Math.round(m * 100);
    y = Math.round(y * 100);
    k = Math.round(k * 100);
    
    return `${c}%, ${m}%, ${y}%, ${k}%`;
}

/**
 * Oscurecer un color para gradientes
 */
function darkenColor(hex, percent) {
    const num = parseInt(hex.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    
    return `#${(
        0x1000000 +
        (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)
    )
    .toString(16)
    .slice(1)}`.toUpperCase();
}

/**
 * Aclarar un color para efectos de brillo
 */
function lightenColor(hex, percent) {
    const num = parseInt(hex.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    
    return `#${(
        0x1000000 +
        R * 0x10000 +
        G * 0x100 +
        B
    )
    .toString(16)
    .slice(1)}`.toUpperCase();
}

/**
 * Calcular luminosidad para determinar si usar texto oscuro o claro
 */
function getLuminance(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    // Fórmula de luminosidad relativa
    return (0.299 * r + 0.587 * g + 0.114 * b);
}

/**
 * Aplicar un color a toda la interfaz
 */
function applyColor(color) {
    currentColor = color;
    const darkenedColor = darkenColor(color, 20);
    const lightenedColor = lightenColor(color, 30);
    const glowColor = color + '40'; // Agregar transparencia para efecto glow
    const luminance = getLuminance(color);
    
    // 1. Cambiar fondo del body al color exacto generado
    body.style.backgroundColor = color;
    
    // 2. Actualizar variables CSS para efectos
    document.documentElement.style.setProperty('--current-color', color);
    document.documentElement.style.setProperty('--current-color-dark', darkenedColor);
    document.documentElement.style.setProperty('--current-color-light', lightenedColor);
    document.documentElement.style.setProperty('--current-color-glow', glowColor);
    
    // 3. Actualizar título con animación
    title.style.background = `linear-gradient(135deg, ${color}, ${lightenedColor}, ${color})`;
    title.classList.add('animated');
    
    // 4. Actualizar círculo de color
    colorCircle.style.background = `linear-gradient(135deg, ${color}, ${darkenedColor})`;
    colorCircle.style.boxShadow = `0 0 60px ${glowColor}, inset 0 0 30px rgba(255, 255, 255, 0.1), 0 0 0 8px rgba(255, 255, 255, 0.1)`;
    
    // 5. Mostrar código
    colorCode.textContent = color;
    
    // 6. Actualizar valores de color
    rgbValue.textContent = hexToRgb(color);
    hslValue.textContent = hexToHsl(color);
    cmykValue.textContent = hexToCmyk(color);
    
    // 7. Actualizar botón de generar
    generateBtn.style.background = `linear-gradient(135deg, ${color}, ${darkenedColor})`;
    generateBtn.style.boxShadow = `0 10px 25px ${color}30`;
    
    // 8. Actualizar teclas de atajos
    document.querySelectorAll('.key').forEach(key => {
        key.style.color = color;
        key.style.borderColor = color + '30';
    });
    
    // 9. Agregar al historial
    addToHistory(color);
    
    // 10. Efecto de animación en círculo
    colorCircle.style.animation = 'none';
    setTimeout(() => {
        colorCircle.style.animation = 'float 3s ease-in-out infinite';
    }, 10);
    
    // 11. Efecto de pulsación en botón
    generateBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        generateBtn.style.transform = '';
    }, 100);
}

/**
 * Agregar color al historial
 */
function addToHistory(color) {
    // Evitar duplicados consecutivos
    if (colorHistory[0] === color) return;
    
    // Agregar al inicio del array
    colorHistory.unshift(color);
    
    // Limitar a 12 colores
    if (colorHistory.length > 12) {
        colorHistory = colorHistory.slice(0, 12);
    }
    
    // Guardar en localStorage
    localStorage.setItem('colorHistory', JSON.stringify(colorHistory));
    
    // Renderizar historial
    renderHistory();
}

/**
 * Renderizar historial de colores
 */
function renderHistory() {
    historyGrid.innerHTML = '';
    
    colorHistory.forEach((color, index) => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.style.backgroundColor = color;
        item.setAttribute('data-color', color);
        item.textContent = color;
        
        // Establecer color de texto según luminosidad
        const luminance = getLuminance(color);
        item.style.color = luminance > 0.6 ? '#000' : '#fff';
        
        // Agregar delay para animación escalonada
        item.style.animationDelay = `${index * 0.05}s`;
        
        // Click para aplicar ese color
        item.addEventListener('click', () => {
            applyColor(color);
        });
        
        historyGrid.appendChild(item);
    });
}

/**
 * Copiar código al portapapeles
 */
async function copyToClipboard() {
    try {
        await navigator.clipboard.writeText(currentColor);
        showToast('Código copiado al portapapeles');
    } catch (err) {
        // Fallback para navegadores antiguos
        const textArea = document.createElement('textarea');
        textArea.value = currentColor;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Código copiado');
    }
}

/**
 * Mostrar notificación toast
 */
function showToast(message) {
    const toastText = document.querySelector('.toast-text');
    toastText.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

/**
 * Limpiar historial
 */
function clearHistory() {
    if (confirm('¿Estás seguro de que quieres limpiar el historial?')) {
        colorHistory = [];
        localStorage.removeItem('colorHistory');
        renderHistory();
        showToast('Historial limpiado');
    }
}

// Event Listeners
generateBtn.addEventListener('click', () => {
    const newColor = generateRandomColor();
    applyColor(newColor);
});

copyBtn.addEventListener('click', copyToClipboard);

// Click en el código para copiar
colorCode.addEventListener('click', copyToClipboard);

clearHistoryBtn.addEventListener('click', clearHistory);

// Atajos de teclado
document.addEventListener('keydown', (e) => {
    // Espacio para generar
    if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        const newColor = generateRandomColor();
        applyColor(newColor);
    }
    
    // Ctrl+C o Cmd+C para copiar
    if ((e.ctrlKey || e.metaKey) && e.code === 'KeyC') {
        e.preventDefault();
        copyToClipboard();
    }
    
    // Alt+G para generar
    if (e.altKey && e.code === 'KeyG') {
        e.preventDefault();
        const newColor = generateRandomColor();
        applyColor(newColor);
    }
});

// Cargar historial al inicio
renderHistory();

// Aplicar color inicial
if (colorHistory.length > 0) {
    applyColor(colorHistory[0]);
} else {
    // Color inicial por defecto
    applyColor('#667EEA');
}