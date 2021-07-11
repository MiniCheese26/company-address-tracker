import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import GlobalDefault from 'Styles/globalDefault';
import AddBar from 'Components/addBar';
import GlobalFonts from 'Resources/fonts/fonts';
import SearchBar from 'Components/searchBar';
import Results from 'Components/results';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const RootContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export type SearchResult = {
  id: number,
  company_name: string,
  address: string
}

export default function App() {
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  const reloadResults = () => {
	ipcRenderer.on('from-query-get-all', (event, arg: SearchResult[]) => {
	  setResults(arg);
	});

	ipcRenderer.send('to-query-get-all',
	  {
		statement: 'SELECT * FROM addresses WHERE company_name LIKE (? || \'%\') OR address LIKE (\'%\' || ? || \'%\')',
		getArgs: [currentSearchTerm, currentSearchTerm]
	  }
	);
  };

  useEffect(() => {
    //reloadResults();
  }, [currentSearchTerm]);

  return (
	<RootContainer>
	  <GlobalDefault/>
	  <GlobalFonts/>
	  <AddBar reloadResults={reloadResults}/>
	  <SearchBar setResults={setResults} setCurrentSearchTerm={setCurrentSearchTerm}/>
	  <Results searchResults={results} reloadResults={reloadResults}/>
	</RootContainer>
  );
}
