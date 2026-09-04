import { createContext, useContext } from "react";
import { CheckoutContextValue } from "./type";

export const CheckoutContext = createContext<CheckoutContextValue | null>(null)


export function useCheckout()
{
    const context = useContext(CheckoutContext)
    if (!context)
        throw new Error("useCheckout must be within CheckoutProvider")
    return context;
}

import { Wallet, Zap } from "lucide-react-native";
import { CheckoutSummary } from "../checkout/type";
import { PaymentOption } from "./type";

export const paymentOptions = (CheckoutInfo: CheckoutSummary, canUseWallet: boolean): PaymentOption[] => [
    {
        value: "6e41261d-2f07-880f-e86e-867213454d82",
        icon: Zap,
        label: "CC Avenue",
        description: "UPI, Net banking, Debit & Credit cards",
        badge: { text: "Recommended", variant: "default" },
        amount: (CheckoutInfo.totalAmount + CheckoutInfo.totalShippingAmount),
        disabled: false,
        additionalText: "",
        balance: 0
    },
    {
        value: "79e797dd-f2f7-a472-339c-cf9bdd1fc249",
        icon: Wallet,
        label: "Wallet",
        description: canUseWallet ? `Pay directly from your wallet` : "Not enough to cover total",
        amount: (CheckoutInfo.totalAmount + CheckoutInfo.totalShippingAmount),
        badge: !canUseWallet ? { text: "Insufficient", variant: "secondary" } : { text: "Recommended", variant: "default" },
        disabled: !canUseWallet,
        additionalText: `Available balance`,
        balance: CheckoutInfo.totalWalletAmount
    }
];
