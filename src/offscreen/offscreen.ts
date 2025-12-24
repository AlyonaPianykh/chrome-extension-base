import { CATS_GENERATOR_URL, MESSAGE_TOPICS } from '../constants';

const createOffscreenManager = () => {
    let iframe: HTMLIFrameElement | null = null;

    /* Iframe Management */
    const initCatsIframe = () => {
        if (iframe) {
            console.log('Offscreen: Iframe already exists');
            return;
        }

        console.log('Offscreen: Creating cats iframe');

        iframe = document.createElement('iframe');
        iframe.src = CATS_GENERATOR_URL;
        iframe.width = '900';
        iframe.height = '900';
        iframe.style.border = 'none';
        iframe.title = 'Cats generator';
        iframe.onload = handleIframeLoad;

        document.body.appendChild(iframe);
    }

    const handleIframeLoad = () => {
        console.log('Offscreen: iframe loaded successfully');

        // Notify that iframe is loaded or refreshed
        chrome.runtime.sendMessage({
            from: 'offscreen',
            type: MESSAGE_TOPICS.IFRAME_LOADED,
            data: { timestamp: Date.now() }
        });
    };


    const destroyCatsIframe = () => {
        if (iframe) {
            console.log('Offscreen: Destroying cats iframe');
            // Clear forceOverrideRAF from iframe's sessionStorage before destroying
            sendMessageToIframe({
                type: MESSAGE_TOPICS.CLEAR_FORCE_OVERRIDE_RAF
            });

            iframe.onload = null;
            iframe.remove();
            iframe = null;
        }
    }

    const refreshCatsIframe = () =>  {
        console.log('Offscreen: Refreshing cats iframe');
        if (iframe) {
            // Force iframe reload by re-assigning src
            iframe.src = iframe.src + '?t=' + Date.now();
        }
    }

    /* End of Iframe Management */

    /* Messaging with iframe */
    const sendMessageToIframe = (message: any) => {
        if (iframe?.contentWindow) {
            iframe.contentWindow.postMessage(message, CATS_GENERATOR_URL);
        }
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

    /* End of Messaging with iframe */

    /* Messaging with Page */

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
                refreshCatsIframe();
                sendResponse({ refreshed: true });
                break;
            case MESSAGE_TOPICS.REQUEST_CANVAS_DATA:
                sendMessageToIframe({
                    type: MESSAGE_TOPICS.REQUEST_CANVAS_DATA,
                    params: message.data.params
                });
                sendResponse({ processing: true });
                break;
            case MESSAGE_TOPICS.TOGGLE_RAF_POLYFILL:
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

    /* End of Messaging with Page */

    const init = () => {
        console.log('Offscreen: Initializing offscreen module');

        // initialize communication
        chrome.runtime.onMessage.addListener(pageEventListener);
        window.addEventListener('message', handleMessageFromIframe);

        // Notify that offscreen document is ready
        chrome.runtime.sendMessage({
            from: 'offscreen',
            type: MESSAGE_TOPICS.OFFSCREEN_READY,
            data: { timestamp: Date.now() }
        });
    }

    return { init };
}

// Auto-initialize when module loads
const offscreenManager = createOffscreenManager();
offscreenManager.init();

