import React from 'react';
import styled from 'styled-components';
import {Delete as DeleteIcon} from '@styled-icons/material';
import {Edit as EditIcon} from '@styled-icons/boxicons-regular';

const ResultsContainer = styled.section`
  flex: 4;
  display: flex;
  height: 100%;
  flex-direction: column;
  margin-left: 4rem;
  margin-right: 4rem;
  margin-bottom: 4rem;
  box-shadow: 0 0 30px #979797;
  border-radius: 10px;
`;

const ResultsRow = styled.div`
  flex: 1;
  display: grid;
  grid-template-areas: 'actions company address';
  grid-template-columns: 1fr 3fr 3fr;
  width: 100%;
  max-height: 80px;
  border-bottom: 3px solid #CCC;
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
  background-color: #E0E0E0;

  &:hover {
    background-color: #CCCCCC;
	cursor: pointer;
  }
`;

const Delete = styled(DeleteIcon)`
  width: 30px;
  height: 30px;
  color: red;
`;

const Edit = styled(EditIcon)`
  width: 30px;
  height: 30px;
  color: blue;
`;

const ResultsCompany = styled.div`
  grid-area: company;
`;

const ResultsAddress = styled.div`
  grid-area: address;
`;

export default function Results() {
  return (
	<ResultsContainer>
	  <ResultsRow>
		<ResultsAction>
		  <IconContainer>
			<Delete/>
		  </IconContainer>
		  <IconContainer>
			<Edit/>
		  </IconContainer>
		</ResultsAction>
		<ResultsCompany>

		</ResultsCompany>
		<ResultsAddress>

		</ResultsAddress>
	  </ResultsRow>
	  <ResultsRow>
		<ResultsAction>

		</ResultsAction>
		<ResultsCompany>

		</ResultsCompany>
		<ResultsAddress>

		</ResultsAddress>
	  </ResultsRow>
	</ResultsContainer>
  );
}
