import React from 'react';
import styled from 'styled-components';
import ResultsRow from 'Components/resultsRow';
import {SearchResult} from 'App/appRoot';

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

export type ResultsProps = {
  searchResults: SearchResult[],
  reloadResults: () => void
}

export default function Results(props: ResultsProps) {
  const rows = props.searchResults.map(x => <ResultsRow searchResult={x} reloadResults={props.reloadResults}/>);

  return (
	<ResultsContainer>
	  {rows}
	</ResultsContainer>
  );
}
