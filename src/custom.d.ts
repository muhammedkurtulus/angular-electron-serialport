interface Window {
  electronAPI: {
    listSerialPorts: () => Promise<any>;
    openPort: (portConfig: { path: string; baudRate: number }) => Promise<any>;
    closePort: (portConfig: { path: string }) => Promise<any>;
    onSerialData: (callback: (data: string) => void) => void;
    sendData: (data: { path: string; data: string }) => Promise<any>;
  };
}
