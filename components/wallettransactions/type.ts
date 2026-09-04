import { OptionItem } from "@/types";

export interface WalletTransaction
{
    id: string;
    orderId: OptionItem
    paymentModeId: OptionItem
    transactionTypeId: OptionItem
    amount: number;
    openingBalance: number;
    closingBalance: number;
    referenceNo: string;
    remarks: string;
    createdby: string;
    createdon: string;
    updatedby: string;
    updatedon: string;
}