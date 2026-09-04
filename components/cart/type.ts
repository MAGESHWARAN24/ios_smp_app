import { AdditionalOptionItem, ImageOptionItem } from "@/types"
import { PropsWithChildren } from "react"

export interface CartItemData
{
    id: string
    optionType: string
    instruction: string
    quantity: number
    product: string
    productDescription: string
    productImage: string
    unitPrice: number
    price: number
    cellCount: number
    noOfUnits: number
    designFiles: ImageOptionItem[]
    otherSpecification: string[]
    otherSpecificationOptions: AdditionalOptionItem[]
}

export interface CartInfo
{
    totalItems: number
    totalAmount: number
    totalWalletAmount: number
    creditBalance: number
}

export interface UpdateCartItem
{
    id: string
    otherSpecification: string[]
    noOfUnits: number
    instruction: string
}

export interface CartContextValue
{
    cart: CartInfo
    updateCartItemAsync: (payload: UpdateCartItem) => Promise<void>
    removeToCartItemAsync: (id: string) => Promise<void>
    fetchData: () => Promise<void>
    loading: boolean
}

export interface CartProviderProps extends PropsWithChildren
{

}