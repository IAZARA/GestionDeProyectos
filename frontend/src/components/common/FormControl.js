import React from 'react';
import styled, { css } from 'styled-components';

const FormControlWrapper = styled.div`
  margin-bottom: 1.5rem;
  width: 100%;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const inputStyles = css`
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #1F2937;
  background-color: #fff;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  
  &:focus {
    border-color: #3B82F6;
    outline: 0;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
  }
  
  &:disabled {
    background-color: #F3F4F6;
    opacity: 0.65;
  }
  
  ${props => props.error && css`
    border-color: #EF4444;
    
    &:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.25);
    }
  `}
`;

const StyledInput = styled.input`
  ${inputStyles}
`;

const StyledTextarea = styled.textarea`
  ${inputStyles}
  min-height: 100px;
  resize: vertical;
`;

const StyledSelect = styled.select`
  ${inputStyles}
  padding-right: 2rem;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20' stroke='%236B7280'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
`;

const HelperText = styled.div`
  margin-top: 0.25rem;
  font-size: 0.75rem;
  
  ${props => props.error ? css`
    color: #EF4444;
  ` : css`
    color: #6B7280;
  `}
`;

const Input = ({ id, label, helperText, error, ...props }) => {
  return (
    <FormControlWrapper>
      {label && <Label htmlFor={id}>{label}</Label>}
      <InputWrapper>
        <StyledInput id={id} error={!!error} {...props} />
      </InputWrapper>
      {(helperText || error) && (
        <HelperText error={!!error}>{error || helperText}</HelperText>
      )}
    </FormControlWrapper>
  );
};

const Textarea = ({ id, label, helperText, error, ...props }) => {
  return (
    <FormControlWrapper>
      {label && <Label htmlFor={id}>{label}</Label>}
      <InputWrapper>
        <StyledTextarea id={id} error={!!error} {...props} />
      </InputWrapper>
      {(helperText || error) && (
        <HelperText error={!!error}>{error || helperText}</HelperText>
      )}
    </FormControlWrapper>
  );
};

const Select = ({ id, label, children, helperText, error, ...props }) => {
  return (
    <FormControlWrapper>
      {label && <Label htmlFor={id}>{label}</Label>}
      <InputWrapper>
        <StyledSelect id={id} error={!!error} {...props}>
          {children}
        </StyledSelect>
      </InputWrapper>
      {(helperText || error) && (
        <HelperText error={!!error}>{error || helperText}</HelperText>
      )}
    </FormControlWrapper>
  );
};

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  cursor: pointer;
  width: 1rem;
  height: 1rem;
  color: #3B82F6;
  border: 1px solid #D1D5DB;
  border-radius: 0.25rem;
  
  &:checked {
    background-color: currentColor;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
`;

const FormControl = {
  Input,
  Textarea,
  Select,
  Checkbox,
  CheckboxLabel
};

export default FormControl;
