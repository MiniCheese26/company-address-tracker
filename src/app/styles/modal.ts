import styled from 'styled-components';
import {Cross as CrossIcon} from '@styled-icons/entypo/Cross';

export const ModalContainer = styled.div`
  display: flex;
  position: fixed;
  left: 50%;
  top: 50%;
  flex-direction: column;
  align-items: flex-start;
  min-height: 550px;
  min-width: 550px;
  background-color: white;
  border-radius: 10px;
  transform: translate(-50%, -50%);
  padding: 0.4rem;
  box-shadow: 0 0 25px #979797;
  max-height: 625px;
  overflow-y: auto;
`;

export const RowContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 0.7rem;
  width: 100%;
`;

export const InputLabel = styled.label`
  max-height: 10%;
  font-size: 16px;
  color: #575757;
  margin-bottom: 0.3rem;
`;

export const InputField = styled.input`
  flex: 2;
  font-size: 18px;
  border-radius: 5px;
  background-color: #f3f3f3;
  border-bottom: 5px solid #DDD;
  padding-left: 0.4rem;
  padding-right: 0.4rem;
  min-height: 40px;
`;

export const CrossContainer = styled.div`
  margin-left: auto;

  &:hover {
    background-color: #EEE;
    border-radius: 20px;
    cursor: pointer;
  }
`;

export const Cross = styled(CrossIcon)`
  width: 25px;
  height: 25px;
  color: #E73D23;
`;

export const InputFieldContainer = styled.div`
  flex: 2;
  display: flex;
`;

export const InputActionContainer = styled.div`
  display: flex;
  background-color: #f3f3f3;
  border-bottom: 5px solid #DDD;
  margin-left: 0.2rem;
  border-radius: 5px;
  padding: 0.3rem;
  justify-content: center;
  align-items: center;

  &:hover {
    background-color: #DDD;
    cursor: pointer;
  }
`;
