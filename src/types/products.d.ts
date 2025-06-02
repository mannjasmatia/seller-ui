import { Category } from "./categories";
import { Seller } from "./seller";

export interface ProductProps {
    querySet: {
        queryKey: string | unknown[];
        queryFn: () => Promise<Product[]>;
    };
}

export interface Product {
    _id: string;
    name: string;
    slug?: string;
    description?: string;
    avgRating?: number;
    ratingsCount?: number;
    seller?: Seller;
    images?: string[];
    about?: string[];
    services?: string[];
    minPrice?: number;
    maxPrice?: number;
    moq?: number;
    categoryId?: Category;
    isVerified?: boolean;
    deliveryDays?:number;
    isCustomizable?:boolean;
    isLiked?: boolean;
    stock?: number;
    state?: string;
}
