import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import GlobalDefault from 'Styles/globalDefault';
import AddBar from 'Components/addBar';
import GlobalFonts from 'Resources/fonts/fonts';
import SearchBar from 'Components/searchBar';
import Results from 'Components/results';
import {nanoid} from 'nanoid';
import useSettings from './hooks/useSettings';

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
  country?: string,
  postcode: string,
  address_lines: string
  address_line_ids: string
}

export default function App() {
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [settings, writeSettings] = useSettings();

  useEffect(() => {
	const userId = nanoid(5);

	if (!settings.userId) {
	  (async () => {
		const result = await ipcRenderer.invoke(
		  'to-query-postgres',
		  {query: 'INSERT INTO users (id, username) VALUES ($1, $2)', args: [userId, 'emily']}
		);

		if (result?.rowCount > 0) {
		  settings.userId = userId;
		  writeSettings(settings);
		}
	  })();
	}
  }, []);

  const reloadResults = async () => {
	const results = await ipcRenderer.invoke('to-query-postgres', {
	  query: `SELECT addresses.id,
                           city,
                           company_name,
                           county,
                           country,
                           postcode,
                           string_agg(address_line::character varying, ', ') as address_lines,
                           string_agg(address_lines.id::character varying, ',')   as address_line_ids
                    FROM addresses
                             JOIN address_lines ON addresses.id = address_lines.address_id
                    WHERE addresses.company_name LIKE $1
                       OR addresses.postcode LIKE $1
                       AND addresses.user_id = $2
                    GROUP BY addresses.id, time_added
                    ORDER BY time_added DESC
                    LIMIT 10`,
	  args: ['%' + currentSearchTerm + '%', settings.userId]
	});

	setResults(results.rows);
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
