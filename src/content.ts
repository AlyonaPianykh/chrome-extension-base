console.log('Content script loaded');

// Inject a script into the page
const script = document.createElement('script');
script.src = chrome.runtime.getURL('injected.js');
document.head.appendChild(script)