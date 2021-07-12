import React, {useRef, useState} from 'react';
import styled, {css} from 'styled-components';
import {Delete as DeleteIcon} from '@styled-icons/material/Delete';
import {Edit as EditIcon} from '@styled-icons/boxicons-regular/Edit';
import {Copy as CopyIcon} from '@styled-icons/fa-regular/Copy';
import {CheckmarkSquareOutline} from '@styled-icons/evaicons-outline';
import {SearchResult} from 'App/appRoot';
import {nanoid} from 'nanoid';
import InfoEditorModal from 'Components/infoEditorModal';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const ResultsRowContainer = styled.div`
  flex: 1;
  display: grid;
  grid-template-areas: 'actions company address copy';
  grid-template-columns: 1fr 3fr 5fr .75fr;
  width: 100%;
  max-height: 80px;
  border-bottom: 3px solid #CCC;

  & > div:not(:first-child) > div {
    padding-left: 0.4rem;
    padding-right: 0.4rem;
    border-left: 2px solid #CCC;
  }

  & > div {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
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

const ResultsBorderContainer = styled.div`
  flex: 1;
  display: flex;
  height: 100%;
  align-items: center;
`;

const ResultsText = styled.p`
  flex: 1;
  border-radius: 3px;
  font-size: 16px;
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
	  const copyContents = `${props.searchResult.company_name}\n${props.searchResult.address_lines.split(', ')
		.join('\n')}\n${props.searchResult.city}\n${props.searchResult.county}\n${props.searchResult.postcode}`;
	  navigator.clipboard.writeText(copyContents);
	}
	setCopyToggle(true);
	setTimeout(() => {
	  setCopyToggle(false);
	}, 1000);
  };

  const onEditClick = () => {
	if (editToggle) {
	  setEditToggle(false);
	} else {
	  setEditToggle(true);
	}
  };

  const onDeleteClick = () => {
	const responseId = nanoid(4);

	ipcRenderer.on('from-query-run', (event, args) => {
	  if (responseId === args.responseId) {
		props.reloadResults();
	  }
	});

	ipcRenderer.send(
	  'to-query-run',
	  {
		statement: 'DELETE FROM address_lines WHERE address_id = ?',
		runArgs: [props.searchResult.id]
	  }
	);

	ipcRenderer.send(
	  'to-query-run',
	  {
		statement: 'DELETE FROM addresses WHERE id = ?',
		runArgs: [props.searchResult.id],
		responseId
	  }
	);
  };

  const addressString = `${props.searchResult.address_lines}, ${props.searchResult.city}, ${props.searchResult.county}, ${props.searchResult.country}, ${props.searchResult.postcode}`;

  return (
	<ResultsRowContainer>
	  {editToggle ? <InfoEditorModal reloadResults={props.reloadResults} setToggled={setEditToggle} operation={'update'}
									 existingSearchResult={props.searchResult}/> : null}
	  <ResultsAction>
		<IconContainer onClick={() => onDeleteClick()}>
		  <Delete/>
		</IconContainer>
		<IconContainer onClick={() => onEditClick()}>
		  <Edit/>
		</IconContainer>
	  </ResultsAction>
	  <ResultsCompany>
		<ResultsBorderContainer>
		  <ResultsText ref={companyNameRef}>{props.searchResult.company_name}</ResultsText>
		</ResultsBorderContainer>
	  </ResultsCompany>
	  <ResultsAddress>
		<ResultsBorderContainer>
		  <ResultsText ref={addressRef}>{addressString}</ResultsText>
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
