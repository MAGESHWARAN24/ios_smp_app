import { api } from '@/lib/api';
import { spacing } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import { PagedResult } from '@/types';
import { AxiosError } from 'axios';
import { useRouter } from 'expo-router';
import { PackageSearch } from 'lucide-react-native';
import { useCallback, useEffect, useState, type FC } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import OrderListItem from './order-list-item';
import { OrderItem } from './type';

interface OrderListProps { }

const PAGE_SIZE = 12;

const EMPTY_RESULT: PagedResult<OrderItem> = {
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

function EmptyOrders({ onBrowse }: { onBrowse: () => void })
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
                <PackageSearch size={32} color={colors.mutedForeground} />
            </View>
            <Text style={[theme.title, { textAlign: 'center' }]}>No orders yet</Text>
            <Text style={[theme.mutedText, { textAlign: 'center' }]}>When you place an order, it will show up here</Text>
            <Pressable onPress={onBrowse} style={[theme.primaryButton, { marginTop: 8, alignSelf: 'stretch' }]}>
                <Text style={theme.primaryButtonText}>Browse Catalog</Text>
            </Pressable>
        </View>
    )
}

const OrderList: FC<OrderListProps> = () =>
{
    const [orders, setOrders] = useState<PagedResult<OrderItem>>(EMPTY_RESULT)
    const [pageNumber, setPageNumber] = useState<number>(1)
    const [loading, setLoading] = useState<boolean>(false)

    const { colors, styles } = useThemedStyles()
    const router = useRouter()

    const fetchOrders = useCallback(async (page: number) =>
    {
        setLoading(true)
        try
        {
            const response = await api.post<PagedResult<OrderItem>>(
                'order/pagedresult',
                {
                    viewId: '',
                    sorting: [],
                    columnFilters: [],
                    searchString: '',
                    pageNumber: page,
                    pageSize: PAGE_SIZE,
                },
                {
                    params: {
                        pageSize: PAGE_SIZE,
                        pageNumber: page,
                        searchString: '',
                        viewId: '',
                    },
                }
            )

            if (response.status === 200 && response.data)
            {
                setOrders(response.data)
            }
        } catch (error)
        {
            if (error instanceof AxiosError)
            {
                console.warn('Failed to fetch orders', error.message)
            }
        } finally
        {
            setLoading(false)
        }
    }, [])

    useEffect(() =>
    {
        fetchOrders(pageNumber)
    }, [pageNumber, fetchOrders])

    const totalPages = orders.totalPages || 1
    const canGoPrevious = pageNumber > 1 && !loading
    const canGoNext = pageNumber < totalPages && !loading
    const isEmpty = !loading && orders.items.length === 0

    const handlePrevious = () =>
    {
        if (canGoPrevious)
        {
            setPageNumber((current) => current - 1)
        }
    }

    const handleNext = () =>
    {
        if (canGoNext)
        {
            setPageNumber((current) => current + 1)
        }
    }

    return (
        <View style={styles.screen}>
            {loading && orders.items.length === 0 ? (
                <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator />
                </View>
            ) : isEmpty ? (
                <EmptyOrders onBrowse={() => router.push('/(tabs)/products' as any)} />
            ) : (
                <FlatList
                    data={orders.items}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: spacing * 2, gap: spacing * 2 }}
                    renderItem={({ item }) => <OrderListItem order={item} />}
                />
            )}

            {!isEmpty && (
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: spacing * 3,
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                    }}
                >
                    <Pressable
                        onPress={handlePrevious}
                        disabled={!canGoPrevious}
                        style={{
                            paddingVertical: spacing * 2,
                            paddingHorizontal: spacing * 4,
                            borderRadius: 8,
                            backgroundColor: canGoPrevious ? colors.primary : colors.muted,
                        }}
                    >
                        <Text style={{ color: canGoPrevious ? colors.primaryForeground : colors.mutedForeground, fontWeight: 'bold' }}>
                            Previous
                        </Text>
                    </Pressable>

                    <Text style={[styles.mutedText, { fontSize: 12 }]}>
                        Page {orders.pageNumber || pageNumber} of {totalPages}
                    </Text>

                    <Pressable
                        onPress={handleNext}
                        disabled={!canGoNext}
                        style={{
                            paddingVertical: spacing * 2,
                            paddingHorizontal: spacing * 4,
                            borderRadius: 8,
                            backgroundColor: canGoNext ? colors.primary : colors.muted,
                        }}
                    >
                        <Text style={{ color: canGoNext ? colors.primaryForeground : colors.mutedForeground, fontWeight: 'bold' }}>
                            Next
                        </Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
}

export default OrderList;