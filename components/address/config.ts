import { createContext, useContext } from "react";
import z from "zod";
import { AddressContextValue } from "./type";

export const AddressContext = createContext<AddressContextValue | null>(null)

export function useAddress()
{
    const context = useContext(AddressContext)
    if (!context)
        throw new Error("useAddress must be within AddressProvider")
    return context;
}

const optionItemSchema = z.object({
    label: z.string(),
    value: z.any()
})

export const formSchema = z.object({
    addressTypeId: optionItemSchema.refine(item => !!item.value, { message: "Address type is required" }),
    addressReferenceName: z.string().nonempty("Address Reference is required"),
    contactPersonName: z.string().nonempty("Contact person is required"),
    addressLine1: z.string().nonempty("Address 1 is required"),
    addressLine2: z.string().optional(),
    mobileNo: z.string().nonempty("Mobile no is required"),
    cityId: optionItemSchema.refine(item => !!item.value, { message: "City is required" }),
    districtId: optionItemSchema.refine(item => !!item.value, { message: "District is required" }),
    stateId: optionItemSchema.refine(item => !!item.value, { message: "State is required" }),
    countryId: optionItemSchema.refine(item => !!item.value, { message: "Country is required" }),
    pincodeId: optionItemSchema.refine(item => !!item.value, { message: "Pincode is required" }),
})

export type AddressFormValues = z.infer<typeof formSchema>;