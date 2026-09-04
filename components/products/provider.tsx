import { api } from '@/lib/api';
import { debounce } from '@/lib/debounce';
import { AxiosError } from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';
import { useApiAction } from '../api-actions/hook';
import { ProductContext } from './config';
import { Catalog, ProductFilterItem, ProductItem } from './type';

interface ProviderProps extends PropsWithChildren
{

}

const Provider: FC<ProviderProps> = ({ children }) =>
{
    const { productType = "" } = useLocalSearchParams<{ productType: string }>()
    const [catalog, setCatalog] = useState<Catalog>({ products: [], types: [] })
    const [items, setItems] = useState<Catalog>({ products: [], types: [] })
    const [loading, setLoading] = useState<boolean>(false)
    const [filter, setFilter] = useState<ProductFilterItem>({ productTypeId: "", searchString: "" })
    const { apiActionAsync } = useApiAction()
    const initialRef = useRef<boolean>(false)
    const debouncedFilter = useMemo(
        () =>
            debounce(
                (
                    payload: ProductFilterItem,
                    products: ProductItem[]
                ) =>
                {
                    setLoading(true);
                    (() =>
                    {
                        const searchString = payload.searchString ? payload.searchString.trim().toLowerCase() : ""

                        const filteredItems = products.filter((product) =>
                        {
                            if (
                                payload.productTypeId &&
                                product.productTypeId !== payload.productTypeId
                            )
                            {
                                return false;
                            }

                            if (searchString)
                            {
                                return (
                                    product.name
                                        .toLowerCase()
                                        .includes(searchString) ||
                                    product.productType
                                        .toLowerCase()
                                        .includes(searchString)
                                );
                            }

                            return true;
                        });

                        setItems((prev) => ({
                            ...prev,
                            products: filteredItems,
                        }));
                        setLoading(false)
                    })();
                },
                500
            ),
        []
    );

    const applyFilter = useCallback(
        (payload: ProductFilterItem) =>
        {
            setFilter(payload);

            debouncedFilter(payload, catalog.products);
        },
        [catalog.products, debouncedFilter]
    );

    const resetFilter = useCallback(() =>
    {
        setItems(catalog)
        setFilter({ productTypeId: "", searchString: "" })
    }, [catalog])

    const fetchData = useCallback(async () =>
    {
        try
        {
            setLoading(true)
            const response = await api.get(`product/mobilenavitem`)
            if (response.status === 200 && response.data)
            {
                const types = [{ label: "All", description: "All", value: "" }, ...response.data.types];
                const fetched = { ...response.data, types };
                setCatalog(fetched)

                if (productType)
                {
                    setFilter({ productTypeId: productType, searchString: "" });
                    const searchString = "";
                    setItems({
                        ...fetched,
                        products: fetched.products.filter(
                            (p: ProductItem) => p.productTypeId === productType
                        ),
                    });
                } else
                {
                    setItems(fetched)
                }
            }
        } catch (error)
        {
            if (error instanceof AxiosError && error.response)
            {
                await apiActionAsync(error.response)
            }
        } finally
        {
            setLoading(false)
            initialRef.current = true
        }
    }, [productType])

    useEffect(() =>
    {
        fetchData()
    }, [productType])


    return (
        <ProductContext.Provider value={{ items, applyFilter, resetFilter, filter, loading }}>
            {children}
        </ProductContext.Provider>
    );
}

export default Provider;
