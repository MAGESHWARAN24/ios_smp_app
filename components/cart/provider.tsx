import { api } from "@/lib/api";
import { AxiosError } from "axios";
import
{
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";
import { useApiAction } from "../api-actions/hook";
import { useAuth } from "../auth/config";
import { CartContext } from "./config";
import type {
    CartInfo,
    CartProviderProps,
    UpdateCartItem
} from "./type";


function Provider({ children }: CartProviderProps)
{
    const { apiActionAsync } = useApiAction();
    const { isAuthenticated = false } = useAuth();
    const [loading, setLoading] = useState<boolean>(true);
    const [cart, setcart] = useState<CartInfo>({
        totalAmount: 0,
        totalItems: 0,
        totalWalletAmount: 0,
        creditBalance: 0
    });

    const removeToCartItemAsync = useCallback(async (id: string) =>
    {
        try
        {
            const response = await api.delete(`cart/delete?id=${id}`);
            if (response.status == 200 && response.data)
            {
                await fetchData()
            }
        } catch (error)
        {
            if (error instanceof AxiosError && error.response)
            {
                await apiActionAsync(error.response);
            }
        }
    }, []);

    const updateCartItemAsync = async (payload: UpdateCartItem) =>
    {
        try
        {
            const response = await api.post(`cart/update?id=${payload.id}`, payload);
            if (response.status == 200 && response.data)
            {
                await fetchData()
                return response.data ?? 0
            }
            return 0;
        } catch (error)
        {
            if (error instanceof AxiosError && error.response)
            {
                await apiActionAsync(error.response);
                return 0;
            }
            return 0;
        }
    }

    const fetchData = async () =>
    {
        (async () =>
        {
            try
            {
                const response = await api.get(`cart/info`);
                if (response.status == 200 && response.data)
                {
                    setcart(response.data);
                }
            } catch (error)
            {
                if (error instanceof AxiosError && error.response)
                {
                    await apiActionAsync(error.response);
                }
            }
            finally
            {
                setLoading(false)
            }
        })();
    };

    useEffect(() =>
    {
        if (!isAuthenticated) return;
        fetchData();
    }, [isAuthenticated]);

    const contextValue = useMemo(
        () => ({
            removeToCartItemAsync,
            updateCartItemAsync,
            loading,
            cart,
            fetchData
        }),
        [
            loading,
            cart,
            updateCartItemAsync,
            removeToCartItemAsync,
            fetchData,
        ],
    );

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
}


export default Provider