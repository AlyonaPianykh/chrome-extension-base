import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import {CATS_GENERATOR_URL} from '../constants';

const Offscreen: React.FC = () => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const handleMessageFromPage = (message, sender, sendResponse) => {
        console.log('Received message from page', message, sender, sendResponse);

        switch (message.type) {
            case 'REQUEST_CANVAS_DATA':
                // todo: iframe send message
                // sendResponse({ processing: true });
                break;
            case 'TOGGLE_STATE_CHANGE':
                // setFeatureEnabled(message.data.enabled);
                break;

        }
    };

    useEffect(() => {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.from === 'page') {
                handleMessageFromPage(message, sender, sendResponse);
            }

            return true;
        });

        // Example of sending a message to the background script
        chrome.runtime.sendMessage({
            from: 'offscreen',
            type: 'READY',
            data: { timestamp: Date.now() }
        });
    }, []);

    return (
        <div>
            <h1>Offscreen Document</h1>
            <p>Here is random cats generator:</p>
            <iframe
                ref={iframeRef}
                src={CATS_GENERATOR_URL}
                width="900px"
                height="900px"
                style={{ border: 'none' }}
                title="Cats generator"
                // sandbox="allow-same-origin allow-scripts"
            />
        </div>
    );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Offscreen />
    </React.StrictMode>
);

export default Offscreen;