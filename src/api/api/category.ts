import { apiPaths } from "../api-service/apiPaths"
import ApiService from "../api-service/ApiService"


// ============================================================Category API=======================================================
export const fetchAll = (params:any) => {
    return ApiService({
        method: 'GET',
        endpoint: apiPaths.category.all,
        params
    })
}