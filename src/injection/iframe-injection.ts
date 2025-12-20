window.__Interaction = {
    getImageData: () => {
        //todo: implement image data retrieval from iframe
        console.log('Interaction.getImageData called from iframe');
    },

}

export const initIframeCommunicationWithParentWindow = () => {
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
        //todo: process messages from parent
        console.log('Iframe received message from parent:', event);
    }

    window.addEventListener('message', listener);

    return {
        sendMessageToParent
    };
}

window.__parentCommunicator = initIframeCommunicationWithParentWindow();
