import z from "zod";
import { designFileSchema } from "../design-file-upload/config";
import { DesignFileProduct } from "./type";


export const formSchema = z.object({
    id: z.string().optional(),
    customerId: z.string().optional(),
    productId: z.string().nonempty("Product ID is required"),
    quantityId: z.string().nonempty("Quantity is required"),
    instruction: z.string(),
    otherSpecification: z.array(z.string()),
    attachments: z.array(designFileSchema),
    imageUrl: z.string().optional()
})

export const defaultValue: DesignFileProduct = {
    id: "",
    optionType: "",
    noOfQuantity: 0,
    noOfAttachment: 0,
    name: "",
    skucode: "",
    description: "",
    productImage: { label: "", value: "" },
    producType: { label: "", value: "" },
    classification: { label: "", value: "" },
    gsm: { label: "", value: "" },
    media: { label: "", value: "" },
    lamination: { label: "", value: "" },
    prinitingSide: { label: "", value: "" },
    foilType: { label: "", value: "" },
    foilSide: { label: "", value: "" },
    spotUV: { label: "", value: "" },
    coverType: { label: "", value: "" },
    pad: { label: "", value: "" },
    diecut: { label: "", value: "" },
    finishSize: { label: "", value: "", height: 0, width: 0 },
    uploadDimensions: { label: "", value: "", height: 0, width: 0 },
    quantity: { label: "", value: "" },
    turnAroundDays: "",
    price: 0,
    otherSpecifications: [],
    basePrice: 0,
    attachments: [],
    helperText: "",
    helperLink: ""
}

export type FormSchemaType = z.infer<typeof formSchema>