import { createContext, useContext } from "react";
import { ProductContextValue } from "./type";

export const ProductContext = createContext<ProductContextValue | null>(null)

export function useProduct()
{
    const context = useContext(ProductContext)
    if (!context)
        throw new Error("useProduct must be use within ProductContext")
    return context;
}