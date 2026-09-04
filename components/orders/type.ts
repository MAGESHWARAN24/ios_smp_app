import { OptionItem } from '@/types';

export interface OrderItem
{
    id: string;
    orderReferenceNumber: string;
    status: string;
    totalAmount: number;
    refundAmount: number;
    subTotalAmount: number;
    shippingAmount: number;
    isPaymentSucceeded: boolean;
    orderDate: string;
    totalItems: number;
    addressReferenceName: string;
    addressLine1: string;
    addressLine2: string;
    mobileNo: string;
    country: string;
    state: string;
    district: string;
    city: string;
    pinCode: string;
    trackingNumber: string;
    shippingProvider: string;
    trackingUrl: string;
    isCustomJob: string;
    customJobId: string;
}


export interface OrderDetails
{
    id: string;
    shippingMethod: string;
    orderDate: string;
    approvedBy: OptionItem;
    orderReferenceNumber: string;
    totalAmount: number;
    isCustomJob: boolean;
    totalItems: number;
    totalShippingAmount: number;
    customJobReferenceNo: string;
    items: OrderLineItem[];
    canceledItems: OrderLineItem[];
    shippingAddress: OrderAddress;
    billingAddress: OrderAddress;
    paymentMode: string;
    isPaymentSucceeded: boolean;
    remarks: string;
}

export interface OrderAddress
{
    contactPersonName: string;
    addressLine1: string;
    addressLine2: string;
    mobileNo: string;
    country: string;
    state: string;
    district: string;
    pinCode: string;
    area: string;
}

export interface OrderLineItem
{
    id: string;
    referecnceNo: string;
    productName: string;
    subProductName: string;
    totalamount: number;
    grandTotal: number;
    subtotalamount: number;
    shippingamount: number;
    additionprocessingamount: number;
    isBatched: boolean;
    designFileUrl: string[];
    batchName: string;
    batchItemStatus: string;
    isCanceled: boolean;
    courierName: string | null;
    trackingUrl: string | null;
    trackingNumber: string | null;
    additionProcessing: string[];
    instruction: string;
    noOfUnits: number;
    customQuantity: number;
    quantity: number;
}