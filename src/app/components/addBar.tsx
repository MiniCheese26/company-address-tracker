import React from 'react';
import styled from 'styled-components';

const AddBarContainer = styled.section`
  flex: 1;
  display: flex;
  justify-content: flex-end;
`;

const AddButton = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #8DA9C4;
  border: 2px solid #333333;
  border-radius: 10px;
  margin-right: 0.6rem;
  margin-top: 0.6rem;
  margin-bottom: 0.6rem;
  padding: 0.4rem;
  max-width: 125px;
  max-height: 60px;

  &:hover {
    background-color: #5D86AC;
    cursor: pointer;
  }
`;

export default function AddBar() {
  return (
    <AddBarContainer>
      <AddButton>
        Add Address
      </AddButton>
    </AddBarContainer>
  );
}
