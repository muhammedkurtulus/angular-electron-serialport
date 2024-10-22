import { Component, OnDestroy } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  imports: [NgFor, NgIf, FormsModule],
})
export class AppComponent implements OnDestroy {
  title = 'angular-electron-serialcom';
  ports: any[] = [];
  selectedPort: string = '';
  inputData: string = '';
  receivedData: string = '';
  isConnected: boolean = false;
  errorMessage: string = '';
  portRefreshInterval: any;

  constructor() {
    this.listPorts();
    this.startPortRefresh();
    window.electronAPI.onSerialData((data: string) => {
      this.receivedData += data + '\n';
    });
  }

  async listPorts() {
    const result = await window.electronAPI.listSerialPorts();
    if (result.error) {
      console.error('Error listing ports:', result.error);
    } else {
      this.ports = result;
    }
  }

  startPortRefresh() {
    this.portRefreshInterval = setInterval(() => {
      this.listPorts();
    }, 200);
  }

  ngOnDestroy() {
    clearInterval(this.portRefreshInterval);
  }

  async toggleConnection() {
    if (this.isConnected) {
      try {
        const closeResult = await window.electronAPI.closePort({
          path: this.selectedPort,
        });

        if (closeResult.error) {
          this.errorMessage = closeResult.error;
        } else {
          this.isConnected = false;
          this.errorMessage = '';
          this.receivedData = '';
        }
      } catch (error: any) {
        this.errorMessage = 'Error closing port: ' + error.message;
      }
    } else {
      if (this.selectedPort) {
        const result = await window.electronAPI.openPort({
          path: this.selectedPort,
          baudRate: 9600,
        });

        if (result.error) {
          this.errorMessage = result.error;
          this.isConnected = false;
        } else {
          this.isConnected = true;
          this.errorMessage = '';
        }
      }
    }
  }

  async sendData() {
    if (this.isConnected && this.inputData) {
      try {
        const sendResult = await window.electronAPI.sendData({
          path: this.selectedPort,
          data: this.inputData,
        });

        if (sendResult.error) {
          console.error('Error sending data:', sendResult.error);
          this.errorMessage = 'Failed to send data: ' + sendResult.error;
        } else {
          console.log('Data sent successfully');
        }
      } catch (error: any) {
        console.error('Error while sending data:', error);
        this.errorMessage = 'Error while sending data: ' + error.message;
      }
    } else {
      this.errorMessage = 'Port not connected or no input data';
    }
  }
}
