const {app, BrowserWindow, protocol} = require('electron');

function initApplication() {
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        },
        frame: false,
        minWidth: 550,
        minHeight: 400
    });

    win.loadFile('index/index.html');

    win.webContents.openDevTools();
}

app.on('ready', initApplication);