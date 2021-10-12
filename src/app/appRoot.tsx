import React, {useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import GlobalDefault from 'Styles/globalDefault';
import AddBar from 'Components/addBar';
import GlobalFonts from 'Resources/fonts/fonts';
import SearchBar from 'Components/searchBar';
import Results from 'Components/results';
import {nanoid} from 'nanoid';
import useSettings from './hooks/useSettings';
import {Settings} from 'Types/types';

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
  const settings = useRef<Settings>({userId: ''});
  const [reloadData, writeSettings] = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const offset = useRef(0);

  const assignSettings = async () => {
	settings.current = await reloadData();
  };

  useEffect(() => {
	assignSettings().then(() => {
	  const userId = nanoid(5);

	  if (!settings.current.userId) {
		(
		  async () => {
			const result = await ipcRenderer.invoke(
			  'to-query-postgres',
			  {query: 'INSERT INTO users (id, username) VALUES ($1, $2)', args: [userId, 'emily']}
			);

			if (result?.rowCount > 0) {
			  settings.current.userId = userId;
			  writeSettings(settings.current);
			}
		  }
		)();
	  }
	});
  }, []);

  const reloadResults = async (updating?: boolean, searching?: boolean, incrementOffset?: number) => {
	setIsLoading(searching);

	let localOffset = offset.current;
	let limit = 7;

	if (!updating && localOffset > 0) {
	  localOffset = 0;
	  limit = offset.current;
	}

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
                    ORDER BY time_added ASC
                    LIMIT ${limit} OFFSET ${localOffset};`,
	  args: ['%' + currentSearchTerm + '%', settings.current.userId]
	});

	if (results.rows.length === 0) {
	  if (!updating) {
		setResults(results.rows);
	  }

	  setIsLoading(false);
	  return false;
	}

	if (updating) {
	  setResults(prev => [...prev, ...results.rows]);
	} else {
	  setResults(results.rows);
	}

	if (incrementOffset) {
	  offset.current += incrementOffset;
	}

	if (offset.current === 0) {
	  offset.current += results.rows.length;
	}

	setIsLoading(false);
	return true;
  };

  useEffect(() => {
	reloadResults(false, true);
  }, [currentSearchTerm]);

  const onHitBottomOfResults = async () => {
	const result = await reloadResults(true);

	if (!result) {
	  offset.current += results.length - offset.current;
	} else {
	  offset.current += 7;
	}
  };

  return (
	<RootContainer>
	  <GlobalDefault/>
	  <GlobalFonts/>
	  <AddBar reloadResults={reloadResults}/>
	  <SearchBar setResults={setResults} setCurrentSearchTerm={setCurrentSearchTerm}/>
	  <Results isLoading={isLoading} searchResults={results} reloadResults={reloadResults}
			   onHitBottomOfResults={onHitBottomOfResults}/>
	</RootContainer>
  );
}
