import {MESSAGE_TOPICS} from "../constants";

export const getIframeCommunicationWithParentWindow = () => {
    const parentWindow = window.parent;
    if (!parentWindow) {
        console.log('No parent window found for iframe communication');
        return;
    }
    if (parentWindow === window) {
        console.log('Iframe is running in the top-level window, no parent to communicate with');
        return;
    }

    const sendMessageToParent = (message: any) => {
        parentWindow.postMessage(message, '*');
    }

    const listener = (event: MessageEvent) => {
        if (event.source !== parentWindow) {
            return;
        }
        console.log('Iframe: Received message', event);
        const { data } = event;
        switch (data.type) {
            case MESSAGE_TOPICS.REQUEST_CANVAS_DATA: {
                const canvasData = window.__DomInteraction?.getImageData(data.params.canvasSelector);
                sendMessageToParent({
                    type: MESSAGE_TOPICS.CANVAS_DATA,
                    data: { image: canvasData }
                });
                break;
            }
            case MESSAGE_TOPICS.OVERRIDE_REQUEST_ANIMATION_FRAME: {
                console.log('Iframe: Setting forceOverrideRAF to', data.params.forceOverride);
                sessionStorage.setItem('forceOverrideRAF', JSON.stringify(data.params.forceOverride));
                window.location.reload();
                break;
            }
            case MESSAGE_TOPICS.CLEAR_FORCE_OVERRIDE_RAF: {
                sessionStorage.removeItem('forceOverrideRAF');
                break;
            }

            case MESSAGE_TOPICS.BUTTON_CLICK: {
                const success = window.__DomInteraction?.buttonClick(data.params.buttonSelector);
                console.log('Iframe: Button click result:', success);
                break;
            }
        }
    }

    window.addEventListener('message', listener);

    return {
        sendMessageToParent
    };
}

export const initDomInteraction = () => {
    window.__DomInteraction = {
        getImageData: (canvasSelector: string): string | null => {
            const srcCanvas = document.querySelector(canvasSelector) as HTMLCanvasElement | null;

            if (!(srcCanvas instanceof HTMLCanvasElement)) {
                 return null;
            }

            const { width: canvasWidth, height: canvasHeight } = srcCanvas;

            if (canvasWidth === 0 || canvasHeight === 0) {
                console.log('getImageData: Canvas has zero dimensions');
                return null;
            }

            try {
                const tmpCanvas = document.createElement('canvas');
                tmpCanvas.width = canvasWidth;
                tmpCanvas.height = canvasHeight;
                const tmpCtx = tmpCanvas.getContext('2d');
                if (!(tmpCtx instanceof CanvasRenderingContext2D)) {
                    console.log('getImageData: Could not get 2d context');
                    return null;
                }

                tmpCtx.drawImage(srcCanvas, 0, 0, canvasWidth, canvasHeight, 0, 0, tmpCanvas.width, tmpCanvas.height);

                return tmpCanvas.toDataURL().replace(/^data:image\/?[A-Za-z]*;base64,/, '')
            } catch (e) {
                console.error('Error getting image data from canvas:', e);
                return null;
            }
        },

        buttonClick: (buttonSelector: string): boolean => {
            const button = document.querySelector(buttonSelector) as HTMLElement | null;
            if (!button) {
                console.log('buttonClick: Button not found with selector:', buttonSelector);
                return false;
            }
            button.click();
            return true;
        },
    }
}

export const initIframeCommunicationWithParentWindow = () => {
    window.__parentCommunicator = getIframeCommunicationWithParentWindow();

    // Notify parent that iframe has loaded/reloaded
    window.__parentCommunicator?.sendMessageToParent({
        type: MESSAGE_TOPICS.IFRAME_LOADED,
        data: { timestamp: Date.now() }
    });
}
