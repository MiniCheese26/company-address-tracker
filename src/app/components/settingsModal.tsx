import {
  Cross,
  CrossContainer,
  InputActionContainer,
  InputField,
  InputFieldContainer,
  InputLabel,
  ModalContainer,
  RowContainer
} from 'App/styles/modal';
import {FolderOpen} from '@styled-icons/boxicons-regular';
import React, {useRef} from 'react';
import styled from 'styled-components';
import useSettings from 'App/hooks/useSettings';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const Folder = styled(FolderOpen)`
  width: 25px;
  height: 25px;
  color: #313638;
`;

export type SettingsModalProps = {
  setToggled: React.Dispatch<React.SetStateAction<boolean>>
}

export default function SettingsModal(props: SettingsModalProps) {
  const [settings, writeSettings] = useSettings();
  const databasePathRef = useRef<HTMLInputElement>();

  const onDatabaseBrowseClick = () => {
	ipcRenderer.on('from-browse', (event, args) => {
	  if (!args.data.canceled && args.data?.filePaths && args.data.filePaths.length > 0) {
		databasePathRef.current.value = args.data.filePaths[0];
	  }
	});

	ipcRenderer.send('to-browse', {
	  options: {
		defaultPath: './',
		filters: [
		  {name: 'sqlite3', extensions: ['sqlite3']}
		],
		properties: ['openFile']
	  }
	});
  };

  return (
	<ModalContainer>
	  <RowContainer style={{alignSelf: 'flex-end'}}>
		<CrossContainer onClick={() => props.setToggled(false)}>
		  <Cross/>
		</CrossContainer>
	  </RowContainer>
	  <RowContainer>
		<InputLabel>Path to sqlite3 database file</InputLabel>
		<InputFieldContainer>
		  <InputField ref={databasePathRef} style={{fontSize: '14px'}}/>
		  <InputActionContainer style={{minWidth: '10%'}} onClick={() => onDatabaseBrowseClick()}>
			<Folder/>
		  </InputActionContainer>
		</InputFieldContainer>
	  </RowContainer>
	  <RowContainer>
		<InputField value={'STILL WORKING ON THIS, IGNORE'}/>
	  </RowContainer>
	</ModalContainer>
  );
}
