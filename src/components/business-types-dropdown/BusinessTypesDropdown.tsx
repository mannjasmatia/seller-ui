import { useGetBusinessTypesApi } from "../../api/api-hooks/useBusinessTypeApi";
import Dropdown from "../BasicComponents/Dropdown";

interface BusinessTypeDropdownProps {
    limit?:number;
    label?:string;
    allowSelectAll?:boolean,
  selectedBusinessTypes: string;
  onChange: (businessTypes: string) => void;
  placeholder?: string;
}

const BusinessTypeDropdown : React.FC<BusinessTypeDropdownProps> = ({
    limit=5,
    label,
    allowSelectAll=false,
  selectedBusinessTypes,
  onChange,
  placeholder,
})=>{

    const handleSelection = (businessTypes:string[] | string)=>{
        if(!Array.isArray(businessTypes)){
            onChange(businessTypes)
        }
    }

    const {data} = useGetBusinessTypesApi();

    const getTransformedData = ()=>{
      if(!data) {
        return
      }

      const transformedData = data.map((item: any) => ({
        value: item._id || item.id,
        label: item.name || item.label,
      }));

      return transformedData;
    }

    console.log("BUSINESS : ", getTransformedData())

    return (
        <Dropdown
          label={label}
          defaultValues={getTransformedData()}
          placeholder={placeholder}
          selectedValues={selectedBusinessTypes}
          onSelectionChange={handleSelection}
          allowSelectAll={allowSelectAll}
          transformItem={(item) => ({ value: item._id || item.id, label: item.name || item.label })}
        />
    )
}

export default BusinessTypeDropdown;