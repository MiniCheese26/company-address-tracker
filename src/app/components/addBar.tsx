import React, {createRef, useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {Cross as CrossIcon} from '@styled-icons/entypo';
import {CheckmarkOutline} from '@styled-icons/evaicons-outline';
import {Minus as MinusIcon, Plus as PLusIcon} from '@styled-icons/boxicons-regular';
import {nanoid} from 'nanoid';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const AddBarContainer = styled.section`
  flex: 1;
  display: flex;
  justify-content: flex-end;
`;

const AddAddressButton = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  margin-right: 4rem;
  margin-top: 1rem;
  margin-bottom: 0.6rem;
  padding: 0.4rem;
  max-width: 175px;
  max-height: 60px;
  box-shadow: 0 5px 25px #979797;
  border: 0 solid white;
  transition: border .1s ease-in-out, box-shadow .4s ease-in, color .2s ease-out;

  &:hover {
    border: 3px solid #9F9FED;
    box-shadow: 0 0 25px #9F9FED;
    cursor: pointer;
    color: #9F9FED;
  }
`;

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

const AddressInputArea = styled.textarea`
  flex: 2;
  font-size: 16px;
  border-radius: 5px;
  background-color: #f3f3f3;
  border-bottom: 5px solid #DDD;
  padding: 0.4rem;
  max-height: 150px;
  margin-bottom: 0.5rem;
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

export type AddBarProps = {
  reloadResults: () => void
}

export default function AddBar(props: AddBarProps) {
  const [error, setError] = useState(false);
  const [toggled, setToggled] = useState(true);
  const [numberOfAddressLines, setNumberOfAddressLines] = useState(1);
  const [addressRefs, setAddressRefs] = useState<React.MutableRefObject<HTMLInputElement>[]>([]);
  const companyNameRef = useRef<HTMLInputElement>();
  const cityRef = useRef<HTMLInputElement>();
  const countyRef = useRef<HTMLInputElement>();
  const postcodeRef = useRef<HTMLInputElement>();

  useEffect(() => {
	setAddressRefs(ref => (
	  Array(numberOfAddressLines).fill([]).map((_, i) => ref[i] || createRef())
	));
  }, [numberOfAddressLines]);

  const onCrossClick = () => {
	setToggled(prev => !prev);
  };

  const onSubmitClick = () => {
	if (companyNameRef.current && cityRef.current && countyRef.current && postcodeRef.current) {
	  if (!companyNameRef.current.value || !cityRef.current.value || !postcodeRef.current.value || !addressRefs[0].current.value) {
		setError(true);
		setTimeout(() => {
		  setError(false);
		}, 1000);
	  } else {
	    const responseId = nanoid(4);

		ipcRenderer.on('from-query-run', (event, args) => {
		  console.log(args);
		  if (args.responseId === responseId) {
		    const responseId = nanoid(4);

		    ipcRenderer.on('from-query-run', (event, args) => {
		      if (responseId === args.responseId) {
				props.reloadResults();
				companyNameRef.current.value = '';
				cityRef.current.value = '';
				countyRef.current.value = '';
				postcodeRef.current.value = '';
				addressRefs[0].current.value = '';
				setNumberOfAddressLines(1);
			  }
			});

		    addressRefs.forEach((ref, i) => {
			  ipcRenderer.send(
				'to-query-run',
				{
				  statement: 'INSERT INTO address_lines (company_id, address_line) VALUES (?, ?)',
				  runArgs: [args.lastInsertRowid, ref.current.value],
				  responseId: i + 1 === addressRefs.length ? responseId : null
				}
			  );
			});
		  }
		});

		ipcRenderer.send(
		  'to-query-run',
		  {
			statement: 'INSERT INTO addresses (company_name, city, county, postcode) VALUES (?, ?, ?, ?)',
			runArgs: [companyNameRef.current.value, cityRef.current.value, countyRef.current.value, postcodeRef.current.value],
			responseId
		  }
		);
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
		  <InputField ref={addressRefs[v]}/>
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
	<AddBarContainer>
	  {toggled ? (
		<AddModal>
		  <RowContainer>
			<CrossContainer onClick={() => setToggled(false)}>
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
	  ) : null}
	  <AddAddressButton onClick={() => onCrossClick()}>
		Add Address
	  </AddAddressButton>
	</AddBarContainer>
  );
}
