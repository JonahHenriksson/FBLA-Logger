
const {app, BrowserWindow, protocol} = require('electron');

// Creates a window
function initApplication() {
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        },
        frame: false,
        minWidth: 750,
        minHeight: 500,
        icon: 'fbla-ico.ico'
    });

    win.loadFile('index/index.html');
}

// Code entry point
app.on('ready', initApplication);