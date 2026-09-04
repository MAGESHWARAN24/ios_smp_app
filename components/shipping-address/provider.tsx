import { api } from '@/lib/api';
import { debounce } from '@/lib/debounce';
import { PagedResult } from '@/types';
import { AxiosError } from 'axios';
import { useCallback, useEffect, useMemo, useState, type FC, type PropsWithChildren } from 'react';
import { useApiAction } from '../api-actions/hook';
import { ShippingAddressContext } from './config';
import { Address } from './type';

interface ProviderProps extends PropsWithChildren { }

const PAGE_SIZE = 12;

const EMPTY_RESULT: PagedResult<Address> = {
    endPage: 0,
    items: [],
    maxNavigationPages: 5,
    pageNumber: 0,
    pageNumbers: [],
    pageSize: 0,
    startPage: 0,
    totalItems: 0,
    totalPages: 0,
};


const Provider: FC<ProviderProps> = ({ children }) =>
{
    const { apiActionAsync } = useApiAction()
    const [address, setAddress] = useState<PagedResult<Address>>(EMPTY_RESULT)
    const [loading, setLoading] = useState<boolean>(true)

    const debouncedFilter = useMemo(
        () =>
            debounce(
                async (searchString: string = "") =>
                {
                    await fetchData(searchString, 25, 1)
                },
                500
            ),
        []
    );

    const fetchData = useCallback(async (searchString: string = "", pageSize: number = 25, pageNumber: number = 1) =>
    {
        try
        {
            setLoading(true)
            const payload = {
                "viewId": "",
                "sorting": [
                    {
                        id: "customeraddresses.id",
                        desc: true
                    }
                ],
                "columnFilters": [],
                "searchString": "",
                "pageNumber": 1,
                "pageSize": 10000
            }
            const response = await api.post(`customeraddresses/pagedresult?pageSize=${pageSize}&pageNumber=${pageNumber}&searchString=${searchString}`, payload)
            if (response.status == 200 && response.data)
            {
                setAddress(response.data)
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


    useEffect(() =>
    {
        fetchData("")
    }, [])

    return (
        <ShippingAddressContext.Provider value={{ debouncedFilter, fetchData, address, loading }}>
            {children}
        </ShippingAddressContext.Provider>
    );
}

export default Provider;
