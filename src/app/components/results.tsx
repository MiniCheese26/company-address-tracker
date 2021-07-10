import React from 'react';
import styled from 'styled-components';
import ResultsRow from 'Components/resultsRow';

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

export default function Results() {
  return (
	<ResultsContainer>
	  <ResultsRow address={'test'} company={'d'}/>
	  <ResultsRow address={'dd'} company={'gf'}/>
	</ResultsContainer>
  );
}
