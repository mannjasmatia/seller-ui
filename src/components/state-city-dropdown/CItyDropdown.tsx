// src/components/location-dropdowns/CityDropdown.tsx
import React from 'react';
import { City } from 'country-state-city';
import Dropdown from '../BasicComponents/Dropdown';

interface CityDropdownProps {
  label?: string;
  selectedCity: string;
  selectedState: string;
  onChange: (city: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

const CityDropdown: React.FC<CityDropdownProps> = ({
  label = 'City',
  selectedCity,
  selectedState,
  onChange,
  placeholder = 'Select city',
  disabled = false,
  error,
}) => {
  const getCitiesForState = () => {
    if (!selectedState) return [];
    return City.getCitiesOfState('CA', selectedState).map(city => ({
      value: city.name,
      label: city.name,
    }));
  };

  const handleSelection = (city: string[] | string) => {
    if (!Array.isArray(city)) {
      onChange(city);
    }
  };

  return (
    <div>
      <Dropdown
        label={label}
        defaultValues={getCitiesForState()}
        placeholder={placeholder}
        selectedValues={selectedCity}
        onSelectionChange={handleSelection}
        allowSelectAll={false}
        disabled={disabled || !selectedState}
        transformItem={(item) => ({ value: item.value, label: item.label })}
      />
      {error && <p className="text-cb-red text-sm mt-1">{error}</p>}
    </div>
  );
};

export default CityDropdown;