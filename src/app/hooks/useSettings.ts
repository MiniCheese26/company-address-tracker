import {Settings} from 'Types/types';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

export default function useSettings(): [(settings: Settings) => Promise<void>, (settings: Settings) => void] {
  const reloadResults = async (settings: Settings) => {
	const settingsText = await ipcRenderer.invoke(
	  'to-read-file',
	  {filepath: 'settings.json'}
	);

	settings = JSON.parse(settingsText);
  };

  const writeSettings = (settings: Settings) => {
	ipcRenderer.sendSync(
	  'to-write-file-sync',
	  {filepath: 'settings.json', data: JSON.stringify(settings, null, 2)}
	);
  };

  return [reloadResults, writeSettings];
}
