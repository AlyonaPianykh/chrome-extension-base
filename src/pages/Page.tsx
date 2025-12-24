import React, {useEffect/*, useRef*/, useState} from 'react';
import ReactDOM from 'react-dom/client';
import Header from '../components/Header';
import CanvasPreview from '../components/CanvasPreview';
import Toggle from '../components/Toggle';
import {MESSAGE_TOPICS} from "../constants";


const Page: React.FC = () => {
    const [imageData, setImageData] = useState<string | null>(null);
    const [isEnabled, setIsEnabled] = useState(false);
    const [iframeLoadedTimestamp, setIframeLoadedTimestamp] = useState<number | null>(null);

    const formatTimestamp = (timestamp: number): string => {
        return new Date(timestamp).toLocaleString();
    };

    const handleOffscreenMessage = (message, _, sendResponse) => {
        switch (message.type) {
            case MESSAGE_TOPICS.CANVAS_DATA:
                const {image} = message.data;
                setImageData(image);
                console.log('Page: Received canvas data from offscreen document:', message.data);
                sendResponse({received: true});
                break;
            case MESSAGE_TOPICS.IFRAME_LOADED:
                console.log('Iframe loaded/reloaded:', message.data);
                setIframeLoadedTimestamp(message.data.timestamp);
                sendResponse({received: true});
                break;
        }
    }

    const offscreenEventListener = (message, sender, sendResponse) => {
        if (message.from === 'offscreen') {
            handleOffscreenMessage(message, sender, sendResponse);
        }

        return true;
    }

    const sendRuntimeMessage = (type: string, data?, responseCallback?: (response: any) => void) => {
        chrome.runtime.sendMessage({
            type,
            from: 'page',
            ...(data && {data})
        }, responseCallback);
    }

    useEffect(() => {
        // Setup listener for messages from the offscreen document
        chrome.runtime.onMessage.addListener(offscreenEventListener);

        // Initialize the cats iframe in offscreen document
        sendRuntimeMessage(MESSAGE_TOPICS.INIT_CATS_IFRAME);

        // Notify background script that the page is ready
        sendRuntimeMessage(MESSAGE_TOPICS.PAGE_READY);
        handleToggleRAFPolyfill(false);

        return () => {
            chrome.runtime.onMessage.removeListener(offscreenEventListener);
            // Destroy the iframe when page is closed
            sendRuntimeMessage(MESSAGE_TOPICS.DESTROY_CATS_IFRAME);
        };
    }, []);

    // Request canvas data from offscreen document
    const handleGetImage = () => {
        sendRuntimeMessage(MESSAGE_TOPICS.REQUEST_CANVAS_DATA, {params: {canvasSelector: '#catCanvas'}});
    };

    // Trigger iframe refresh to get a new cat
    const handleNewCat = () => {
        sendRuntimeMessage(MESSAGE_TOPICS.BUTTON_CLICK, {params: {buttonSelector: '#refresh-btn'}}, (data) => {
            if (data?.refreshed) {
                setTimeout(() => {
                    handleGetImage();
                }, 1000);
            }
        });
    };

    // Handle toggle state change
    const handleToggleRAFPolyfill = (checked: boolean) => {
        setIsEnabled(checked);

        sendRuntimeMessage(MESSAGE_TOPICS.TOGGLE_RAF_POLYFILL, {enabled: checked});
    };

    return (
        <div className="page-container">
            <Header title="Extension Page"/>

            <main className="page-content">
                {iframeLoadedTimestamp && (
                    <div className="iframe-notification">
                        Iframe reloaded {formatTimestamp(iframeLoadedTimestamp)}
                    </div>
                )}
                <div className="controls-section">
                    <div>
                        <button
                            className="fetch-button"
                            onClick={handleGetImage}
                        >
                            Get Iframe Canvas Content
                        </button>

                        <button
                            className="fetch-button"
                            onClick={handleNewCat}
                        >
                            New Cat
                        </button>
                    </div>
                    <Toggle
                        label="Override requestAnimationFrame"
                        checked={isEnabled}
                        onChange={handleToggleRAFPolyfill}
                    />
                </div>

                <div className="canvas-section">
                    <h2>Canvas Display</h2>
                    <div className="preview-container">
                        <CanvasPreview imageData={imageData}/>
                        <div className="base64-preview">
                            <h3>Base64 Data:</h3>
                            <textarea
                                readOnly
                                value={imageData || 'No image data yet'}
                                className="base64-textarea"
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Page/>
    </React.StrictMode>
);

export default Page;