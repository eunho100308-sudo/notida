import { DEFAULT_EXAMPLE } from './constants/examples.js';
import { runDecompiler } from './core/decompiler.js';
import { showToast } from './utils/toast.js';
import { ThemeManager } from './components/ThemeManager.js';
import { FileHandler } from './components/FileHandler.js';
import { CodeExporter } from './components/CodeExporter.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM 요소 취득
    const assemblyInput = document.getElementById('assemblyInput');
    const outputCode = document.getElementById('outputCode')?.querySelector('code');
    const decompileBtn = document.getElementById('decompileBtn');
    const lineCounter = document.getElementById('lineCounter');
    const statusMessage = document.getElementById('statusMessage');

    const resetExampleBtn = document.getElementById('resetExampleBtn');
    const clearInputBtn = document.getElementById('clearInputBtn');
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    const downloadCodeBtn = document.getElementById('downloadCodeBtn');

    // 2. 테마 컴포넌트 초기화
    new ThemeManager({
        toggleBtn: document.getElementById('themeToggleBtn'),
        iconEl: document.getElementById('themeIcon'),
        textEl: document.getElementById('themeText')
    });

    // 3. 파일 핸들러 컴포넌트 초기화
    new FileHandler({
        fileInput: document.getElementById('fileUploadInput'),
        dropZone: document.getElementById('editorContainer'),
        infoBar: document.getElementById('fileInfoBar'),
        nameDisplay: document.getElementById('fileNameDisplay'),
        sizeDisplay: document.getElementById('fileSizeDisplay'),
        removeBtn: document.getElementById('removeFileBtn'),
        onFileLoaded: (content, fileName) => {
            assemblyInput.value = content;
            updateLineCount();
            if (statusMessage) statusMessage.textContent = `상태: 파일 로드됨 (${fileName})`;
        }
    });

    // 4. 에디터 헬퍼 함수
    function updateLineCount() {
        const text = assemblyInput.value;
        const lines = text ? text.split('\n').length : 0;
        if (lineCounter) lineCounter.textContent = `${lines} 줄`;
    }

    // 5. 버튼 이벤트 등록
    assemblyInput?.addEventListener('input', updateLineCount);
    updateLineCount();

    // 디컴파일 실행
    decompileBtn?.addEventListener('click', () => {
        const input = assemblyInput.value.trim();
        if (!input) {
            showToast('어셈블리 코드를 먼저 입력해주세요.');
            return;
        }

        const startTime = performance.now();
        const decompiled = runDecompiler(assemblyInput.value);
        const endTime = performance.now();

        if (outputCode) outputCode.textContent = decompiled;
        const duration = (endTime - startTime).toFixed(1);
        if (statusMessage) statusMessage.textContent = `상태: 디컴파일 완료 (${duration}ms 소요)`;
        showToast('디컴파일이 완료되었습니다!');
    });

    // 예제 리셋
    resetExampleBtn?.addEventListener('click', () => {
        assemblyInput.value = DEFAULT_EXAMPLE;
        updateLineCount();
        showToast('기본 예제 코드를 불러왔습니다.');
    });

    // 입력창 비우기
    clearInputBtn?.addEventListener('click', () => {
        assemblyInput.value = '';
        updateLineCount();
        showToast('입력창을 비웠습니다.');
    });

    // 복사 & 다운로드
    copyCodeBtn?.addEventListener('click', () => {
        CodeExporter.copyToClipboard(outputCode?.textContent);
    });

    downloadCodeBtn?.addEventListener('click', () => {
        CodeExporter.downloadAsCFile(outputCode?.textContent);
    });
});