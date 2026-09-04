import { LucideIcon } from "lucide-react-native"

export interface OptionItem
{
    label: string
    value: any
}

export interface PriceOptionItem extends OptionItem
{
    price: number
}

export interface ImageOptionItem extends OptionItem
{
    description: string
}

export interface PrintingOptionItem extends OptionItem
{
    noOfAttachment: number
}

export interface DimensionOptionItem extends OptionItem
{
    height: number
    width: number
}

export interface AdditionalOptionItem extends OptionItem
{
    minQuantity: number
    price: number
}

export interface AttachmentOptionItem extends OptionItem
{
    height: number
    width: number
}

export interface QuantityOptionItem extends OptionItem
{
    quantity: number
}

export interface IconOptionItem extends OptionItem
{
    icon: LucideIcon
}


export type DataType =
    | "text"
    | "numeric"
    | "boolean"
    | "array"
    | "date"
    | "time"
    | "file"
    | "html"
    | 'currency'
    | "json"
    | "decimal"


export type FilterOptionItem = Record<string, OptionItem[]>

export type Logic =
    | "AND"
    | "OR"

export type MatchCase =
    | "="
    | "!="
    | "<>"
    | "<"
    | "<="
    | ">"
    | ">="
    | "IS NULL"
    | "IS NOT NULL"
    | "IS NULL OR ''"
    | "IS NULL OR '[]'"
    | "IS NOT NULL AND ''"
    | "IS NOT NULL AND '[]'"
    | "IN"
    | "NOT IN"
    | "LIKE"
    | "NOT LIKE"
    | "BETWEEN"
    | "None"

export interface Rules
{
    logic: Logic
    value: any
    alias: string
    dataType: DataType
    matchCase: MatchCase;
}

export interface Filter
{
    id: string
    value: Rules
}

export interface PagedResult<T>
{
    items: T[]
    totalItems: number
    maxNavigationPages: number
    pageNumber: number
    pageSize: number
    totalPages: number
    startPage: number
    endPage: number
    pageNumbers: number[]
}