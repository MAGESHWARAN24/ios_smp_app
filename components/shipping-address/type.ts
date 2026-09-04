import { OptionItem, PagedResult } from "@/types"

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


export interface ShippingAddressContextValue
{
    fetchData: (searchString: string, pageSize: number, pageNumber: number) => Promise<void>
    address: PagedResult<Address>
    loading: boolean
    debouncedFilter: (searchString: string) => void
}