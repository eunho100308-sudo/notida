let toastTimeout;

/**
 * 화면에 일시적인 알림 메시지를 표시합니다.
 * @param {string} message - 표시할 텍스트
 * @param {number} duration - 노출 시간 (기본 2500ms)
 */
export function showToast(message, duration = 2500) {
    const toastNotification = document.getElementById('toastNotification');
    if (!toastNotification) return;

    toastNotification.textContent = message;
    toastNotification.classList.add('show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toastNotification.classList.remove('show');
    }, duration);
}