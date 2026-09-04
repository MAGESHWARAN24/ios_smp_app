import { api } from '@/lib/api';
import { useThemedStyles } from '@/lib/useThemedStyles';
import { PagedResult } from '@/types';
import { AxiosError } from 'axios';
import { useRouter } from 'expo-router';
import { ShoppingCart } from 'lucide-react-native';
import { useCallback, useEffect, useState, type FC } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useApiAction } from '../api-actions/hook';
import CartItem from './cart-item';
import CartSummary from './cart-summery';
import { useCart } from './config';
import { CartItemData } from './type';

interface CartScreenProps { }

const styles = StyleSheet.create({
    container: {
        padding: 10,
        gap: 8,
        flexGrow: 1,
    },
})

const EMPTY_RESULT: PagedResult<CartItemData> = {
    endPage: 0,
    items: [],
    maxNavigationPages: 0,
    pageNumber: 0,
    pageNumbers: [],
    pageSize: 0,
    startPage: 0,
    totalItems: 0,
    totalPages: 0,
}

function EmptyCart({ onBrowse }: { onBrowse: () => void })
{
    const { colors, styles: theme } = useThemedStyles()

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32, paddingVertical: 48 }}>
            <View
                style={{
                    height: 72,
                    width: 72,
                    borderRadius: 999,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.muted,
                }}
            >
                <ShoppingCart size={32} color={colors.mutedForeground} />
            </View>
            <Text style={[theme.title, { textAlign: 'center' }]}>Your cart is empty</Text>
            <Text style={[theme.mutedText, { textAlign: 'center' }]}>Start adding products to your cart</Text>
            <Pressable onPress={onBrowse} style={[theme.primaryButton, { marginTop: 8, alignSelf: 'stretch' }]}>
                <Text style={theme.primaryButtonText}>Browse Catalog</Text>
            </Pressable>
        </View>
    )
}

const CartScreen: FC<CartScreenProps> = () =>
{
    const appTheme = useThemedStyles()
    const router = useRouter()
    const [cartItemPagedResult, setCartItemPagedResult] = useState<PagedResult<CartItemData>>(EMPTY_RESULT);
    const { fetchData } = useCart()
    const [loading, setLoading] = useState<boolean>(true)
    const { apiActionAsync } = useApiAction()
    const fetchCartItem = useCallback(async () =>
    {
        try
        {
            const response = await api.post(`cart/pagedresult?pageSize=10000&pageNumber=1`, {
                "viewId": "",
                "sorting": [],
                "columnFilters": [],
                "searchString": "",
                "pageNumber": 1,
                "pageSize": 10
            })
            if (response.status == 200 && response.data)
            {
                setCartItemPagedResult(response.data)
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
        fetchCartItem()
        fetchData()
    }, [])

    const isEmpty = !loading && cartItemPagedResult.items.length === 0

    return (
        <View style={[appTheme.styles.screen]}>
            {loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator color={appTheme.colors.primary} />
                </View>
            ) : isEmpty ? (
                <EmptyCart onBrowse={() => router.push('/(tabs)/products' as any)} />
            ) : (
                <FlatList
                    data={cartItemPagedResult.items}
                    numColumns={1}
                    contentContainerStyle={styles.container}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                        <CartItem
                            key={item.id}
                            cartItem={item}
                            fetchData={fetchCartItem}
                        />
                    )}
                />
            )}
            {!isEmpty && !loading && <CartSummary />}
        </View>
    );
}

export default CartScreen;