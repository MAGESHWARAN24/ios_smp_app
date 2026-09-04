import { spacing } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import { useRouter } from 'expo-router';
import type { FC } from 'react';
import { Pressable, Text, View } from 'react-native';
import { OrderItem } from './type';

interface OrderListItemProps
{
    order: OrderItem
}

const formatCurrency = (amount: number) => `\u20B9${amount.toLocaleString('en-IN')}`

const formatDate = (isoDate: string) =>
{
    const date = new Date(isoDate)
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const getStatusColor = (status: string, colors: ReturnType<typeof useThemedStyles>['colors']) =>
{
    switch (status)
    {
        case 'PAYMENT FAILED':
            return colors.destructive
        case 'PAYMENT INITIATED':
            return colors.accent
        default:
            return colors.mutedForeground
    }
}

const OrderListItem: FC<OrderListItemProps> = ({ order }) =>
{
    const { colors, styles, shadows } = useThemedStyles()
    const statusColor = getStatusColor(order.status, colors)
    const router = useRouter()

    return (
        <Pressable
            style={[styles.card, { ...shadows.sm, padding: spacing * 3, gap: spacing * 2 }]}
            onPress={() => router.navigate(`order/${order.id}`)}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[styles.title, { fontSize: 14, fontWeight: 'bold' }]}>
                        {order.orderReferenceNumber}
                    </Text>
                    <Text style={[styles.mutedText, { fontSize: 12 }]}>
                        {formatDate(order.orderDate)}
                    </Text>
                </View>

                <View
                    style={{
                        ...styles.badge,
                        borderColor: statusColor,
                        borderWidth: 1,
                        backgroundColor: 'transparent',
                    }}
                >
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: statusColor, textTransform: 'uppercase' }}>
                        {order.status}
                    </Text>
                </View>
            </View>

            <View style={{ height: 1, backgroundColor: colors.border }} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ gap: 2 }}>
                    <Text style={[styles.mutedText, { fontSize: 12 }]}>
                        {order.totalItems} {order.totalItems === 1 ? 'item' : 'items'}
                    </Text>
                    <Text style={[styles.mutedText, { fontSize: 12 }]} numberOfLines={1}>
                        {order.city}, {order.state}
                    </Text>
                </View>

                <Text style={[styles.title, { fontSize: 16, fontWeight: 'bold' }]}>
                    {formatCurrency(order.totalAmount)}
                </Text>
            </View>
        </Pressable>
    );
}

export default OrderListItem;