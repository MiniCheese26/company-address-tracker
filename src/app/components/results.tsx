import React, {useRef} from 'react';
import styled, {keyframes} from 'styled-components';
import ResultsRow from 'Components/resultsRow';
import {SearchResult} from 'App/appRoot';
import {Spinner} from '@styled-icons/evil';

const ResultsContainer = styled.section`
  flex: 4 1 auto;
  display: flex;
  flex-direction: column;
  margin-left: 4rem;
  margin-right: 4rem;
  margin-bottom: 4rem;
  box-shadow: 0 0 30px #979797;
  border-radius: 10px;
  overflow-y: auto;
  height: 0;
`;

const LoadingContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const LoadingKeyframes = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(359.9deg);
  }
`;

const Loading = styled(Spinner)`
  top: 50%;
  left: 50%;

  width: 60px;
  height: 60px;
  color: #7B828E;
  animation: .7s ${LoadingKeyframes} ease-in-out infinite;
`;

export type ResultsProps = {
  searchResults: SearchResult[],
  reloadResults: (appending?: boolean, searching?: boolean, incrementOffset?: number) => void,
  onHitBottomOfResults: () => Promise<void>,
  isLoading: boolean
}

export default function Results(props: ResultsProps) {
  const restoreScroll = useRef(false);

  const rows = props.searchResults.map(x => {
	return x.id === null ? null : <ResultsRow searchResult={x} key={x.id} reloadResults={props.reloadResults}/>;
  });

  const resultsContainerRef = useRef<HTMLDivElement>();

  const onScroll = async () => {
	if (resultsContainerRef.current.scrollHeight -
	  Math.abs(resultsContainerRef.current.scrollTop) ===
	  resultsContainerRef.current.clientHeight) {
	  await props.onHitBottomOfResults();
	  restoreScroll.current = true;
	}
  };

  return (
	<ResultsContainer ref={resultsContainerRef} onScroll={() => onScroll()}>
	  {props.isLoading ? (
		<LoadingContainer>
		  <Loading/>
		  <div style={{display: 'none'}}>
			{rows}
		  </div>
		</LoadingContainer>
	  ) : rows}
	</ResultsContainer>
  );
}
