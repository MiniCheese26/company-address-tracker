import React, {useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {CheckmarkOutline} from '@styled-icons/evaicons-outline';
import {Plus as PLusIcon} from '@styled-icons/boxicons-regular/Plus';
import {Minus as MinusIcon} from '@styled-icons/boxicons-regular/Minus';
import {SearchResult} from 'App/appRoot';
import {
  Cross,
  CrossContainer,
  InputActionContainer,
  InputField,
  InputFieldContainer,
  InputLabel,
  ModalContainer,
  RowContainer
} from 'Styles/modal';
import useSettings from 'App/hooks/useSettings';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const Plus = styled(PLusIcon)`
  height: 25px;
  width: 25px;
  color: #44BBA4;
`;

const Minus = styled(MinusIcon)`
  height: 25px;
  width: 25px;
  color: #E73D23;
`;

const AddButton = styled.button`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #44BBA4;
  border-radius: 10px;

  &:hover {
    background-color: #3ca894;
  }
`;

const Checkmark = styled(CheckmarkOutline)`
  height: 35px;
  width: 35px;
  color: white;
`;

export type InfoEditorModalProps = {
  reloadResults: () => void,
  setToggled: React.Dispatch<React.SetStateAction<boolean>>,
  operation: 'update' | 'insert',
  existingSearchResult?: SearchResult
}

export default function InfoEditorModal(props: InfoEditorModalProps) {
  const [error, setError] = useState(false);
  const [settings] = useSettings();
  const [numberOfAddressLines, setNumberOfAddressLines] = useState(1);
  const addressRefs = useRef<Array<HTMLInputElement>>([]);
  const companyNameRef = useRef<HTMLInputElement>();
  const cityRef = useRef<HTMLInputElement>();
  const countyRef = useRef<HTMLInputElement>();
  const countryRef = useRef<HTMLInputElement>();
  const postcodeRef = useRef<HTMLInputElement>();

  useEffect(() => {
	addressRefs.current = addressRefs.current.slice(0, numberOfAddressLines);
  }, [numberOfAddressLines]);

  useEffect(() => {
	if (props.existingSearchResult) {
	  companyNameRef.current.value = props.existingSearchResult.company_name;
	  cityRef.current.value = props.existingSearchResult.city;
	  countyRef.current.value = props.existingSearchResult.county;
	  postcodeRef.current.value = props.existingSearchResult.postcode;
	  setNumberOfAddressLines(props.existingSearchResult.address_lines.split(', ').length);
	}
  }, []);

  const onSubmitClick = async () => {
	if (companyNameRef.current && cityRef.current && countyRef.current && postcodeRef.current) {
	  if (!companyNameRef.current.value ||
		!cityRef.current.value ||
		!postcodeRef.current.value ||
		!addressRefs.current[0].value) {
		setError(true);
		setTimeout(() => {
		  setError(false);
		}, 1000);
	  } else {
		if (props.operation === 'insert') {
		  const insertResult = await ipcRenderer.invoke(
			'to-query-postgres',
			{
			  query: 'INSERT INTO addresses (company_name, city, county, country, postcode, time_added, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
			  args: [
				companyNameRef.current.value,
				cityRef.current.value,
				countyRef.current.value,
				countryRef.current.value,
				postcodeRef.current.value,
				new Date().getTime(),
				settings.userId
			  ]
			}
		  );

		  await ipcRenderer.invoke(
			'to-transaction-postgres',
			{
			  query: 'INSERT INTO address_lines (address_id, address_line) VALUES ($1, $2)',
			  args: addressRefs.current.map(x => (
				[insertResult.rows[0].id, x.value]
			  ))
			}
		  );
		} else {
		  await ipcRenderer.invoke('to-query-postgres', {
			query: 'UPDATE addresses SET company_name = $1, city = $2, county = $3, country = $4, postcode = $5 WHERE id = $6',
			args: [
			  companyNameRef.current.value,
			  cityRef.current.value,
			  countyRef.current.value,
			  countryRef.current.value,
			  postcodeRef.current.value,
			  props.existingSearchResult.id
			]
		  });

		  await ipcRenderer.invoke(
			'to-transaction-postgres',
			{
			  query: 'UPDATE address_lines SET address_line = $1 WHERE id = $2',
			  args: addressRefs.current.map((x, i) => {
				return (
				  [x.value, props.existingSearchResult.address_line_ids.split(',')[i]]
				);
			  })
			}
		  );

		  if (props.existingSearchResult.address_lines.split(', ').length > numberOfAddressLines) {
			const idsToDelete = props.existingSearchResult.address_line_ids.split(',').slice(numberOfAddressLines);

			await ipcRenderer.invoke(
			  'to-transaction-postgres',
			  {
				query: 'DELETE FROM address_lines WHERE id = $1',
				args: idsToDelete.map(x => (
				  [x]
				))
			  }
			);
		  } else if (props.existingSearchResult.address_lines.split(', ').length < numberOfAddressLines) {
			const entriesToAdd = addressRefs.current.slice(props.existingSearchResult.address_line_ids.split(',').length);

			await ipcRenderer.invoke(
			  'to-transaction-postgres',
			  {
				query: 'INSERT INTO address_lines (address_id, address_line) VALUES ($1, $2)',
				args: entriesToAdd.map(x => (
				  [props.existingSearchResult.id, x.value]
				))
			  }
			);
		  }
		}

		if (props.operation === 'update') {
		  props.setToggled(false);
		} else {
		  companyNameRef.current.value = '';
		  cityRef.current.value = '';
		  countyRef.current.value = '';
		  postcodeRef.current.value = '';
		  countryRef.current.value = '';
		  addressRefs.current[0].value = '';
		  setNumberOfAddressLines(1);
		}

		props.reloadResults();
	  }
	}
  };

  const onAddAddressLineClick = () => {
	setNumberOfAddressLines(prev => prev + 1);
  };

  const onMinusAddressLineClick = () => {
	setNumberOfAddressLines(prev => prev - 1);
  };

  const addressLines: JSX.Element[] = [];

  [...Array(numberOfAddressLines).keys()].forEach((v) => {
	addressLines.push((
	  <RowContainer>
		<InputLabel>Address Line {v + 1}</InputLabel>
		<InputFieldContainer>
		  {props.existingSearchResult
			? <InputField ref={el => addressRefs.current[v] = el}
						  defaultValue={props.existingSearchResult.address_lines.split(', ')[v]}/>
			: <InputField ref={el => addressRefs.current[v] = el}/>}
		  <InputActionContainer onClick={() => {
			if (v === 0) {
			  onAddAddressLineClick();
			} else {
			  onMinusAddressLineClick();
			}
		  }}>
			{v === 0 ? <Plus/> : <Minus/>}
		  </InputActionContainer>
		</InputFieldContainer>
	  </RowContainer>
	));
  });

  return (
	<ModalContainer>
	  <RowContainer>
		<CrossContainer onClick={() => props.setToggled(false)}>
		  <Cross/>
		</CrossContainer>
	  </RowContainer>
	  <RowContainer>
		<InputLabel>Company Name</InputLabel>
		<InputField ref={companyNameRef}/>
	  </RowContainer>
	  {addressLines}
	  <RowContainer>
		<InputLabel>City</InputLabel>
		<InputField ref={cityRef}/>
	  </RowContainer>
	  <RowContainer>
		<InputLabel>County</InputLabel>
		<InputField ref={countyRef} placeholder={'Optional'}/>
	  </RowContainer>
	  <RowContainer>
		<InputLabel>Country</InputLabel>
		<InputField ref={countryRef} placeholder={'Optional'} defaultValue={'United Kingdom'}/>
	  </RowContainer>
	  <RowContainer>
		<InputLabel>Postcode</InputLabel>
		<InputField ref={postcodeRef}/>
	  </RowContainer>
	  <RowContainer>
		<AddButton style={error ? {backgroundColor: '#E73D23'} : null} onClick={() => onSubmitClick()}>
		  {error ? <Cross style={{height: '35px', width: '35px', color: 'white'}}/> : <Checkmark/>}
		</AddButton>
	  </RowContainer>
	</ModalContainer>
  );
}
