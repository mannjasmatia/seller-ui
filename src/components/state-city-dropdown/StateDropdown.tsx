// src/components/location-dropdowns/StateDropdown.tsx
import React from 'react';
import { State } from 'country-state-city';
import Dropdown from '../BasicComponents/Dropdown';

interface StateDropdownProps {
  label?: string;
  selectedState: string;
  onChange: (state: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

const StateDropdown: React.FC<StateDropdownProps> = ({
  label = 'Province/Territory',
  selectedState,
  onChange,
  placeholder = 'Select province or territory',
  disabled = false,
  error,
}) => {
  const canadianStates = State.getStatesOfCountry('CA').map(state => ({
    value: state.isoCode,
    label: state.name,
  }));

  const handleSelection = (state: string[] | string) => {
    if (!Array.isArray(state)) {
      onChange(state);
    }
  };

  return (
    <div>
      <Dropdown
        label={label}
        defaultValues={canadianStates}
        placeholder={placeholder}
        selectedValues={selectedState}
        onSelectionChange={handleSelection}
        allowSelectAll={false}
        disabled={disabled}
        transformItem={(item) => ({ value: item.value, label: item.label })}
      />
      {error && <p className="text-cb-red text-sm mt-1">{error}</p>}
    </div>
  );
};

export default StateDropdown;