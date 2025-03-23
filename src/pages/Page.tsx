import React, { useEffect/*, useRef*/, useState } from 'react';
import ReactDOM from 'react-dom/client';
import Header from '../components/Header';
import CanvasPreview from '../components/CanvasPreview';
import Toggle from '../components/Toggle';

const Page: React.FC = () => {
    const [imageData, setImageData] = useState<string | null>(null);
    const [isEnabled, setIsEnabled] = useState(false);
   // const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        // Setup listener for messages from the offscreen document
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.from === 'offscreen') {
                handleOffscreenMessage(message, sender, sendResponse);
            }

            return true;
        });

        // Notify background script that the page is ready
        chrome.runtime.sendMessage({
            from: 'page',
            type: 'PAGE_READY'
        });
    }, []);

    const handleOffscreenMessage = (message, sender, sendResponse) => {
        console.log('Received message', message, sender, sendResponse);
        if (message.type === 'CANVAS_DATA') {
            setImageData(message.data);
            sendResponse({ received: true });
        }
    }

    const sendMessage = (type: string, data?) => {
        chrome.runtime.sendMessage({
            type,
            from: 'page',
            ...(data && {data})
        });
    }

    // Request canvas data from offscreen document
    const handleGetImage = () => {
        sendMessage('REQUEST_CANVAS_DATA');
    };

    // Handle toggle state change
    const handleToggleChange = (checked: boolean) => {
        setIsEnabled(checked);

        sendMessage('TOGGLE_STATE_CHANGE',  { enabled: checked });
    };

    return (
        <div className="page-container">
            <Header title="Extension Page" />

            <main className="page-content">
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