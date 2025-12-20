import React, { useEffect/*, useRef*/, useState } from 'react';
import ReactDOM from 'react-dom/client';
import Header from '../components/Header';
import CanvasPreview from '../components/CanvasPreview';
import Toggle from '../components/Toggle';
import {MESSAGE_TOPICS} from "../constants";


const Page: React.FC = () => {
    const [imageData, setImageData] = useState<string | null>(null);
    const [isEnabled, setIsEnabled] = useState(false);
    const [isOffscreenReady, setIsOffscreenReady] = useState(false);
   // const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleOffscreenMessage = (message, sender, sendResponse) => {
        console.log('Page: Received message from chrome.runtime: ', message, sender, sendResponse);

        switch (message.type) {
            case MESSAGE_TOPICS.CANVAS_DATA:
                setImageData(message.data);
                console.log('Page: Received canvas data from offscreen document:', message.data);
                sendResponse({ received: true });
                break;
            case MESSAGE_TOPICS.OFFSCREEN_READY:
                console.log('Offscreen document is ready');
                setIsOffscreenReady(true);
                sendResponse({ received: true });
                break;
        }
    }

    const offscreenEventListener = (message, sender, sendResponse) => {
        if (message.from === 'offscreen') {
            handleOffscreenMessage(message, sender, sendResponse);
        }

        return true;
    }

    useEffect(() => {
        // Setup listener for messages from the offscreen document
        chrome.runtime.onMessage.addListener(offscreenEventListener);

        // Notify background script that the page is ready
        chrome.runtime.sendMessage({
            from: 'page',
            type: MESSAGE_TOPICS.PAGE_READY
        });

        return () => {
            chrome.runtime.onMessage.removeListener(offscreenEventListener);
        };
    }, []);

    const sendRuntimeMessage = (type: string, data?) => {
        chrome.runtime.sendMessage({
            type,
            from: 'page',
            ...(data && {data})
        });
    }

    // Request canvas data from offscreen document
    const handleGetImage = () => {
        sendRuntimeMessage(MESSAGE_TOPICS.REQUEST_CANVAS_DATA);
    };

    // Handle toggle state change
    const handleToggleChange = (checked: boolean) => {
        setIsEnabled(checked);

        sendRuntimeMessage(MESSAGE_TOPICS.TOGGLE_STATE_CHANGE,  { enabled: checked });
    };

    return (
        <div className="page-container">
            <Header title="Extension Page" />

            <main className="page-content">
                <h4>Offscreen is {isOffscreenReady ? 'ready' : 'not ready yet'}.</h4>
                <div className="controls-section">
                    <button
                        className="fetch-button"
                        onClick={handleGetImage}
                    >
                        Get Iframe Canvas Content
                    </button>

                    <Toggle
                        label="Enable Feature"
                        checked={isEnabled}
                        onChange={handleToggleChange}
                    />
                </div>

                <div className="canvas-section">
                    <h2>Canvas Display</h2>
                    <CanvasPreview imageData={imageData} />
                </div>
            </main>
        </div>
    );
};

// Create root and render
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Page />
    </React.StrictMode>
);

export default Page;