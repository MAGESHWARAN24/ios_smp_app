import { OptionItem } from "@/types"
import { Dispatch, SetStateAction } from "react"

export interface Address
{
    id: string
    customerId: OptionItem
    addressTypeId: OptionItem
    addressReferenceName: string
    contactPersonName: string
    addressLine1: string
    addressLine2: string
    mobileNo: string
    cityId: OptionItem
    districtId: OptionItem
    stateId: OptionItem
    countryId: OptionItem
    pincodeId: OptionItem
    address: string
}


export interface AddressContextValue
{
    addressId: string
    setAddressId: Dispatch<SetStateAction<string>>
    fetchData: (searchString: string) => Promise<void>
    items: Address[]
    loading: boolean
    debouncedFilter: (searchString: string) => void
}