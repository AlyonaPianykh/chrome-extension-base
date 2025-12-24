// When extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
    ensureOffscreenDocument();
});

// When browser starts (for already installed extensions)
chrome.runtime.onStartup.addListener(() => {
    ensureOffscreenDocument();
});

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