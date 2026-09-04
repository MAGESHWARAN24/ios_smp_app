import { api } from '@/lib/api';
import { useThemedStyles } from '@/lib/useThemedStyles';
import { AxiosError } from 'axios';
import type { FC } from 'react';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text } from 'react-native';
import { useApiAction } from '../api-actions/hook';

interface OrderCancelationBtnProps
{
    orderItemId: string;
    fetchOrderDetailsAsync: () => Promise<void>;
}

// NOTE: the real cancellation endpoint/payload wasn't in the shared code —
// this mirrors the original component's props/behavior with a reasonable
// guess at the API shape. Swap the api.post call for your actual endpoint.
const OrderCancelationBtn: FC<OrderCancelationBtnProps> = ({ orderItemId, fetchOrderDetailsAsync }) =>
{
    const { colors } = useThemedStyles()
    const { apiActionAsync } = useApiAction()
    const [cancelling, setCancelling] = useState(false)

    const cancelItem = async () =>
    {
        setCancelling(true)
        try
        {
            const response = await api.patch(`order/cancel?id=${orderItemId}`)
            if (response.status === 200)
            {
                await fetchOrderDetailsAsync()
            }
        } catch (error)
        {
            if (error instanceof AxiosError && error.response)
            {
                await apiActionAsync(error.response)
            }
        } finally
        {
            setCancelling(false)
        }
    }

    const onPress = () =>
    {
        Alert.alert(
            'Cancel item',
            'Are you sure you want to cancel this item?',
            [
                { text: 'Keep item', style: 'cancel' },
                { text: 'Cancel item', style: 'destructive', onPress: cancelItem },
            ]
        )
    }

    if (cancelling)
    {
        return <ActivityIndicator size="small" color={colors.destructive} />
    }

    return (
        <Pressable onPress={onPress} hitSlop={8}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.destructive }}>
                Cancel
            </Text>
        </Pressable>
    );
}

export default OrderCancelationBtn;