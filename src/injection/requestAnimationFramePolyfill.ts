/** requestAnimationFramePolyfill
 * is forcing override of the requestAnimationFrame method implementation with setTimeout version
 * it is needed to overcome the issue when image on canvas is not rendered in the chrome.offscreen.
 * image is rendered inside requestAnimationFrame for optimisation purposes, which is common widely-used practice.
 * The rendering got paused when inside the offscreen
 */
const originalRequestAnimationFrame = window.requestAnimationFrame;
const originalCancelAnimationFrame = window.cancelAnimationFrame;

export function overrideRequestAnimationFramePolyfill(flag: boolean) {
    if (!flag) {
        window.requestAnimationFrame = originalRequestAnimationFrame;
        window.cancelAnimationFrame = originalCancelAnimationFrame;
        return;
    }

    let lastTime = 0;
    window.requestAnimationFrame = callback => {
        const currTime = new Date().getTime();
        const timeToCall = Math.max(0, 16 - (currTime - lastTime));
        const id = window.setTimeout(() => {
            callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };

    const cancel = (id: number) => {
        clearTimeout(id);
    };
    window.cancelAnimationFrame = cancel;
}