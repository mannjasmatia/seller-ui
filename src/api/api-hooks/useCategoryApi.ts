import { useQuery, useMutation, } from '@tanstack/react-query';
import * as categoryApi from '../api/category'
import { useSelector } from 'react-redux';
import { ApiResponse } from '../api-service/types.api';


// --------------------------------------------------------------Category API---------------------------------------------------//
export const useFetchAllCategoriesApi = (params:any = {page:"1",limit:"20",search:""}) => {

    const {search, ...finalParams} = params; 

    if(params?.search){
        finalParams.search = params?.search
    }

    return useQuery({
        queryKey: ['fetchAllCategories',params],
        queryFn: () => categoryApi.fetchAll(finalParams),
        gcTime: 1000 * 60 * 1, // 1 minute
        staleTime: 1000 * 60 * 1, // 1 minute
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        select: (data:any) => {
            return data?.data?.response
        }

    })
}