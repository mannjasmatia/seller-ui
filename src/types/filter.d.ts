// Define types for the filter state

export interface FilterProps{
    preferredState: string;
    filter: Partial<FilterState>;
    setFilter: React.Dispatch<React.SetStateAction<Partial<FilterState>>>;
    setFinalFilters: React.Dispatch<React.SetStateAction<Partial<FilterState>>>;
    closeFilterOnMobile: () => void;
    onFilterDataReady?: (businessTypesData: any[], subcategoriesData: any[]) => void;
    businessTypes: BusinessTypes[];
    subcategories: SubCategory[];
}

export interface FilterState {
  businessType?: string;
  subcategories?: string[];
  state?: string;
  minPrice?: string;
  maxPrice?: string;
  isVerified?: boolean;
  deliveryDays?: string;
  minRating?: string;
  minQuantity?: string;
  ratings?: ''|'asc'|'desc';
}

export interface SubCategory{
  _id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  isActive: boolean;
}

export interface BusinessTypes {
    _id: string;
    name: string;
    description?: string;
    status: string;
  }


export interface AppliedFiltersProps {
      filters: Partial<FilterState>;
      clearAllFilters: () => void;
      removeFilter: (key: keyof FilterState | 'search', value?: string) => void; // Change this line
      searchTerm?: string | null;
      businessTypes: { _id: string; name: string }[];
      subcategories: { _id: string; name: string }[];
    }