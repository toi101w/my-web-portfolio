/**
 * Shared Bilingual System for Demo Sites
 * Handles language detection, switching, and DOM updates.
 */
const DemoLang = {
  // Current language state
  currentLang: 'en',
  
  // Dictionary storage
  dict: {},

  /**
   * Initialize the language system
   * @param {Object} config - Configuration object
   * @param {Object} config.dict - Translation dictionary { en: {}, ja: {} }
   */
  init({ dict }) {
    this.dict = dict;
    
    // 1. Detect Language Priority: URL param > localStorage > Browser > Default (en)
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    const storedLang = localStorage.getItem('demoLang');
    const browserLang = (navigator.language || navigator.userLanguage || 'en').startsWith('ja') ? 'ja' : 'en';

    // Validate language (only 'en' or 'ja' allowed)
    const validLangs = ['en', 'ja'];
    this.currentLang = validLangs.includes(urlLang) ? urlLang 
                     : validLangs.includes(storedLang) ? storedLang 
                     : browserLang;

    // 2. Apply Language
    this.applyLang(this.currentLang);

    // 3. Setup Event Listeners & Link Updates
    this.attachListeners();
    this.updateLinks(this.currentLang);
    
    // 4. Update HTML lang attribute
    document.documentElement.lang = this.currentLang;
  },

  /**
   * Apply language to the page
   * @param {string} lang - 'en' or 'ja'
   */
  applyLang(lang) {
    this.currentLang = lang;
    localStorage.setItem('demoLang', lang);

    // Update text content for elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (this.dict[lang] && this.dict[lang][key]) {
        // Handle HTML content if key ends with '_html', otherwise textContent
        if (key.endsWith('_html')) {
            el.innerHTML = this.dict[lang][key];
        } else {
            el.textContent = this.dict[lang][key];
        }
      }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      if (this.dict[lang] && this.dict[lang][key]) {
        el.placeholder = this.dict[lang][key];
      }
    });
    
    // Toggle active state on switcher buttons if they exist
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.dataset.lang === lang) {
            btn.classList.add('font-bold', 'underline');
            btn.classList.remove('opacity-50');
        } else {
            btn.classList.remove('font-bold', 'underline');
            btn.classList.add('opacity-50');
        }
    });

    // Update URL without reloading (cleaner UX)
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('lang', lang);
    window.history.replaceState({}, '', newUrl);
    
    // Update all internal links to persist language
    this.updateLinks(lang);
  },

  /**
   * Attach click listeners to language switchers
   */
  attachListeners() {
    // Global language toggles (e.g., in nav)
    document.querySelectorAll('[data-lang-switch]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = btn.getAttribute('data-lang-switch');
        this.applyLang(lang);
      });
    });
  },

  /**
   * Update all internal links to carry the current language param
   * @param {string} lang 
   */
  updateLinks(lang) {
    document.querySelectorAll('a[data-lang-link]').forEach(a => {
      try {
        const url = new URL(a.href, window.location.href);
        // Only update if it's a relative link or same origin
        if (url.origin === window.location.origin) {
            url.searchParams.set('lang', lang);
            a.href = url.toString();
        }
      } catch (e) {
        // Ignore invalid URLs
        console.warn('Invalid URL in link update:', a.href);
      }
    });
  }
};

/**
 * Image Fallback Utility via SVG
 * Generates a placeholder image if the source image fails to load.
 */
window.__demoFallbackImg = function(img, text = 'Image', bg = 'eee', fg = '555') {
    // Prevent infinite loop if fallback also fails
    img.onerror = null;
    
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="none">
        <rect width="400" height="300" fill="#${bg}"/>
        <text x="50%" y="50%" font-family="sans-serif" font-size="24" fill="#${fg}" text-anchor="middle" dy=".3em">${text}</text>
    </svg>`;
    
    const encoded = encodeURIComponent(svg)
        .replace(/'/g, '%27')
        .replace(/"/g, '%22');
        
    img.src = `data:image/svg+xml;charset=utf-8,${encoded}`;
};

// Expose to window
window.DemoLang = DemoLang;
