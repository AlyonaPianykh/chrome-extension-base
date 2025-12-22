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
                const canvasData = window.__Interaction?.getImageData(data.params.canvasSelector);
                sendMessageToParent({
                    type: MESSAGE_TOPICS.CANVAS_DATA,
                    data: { image: canvasData }
                });
                break;
            }
            case MESSAGE_TOPICS.OVERRIDE_REQUEST_ANIMATION_FRAME: {
                localStorage.setItem('forceOverrideRAF', JSON.stringify(data.params.forceOverride));
                window.location.reload();
                break;
            }
            case MESSAGE_TOPICS.CLEAR_FORCE_OVERRIDE_RAF: {
                localStorage.removeItem('forceOverrideRAF');
                break;
            }
        }
        //todo: process messages from parent
        console.log('Iframe received message from parent:', event);
    }

    window.addEventListener('message', listener);

    return {
        sendMessageToParent
    };
}

export const initInteraction = () => {
    window.__Interaction = {
        getImageData: (canvasSelector: string): string | null => {
            const srcCanvas = document.querySelector(canvasSelector) as HTMLCanvasElement | null;

            if (!(srcCanvas instanceof HTMLCanvasElement)) {
                 return null;
            }

            const finalWidth = srcCanvas.width;
            const finalHeight = srcCanvas.height;

            if (finalWidth === 0 || finalHeight === 0) {
                console.log('getImageData: Canvas has zero dimensions');
                return null;
            }

            try {
                const tmpcanvas = document.createElement('canvas');
                tmpcanvas.width = finalWidth;
                tmpcanvas.height = finalHeight;
                const tmpctx = tmpcanvas.getContext('2d');
                if (!(tmpctx instanceof CanvasRenderingContext2D)) {
                    console.log('getImageData: Could not get 2d context');
                    return null;
                }

                tmpctx.drawImage(srcCanvas, 0, 0, srcCanvas.width, srcCanvas.height, 0, 0, tmpcanvas.width, tmpcanvas.height);

                const dataUrl = tmpcanvas.toDataURL();

                return dataUrl.replace(/^data:image\/?[A-Za-z]*;base64,/, '')
            } catch (e) {
                console.error('Error getting image data from canvas:', e);
                return null;
            }
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
