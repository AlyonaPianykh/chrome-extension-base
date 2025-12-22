import {initInteraction, initIframeCommunicationWithParentWindow} from "./injection/iframeInjection.ts";
import {overrideRequestAnimationFramePolyfill} from "./injection/requestAnimationFramePolyfill.ts";

console.log('Content script loaded');

const forceOverrideRAF = localStorage.getItem('forceOverrideRAF');
if (forceOverrideRAF !== null) {
    const forceOverride = JSON.parse(forceOverrideRAF);
    overrideRequestAnimationFramePolyfill(forceOverride);
}

const start = () => {
    if (window === window.top) {
        // not iframe
        return;
    }

    // Inject the iframe-injection script into the page
    // const script = document.createElement('script');
    // script.src = chrome.runtime.getURL('iframe-injection.js');
    // document.head.appendChild(script);
    initIframeCommunicationWithParentWindow();
    initInteraction();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start)
} else {
    start();
}