import React, {useRef, useState} from 'react';
import styled from 'styled-components';
import {SearchResult} from 'App/appRoot';

const SearchBarContainer = styled.section`
  flex: 1 0 10%;
  display: flex;
  justify-content: center;
`;

const SearchBarStyle = styled.input`
  flex: 1;
  border-radius: 10px;
  max-height: 75px;
  margin: 2rem 4rem;
  padding: 0.8rem;
  font-size: 36px;
  box-shadow: 0 0 30px #979797;
  border-bottom: 0 solid #7B828E;
  transition: border-bottom .4s ease-in-out;

  &:focus {
    border-bottom: 6px solid #9F9FED;
  }
`;

export type SearchBarProps = {
  setResults: React.Dispatch<React.SetStateAction<SearchResult[]>>,
  setCurrentSearchTerm: React.Dispatch<React.SetStateAction<string>>
}

export default function SearchBar(props: SearchBarProps) {
  const [timeout, setTimoutState] = useState<NodeJS.Timeout>(undefined);
  const inputElement = useRef<HTMLInputElement>();

  const onChange = () => {
	if (inputElement.current) {
	  if (timeout) {
		clearTimeout(timeout);
	  }

	  setTimoutState(setTimeout(() => {
	    props.setCurrentSearchTerm(inputElement.current.value);
	  }, 500));
	}
  };

  return (
	<SearchBarContainer>
	  <SearchBarStyle ref={inputElement} onChange={() => onChange()} placeholder="Enter search term..."/>
	</SearchBarContainer>
  );
}
