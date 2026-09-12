/**
 * Web Toy Decompiler - Main Script
 * 파일 업로드, 드래그 앤 드롭, 흑백 모드 테마, 코드 복사/다운로드 기능 탑재
 */

// 기본 예제 코드 상수
const DEFAULT_EXAMPLE = `MOV R1, 10
MOV R2, 20
ADD R1, R2
CMP R1, 30
JEQ 8
PRINT "Not Equal"
JMP 10
PRINT "Equal!"
RET`;

// DOM 요소 참조
const assemblyInput = document.getElementById('assemblyInput');
const outputCode = document.getElementById('outputCode').querySelector('code');
const decompileBtn = document.getElementById('decompileBtn');
const lineCounter = document.getElementById('lineCounter');
const statusMessage = document.getElementById('statusMessage');

// 테마 관련 요소
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');
const themeText = document.getElementById('themeText');

// 파일 업로드 관련 요소
const fileUploadInput = document.getElementById('fileUploadInput');
const fileInfoBar = document.getElementById('fileInfoBar');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const fileSizeDisplay = document.getElementById('fileSizeDisplay');
const removeFileBtn = document.getElementById('removeFileBtn');
const editorContainer = document.getElementById('editorContainer');

// 액션 버튼
const resetExampleBtn = document.getElementById('resetExampleBtn');
const clearInputBtn = document.getElementById('clearInputBtn');
const copyCodeBtn = document.getElementById('copyCodeBtn');
const downloadCodeBtn = document.getElementById('downloadCodeBtn');
const toastNotification = document.getElementById('toastNotification');

/* ==========================================================================
   1. 초기화 (테마 복원 및 이벤트 등록)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateLineCount();
});

// 테마 초기화 (localStorage 확인)
function initTheme() {
    const savedTheme = localStorage.getItem('decompiler_theme');
    if (savedTheme === 'monochrome') {
        enableMonochromeTheme();
    } else {
        enableDefaultTheme();
    }
}

// 흑백 모드 활성화
function enableMonochromeTheme() {
    document.body.classList.add('monochrome-mode');
    themeIcon.textContent = '🎨';
    themeText.textContent = '컬러 모드';
    localStorage.setItem('decompiler_theme', 'monochrome');
}

// 기본(컬러) 테마 활성화
function enableDefaultTheme() {
    document.body.classList.remove('monochrome-mode');
    themeIcon.textContent = '🌓';
    themeText.textContent = '흑백 모드';
    localStorage.setItem('decompiler_theme', 'default');
}

// 흑백 모드 토글 버튼 클릭
themeToggleBtn.addEventListener('click', () => {
    const isMonochrome = document.body.classList.contains('monochrome-mode');
    if (isMonochrome) {
        enableDefaultTheme();
        showToast('컬러 모드로 변경되었습니다.');
    } else {
        enableMonochromeTheme();
        showToast('흑백 모드로 변경되었습니다.');
    }
});

/* ==========================================================================
   2. 파일 업로드 및 드래그 앤 드롭
   ========================================================================== */
// 파일 선택 인풋 변경 이벤트
fileUploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        processUploadedFile(file);
    }
});

// 파일 파싱 및 텍스트 로드
function processUploadedFile(file) {
    if (file.size > 5 * 1024 * 1024) {
        showToast('5MB 이하의 텍스트 파일만 업로드할 수 있습니다.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        assemblyInput.value = text;
        updateLineCount();
        
        // 파일 정보 바 노출
        fileNameDisplay.textContent = file.name;
        fileSizeDisplay.textContent = `(${(file.size / 1024).toFixed(1)} KB)`;
        fileInfoBar.style.display = 'flex';
        
        showToast(`'${file.name}' 파일을 성공적으로 불러왔습니다.`);
        statusMessage.textContent = `상태: 파일 로드됨 (${file.name})`;
    };
    reader.onerror = () => {
        showToast('파일을 읽는 중 오류가 발생했습니다.');
    };
    reader.readAsText(file);
}

// 업로드된 파일 정보 닫기
removeFileBtn.addEventListener('click', () => {
    fileUploadInput.value = '';
    fileInfoBar.style.display = 'none';
    showToast('파일 연결이 해제되었습니다.');
});

// 드래그 앤 드롭 이벤트 등록
['dragenter', 'dragover'].forEach(eventName => {
    editorContainer.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        editorContainer.classList.add('dragover');
    });
});

['dragleave', 'drop'].forEach(eventName => {
    editorContainer.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        editorContainer.classList.remove('dragover');
    });
});

editorContainer.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    if (file) {
        processUploadedFile(file);
    }
});

/* ==========================================================================
   3. 디컴파일 엔진 (기존 로직 보존 및 강화)
   ========================================================================== */
