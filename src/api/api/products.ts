import { ProductsQueryParams, ProductsResponse } from "../../pages/products/types.products";
import { apiPaths } from "../api-service/apiPaths";
import ApiService from "../api-service/ApiService";

export const getProducts = async (params: ProductsQueryParams) => {

  return ApiService({
        method: 'GET',
        endpoint: apiPaths.product.all,
        params,
    })
};