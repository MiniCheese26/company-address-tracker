import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import GlobalDefault from 'Styles/globalDefault';
import AddBar from 'Components/addBar';
import GlobalFonts from 'Resources/fonts/fonts';
import SearchBar from 'Components/searchBar';
import Results from 'Components/results';
import {QueryResponse} from 'index';

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
  city: string,
  county?: string,
  postcode: string,
  address_lines: string
  address_line_ids: string
}

export default function App() {
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  const reloadResults = () => {
	ipcRenderer.on('from-query-get-all', (event, args: QueryResponse<SearchResult[]>) => {
	  setResults(args.data);
	});

	ipcRenderer.send(
	  'to-query-get-all',
	  {
		statement: `SELECT addresses.id,
                           city,
                           company_name,
                           county,
                           postcode,
                           group_concat(address_line, ', ') as address_lines,
                           group_concat(address_lines.id)   as address_line_ids
                    FROM addresses
                             INNER JOIN address_lines ON addresses.id = address_lines.address_id
                    WHERE addresses.company_name LIKE ('%' || ? || '%')
                       OR addresses.postcode LIKE ('%' || ? || '%')
                    GROUP BY addresses.id, time_added
                    ORDER BY time_added DESC
                    LIMIT 10`,
		getArgs: [currentSearchTerm, currentSearchTerm]
	  }
	);
  };

  useEffect(() => {
	reloadResults();
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
