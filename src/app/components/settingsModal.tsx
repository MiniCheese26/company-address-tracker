import {Cross, CrossContainer, InputField, ModalContainer, RowContainer} from 'App/styles/modal';
import {FolderOpen} from '@styled-icons/boxicons-regular';
import React from 'react';
import styled from 'styled-components';

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
  return (
	<ModalContainer>
	  <RowContainer style={{alignSelf: 'flex-end'}}>
		<CrossContainer onClick={() => props.setToggled(false)}>
		  <Cross/>
		</CrossContainer>
	  </RowContainer>
	  <RowContainer>
		<InputField value={'STILL WORKING ON THIS, IGNORE'}/>
	  </RowContainer>
	</ModalContainer>
  );
}
