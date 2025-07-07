import { useFetchAllCategoriesApi } from "../../api/api-hooks/useCategoryApi";
import Dropdown from "../BasicComponents/Dropdown";

interface CategoryDropdownProps {
  limit?: number;
  label?: string;
  allowSelectAll?: boolean;
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  mode?: "view" | "edit";
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  limit = 5,
  label,
  allowSelectAll = false,
  selectedCategories,
  onChange,
  placeholder,
  disabled=false,
  mode='edit'
}) => {
  const handleSelection = (categories: string[] | string) => {
    if (Array.isArray(categories)) {
      onChange(categories);
    }
  };

  return (
    <Dropdown
      useQueryHook={useFetchAllCategoriesApi}
      limit={limit}
      disabled={disabled}
      label={label}
      placeholder={placeholder}
      multiSelect
      selectedValues={selectedCategories}
      onSelectionChange={handleSelection}
      allowSelectAll={allowSelectAll}
      transformItem={(item) => ({ value: item._id || item.id, label: item.name || item.label })}
    />
  );
};

export default CategoryDropdown;
