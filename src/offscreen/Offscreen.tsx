import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';

const Offscreen: React.FC = () => {
    useEffect(() => {
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
            <p>This document runs in the background and can perform tasks like:</p>
            <ul>
                <li>Processing data</li>
                <li>Making network requests</li>
                <li>Running complex calculations</li>
            </ul>
        </div>
    );
};

// Create root element if it doesn't exist
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