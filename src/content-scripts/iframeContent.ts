import {initDomInteraction, initIframeCommunicationWithParentWindow} from "../injection/iframeInjection.ts";
import {overrideRequestAnimationFramePolyfill} from "../injection/requestAnimationFramePolyfill.ts";

console.log('Content script loaded');

const forceOverrideRAF = sessionStorage.getItem('forceOverrideRAF');
if (forceOverrideRAF !== null) {
    const forceOverride = JSON.parse(forceOverrideRAF);
    overrideRequestAnimationFramePolyfill(forceOverride);
}

const start = () => {
    if (window === window.top) {
        // not iframe
        return;
    }

    initIframeCommunicationWithParentWindow();
    initDomInteraction();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start)
} else {
    start();
}