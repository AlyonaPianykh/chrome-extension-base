console.log('Content script loaded');

const start = () => {
    if (window === window.top) {
        // not iframe
        return;
    }

    // Inject the iframe-injection script into the page
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('iframe-injection.js');
    document.head.appendChild(script);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start)
} else {
    start();
}