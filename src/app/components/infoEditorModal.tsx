import React, {createRef, useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {CheckmarkOutline} from '@styled-icons/evaicons-outline';
import {nanoid} from 'nanoid';
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
  const [numberOfAddressLines, setNumberOfAddressLines] = useState(1);
  const [addressRefs, setAddressRefs] = useState<React.MutableRefObject<HTMLInputElement>[]>([]);
  const companyNameRef = useRef<HTMLInputElement>();
  const cityRef = useRef<HTMLInputElement>();
  const countyRef = useRef<HTMLInputElement>();
  const countryRef = useRef<HTMLInputElement>();
  const postcodeRef = useRef<HTMLInputElement>();

  useEffect(() => {
	setAddressRefs(ref => (
	  Array(numberOfAddressLines).fill(undefined).map((_, i) => ref[i] || createRef())
	));
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

  const onSubmitClick = () => {
	if (companyNameRef.current && cityRef.current && countyRef.current && postcodeRef.current) {
	  if (!companyNameRef.current.value ||
		!cityRef.current.value ||
		!postcodeRef.current.value ||
		!addressRefs[0].current.value) {
		setError(true);
		setTimeout(() => {
		  setError(false);
		}, 1000);
	  } else {
		const responseId = nanoid(4);

		ipcRenderer.on('from-query-run', (event, args) => {
		  if (args.responseId === responseId) {
			const firstResponseId = nanoid(4);
			let secondResponseId: string = undefined;

			ipcRenderer.on('from-query-transaction', (event, args) => {
			  if (firstResponseId === args.responseId) {
				props.reloadResults();

				if (props.operation === 'insert') {
				  companyNameRef.current.value = '';
				  cityRef.current.value = '';
				  countyRef.current.value = '';
				  postcodeRef.current.value = '';
				  countryRef.current.value = '';
				  addressRefs[0].current.value = '';
				  setNumberOfAddressLines(1);
				} else if (!secondResponseId && props.operation === 'update') {
				  props.setToggled(false);
				}
			  } else if (secondResponseId === args.responseId) {
				props.reloadResults();

				if (props.operation === 'update') {
				  props.setToggled(false);
				}
			  }
			});

			if (props.operation === 'insert') {
			  ipcRenderer.send(
				'to-query-transaction',
				{
				  statement: 'INSERT INTO address_lines (address_id, address_line) VALUES (@companyId, @address)',
				  runArgs: addressRefs.map(x => (
					{companyId: args.data.lastInsertRowid, address: x.current.value}
				  )),
				  responseId: firstResponseId
				}
			  );
			} else {
			  ipcRenderer.send(
				'to-query-transaction',
				{
				  statement: 'UPDATE address_lines SET address_line = @addressLine WHERE id = @id',
				  runArgs: addressRefs.map((x, i) => (
					{addressLine: x.current.value, id: props.existingSearchResult.address_line_ids.split(',')[i]}
				  )),
				  responseId: firstResponseId
				}
			  );

			  if (props.existingSearchResult.address_lines.split(', ').length > numberOfAddressLines) {
			    secondResponseId = nanoid(4);
				const idsToDelete = props.existingSearchResult.address_line_ids.split(',').slice(numberOfAddressLines);

				ipcRenderer.send(
				  'to-query-transaction',
				  {
					statement: 'DELETE FROM address_lines WHERE id = @id',
					runArgs: idsToDelete.map(x => (
					  {id: x}
					)),
					responseId: secondResponseId
				  }
				);
			  } else if (props.existingSearchResult.address_lines.split(', ').length < numberOfAddressLines) {
				secondResponseId = nanoid(4);
				const entriesToAdd = addressRefs.slice(props.existingSearchResult.address_line_ids.split(',').length);

				ipcRenderer.send(
				  'to-query-transaction',
				  {
					statement: 'INSERT INTO address_lines (address_id, address_line) VALUES (@companyId, @address)',
					runArgs: entriesToAdd.map(x => (
					  {companyId: props.existingSearchResult.id, address: x.current.value}
					)),
					responseId: secondResponseId
				  }
				);
			  }
			}
		  }
		});

		if (props.operation === 'insert') {
		  ipcRenderer.send(
			'to-query-run',
			{
			  statement: 'INSERT INTO addresses (company_name, city, county, country, postcode, time_added) VALUES (?, ?, ?, ?, ?, ?)',
			  runArgs: [
				companyNameRef.current.value,
				cityRef.current.value,
				countyRef.current.value,
				countryRef.current.value,
				postcodeRef.current.value,
				new Date().getTime()
			  ],
			  responseId
			}
		  );
		} else {
		  ipcRenderer.send(
			'to-query-run',
			{
			  statement: 'UPDATE addresses SET company_name = ?, city = ?, county = ?, country = ?, postcode = ? WHERE id = ?',
			  runArgs: [
				companyNameRef.current.value,
				cityRef.current.value,
				countyRef.current.value,
				countryRef.current.value,
				postcodeRef.current.value,
				props.existingSearchResult.id
			  ],
			  responseId
			}
		  );
		}
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
			? <InputField ref={addressRefs[v]}
						  defaultValue={props.existingSearchResult.address_lines.split(', ')[v]}/>
			: <InputField ref={addressRefs[v]}/>}
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
