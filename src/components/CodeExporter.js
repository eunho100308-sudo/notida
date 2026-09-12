import { showToast } from '../utils/toast.js';

export class CodeExporter {
    /**
     * 대상 텍스트를 클립보드에 복사
     */
    static async copyToClipboard(code) {
        if (!code || code.includes('디컴파일 결과가 여기에 표시됩니다')) {
            showToast('복사할 디컴파일 결과가 없습니다.');
            return;
        }

        try {
            await navigator.clipboard.writeText(code);
            showToast('📋 코드가 클립보드에 복사되었습니다.');
        } catch {
            const temp = document.createElement('textarea');
            temp.value = code;
            document.body.appendChild(temp);
            temp.select();
            document.execCommand('copy');
            document.body.removeChild(temp);
            showToast('📋 코드가 클립보드에 복사되었습니다.');
        }
    }

    /**
     * C 언어 소스 파일(.c)로 다운로드
     */
    static downloadAsCFile(code, fileName = 'decompiled_output.c') {
        if (!code || code.includes('디컴파일 결과가 여기에 표시됩니다')) {
            showToast('다운로드할 디컴파일 결과가 없습니다.');
            return;
        }

        const blob = new Blob([code], { type: 'text/x-csrc;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`💾 ${fileName} 다운로드 시작`);
    }
}