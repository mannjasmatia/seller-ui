import { useQuery } from "@tanstack/react-query";
import { getBusinessTypes } from "../api/businessType";

/**
 * Custom hook for getting business types
 */
export const useGetBusinessTypesApi = () => {
  return useQuery({
    queryKey: ["getBusinessTypes"],
    queryFn: () => getBusinessTypes(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    select: (data:any) => {
            return data?.data?.response
        }
  });
};
