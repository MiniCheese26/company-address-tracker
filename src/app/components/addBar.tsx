import React, {useState} from 'react';
import styled from 'styled-components';
import InfoEditorModal from 'Components/infoEditorModal';
import {Cog as CogIcon} from '@styled-icons/boxicons-regular';
import SettingsModal from 'Components/settingsModal';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const AddBarContainer = styled.section`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  margin-right: 4rem;
  margin-left: 4rem;
`;

const AddAddressButton = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  margin-top: 1rem;
  margin-bottom: 0.6rem;
  padding: 0.4rem;
  max-width: 175px;
  max-height: 60px;
  box-shadow: 0 5px 25px #979797;
  border: 0 solid white;
  transition: border .1s ease-in-out, box-shadow .4s ease-in, color .2s ease-out;

  &:hover {
    border: 3px solid #9F9FED;
    box-shadow: 0 0 25px #9F9FED;
    cursor: pointer;
    color: #9F9FED;
  }
`;

const SettingsContainer = styled(AddAddressButton)`
  margin-right: auto;
  max-width: 100px;

  &:hover > svg {
    color: #9F9FED;
  }
`;

const Cog = styled(CogIcon)`
  width: 35px;
  height: 35px;
  color: #3A506B;
  transition: color .2s ease-out;;
`;

export type AddBarProps = {
  reloadResults: () => void
}

export default function AddBar(props: AddBarProps) {
  const [addToggled, setAddToggled] = useState(false);
  const [settingsToggled, setSettingsToggled] = useState(false);

  const onAddCrossClick = () => {
	if (settingsToggled) {
	  setSettingsToggled(false);
	}

	setAddToggled(prev => !prev);
  };

  const onSettingsCrossClick = () => {
	if (addToggled) {
	  setAddToggled(false);
	}

	setSettingsToggled(prev => !prev);
  };

  return (
	<AddBarContainer>
	  {addToggled ? (
		  <InfoEditorModal reloadResults={props.reloadResults} setToggled={setAddToggled} operation={'insert'}/>
	  ) : null}
	  {settingsToggled ? (
		  <SettingsModal setToggled={setSettingsToggled}/>
	  ) : null}
	  <SettingsContainer onClick={() => onSettingsCrossClick()}>
		<Cog/>
	  </SettingsContainer>
	  <AddAddressButton onClick={() => onAddCrossClick()}>
		Add Address
	  </AddAddressButton>
	</AddBarContainer>
  );
}
