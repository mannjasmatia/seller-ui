import { Product } from "../types/products";

export const removeDuplicateProducts = (list: Product[]) => {
    const map = new Map<string,Product>();

     list && list.length>0 && list.forEach((product) => {
      map.set(product._id, product);
    });
  
    return Array.from(map.values());
  };
  
  