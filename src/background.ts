chrome.runtime.onInstalled.addListener(() => {
    setupOffscreenDocument();
});

async function setupOffscreenDocument() {
    // Check if offscreen document is already created
    try {
        const contexts = await chrome.runtime.getContexts({
            contextTypes: ["OFFSCREEN_DOCUMENT"] as chrome.runtime.ContextType[]
        });

        // If there's already an offscreen document, return early
        if (contexts && contexts.length > 0) {
            return;
        }

        // Create an offscreen document
        await chrome.offscreen.createDocument({
            url: 'offscreen.html',
            reasons: ['IFRAME_SCRIPTING'] as chrome.offscreen.Reason[],
            justification: 'Extension needs offscreen document for processing'
        });
    } catch (error) {
        console.error('Error setting up offscreen document:', error);
    }
}

// Listen for messages from the offscreen document
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    if (message.from === 'offscreen') {
        console.log('Received message from offscreen document:', message);
        // Handle message from offscreen document
        sendResponse({ received: true });
    }
    return true;
});