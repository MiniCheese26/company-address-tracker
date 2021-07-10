import React, {useRef, useState} from 'react';
import styled from 'styled-components';

const SearchBarContainer = styled.section`
  flex: 2;
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

export default function SearchBar() {
  const [input, setInput] = useState('');
  const inputElement = useRef<HTMLInputElement>();

  const onChange = () => {
	if (inputElement.current) {
	  setInput(inputElement.current.value);
	}
  };

  return (
	<SearchBarContainer>
	  <SearchBarStyle ref={inputElement} onChange={() => onChange()} placeholder="Enter company name...">

	  </SearchBarStyle>
	</SearchBarContainer>
  );
}
