import { CATS_GENERATOR_URL, MESSAGE_TOPICS } from '../constants';

let iframe: HTMLIFrameElement | null = null;
// let pendingCanvasRequest: { params: any } | null = null;

const sendMessageToIframe = (message: any) => {
    if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(message, CATS_GENERATOR_URL);
    }
};

const handleIframeLoad = () => {
    console.log('Offscreen: iframe loaded successfully');

    // Notify that iframe is loaded
    chrome.runtime.sendMessage({
        from: 'offscreen',
        type: MESSAGE_TOPICS.IFRAME_LOADED,
        data: { timestamp: Date.now() }
    });

    // if (pendingCanvasRequest) {
    //     console.log('Offscreen: Processing pending canvas request after iframe load');
    //     // Small delay to ensure iframe content is fully rendered
    //     setTimeout(() => {
    //         sendMessageToIframe({
    //             type: MESSAGE_TOPICS.REQUEST_CANVAS_DATA,
    //             params: pendingCanvasRequest?.params
    //         });
    //         pendingCanvasRequest = null;
    //     }, 500);
    // }
};

const handleMessageFromIframe = (event: MessageEvent) => {
    // Verify the message is from our specific iframe
    if (event.source !== iframe?.contentWindow) return;

    console.log('Offscreen: Received message from iframe:', event.data);

    // Pass the message to the Page via background script
    chrome.runtime.sendMessage({
        from: 'offscreen',
        type: event.data.type,
        data: event.data.data
    });
};

const handleMessageFromPage = (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    console.log('Offscreen: Received message from page', message, sender);

    switch (message.type) {
        case MESSAGE_TOPICS.INIT_CATS_IFRAME:
            initCatsIframe();
            sendResponse({ initialized: true });
            break;
        case MESSAGE_TOPICS.DESTROY_CATS_IFRAME:
            destroyCatsIframe();
            sendResponse({ destroyed: true });
            break;
        case MESSAGE_TOPICS.REFRESH_CATS_IFRAME:
            refreshCatsIframe(message.data.params);
            sendResponse({ refreshed: true });
            break;
        case MESSAGE_TOPICS.REQUEST_CANVAS_DATA:
            sendMessageToIframe({
                type: MESSAGE_TOPICS.REQUEST_CANVAS_DATA,
                params: message.data.params
            });
            sendResponse({ processing: true });
            break;
        case MESSAGE_TOPICS.TOGGLE_STATE_CHANGE:
            sendMessageToIframe({
                type: MESSAGE_TOPICS.OVERRIDE_REQUEST_ANIMATION_FRAME,
                params: { forceOverride: message.data.enabled }
            });
            sendResponse({ received: true });
            break;
    }
};

const pageEventListener = (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    if (message.from === 'page') {
        handleMessageFromPage(message, sender, sendResponse);
    }
    return true;
};

export function initCatsIframe() {
    if (iframe) {
        console.log('Offscreen: Iframe already exists');
        return;
    }

    console.log('Offscreen: Creating cats iframe');

    sendMessageToIframe({
        type: MESSAGE_TOPICS.CLEAR_FORCE_OVERRIDE_RAF
    });

    iframe = document.createElement('iframe');
    iframe.src = CATS_GENERATOR_URL;
    iframe.width = '900';
    iframe.height = '900';
    iframe.style.border = 'none';
    iframe.title = 'Cats generator';
    iframe.onload = handleIframeLoad;

    document.body.appendChild(iframe);
}

export function destroyCatsIframe() {
    if (iframe) {
        console.log('Offscreen: Destroying cats iframe');
        // Clear forceOverrideRAF from iframe's localStorage before destroying
        sendMessageToIframe({
            type: MESSAGE_TOPICS.CLEAR_FORCE_OVERRIDE_RAF
        });

        iframe.onload = null;
        iframe.remove();
        iframe = null;
    }
}

export function refreshCatsIframe(params) {
    console.log('Offscreen: Refreshing cats iframe');
    if (iframe) {
        // Set pending request to fetch canvas data after iframe reloads
        //pendingCanvasRequest = { params };

        // Force iframe reload by re-assigning src
        iframe.src = iframe.src;
    }
}

// Initialize message listeners
function init() {
    console.log('Offscreen: Initializing offscreen module');

    chrome.runtime.onMessage.addListener(pageEventListener);
    window.addEventListener('message', handleMessageFromIframe);

    // Notify that offscreen document is ready
    chrome.runtime.sendMessage({
        from: 'offscreen',
        type: MESSAGE_TOPICS.OFFSCREEN_READY,
        data: { timestamp: Date.now() }
    });
}

// Auto-initialize when module loads
init();

