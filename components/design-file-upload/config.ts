import { api } from "@/lib/api";
import { AxiosError } from "axios";
import z from "zod";
import { PickedFile } from "./design-file-upload";

export const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
export const MAX_SIZE = 500 * 1024 * 1024;
export const MAX_FILES = 1

export const designFileSchema = z.object({
    imageTypeId: z.string(),
    imageTypeName: z.string(),
    document: z.custom<PickedFile | undefined>()
        .superRefine((data, ctx) =>
        {
            if (!data)
            {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Required",
                });
            }
        }),
    documentHeightInPx: z.coerce.number<number>(),
    documentHeightInMM: z.coerce.number<number>(),
    documentWidthInPx: z.coerce.number<number>(),
    documentWidthInMM: z.coerce.number<number>(),
    cellCount: z.coerce.number<number>(),
    isValid: z.coerce.boolean<boolean>(),
    currentDPI: z.coerce.number<number>(),
    colorSpace: z.string().optional(),
    extraChannels: z.coerce.number<number>(),
    totalChannels: z.coerce.number<number>(),
    imageUrl: z.string().optional()
})

export type DesignFileSchemaType = z.infer<typeof designFileSchema>

export interface DPIResponse
{
    isValid: boolean;
    documentHeightInPx: number;
    documentHeightInMM: number;
    documentWidthInPx: number;
    documentWidthInMM: number;
    message: string;
    currentDPI: number;
    cellCount: number;
    align: "vertical" | "horizontal"
    colorSpace: string
    totalChannels: number
    extraChannels: number
    imageUrl: string
}
export async function ValidateDPISeverSideAsync(
    files: PickedFile[],
    height: number = 53,
    width: number = 90,
    cellCount: number = 1,
    previousHeight: number = 0,
    previousWidth: number = 0
): Promise<DPIResponse>
{
    try
    {
        if (files && files.length <= 0)
        {
            return ({
                isValid: false,
                message: "",
                cellCount: 0,
                currentDPI: 0,
                documentHeightInMM: 0,
                documentWidthInMM: 0,
                align: "vertical",
                documentHeightInPx: 0,
                documentWidthInPx: 0,
                colorSpace: "",
                extraChannels: 0,
                totalChannels: 0,
                imageUrl: ""
            })
        }

        const response = await api.post(`dpi/validatedpi`, {
            document: files[0],
            height,
            width,
            cellCount,
            previousHeight,
            previousWidth
        }, {
            headers: {
                "Content-Type": "multipart/form-data",
            }
        })

        if (response.status == 200 && response.data)
        {
            return response.data
        }

        return ({
            isValid: false,
            message: "",
            cellCount: 0,
            currentDPI: 0,
            documentHeightInMM: 0,
            documentWidthInMM: 0,
            align: "vertical",
            documentHeightInPx: 0,
            documentWidthInPx: 0,
            colorSpace: "",
            extraChannels: 0,
            totalChannels: 0,
            imageUrl: ""
        })
    } catch (error)
    {
        if (error instanceof AxiosError && error.response)
        {

            return ({
                isValid: false,
                message: "",
                cellCount: 0,
                currentDPI: 0,
                documentHeightInMM: 0,
                documentWidthInMM: 0,
                align: "vertical",
                documentHeightInPx: 0,
                documentWidthInPx: 0,
                colorSpace: "",
                extraChannels: 0,
                totalChannels: 0,
                imageUrl: ""
            })
        }

        return ({
            isValid: false,
            message: "",
            cellCount: 0,
            currentDPI: 0,
            documentHeightInMM: 0,
            documentWidthInMM: 0,
            align: "vertical",
            documentHeightInPx: 0,
            documentWidthInPx: 0,
            colorSpace: "",
            extraChannels: 0,
            totalChannels: 0,
            imageUrl: ""
        })
    }
}