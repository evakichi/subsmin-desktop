"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
require("dotenv/config");
function printToken() {
    console.log(process.env.token);
}
function createWindow() {
    var win = new electron_1.BrowserWindow({
        width: 400,
        height: 200,
        webPreferences: {
            nodeIntegration: true
        }
    });
    win.loadFile('index.html');
}
;
electron_1.app.whenReady().then(createWindow);
printToken();
