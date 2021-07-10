import React from 'react';
import styled from 'styled-components';
import GlobalDefault from 'Styles/globalDefault';
import AddBar from 'Components/addBar';
import GlobalFonts from 'Resources/fonts/fonts';
import SearchBar from 'Components/searchBar';
import Results from 'Components/results';

const RootContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export default function App() {
  return (
    <RootContainer>
      <GlobalDefault/>
      <GlobalFonts/>
      <AddBar/>
      <SearchBar/>
      <Results/>
    </RootContainer>
  );
}