decompileBtn.addEventListener('click', () => {
    const input = assemblyInput.value.trim();
    if (!input) {
        showToast('어셈블리 코드를 먼저 입력해주세요.');
        return;
    }

    const startTime = performance.now();
    const lines = assemblyInput.value.split('\n');
    const decompiledCode = runDecompiler(lines);
    const endTime = performance.now();

    outputCode.textContent = decompiledCode;
    const duration = (endTime - startTime).toFixed(1);
    statusMessage.textContent = `상태: 디컴파일 완료 (${duration}ms 소요)`;
    showToast('디컴파일이 완료되었습니다!');
});

function runDecompiler(lines) {
    let cCode = "#include <stdio.h>\n\nint main() {\n";
    let variables = new Set();
    
    // 1단계: 선언된 레지스터/변수 스캔
    lines.forEach(line => {
        let trimmed = line.trim();
        if (trimmed.startsWith(';') || trimmed.startsWith('//')) return;

        let parts = trimmed.split(/[\s,]+/);
        if (parts[0] === 'MOV' || parts[0] === 'ADD') {
            if (parts[1] && parts[1].startsWith('R')) {
                variables.add(parts[1].toLowerCase());
            }
        }
    });

    // 변수 선언부 생성
    if (variables.size > 0) {
        cCode += `    int ${Array.from(variables).join(', ')};\n\n`;
    }

    // 2단계: 명령어 파싱 및 변환
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;
        if (line.startsWith(';') || line.startsWith('//')) {
            cCode += `    // ${line.replace(/^[;/]+/, '').trim()}\n`;
            continue;
        }

        let parts = line.split(/[\s,]+/);
        let cmd = parts[0].toUpperCase();

        if (cmd === 'MOV') {
            cCode += `    ${parts[1].toLowerCase()} = ${parts[2]};\n`;
        } else if (cmd === 'ADD') {
            cCode += `    ${parts[1].toLowerCase()} = ${parts[1].toLowerCase()} + ${parts[2].toLowerCase()};\n`;
        } else if (cmd === 'CMP') {
            cCode += `    if (${parts[1].toLowerCase()} == ${parts[2]}) {\n`;
            cCode += `        // [Decompiler] Condition matched\n`;
            cCode += `    }\n`;
        } else if (cmd === 'PRINT') {
            let msg = line.substring(line.indexOf('PRINT') + 5).trim();
            cCode += `    printf("%s\\n", ${msg});\n`;
        } else if (cmd === 'RET') {
            cCode += `    return 0;\n`;
        } else if (cmd === 'JEQ' || cmd === 'JMP') {
            cCode += `    // [Control Flow] ${cmd} to target: ${parts[1]}\n`;
        } else {
            cCode += `    // 유효하지 않거나 처리되지 않은 명령어: ${line}\n`;
        }
    }

    cCode += "}";
    return cCode;
}

/* ==========================================================================
   4. 보조 기능 (줄 수 계산, 예제, 복사, 다운로드, 토스트)
   ========================================================================== */
// 줄 수 실시간 계산
assemblyInput.addEventListener('input', updateLineCount);

function updateLineCount() {
    const text = assemblyInput.value;
    const lines = text ? text.split('\n').length : 0;
    lineCounter.textContent = `${lines} 줄`;
}

// 기본 예제 코드 불러오기
resetExampleBtn.addEventListener('click', () => {
    assemblyInput.value = DEFAULT_EXAMPLE;
    updateLineCount();
    showToast('기본 예제 코드를 불러왔습니다.');
});

// 입력창 지우기
clearInputBtn.addEventListener('click', () => {
    assemblyInput.value = '';
    updateLineCount();
    showToast('입력창을 비웠습니다.');
});

// 결과 클립보드 복사
copyCodeBtn.addEventListener('click', async () => {
    const code = outputCode.textContent;
    if (!code || code.includes('디컴파일 결과가 여기에 표시됩니다')) {
        showToast('복사할 디컴파일 결과가 없습니다.');
        return;
    }

    try {
        await navigator.clipboard.writeText(code);
        showToast('📋 코드가 클립보드에 복사되었습니다.');
    } catch (err) {
        const temp = document.createElement('textarea');
        temp.value = code;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        showToast('📋 코드가 클립보드에 복사되었습니다.');
    }
});

// C 언어 파일(.c)로 다운로드
downloadCodeBtn.addEventListener('click', () => {
    const code = outputCode.textContent;
    if (!code || code.includes('디컴파일 결과가 여기에 표시됩니다')) {
        showToast('다운로드할 디컴파일 결과가 없습니다.');
        return;
    }

    const blob = new Blob([code], { type: 'text/x-csrc;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'decompiled_output.c';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('💾 decompiled_output.c 다운로드 시작');
});

// 토스트 메시지 함수
let toastTimeout;
function showToast(message) {
    if (!toastNotification) return;
    toastNotification.textContent = message;
    toastNotification.classList.add('show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toastNotification.classList.remove('show');
    }, 2500);
}