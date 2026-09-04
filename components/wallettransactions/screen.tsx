import { api } from '@/lib/api';
import { spacing } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import { PagedResult } from '@/types';
import { AxiosError } from 'axios';
import { useRouter } from 'expo-router';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { useCallback, useEffect, useState, type FC } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApiAction } from '../api-actions/hook';
import { EMPTY_RESULT } from './config';
import { WalletTransaction } from './type';

interface WalletTransactionsScreenProps { }

const PAGE_SIZE = 25;
const CREDIT_TRANSACTION_TYPE_ID = "55b902e1-1167-556b-ae3b-3e8895eda122"

const fmtCurrency = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(n)

const fmtDate = (isoDate: string) =>
{
    const date = new Date(isoDate)
    const datePart = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const timePart = date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
    return `${datePart} \u2022 ${timePart}`
}

function TransactionRow({ transaction }: { transaction: WalletTransaction })
{
    const { colors, styles, shadows } = useThemedStyles()
    const router = useRouter()
    const isCredit = transaction.transactionTypeId.value === CREDIT_TRANSACTION_TYPE_ID

    return (
        <View
            style={[
                styles.card,
                {
                    ...shadows.sm,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: spacing * 3,
                },
            ]}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing * 3, flex: 1 }}>
                <View
                    style={{
                        height: 40,
                        width: 40,
                        borderRadius: 999,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isCredit ? '#16a34a20' : colors.destructive + '20',
                    }}
                >
                    {isCredit ? (
                        <ArrowDownLeft size={18} color="#16a34a" />
                    ) : (
                        <ArrowUpRight size={18} color={colors.destructive} />
                    )}
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[styles.title, { fontSize: 14, fontWeight: '600' }]} numberOfLines={1}>
                        {transaction.referenceNo}
                    </Text>
                    <Text style={[styles.mutedText, { fontSize: 11 }]} numberOfLines={1}>
                        {transaction.paymentModeId.label}
                    </Text>
                    <Text style={[styles.mutedText, { fontSize: 11 }]}>
                        {fmtDate(transaction.createdon)}
                    </Text>
                    {!!transaction.remarks && (
                        <Text style={[styles.mutedText, { fontSize: 11, fontStyle: 'italic' }]} numberOfLines={2}>
                            {transaction.remarks}
                        </Text>
                    )}
                </View>
            </View>

            <View
                style={{
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 999,
                    backgroundColor: isCredit ? '#16a34a20' : colors.destructive + '20',
                }}
            >
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: isCredit ? '#16a34a' : colors.destructive }}>
                    {isCredit ? '+' : '-'}{fmtCurrency(transaction.amount)}
                </Text>
            </View>
        </View>
    )
}

const WalletTransactionsScreen: FC<WalletTransactionsScreenProps> = () =>
{
    const { apiActionAsync } = useApiAction()
    const { colors, styles } = useThemedStyles()

    const [transactions, setTransactions] = useState<PagedResult<WalletTransaction>>(EMPTY_RESULT)
    const [pageNumber, setPageNumber] = useState<number>(1)
    const [loading, setLoading] = useState<boolean>(false)

    const fetchTransactions = useCallback(async (page: number) =>
    {
        setLoading(true)
        try
        {
            const response = await api.post<PagedResult<WalletTransaction>>(
                'wallettransactions/pagedresult',
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
        fetchTransactions(pageNumber)
    }, [pageNumber, fetchTransactions])

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
                            No transactions yet.
                        </Text>
                    }
                    renderItem={({ item }) => <TransactionRow transaction={item} />}
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

export default WalletTransactionsScreen;