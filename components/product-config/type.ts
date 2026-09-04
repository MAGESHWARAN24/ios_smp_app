import { AdditionalOptionItem, AttachmentOptionItem, DimensionOptionItem, OptionItem, PrintingOptionItem, QuantityOptionItem } from "@/types"
import { DesignFileSchemaType } from "../design-file-upload/config"
import { CartFormSchemaType } from "./config"


export interface ProductOptionVisibility
{
    isGsm: boolean
    isMedia: boolean
    isLamination: boolean
    isPrintingSide: boolean
    isFoilSide: boolean
    isSpotUV: boolean
    isFoilType: boolean
    isPad: boolean
    isPouch: boolean
    isDiecut: boolean
    isQuantity: boolean
    isFinishSize: boolean
    isCoverType: boolean
    isFileFinishing: boolean
}

export interface ProductConfigOptions
{
    id: string
    mobileDescription: string
    optionType: string
    sizeFormat: string
    helperText: string
    helperLink: string
    noOfAttachment: number
    name: string
    description: string
    minQuantity: string
    price: number
    optionVisibility: ProductOptionVisibility
    productImage: OptionItem
    producType: OptionItem
    classification: OptionItem
    gsm: OptionItem[]
    media: OptionItem[]
    lamination: OptionItem[]
    printingSide: PrintingOptionItem[]
    finishSize: DimensionOptionItem[]
    quantity: OptionItem[]
    foilSide: OptionItem[]
    foilType: OptionItem[]
    spotUV: OptionItem[]
    coverType: OptionItem[]
    pad: OptionItem[]
    dieCut: OptionItem[]
    attachments: OptionItem[]
    otherSpecifications: AdditionalOptionItem[]
    pouch: OptionItem[]
    fileFinishing: OptionItem[]
    productQuantityId: string
}

export interface ItemPrice
{
    id: string
    description: string
    price: number
    basePrice: number,
    helperText: string
    helperLink: string
    turnAroundDays: string
    quantity: OptionItem
    shortDescription: string
    isValid: boolean
    minQuantity: string
}

export type AvailableOptions = Record<
    | "media" | "gsm" | "lamination" | "fileFinishing" | "printingSide"
    | "finishSize" | "quantity" | "pouch" | "foilType" | "foilSide"
    | "spotUV" | "coverType" | "pad" | "dieCut",
    string[]>

export type SelectableFieldKey =
    | "mediaId" | "gsmId" | "laminationId" | "fileFinishingId"
    | "printingSideId" | "finishSizeId" | "quantityId" | "pouchId"
    | "foilTypeId" | "foilSideId" | "spotUVId" | "coverTypeId"
    | "padId" | "dieCutId"

export type OptionVisibility = CartFormSchemaType["optionVisibility"]

export interface ProductCombination
{
    product: ItemPrice[]
    gsm: OptionItem[]
    media: OptionItem[]
    lamination: OptionItem[]
    printingSide: AttachmentOptionItem[]
    finishSize: DimensionOptionItem[]
    quantity: QuantityOptionItem[]
    foilSide: AttachmentOptionItem[];
    foilType: OptionItem[];
    spotUV: AttachmentOptionItem[];
    coverType: OptionItem[];
    pad: OptionItem[];
    dieCut: OptionItem[];
    pouch: OptionItem[]
    attachments: DesignFileSchemaType[]
    fileFinishing: OptionItem[]
    additionProcessing: OptionItem[]
    uploadDimensions: DimensionOptionItem[]
}
