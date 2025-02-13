import React from 'react';
import ReactDOM from 'react-dom/client';

const Popup: React.FC = () => {
    return (
        <div className="w-64 p-4">
            <h1 className="text-xl font-bold mb-4">Chrome Extension</h1>
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => console.log('Button clicked!')}
            >
                Click me
            </button>
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>
);
