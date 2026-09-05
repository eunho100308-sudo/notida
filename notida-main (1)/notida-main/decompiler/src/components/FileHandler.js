import { showToast } from '../utils/toast.js';

export class FileHandler {
    constructor({ fileInput, dropZone, infoBar, nameDisplay, sizeDisplay, removeBtn, onFileLoaded }) {
        this.fileInput = fileInput;
        this.dropZone = dropZone;
        this.infoBar = infoBar;
        this.nameDisplay = nameDisplay;
        this.sizeDisplay = sizeDisplay;
        this.removeBtn = removeBtn;
        this.onFileLoaded = onFileLoaded; // 콜백 함수

        this.bindEvents();
    }

    bindEvents() {
        // 인풋 변경 이벤트
        this.fileInput?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) this.processFile(file);
        });

        // 파일 닫기 버튼
        this.removeBtn?.addEventListener('click', () => this.clearFile());

        // 드래그 앤 드롭
        if (this.dropZone) {
            ['dragenter', 'dragover'].forEach(name => {
                this.dropZone.addEventListener(name, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.dropZone.classList.add('dragover');
                });
            });

            ['dragleave', 'drop'].forEach(name => {
                this.dropZone.addEventListener(name, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.dropZone.classList.remove('dragover');
                });
            });

            this.dropZone.addEventListener('drop', (e) => {
                const file = e.dataTransfer?.files[0];
                if (file) this.processFile(file);
            });
        }
    }

    processFile(file) {
        if (file.size > 5 * 1024 * 1024) {
            showToast('5MB 이하의 텍스트 파일만 업로드할 수 있습니다.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            this.showFileInfo(file.name, file.size);
            
            if (typeof this.onFileLoaded === 'function') {
                this.onFileLoaded(text, file.name);
            }
            showToast(`'${file.name}' 파일을 성공적으로 불러왔습니다.`);
        };

        reader.onerror = () => {
            showToast('파일을 읽는 중 오류가 발생했습니다.');
        };

        reader.readAsText(file);
    }

    showFileInfo(name, size) {
        if (this.nameDisplay) this.nameDisplay.textContent = name;
        if (this.sizeDisplay) this.sizeDisplay.textContent = `(${(size / 1024).toFixed(1)} KB)`;
        if (this.infoBar) this.infoBar.style.display = 'flex';
    }

    clearFile() {
        if (this.fileInput) this.fileInput.value = '';
        if (this.infoBar) this.infoBar.style.display = 'none';
        showToast('파일 연결이 해제되었습니다.');
    }
}