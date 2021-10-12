import {Settings} from 'Types/types';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

export default function useSettings(): [() => Promise<Settings>, (settings: Settings) => void] {
  const reloadResults = async () => {
	const settingsText = await ipcRenderer.invoke(
	  'to-read-file',
	  {filepath: 'settings.json'}
	);

	return JSON.parse(settingsText) as Settings;
  };

  const writeSettings = (settings: Settings) => {
	ipcRenderer.sendSync(
	  'to-write-file-sync',
	  {filepath: 'settings.json', data: JSON.stringify(settings, null, 2)}
	);
  };

  return [reloadResults, writeSettings];
}
