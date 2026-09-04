import { api } from '@/lib/api';
import { spacing } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import { PagedResult } from '@/types';
import { AxiosError } from 'axios';
import { useCallback, useEffect, useState, type FC } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApiAction } from '../api-actions/hook';
import { EMPTY_RESULT } from './config';
import { WalletApproval } from './type';
import WalletApprovalItem from './wallet-approval-item';

interface WalletApprovalScreenProps { }

const PAGE_SIZE = 10;

const WalletApprovalScreen: FC<WalletApprovalScreenProps> = () =>
{
    const { apiActionAsync } = useApiAction()
    const { colors, styles } = useThemedStyles()

    const [transactions, setTransactions] = useState<PagedResult<WalletApproval>>(EMPTY_RESULT)
    const [pageNumber, setPageNumber] = useState<number>(1)
    const [loading, setLoading] = useState<boolean>(false)

    const fetchApprovals = useCallback(async (page: number) =>
    {
        setLoading(true)
        try
        {
            const response = await api.post<PagedResult<WalletApproval>>(
                'wallettopups/approval/pagedresult',
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
                setTransactions(response.data)
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
        }
    }, [])

    useEffect(() =>
    {
        fetchApprovals(pageNumber)
    }, [pageNumber, fetchApprovals])

    const totalPages = transactions.totalPages || 1
    const canGoPrevious = pageNumber > 1 && !loading
    const canGoNext = pageNumber < totalPages && !loading

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
        <SafeAreaView style={[styles.screen]}>
            {loading && transactions.items.length === 0 ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={transactions.items}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: spacing * 4, gap: spacing * 2 }}
                    ListEmptyComponent={
                        <Text style={{ textAlign: 'center', paddingVertical: 32, fontSize: 13, color: colors.mutedForeground }}>
                            No pending approvals.
                        </Text>
                    }
                    renderItem={({ item }) => <WalletApprovalItem item={item} />}
                />
            )}

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
                    Page {transactions.pageNumber || pageNumber} of {totalPages}
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
        </SafeAreaView>
    );
}

export default WalletApprovalScreen;