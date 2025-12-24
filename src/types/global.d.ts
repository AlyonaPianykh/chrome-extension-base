declare global {
    interface Window {
        __parentCommunicator?: {
            sendMessageToParent: (message: any) => void;
        };
        __DomInteraction?: {
            getImageData: (canvasSelector: string) => string | null;
            buttonClick: (buttonSelector: string) => boolean;
        };
    }
}

export {};
