import z from "zod";
import { designFileSchema } from "../design-file-upload/config";
import { AvailableOptions, ItemPrice, OptionVisibility, ProductConfigOptions, SelectableFieldKey } from "./type";

export const defaultOptions: ProductConfigOptions = {
    attachments: [],
    id: "",
    optionType: "",
    sizeFormat: "",
    helperText: "",
    helperLink: "",
    noOfAttachment: 0,
    name: "",
    description: "",
    minQuantity: "",
    price: 0,
    optionVisibility: {
        isGsm: false,
        isMedia: false,
        isLamination: false,
        isPrintingSide: false,
        isFoilSide: false,
        isSpotUV: false,
        isFoilType: false,
        isPad: false,
        isPouch: false,
        isDiecut: false,
        isQuantity: false,
        isFinishSize: false,
        isCoverType: false,
        isFileFinishing: false
    },
    productImage: { label: "", value: "" },
    producType: { label: "", value: "" },
    classification: { label: "", value: "" },
    gsm: [],
    media: [],
    lamination: [],
    printingSide: [],
    finishSize: [],
    quantity: [],
    foilSide: [],
    foilType: [],
    spotUV: [],
    coverType: [],
    pad: [],
    dieCut: [],
    otherSpecifications: [],
    pouch: [],
    fileFinishing: [],
    productQuantityId: "",
    mobileDescription: "Classic glossy finish visiting cards with a smooth, shiny surface that makes colors pop."
}

const optionVisibilitySchema = z.object({
    isGsm: z.coerce.boolean<boolean>(),
    isMedia: z.coerce.boolean<boolean>(),
    isLamination: z.coerce.boolean<boolean>(),
    isPrintingSide: z.coerce.boolean<boolean>(),
    isFoilSide: z.coerce.boolean<boolean>(),
    isSpotUV: z.coerce.boolean<boolean>(),
    isFoilType: z.coerce.boolean<boolean>(),
    isPad: z.coerce.boolean<boolean>(),
    isPouch: z.coerce.boolean<boolean>(),
    isDiecut: z.coerce.boolean<boolean>(),
    isQuantity: z.coerce.boolean<boolean>(),
    isFinishSize: z.coerce.boolean<boolean>(),
    isCoverType: z.coerce.boolean<boolean>(),
    isFileFinishing: z.coerce.boolean<boolean>()
})

export const formSchema = z.object({
    customerId: z.string().optional(),
    productId: z.string().nonempty("Product is required"),
    mediaId: z.string().optional(),
    gsmId: z.string().optional(),
    laminationId: z.string().optional(),
    printingSideId: z.string().optional(),
    finishSizeId: z.string().optional(),
    quantityId: z.string().optional(),
    spotUVId: z.string().optional(),
    foilTypeId: z.string().optional(),
    foilSideId: z.string().optional(),
    coverTypeId: z.string().optional(),
    pouchId: z.string().optional(),
    padId: z.string().optional(),
    dieCutId: z.string().optional(),
    fileFinishingId: z.string().optional(),
    productQuantityId: z.string().nonempty("Quantity is required"),
    instruction: z.string(),
    otherSpecification: z.array(z.string()),
    productUploadFileDimensionsId: z.string().optional(),
    attachments: z.array(designFileSchema),
    optionVisibility: optionVisibilitySchema,
}).superRefine((data, ctx) =>
{
    const { optionVisibility: v } = data

    const visibilityRules: [boolean, keyof typeof data, string][] = [
        [v.isGsm, "gsmId", "GSM is required"],
        [v.isMedia, "mediaId", "Media is required"],
        [v.isLamination, "laminationId", "Lamination is required"],
        [v.isPrintingSide, "printingSideId", "Printing side is required"],
        [v.isFoilSide, "foilSideId", "Foil side is required"],
        [v.isSpotUV, "spotUVId", "Spot UV is required"],
        [v.isFoilType, "foilTypeId", "Foil type is required"],
        [v.isPad, "padId", "Pad is required"],
        [v.isPouch, "pouchId", "Pouch is required"],
        [v.isDiecut, "dieCutId", "Die cut is required"],
        [v.isQuantity, "quantityId", "Quantity is required"],
        [v.isFinishSize, "finishSizeId", "Finish size is required"],
        [v.isCoverType, "coverTypeId", "Cover type is required"],
    ]

    for (const [isVisible, field, message] of visibilityRules)
    {
        if (isVisible && !data[field])
        {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message,
                path: [field],
            })
        }
    }
})

