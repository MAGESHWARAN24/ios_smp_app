import { ImageOptionItem } from "@/types";

export interface ProductTypeItem
{
    label: string
    value: string
}

export interface ProductFilterItem
{
    searchString: string
    productTypeId: string
}

export interface ProductItem
{
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    productType: string;
    productTypeId: string;
    category: string;
}

export interface Catalog
{
    types: ImageOptionItem[]
    products: ProductItem[]
}

export interface ProductContextValue
{
    items: Catalog
    applyFilter: (payload: ProductFilterItem) => void
    resetFilter: () => void
    filter: ProductFilterItem
    loading: boolean
}