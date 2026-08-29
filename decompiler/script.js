document.getElementById('decompileBtn').addEventListener('click', () => {
    const input = document.getElementById('assemblyInput').value;
    const lines = input.split('\n');
    const decompiledCode = runDecompiler(lines);
    document.getElementById('outputCode').querySelector('code').textContent = decompiledCode;
});

function runDecompiler(lines) {
    let cCode = "int main() {\n";
    let variables = new Set();
    
    // 1단계: 선언된 레지스터/변수 스캔
    lines.forEach(line => {
        let parts = line.trim().split(/[\s,]+/);
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

    // 2단계: 명령어 변환 파싱
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;

        let parts = line.split(/[\s,]+/);
        let cmd = parts[0];

        if (cmd === 'MOV') {
            cCode += `    ${parts[1].toLowerCase()} = ${parts[2]};\n`;
        } else if (cmd === 'ADD') {
            cCode += `    ${parts[1].toLowerCase()} = ${parts[1].toLowerCase()} + ${parts[2].toLowerCase()};\n`;
        } else if (cmd === 'CMP') {
            // 간단한 if문 구조로 변환 시뮬레이션
            cCode += `    if (${parts[1].toLowerCase()} == ${parts[2]}) {\n`;
            // 다음 줄이 JEQ라면 블록 안으로 묶어주는 미니 휴리스틱
            cCode += `        // [Decompiler] Condition matched\n`;
            cCode += `    }\n`;
        } else if (cmd === 'PRINT') {
            let msg = line.substring(5).trim();
            cCode += `    printf(${msg});\n`;
        } else if (cmd === 'RET') {
            cCode += `    return 0;\n`;
        } else {
            cCode += `    // 유효하지 않거나 처리되지 않은 명령어: ${line}\n`;
        }
    }

    cCode += "}";
    return cCode;
}