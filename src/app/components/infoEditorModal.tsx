import React, {createRef, useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {Cross as CrossIcon} from '@styled-icons/entypo/Cross';
import {CheckmarkOutline} from '@styled-icons/evaicons-outline';
import {nanoid} from 'nanoid';
import {Plus as PLusIcon} from '@styled-icons/boxicons-regular/Plus';
import {Minus as MinusIcon} from '@styled-icons/boxicons-regular/Minus';
import {SearchResult} from 'App/appRoot';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const AddModal = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  min-height: 550px;
  min-width: 500px;
  background-color: white;
  border-radius: 10px;
  padding: 0.4rem;
  box-shadow: 0 0 25px #979797;
`;

const RowContainer = styled.div`
  flex: 1 0;
  display: flex;
  flex-direction: column;
  margin-left: 0.4rem;
  margin-right: 0.4rem;
  margin-bottom: 0.7rem;
`;

const InputLabel = styled.label`
  max-height: 10%;
  font-size: 16px;
  color: #575757;
  margin-bottom: 0.3rem;
`;

const AddressInputFieldContainer = styled.div`
  flex: 2;
  display: flex;
  max-height: 50px;
`;

const InputField = styled.input`
  flex: 2;
  font-size: 18px;
  border-radius: 5px;
  background-color: #f3f3f3;
  border-bottom: 5px solid #DDD;
  padding-left: 0.4rem;
  padding-right: 0.4rem;
  max-height: 50px;
`;

const AddressModifierContainer = styled.div`
  display: flex;
  background-color: #f3f3f3;
  border-bottom: 5px solid #DDD;
  margin-left: 0.2rem;
  border-radius: 5px;

  &:hover {
    background-color: #DDD;
    cursor: pointer;
  }
`;

const Plus = styled(PLusIcon)`
  height: 25px;
  width: 25px;
  color: #44BBA4;
  align-self: center;
`;

const Minus = styled(MinusIcon)`
  height: 25px;
  width: 25px;
  color: #E73D23;
  align-self: center;
`;

const CrossContainer = styled.div`
  margin-left: auto;

  &:hover {
    background-color: #EEE;
    border-radius: 20px;
    cursor: pointer;
  }
`;

const Cross = styled(CrossIcon)`
  width: 25px;
  height: 25px;
  color: #E73D23;
`;

const AddButton = styled.button`
  flex: 1;
  max-height: 50px;
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
			const secondResponseId = nanoid(4);

			ipcRenderer.on('from-query-transaction', (event, args) => {
			  if (firstResponseId === args.responseId) {
				props.reloadResults();

				if (props.operation === 'insert') {
				  companyNameRef.current.value = '';
				  cityRef.current.value = '';
				  countyRef.current.value = '';
				  postcodeRef.current.value = '';
				  addressRefs[0].current.value = '';
				  setNumberOfAddressLines(1);
				  // this is a race condition waiting to happen
				} /*else if (props.operation === 'update') {
				  props.setToggled(false);
				}*/
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
			  statement: 'INSERT INTO addresses (company_name, city, county, postcode, time_added) VALUES (?, ?, ?, ?, ?)',
			  runArgs: [
				companyNameRef.current.value,
				cityRef.current.value,
				countyRef.current.value,
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
			  statement: 'UPDATE addresses SET company_name = ?, city = ?, county = ?, postcode = ? WHERE id = ?',
			  runArgs: [
				companyNameRef.current.value,
				cityRef.current.value,
				countyRef.current.value,
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
		<AddressInputFieldContainer>
		  {props.existingSearchResult
			? <InputField ref={addressRefs[v]}
						  defaultValue={props.existingSearchResult.address_lines.split(', ')[v]}/>
			: <InputField ref={addressRefs[v]}/>}
		  <AddressModifierContainer onClick={() => {
			if (v === 0) {
			  onAddAddressLineClick();
			} else {
			  onMinusAddressLineClick();
			}
		  }}>
			{v === 0 ? <Plus/> : <Minus/>}
		  </AddressModifierContainer>
		</AddressInputFieldContainer>
	  </RowContainer>
	));
  });

  return (
	<AddModal>
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
		<InputLabel>Postcode</InputLabel>
		<InputField ref={postcodeRef}/>
	  </RowContainer>
	  <RowContainer>
		<AddButton style={error ? {backgroundColor: '#E73D23'} : null} onClick={() => onSubmitClick()}>
		  {error ? <Cross style={{height: '35px', width: '35px', color: 'white'}}/> : <Checkmark/>}
		</AddButton>
	  </RowContainer>
	</AddModal>
  );
}