export function isOptionDisabled(available: string[] | undefined, value: string): boolean
{
    if (available === undefined) return false
    if (available.length === 0) return false
    return !available.includes(value)
}

export function toggleValue(current: string | undefined, next: string): string
{
    return current === next ? "" : next
}

export const FACET_DEFINITIONS: Array<{
    fieldKey: SelectableFieldKey
    propertyName: string
    resultKey: keyof AvailableOptions
    visibilityKey: keyof OptionVisibility
}> = [
        { fieldKey: "mediaId", propertyName: "mediaId", resultKey: "media", visibilityKey: "isMedia" },
        { fieldKey: "gsmId", propertyName: "gsmId", resultKey: "gsm", visibilityKey: "isGsm" },
        { fieldKey: "laminationId", propertyName: "laminationId", resultKey: "lamination", visibilityKey: "isLamination" },
        { fieldKey: "printingSideId", propertyName: "printingSideId", resultKey: "printingSide", visibilityKey: "isPrintingSide" },
        { fieldKey: "finishSizeId", propertyName: "finishSizeId", resultKey: "finishSize", visibilityKey: "isFinishSize" },
        { fieldKey: "quantityId", propertyName: "quantityId", resultKey: "quantity", visibilityKey: "isQuantity" },
        { fieldKey: "foilSideId", propertyName: "foilSideId", resultKey: "foilSide", visibilityKey: "isFoilSide" },
        { fieldKey: "foilTypeId", propertyName: "foilTypeId", resultKey: "foilType", visibilityKey: "isFoilType" },
        { fieldKey: "spotUVId", propertyName: "spotUVId", resultKey: "spotUV", visibilityKey: "isSpotUV" },
        { fieldKey: "padId", propertyName: "padId", resultKey: "pad", visibilityKey: "isPad" },
        { fieldKey: "dieCutId", propertyName: "dieCutId", resultKey: "dieCut", visibilityKey: "isDiecut" },
        { fieldKey: "pouchId", propertyName: "pouchId", resultKey: "pouch", visibilityKey: "isPouch" },
        { fieldKey: "coverTypeId", propertyName: "coverTypeId", resultKey: "coverType", visibilityKey: "isCoverType" },
        { fieldKey: "fileFinishingId", propertyName: "fileFinishingId", resultKey: "fileFinishing", visibilityKey: "isFileFinishing" },
    ]

export type CartFormSchemaType = z.infer<typeof formSchema>


export const defaultCartFormValue: CartFormSchemaType = {
    productId: "",
    productQuantityId: "",
    instruction: "",
    otherSpecification: [],
    attachments: [],
    optionVisibility: {
        isGsm: false,
        isMedia: false,
        isLamination: false,
        isPrintingSide: false,
        isFoilSide: false,
        isSpotUV: false,
        isFoilType: false,
        isPad: false,
        isPouch: false,
        isDiecut: false,
        isQuantity: false,
        isFinishSize: false,
        isCoverType: false,
        isFileFinishing: false
    },
    coverTypeId: "",
    customerId: "",
    dieCutId: "",
    fileFinishingId: "",
    finishSizeId: "",
    foilSideId: "",
    foilTypeId: "",
    gsmId: "",
    laminationId: "",
    mediaId: "",
    padId: "",
    pouchId: "",
    printingSideId: "",
    productUploadFileDimensionsId: "",
    quantityId: "",
    spotUVId: ""
}

export const itemPriceDefaultValue: ItemPrice = {
    id: "",
    description: "",
    price: 0,
    basePrice: 0,
    helperText: "",
    helperLink: "",
    turnAroundDays: "",
    quantity: { label: "", value: "" },
    shortDescription: "",
    isValid: false,
    minQuantity: ""
}

export const defaultAvailableOptions: AvailableOptions = {
    coverType: [],
    dieCut: [],
    fileFinishing: [],
    finishSize: [],
    foilSide: [],
    foilType: [],
    gsm: [],
    lamination: [],
    media: [],
    pad: [],
    pouch: [],
    printingSide: [],
    quantity: [],
    spotUV: []
}