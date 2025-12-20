import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import {CATS_GENERATOR_URL, MESSAGE_TOPICS} from '../constants';

const Offscreen: React.FC = () => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const handleMessageFromPage = (message, sender, sendResponse) => {
        console.log('Received message from page', message, sender, sendResponse);

        switch (message.type) {
            case MESSAGE_TOPICS.REQUEST_CANVAS_DATA:
                // todo: iframe send message
                sendResponse({ processing: true });

                // it is a test
                setTimeout(() => {
                    chrome.runtime.sendMessage({
                        from: 'offscreen',
                        type: MESSAGE_TOPICS.CANVAS_DATA,
                        data: { image: 'test' }
                    });
                }, 2000)
                break;
            case MESSAGE_TOPICS.TOGGLE_STATE_CHANGE:
                // setFeatureEnabled(message.data.enabled);
                break;

        }
    };

    const pageEventListener = (message, sender, sendResponse) => {
        if (message.from === 'page') {
            handleMessageFromPage(message, sender, sendResponse);
        }

        return true;
    }

    useEffect(() => {
        chrome.runtime.onMessage.addListener(pageEventListener);

        // Example of sending a message to the background script
        chrome.runtime.sendMessage({
            from: 'offscreen',
            type: MESSAGE_TOPICS.OFFSCREEN_READY,
            data: { timestamp: Date.now() }
        });

        return () => {
            chrome.runtime.onMessage.removeListener(pageEventListener);
        };
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