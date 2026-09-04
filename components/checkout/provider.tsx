import { api } from '@/lib/api';
import { PriceOptionItem } from '@/types';
import { AxiosError } from 'axios';
import { useCallback, useState, type FC, type PropsWithChildren } from 'react';
import { useApiAction } from '../api-actions/hook';
import { CheckoutContext } from './config';
import { CheckoutItems, CheckoutSummary } from './type';

interface ProviderProps extends PropsWithChildren
{

}

const Provider: FC<ProviderProps> = ({ children }) =>
{
    const { apiActionAsync } = useApiAction()
    const [summary, setSummary] = useState<CheckoutSummary>({
        totalAmount: 0,
        totalItemToCheckout: 0,
        totalShippingAmount: 0,
        totalWalletAmount: 0
    })
    const [loading, setLoading] = useState<boolean>(false)
    const [items, setItems] = useState<CheckoutItems[]>([])
    const [courier, setCourier] = useState<PriceOptionItem[]>([])
    const fetchSummary = useCallback(async (addressId: string, courierId: string) =>
    {
        try
        {
            setLoading(true)
            const response = await api.get(`checkout/info?addressId=${addressId}&shippingProviderId=${courierId}`)
            if (response.status == 200 && response.data)
            {
                setSummary(response.data)
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

    const fetchCheckoutItems = useCallback(async () =>
    {
        try
        {
            setLoading(true)
            const response = await api.get(`checkout/getcheckoutproduct`)
            if (response.status == 200 && response.data)
            {
                setItems(response.data)
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
    const fetchCourier = useCallback(async (addressId: string) =>
    {
        try
        {
            setLoading(true)
            const response = await api.get(`checkout/couriercharges?addressId=${addressId}`)
            if (response.status == 200 && response.data)
            {
                setCourier(response.data)
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

    return (
        <CheckoutContext.Provider value={{ summary, items, fetchCheckoutItems, fetchSummary, fetchCourier, courier }}>
            {children}
        </CheckoutContext.Provider>
    );
}

export default Provider;
