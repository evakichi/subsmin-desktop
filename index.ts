import { app, BrowserWindow } from 'electron';
import 'dotenv/config';

function printToken(){
	console.log(process.env.token);
}

function createWindow(){
	let win = new BrowserWindow({
		width:400,
		height:200,
		webPreferences:{
			nodeIntegration:true
		}
	});
	win.loadFile('index.html');
};

app.whenReady().then(createWindow);
printToken();
