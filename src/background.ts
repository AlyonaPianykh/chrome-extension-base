chrome.runtime.onInstalled.addListener(() => {
    setupOffscreenDocument();
});

async function setupOffscreenDocument() {
    try {
        const contexts = await chrome.runtime.getContexts({
            contextTypes: ["OFFSCREEN_DOCUMENT"] as chrome.runtime.ContextType[]
        });

        if (contexts && contexts.length > 0) {
            return;
        }

        await chrome.offscreen.createDocument({
            url: 'offscreen.html',
            reasons: ['IFRAME_SCRIPTING'] as chrome.offscreen.Reason[],
            justification: 'Extension needs offscreen document for processing'
        });
    } catch (error) {
        console.error('Error setting up offscreen document:', error);
    }
}

chrome.action.onClicked.addListener((event) => {
    console.log('onClicked', event);
    chrome.tabs.create({ url: chrome.runtime.getURL("page.html") });
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    if (message.from === 'offscreen') {
        console.log('Received message from offscreen document:', message);
        sendResponse({ received: true });
    }


    return true;
});