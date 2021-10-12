import fetch, {Response} from 'electron-fetch';
import {app, dialog} from 'electron';
import path from 'path';
import fsSync from 'fs';
import fs from 'fs/promises';
import {ChildProcessWithoutNullStreams, spawn} from 'child_process';

export type UpdateResponse = {
  name: string,
  version: string,
  notes: string,
  url: string
}

export let updateOnExit = false;
export let updateSavePath = '';

let spawnedProcess: ChildProcessWithoutNullStreams | undefined;

async function checkForUpdate() {
  let updateResponse: Response;

  try {
	updateResponse = await fetch('https://aws.loc0ded.com/update/win32/1.0.0');
  } catch (e) {
	console.log(e);
	return null;
  }

  if (!updateResponse.ok) {
	console.log(updateResponse.statusText);
	return null;
  }

  return await updateResponse.json() as UpdateResponse | null;
}

async function downloadUpdate(downloadUrl: string) {
  let updateDataResponse: Response;

  try {
	updateDataResponse = await fetch(downloadUrl, {
	  redirect: 'follow'
	});
  } catch (e) {
	console.log(e);
	return null;
  }

  if (!updateDataResponse.ok) {
	console.log(updateDataResponse.statusText);
	return null;
  }

  const tempPath = path.join(app.getPath('temp'), app.name);
  if (!fsSync.existsSync(tempPath)) {
	await fs.mkdir(tempPath);
  }

  const updateData = await updateDataResponse.buffer();
  const savePath = path.join(tempPath, 'Update.exe');

  await fs.writeFile(savePath, updateData);

  return savePath;
}

export async function runUpdateCheck() {
  const updateResult = await checkForUpdate();

  if (!updateResult) {
	return;
  }

  updateSavePath = await downloadUpdate(updateResult.url);

  const response = await dialog.showMessageBox({
	type: 'info',
	buttons: ['Restart', 'Update on exit'],
	title: 'Application Update',
	message: 'An update is available',
	detail: 'Would you like to restart the application to apply the update?'
  });

  if (response.response !== 0) {
	updateOnExit = true;
	return;
  }

  try {
    if (spawnedProcess) {
      await dialog.showMessageBox({
		message: 'Update already in progress',
		type: 'error'
	  });
      return;
	}

    spawnedProcess = spawn(updateSavePath, null, {
      detached: true,
	  windowsHide: true
	});
  } catch (e) {
    console.log(e);
    return;
  }

  let stderr = '';
  let errorEmitted = false;

  spawnedProcess.stderr.on('data', (data) => { stderr += data; });

  spawnedProcess.on('error', (err) => {
    errorEmitted = true;
    console.log(err);
  });

  spawnedProcess.on('exit', (code, signal) => {
    spawnedProcess = undefined;

    if (errorEmitted) {
      return;
	}

    if (code !== 0) {
      console.log(signal === null ? code : signal, stderr);
	}

    app.relaunch();
    app.quit();
  });
}
