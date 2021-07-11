import {contextBridge, ipcRenderer} from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    send: (channel: string, data: unknown) => {
      // whitelist channels
      const validChannels = ['to-query-get', 'to-query-run', 'to-query-get-all', 'to-query-transaction'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receive: (channel: string, func: (...args: unknown[]) => void) => {
      const validChannels = ['from-query-get', 'from-query-run', 'from-query-get-all', 'from-query-transaction'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    }
  }
);

