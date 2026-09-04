import { AdditionalOptionItem, DimensionOptionItem, OptionItem } from "@/types";
import { DesignFileSchemaType } from "../design-file-upload/config";

export interface DesignFileProduct
{
    id: string;
    optionType: string;
    noOfQuantity: number;
    noOfAttachment: number;
    name: string;
    skucode: string;
    description: string;
    productImage: OptionItem
    producType: OptionItem
    classification: OptionItem
    gsm: OptionItem
    media: OptionItem
    lamination: OptionItem
    prinitingSide: OptionItem
    foilType: OptionItem
    foilSide: OptionItem
    spotUV: OptionItem
    coverType: OptionItem
    pad: OptionItem
    diecut: OptionItem
    finishSize: DimensionOptionItem;
    uploadDimensions: DimensionOptionItem;
    quantity: OptionItem
    turnAroundDays: string;
    price: number;
    otherSpecifications: AdditionalOptionItem[];
    basePrice: number;
    attachments: DesignFileSchemaType[];
    helperText: string;
    helperLink: string;
}