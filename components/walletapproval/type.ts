import { OptionItem } from "@/types";

export interface WalletApproval
{
    id: string;
    fullName: string;
    companyName: string;
    proofUrl: string;
    transactionReferenceNo: string;
    walletReferenceNo: string;
    amount: number;
    isApproved: boolean;
    paymentModeId: string;
    status: string;
    createdOn: string;
    statusId: OptionItem;
    remarks: string;
}