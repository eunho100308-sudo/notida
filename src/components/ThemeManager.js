import { showToast } from '../utils/toast.js';

export class ThemeManager {
    constructor({ toggleBtn, iconEl, textEl }) {
        this.toggleBtn = toggleBtn;
        this.iconEl = iconEl;
        this.textEl = textEl;
        this.STORAGE_KEY = 'decompiler_theme';

        this.init();
    }

    init() {
        const savedTheme = localStorage.getItem(this.STORAGE_KEY);
        if (savedTheme === 'monochrome') {
            this.enableMonochromeTheme();
        } else {
            this.enableDefaultTheme();
        }

        this.toggleBtn?.addEventListener('click', () => this.toggleTheme());
    }

    enableMonochromeTheme() {
        document.body.classList.add('monochrome-mode');
        if (this.iconEl) this.iconEl.textContent = '🎨';
        if (this.textEl) this.textEl.textContent = '컬러 모드';
        localStorage.setItem(this.STORAGE_KEY, 'monochrome');
    }

    enableDefaultTheme() {
        document.body.classList.remove('monochrome-mode');
        if (this.iconEl) this.iconEl.textContent = '🌓';
        if (this.textEl) this.textEl.textContent = '흑백 모드';
        localStorage.setItem(this.STORAGE_KEY, 'default');
    }

    toggleTheme() {
        const isMonochrome = document.body.classList.contains('monochrome-mode');
        if (isMonochrome) {
            this.enableDefaultTheme();
            showToast('컬러 모드로 변경되었습니다.');
        } else {
            this.enableMonochromeTheme();
            showToast('흑백 모드로 변경되었습니다.');
        }
    }
}