// // When extension is installed or updated
// chrome.runtime.onInstalled.addListener(() => {
//     setupOffscreenDocument();
// });
//
// // When browser starts (for already installed extensions)
// chrome.runtime.onStartup.addListener(() => {
//     setupOffscreenDocument();
// });

// Keep service worker alive and ensure offscreen document exists
// This helps when service worker wakes up from being idle
// chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
//     // Ensure offscreen document exists when messages come in
//     if (message.from === 'page') {
//         ensureOffscreenDocument().then(() => {
//             // Forward to offscreen or handle here
//         });
//     }
//     return true;
// });

async function ensureOffscreenDocument() {
    try {
        const contexts = await chrome.runtime.getContexts({
            contextTypes: ["OFFSCREEN_DOCUMENT"] as chrome.runtime.ContextType[]
        });

        if (!contexts || contexts.length === 0) {
            console.log('Setting up offscreen document as none exists');
            await setupOffscreenDocument();
        }
    } catch (error) {
        console.error('Error ensuring offscreen document:', error);
    }
}

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

ensureOffscreenDocument();

chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: chrome.runtime.getURL("page.html") });
});

// chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
//     if (message.from === 'offscreen') {
//         console.log('Received message from offscreen document:', message);
//         sendResponse({ received: true });
//         return true;
//     }
//
//     return true;
// });
