const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { SerialPort } = require("serialport");

let mainWindow;
let currentPort = null;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  const indexPath = path.join(
    __dirname,
    "dist",
    "angular-electron-serialcom",
    "browser",
    "index.html"
  );
  mainWindow.loadFile(indexPath);
});

ipcMain.handle("list-serial-ports", async () => {
  try {
    const ports = await SerialPort.list();
    return ports;
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle("open-port", async (event, { path, baudRate }) => {
  currentPort = new SerialPort({ path, baudRate });

  currentPort.on("data", (data) => {
    mainWindow.webContents.send("serial-data", data.toString());
  });

  return { success: true };
});

ipcMain.handle("send-data", async (event, { data }) => {
  try {
    if (currentPort) {
      await currentPort.write(data);
      return { success: true };
    } else {
      return { error: "No open port to send data" };
    }
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle("close-port", async () => {
  return await closePort();
});

async function closePort() {
  if (currentPort) {
    await currentPort.close();
    currentPort = null;
    return { success: true };
  }
  return { error: "No port to close" };
}

app.on("before-quit", async () => {
  const result = await closePort();
  if (result.error) {
    console.error(result.error);
  }
});
