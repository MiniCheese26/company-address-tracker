import React from 'react';
import styled from 'styled-components';
import GlobalDefault from 'Styles/globalDefault';
import AddBar from 'Components/addBar';
import GlobalFonts from 'Resources/fonts/fonts';

const RootContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const SearchContainer = styled.section`
  flex: 2;
  display: flex;
`;

const ResultsContainer = styled.section`
  flex: 4;
  display: flex;
`;

export default function App() {
  return (
    <RootContainer>
      <GlobalDefault/>
      <GlobalFonts/>
      <AddBar/>
      <SearchContainer/>
      <ResultsContainer/>
    </RootContainer>
  );
}
