import React, {useState} from 'react';
import styled from 'styled-components';
import InfoEditorModal from 'Components/infoEditorModal';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const AddBarContainer = styled.section`
  flex: 1;
  display: flex;
  justify-content: flex-end;
`;

const AddAddressButton = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  margin-right: 4rem;
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

export type AddBarProps = {
  reloadResults: () => void
}

export default function AddBar(props: AddBarProps) {
  const [toggled, setToggled] = useState(false);

  const onCrossClick = () => {
	setToggled(prev => !prev);
  };

  return (
	<AddBarContainer>
	  {toggled ? (
		<InfoEditorModal reloadResults={props.reloadResults} setToggled={setToggled} operation={'insert'}/>
	  ) : null}
	  <AddAddressButton onClick={() => onCrossClick()}>
		Add Address
	  </AddAddressButton>
	</AddBarContainer>
  );
}