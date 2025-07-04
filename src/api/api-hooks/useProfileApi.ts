import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as profileApi from "../api/profile";
import { ProfileFormState } from "../../pages/profile/types.profile";

/**
 * Custom hook for getting user profile
 */
export const useGetProfileApi = () => {
  return useQuery({
    queryKey: ["getProfile"],
    queryFn: () => profileApi.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    select:(data)=> data?.data?.response as ProfileFormState
  });
};

/**
 * Custom hook for updating user profile
 */
export const useUpdateProfileApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: FormData | Record<string, any>) => profileApi.updateProfile(data),
    onSuccess: () => {
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: ["getProfile"] });
      queryClient.invalidateQueries({ queryKey: ["verifyTokens"] });
    },
  });
};