import { api } from '@/lib/api';
import { debounce } from '@/lib/debounce';
import { AxiosError } from 'axios';
import { useCallback, useEffect, useMemo, useState, type FC, type PropsWithChildren } from 'react';
import { useApiAction } from '../api-actions/hook';
import { AddressContext } from './config';
import { Address } from './type';

interface ProviderProps extends PropsWithChildren { }

const Provider: FC<ProviderProps> = ({ children }) =>
{
    const { apiActionAsync } = useApiAction()
    const [addressId, setAddressId] = useState<string>("")
    const [items, setItems] = useState<Address[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    const debouncedFilter = useMemo(
        () =>
            debounce(
                async (searchString: string = "") =>
                {
                    await fetchData(searchString)
                },
                500
            ),
        []
    );

    const fetchData = useCallback(async (searchString: string = "") =>
    {
        try
        {
            setLoading(true)
            const payload = {
                "viewId": "",
                "sorting": [],
                "columnFilters": [],
                "searchString": "",
                "pageNumber": 1,
                "pageSize": 10000
            }
            const response = await api.post(`customeraddresses/pagedresult?pageSize=10000&pageNumber=1&searchString=${searchString}`, payload)
            if (response.status == 200 && response.data)
            {
                setItems(response.data.items ?? [])
            }
        } catch (error)
        {
            if (error instanceof AxiosError && error.response)
            {
                await apiActionAsync(error.response)
            }
        }
        finally
        {
            setLoading(false)
        }
    }, [])

    const getBillingAddress = useCallback(async () =>
    {
        try
        {
            setLoading(true)
            const response = await api.get(`customeraddresses/getbillingaddress`)
            if (response.status == 200 && response.data)
            {
                if (response.data.value)
                    setAddressId(response.data.value)
            }
        } catch (error)
        {
            if (error instanceof AxiosError && error.response)
            {
                await apiActionAsync(error.response)
            }
        }
        finally
        {
            setLoading(false)
        }
    }, [setAddressId])

    useEffect(() =>
    {
        (async () =>
        {
            await Promise.all([
                fetchData(""),
                getBillingAddress()
            ])
        })()
    }, [])

    return (
        <AddressContext.Provider value={{ items, fetchData, loading, addressId, setAddressId, debouncedFilter }}>
            {children}
        </AddressContext.Provider>
    );
}

export default Provider;
