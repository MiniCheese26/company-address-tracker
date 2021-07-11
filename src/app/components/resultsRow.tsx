import React, {useRef, useState} from 'react';
import styled, {css} from 'styled-components';
import {Delete as DeleteIcon} from '@styled-icons/material/Delete';
import {Edit as EditIcon} from '@styled-icons/boxicons-regular/Edit';
import {Copy as CopyIcon} from '@styled-icons/fa-regular/Copy';
import {CheckmarkOutline, CheckmarkSquareOutline} from '@styled-icons/evaicons-outline';
import {SearchResult} from 'App/appRoot';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const ResultsRowContainer = styled.div`
  flex: 1;
  display: grid;
  grid-template-areas: 'actions company address copy';
  grid-template-columns: 1fr 3fr 3fr .75fr;
  width: 100%;
  max-height: 80px;
  border-bottom: 3px solid #CCC;

  & > div:not(:first-child) > div {
    padding-left: 0.4rem;
    padding-right: 0.4rem;
    border-left: 2px solid #CCC;
  }
`;

const ResultsAction = styled.div`
  grid-area: actions;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
`;

const IconContainer = styled.div`
  border-radius: 10px;
  padding: 0.3rem;
  box-shadow: 0 0 20px #CCC;
  border: 3px solid transparent;
  transition: border .3s ease-in-out, box-shadow .3s ease-in-out, background-color .3s ease-in-out .1s;

  &:hover {
    border: 3px solid #9F9FED;
    box-shadow: 0 0 20px #9F9FED;
    cursor: pointer;
  }

  &:active {
    background-color: #b4b4e8;
  }

  &:active > svg {
    width: 35px;
    height: 35px;
  }
`;

const IconCss = css`
  transition: width .3s ease-in-out .1s, height .3s ease-in-out .1s;
  top: 50%;
  left: 50%;

  width: 30px;
  height: 30px;

  &:active {
    width: 35px;
    height: 35px;
  }
`;

const Delete = styled(DeleteIcon)`
  ${IconCss};
  color: #E73D23;
`;

const Edit = styled(EditIcon)`
  ${IconCss};
  color: #44BBA4;
`;

const ResultsCompany = styled.div`
  grid-area: company;
  display: flex;
  align-items: center;
`;

const ResultsCopy = styled.div`
  grid-area: copy;
`;

const ResultsCopyContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Copy = styled(CopyIcon)`
  ${IconCss};
  color: #393E41;
`;

const Checkmark = styled(CheckmarkSquareOutline)`
  ${IconCss};
  color: #393E41;
`;

const EditCheckmark = styled(CheckmarkOutline)`
  ${IconCss};
  color: #44BBA4;
`;

const ResultsBorderContainer = styled.div`
  flex: 1;
  display: flex;
  height: 100%;
  align-items: center;
`;

const ResultsText = styled.input`
  flex: 1;
  font-size: 24px;
  font-family: 'Montserrat', sans-serif;
  border-radius: 3px;
  padding: 0.3rem;
  border-bottom: 5px solid transparent;
`;

const ResultsAddress = styled.div`
  grid-area: address;
`;

export type ResultsRowProps = {
  searchResult: SearchResult,
  reloadResults: () => void
}

export default function ResultsRow(props: ResultsRowProps) {
  const [copyToggle, setCopyToggle] = useState(false);
  const [editToggle, setEditToggle] = useState(false);
  const addressRef = useRef<HTMLInputElement>();
  const companyNameRef = useRef<HTMLInputElement>();

  const toggleOnCopyClick = () => {
	if (addressRef.current) {
	  const copyContents = props.searchResult.company_name + '\n\n' + props.searchResult.address.replaceAll('####', '\n');
	  navigator.clipboard.writeText(copyContents);
	}
	setCopyToggle(true);
	setTimeout(() => {
	  setCopyToggle(false);
	}, 1000);
  };

  const onEditClick = () => {
	ipcRenderer.on('from-query-run', (event, arg) => {
	  if (arg.changes < 1) {
		console.log('Error encountered');
	  } else {
		props.reloadResults();
	  }
	});

	if (editToggle) {
	  ipcRenderer.send(
		'to-query-run',
		{
		  statement: 'UPDATE addresses SET company_name = ?, address = ? WHERE id = ?',
		  runArgs: [companyNameRef.current.value, addressRef.current.value, props.searchResult.id]
		}
	  );
	  setEditToggle(false);
	} else {
	  setEditToggle(true);
	}
  };

  const onDeleteClick = () => {
	ipcRenderer.on('from-query-run', () => {
	  props.reloadResults();
	});

	ipcRenderer.send(
	  'to-query-run',
	  {
		statement: 'DELETE FROM addresses WHERE id = ?',
		runArgs: [props.searchResult.id]
	  }
	);
  };

  return (
	<ResultsRowContainer>
	  <ResultsAction>
		<IconContainer>
		  <Delete onClick={() => onDeleteClick()}/>
		</IconContainer>
		<IconContainer onClick={() => onEditClick()}>
		  {editToggle ? <EditCheckmark/> : <Edit/>}
		</IconContainer>
	  </ResultsAction>
	  <ResultsCompany>
		<ResultsBorderContainer>
		  {editToggle ? <ResultsText ref={companyNameRef} defaultValue={props.searchResult.company_name}
									 spellCheck={false}
									 style={{backgroundColor: '#f3f3f3', borderBottom: '5px solid #DDD'}}/> :
			<ResultsText ref={companyNameRef}
						 value={props.searchResult.company_name}
						 spellCheck={false} readOnly={true}/>}
		</ResultsBorderContainer>
	  </ResultsCompany>
	  <ResultsAddress>
		<ResultsBorderContainer>
		  {editToggle ? <ResultsText ref={addressRef} defaultValue={props.searchResult.address.replaceAll('####', ' ')}
									 spellCheck={false}
									 style={{backgroundColor: '#f3f3f3', borderBottom: '5px solid #DDD'}}/> :
			<ResultsText ref={addressRef} value={props.searchResult.address.replaceAll('####', ' ')} spellCheck={false}
						 readOnly={true}/>}
		</ResultsBorderContainer>
	  </ResultsAddress>
	  <ResultsCopy>
		<ResultsBorderContainer>
		  <ResultsCopyContainer>
			<IconContainer onClick={() => toggleOnCopyClick()}>
			  {copyToggle ? <Checkmark/> : <Copy/>}
			</IconContainer>
		  </ResultsCopyContainer>
		</ResultsBorderContainer>
	  </ResultsCopy>
	</ResultsRowContainer>
  );
}
