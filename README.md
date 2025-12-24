# Demo chrome extension with chrome.offscreen, canvas and requestAnimationFrame

It is aimed to display a problem of blank (empty) canvas rendered inside iframe inside chrome.offscreen using rendering technique with requestAnimationFrame.

### demo site
In the branch `cats-viewer` there is a small demo site that is also available here https://alyonapianykh.github.io/demo-chrome-extension-rAF-canvas-offscreen/. 
It displays random cat picture. Rendering is done using canvas and requestAnimationFrame to give "fade" animation effect.

### demo extension
In the main branch there is a chrome extension that uses chrome.offscreen to render the same demo site inside an iframe.
It also shows an attempt to get the canvas data from the iframe and display it in the extension page.

#### To run the extension:

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the extension
4. Open `chrome://extensions/` in Chrome
5. Enable "Developer mode" (top right)
6. Click "Load unpacked" and select `dist` folder inside the cloned repository
7. Click on the extension icon to open the extension page
8. From `chrome://extensions/` go to `Details` then click on `offscreen.html` link to see the offscreen page (if needed)

#### Use-case of interaction with the extension:
1. When page is opened, iframe with the demo site is automatically created inside offscreen page
2. Click "Get Canvas Data" button to attempt to get the canvas data from the iframe: it should be blank, but the base64 is printed on the right side. You may check that this is an empty image for example here: https://base64.guru/converter/decode/image
3. Clicking "Get new cat" button inside iframe should change the cat picture, but the canvas data obtained from the iframe remains blank.
4. Then click "Override requestAnimationFrame" button to apply polyfill for the requestAnimationFrame in the iframe
5. And press "Get Canvas Data" button again: now the canvas data from the iframe is successfully obtained, and it is not blank anymore.
6. Pressing "Get new cat" button inside iframe again should get the updated canvas data with the new cat picture.
7. Switching the toggle will remove the polyfill and the canvas data will be blank again after pressing "Get Canvas Data".

#### Demo video:

https://github.com/user-attachments/assets/32dad21b-0128-4c13-ab9c-ae81f8bab62c

