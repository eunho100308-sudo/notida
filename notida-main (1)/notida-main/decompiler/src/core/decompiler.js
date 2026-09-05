/**
 * 어셈블리 라인 배열 또는 텍스트를 받아 C 언어 코드로 변환하는 엔진
 * @param {string[]|string} input - 어셈블리 라인 배열 또는 텍스트
 * @returns {string} 디컴파일된 C 언어 코드
 */
export function runDecompiler(input) {
    const lines = Array.isArray(input) ? input : input.split('\n');
    let cCode = "#include <stdio.h>\n\nint main() {\n";
    const variables = new Set();
    
    // 1단계: 선언된 레지스터/변수 스캔
    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith(';') || trimmed.startsWith('//')) return;

        const parts = trimmed.split(/[\s,]+/);
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
        const line = lines[i].trim();
        if (!line) continue;
        if (line.startsWith(';') || line.startsWith('//')) {
            cCode += `    // ${line.replace(/^[;/]+/, '').trim()}\n`;
            continue;
        }

        const parts = line.split(/[\s,]+/);
        const cmd = parts[0].toUpperCase();

        switch (cmd) {
            case 'MOV':
                cCode += `    ${parts[1].toLowerCase()} = ${parts[2]};\n`;
                break;
            case 'ADD':
                cCode += `    ${parts[1].toLowerCase()} = ${parts[1].toLowerCase()} + ${parts[2].toLowerCase()};\n`;
                break;
            case 'CMP':
                cCode += `    if (${parts[1].toLowerCase()} == ${parts[2]}) {\n`;
                cCode += `        // [Decompiler] Condition matched\n`;
                cCode += `    }\n`;
                break;
            case 'PRINT': {
                const msg = line.substring(line.indexOf('PRINT') + 5).trim();
                cCode += `    printf("%s\\n", ${msg});\n`;
                break;
            }
            case 'RET':
                cCode += `    return 0;\n`;
                break;
            case 'JEQ':
            case 'JMP':
                cCode += `    // [Control Flow] ${cmd} to target: ${parts[1]}\n`;
                break;
            default:
                cCode += `    // 유효하지 않거나 처리되지 않은 명령어: ${line}\n`;
                break;
        }
    }

    cCode += "}";
    return cCode;
}