const { app, BrowserWindow, session } = require('electron');
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,  // Changed to false for security
            contextIsolation: true,  // Changed to true for security
            webSecurity: true,
            allowRunningInsecureContent: true, // Allow loading mixed content
            webviewTag: true, // Enable webview tag
            sandbox: false // Disable sandbox to allow web workers
        }
    });

    // Enable content protection to prevent screenshots and screen recording
    mainWindow.setContentProtection(true);

    // Prevent saving page as HTML
    mainWindow.webContents.on('context-menu', (e, params) => {
        e.preventDefault();
    });

    // Set content security policy
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: ws: blob:;" +
                    "worker-src 'self' blob: https:;" +
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:;" +
                    "style-src 'self' 'unsafe-inline' https:;" +
                    "img-src 'self' data: https: blob:;" +
                    "media-src 'self' https: blob:;" +
                    "connect-src 'self' https: wss: blob:;"
                ]
            }
        });
    });

    // Load the TestPress LMS demo site
    mainWindow.loadURL('https://lmsdemo.testpress.in/', {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    // Handle new window creation
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https://') || url.startsWith('blob:')) {
            mainWindow.loadURL(url);
        }
        return { action: 'deny' };
    });
}

// Handle certificate errors
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    event.preventDefault();
    callback(true);
});

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
}); 