import { PriceOptionItem } from "@/types";
import { OptionItem } from "@/types"
import { ElementType } from "react"

export interface PaymentOptionBadge
{
    text: string
    variant: "default" | "outline" | "secondary"
}

export interface PaymentOption extends OptionItem
{
    icon: ElementType,
    description: string
    badge: PaymentOptionBadge | null
    disabled: boolean
    amount: number
    additionalText: string
    balance: number
}

export interface CheckoutItems
{
    id: string;
    product: string;
    fileName: string;
    productImage: string;
    quantity: string;
    noOfUnits: number;
    productPrice: number;
    otherSpecificationPrice: number;
    isCheckout: boolean;
}

export interface CheckoutSummary
{
    totalAmount: number;
    totalWalletAmount: number;
    totalItemToCheckout: number;
    totalShippingAmount: number;
}


export interface CheckoutContextValue
{
    courier: PriceOptionItem[]
    summary: CheckoutSummary
    items: CheckoutItems[]
    fetchSummary: (addressId: string, courierId: string) => Promise<void>
    fetchCheckoutItems: () => Promise<void>
    fetchCourier: (addressId: string) => Promise<void>
}