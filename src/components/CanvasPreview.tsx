import React, { useEffect, useRef } from 'react';

interface CanvasPreviewProps {
    imageData: string | null;
}

const CanvasPreview: React.FC<CanvasPreviewProps> = ({ imageData }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (imageData && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                const img = new Image();
                img.onload = () => {
                    // Clear canvas
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                };
                img.onerror = (error) => {
                    console.error('Failed to load image:', error);
                };
                img.src = "data:image/png;base64," + imageData;
            }
        }
    }, [imageData]);

    return (
        <div className="canvas-container">
            <canvas
                ref={canvasRef}
                width={600}
                height={400}
                className="display-canvas"
            />
            {!imageData && <p className="canvas-placeholder">No image data yet. Click the button to fetch from offscreen.</p>}
        </div>
    );
};

export default CanvasPreview;
