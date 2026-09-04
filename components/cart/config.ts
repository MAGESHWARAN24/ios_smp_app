import { createContext, useContext } from "react";
import { CartContextValue } from "./type";

export const CartContext = createContext<CartContextValue | null>(null);

export function useCart()
{
    const context = useContext(CartContext)
    if (!context)
        throw new Error("useCart must be use within CartContext")
    return context
}