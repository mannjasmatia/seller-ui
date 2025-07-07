import { useGetBusinessTypesApi } from "../../api/api-hooks/useBusinessTypeApi";
import Dropdown from "../BasicComponents/Dropdown";

interface BusinessTypeDropdownProps {
    limit?:number;
    label?:string;
    allowSelectAll?:boolean,
    selectedBusinessType: string;
    onChange: (businessTypes: string) => void;
    placeholder?: string;
    disabled?:boolean;
    mode?:'view'| 'edit';
}

const BusinessTypeDropdown : React.FC<BusinessTypeDropdownProps> = ({
    limit=5,
    label,
    allowSelectAll=false,
    disabled=false,
    selectedBusinessType,
    onChange,
    placeholder,
    mode='edit',
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

    if(mode==='view'){
      console.log("View mode : ", getTransformedData()?.filter((b:any)=> b.value === selectedBusinessType as string)[0]?.label)
      return getTransformedData()?.filter((b:any)=> b.value === selectedBusinessType as string)[0]?.label
    }

    return (
        <Dropdown
          label={label}
          disabled={disabled}
          defaultValues={getTransformedData()}
          placeholder={placeholder}
          selectedValues={selectedBusinessType}
          onSelectionChange={handleSelection}
          allowSelectAll={allowSelectAll}
          transformItem={(item) => ({ value: item._id || item.id, label: item.name || item.label })}
        />
    )
}

export default BusinessTypeDropdown;