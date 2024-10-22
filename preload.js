const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  listSerialPorts: () => ipcRenderer.invoke("list-serial-ports"),
  openPort: (portConfig) => ipcRenderer.invoke("open-port", portConfig),
  closePort: () => ipcRenderer.invoke("close-port"),
  onSerialData: (callback) =>
    ipcRenderer.on("serial-data", (event, data) => callback(data)),
  sendData: (data) => ipcRenderer.invoke("send-data", data),
});
