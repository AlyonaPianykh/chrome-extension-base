declare global {
    interface Window {
        __parentCommunicator?: {
            sendMessageToParent: (message: any) => void;
        };
        __Interaction?: {
            getImageData: (canvasSelector: string) => string | null;
        };
    }
}

export {};
