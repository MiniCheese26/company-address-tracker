import {nanoid} from 'nanoid';
import {useRef} from 'react';
import {Settings} from 'Types/types';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

// blocking the UI thread is probably fine here as it's such a quick operation

export default function UseSettings() {
  const settings = useRef<Settings>();

  const settingsContent = ipcRenderer.sendSync('to-read-file-sync', {filepath: 'settings.json'});

  if (settingsContent.data && !settingsContent.isError) {
     settings.current = JSON.parse(settingsContent.data);
  } else {
    console.error(settingsContent.data);
  }

  const updateSettings = (settings: Settings) => {
    const responseId = nanoid(4);

    ipcRenderer.send('to-write-file', {filepath: 'settings.json', data: JSON.stringify(settings), responseId});
  };

  return [settings.current, updateSettings];
}
