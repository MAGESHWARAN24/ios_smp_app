import { spacing } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import type { FC } from 'react';
import { Text, View } from 'react-native';
import { WalletApproval } from './type';

interface WalletApprovalProps
{
    item: WalletApproval;
}

const fmtCurrency = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(n)

const fmtDate = (isoDate: string) =>
{
    const date = new Date(isoDate)
    const datePart = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const timePart = date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
    return `${datePart} \u2022 ${timePart}`
}

const getStatusColors = (status: string, colors: ReturnType<typeof useThemedStyles>['colors']) =>
{
    switch (status)
    {
        case 'PAYMENT FAILED':
            return { fg: colors.destructive, bg: colors.destructive + '20' }
        case 'WAITING FOR ADMIN APPROVAL':
            return { fg: '#f59e0b', bg: '#f59e0b20' }
        case 'APPROVED':
            return { fg: '#16a34a', bg: '#16a34a20' }
        default:
            return { fg: colors.mutedForeground, bg: colors.muted }
    }
}

const WalletApprovalItem: FC<WalletApprovalProps> = ({ item }) =>
{
    const { colors, styles, shadows } = useThemedStyles()
    const statusColors = getStatusColors(item.status, colors)

    return (
        <View style={[styles.card, { ...shadows.sm, padding: spacing * 3, gap: spacing * 2 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[styles.title, { fontSize: 14, fontWeight: 'bold' }]} numberOfLines={1}>
                        {item.fullName}
                    </Text>
                    <Text style={[styles.mutedText, { fontSize: 12 }]} numberOfLines={1}>
                        {item.companyName.trim()}
                    </Text>
                </View>

                <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: statusColors.bg }}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: statusColors.fg, textTransform: 'uppercase' }}>
                        {item.status}
                    </Text>
                </View>
            </View>

            <View style={{ height: 1, backgroundColor: colors.border }} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[styles.mutedText, { fontSize: 11 }]}>Wallet Ref</Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.foreground }}>{item.walletReferenceNo}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[styles.mutedText, { fontSize: 11 }]}>Transaction Ref</Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.foreground }}>{item.transactionReferenceNo}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[styles.mutedText, { fontSize: 11 }]}>Payment Mode</Text>
                <Text style={{ fontSize: 12, color: colors.foreground }}>{item.paymentModeId}</Text>
            </View>
            {!!item.remarks && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[styles.mutedText, { fontSize: 11 }]}>Remarks</Text>
                    <Text style={{ fontSize: 12, color: colors.foreground, flexShrink: 1, textAlign: 'right' }}>{item.remarks}</Text>
                </View>
            )}

            <View style={{ height: 1, backgroundColor: colors.border }} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.mutedText, { fontSize: 11 }]}>{fmtDate(item.createdOn)}</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.foreground }}>{fmtCurrency(item.amount)}</Text>
            </View>
        </View>
    );
}

export default WalletApprovalItem;