/**
 * 디컴파일러 기본 어셈블리 예제
 */
export const DEFAULT_EXAMPLE = `MOV R1, 10
MOV R2, 20
ADD R1, R2
CMP R1, 30
JEQ 8
PRINT "Not Equal"
JMP 10
PRINT "Equal!"
RET`;