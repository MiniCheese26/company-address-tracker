import {Settings} from 'Types/types';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

let settings: Settings;

export default function useSettings(): [Settings, (settings: Settings) => void, () => void] {
  const reloadResults = () => {
	settings = JSON.parse(ipcRenderer.sendSync(
	  'to-read-file-sync',
	  {filepath: 'settings.json'}
	).data) as Settings;
  };

  const writeSettings = (settings: Settings) => {
	ipcRenderer.sendSync(
	  'to-write-file-sync',
	  {filepath: 'settings.json', data: JSON.stringify(settings, null, 2)}
	);
  };

  if (!settings) {
	reloadResults();
  }

  return [settings, writeSettings, reloadResults];
}
