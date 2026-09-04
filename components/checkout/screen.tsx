import { api } from '@/lib/api';
import { fonts, letterSpacing, spacing } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import { AxiosError } from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CreditCard, PackageCheck, Truck } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState, type FC } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApiAction } from '../api-actions/hook';
import CheckoutFooter from './checkout-footer';
import CheckoutLineItem from './checkout-line-item';
import { useCheckout } from './config';
import CourierMode from './courier-mode';
import PaymentMode from './payment-mode';
import SectionCard from './section-card';

const COURIER_TRANSPORT_MODE_ID = 'f4d52b0d-a4fa-4dbb-b855-c215ac55e509';

// Payment modes that need special handling once the order is placed.
const CCA_GATEWAY_PAYMENT_MODE_ID = '6e41261d-2f07-880f-e86e-867213454d82';
const INSTANT_PAYMENT_MODE_ID = '79e797dd-f2f7-a472-339c-cf9bdd1fc249';

// TODO: replace with the actual return-URL substrings configured on your
// CCA merchant account (the URLs CCA redirects to after payment).
const CCA_SUCCESS_URL_MATCH = 'payment/success';
const CCA_FAILURE_URL_MATCH = 'payment/failure';

// TODO: point this at your actual home route (e.g. '/(tabs)/home').
const HOME_ROUTE = '/';

interface CcaPaymentState
{
    paymentUrl: string;
    encryptedData: string;
    accessCode: string;
}

interface ValidationErrors
{
    paymentModeId?: string;
    courierId?: string;
    items?: string;
}

interface OrderPayoutScreenProps { }

const OrderPayoutScreen: FC<OrderPayoutScreenProps> = () =>
{
    const appTheme = useThemedStyles();
    const { colors } = appTheme;
    const { apiActionAsync } = useApiAction();
    const router = useRouter();
    const initialRef = useRef<boolean>(true);
    const [paymentModeId, setPaymentModeId] = useState<string>('');
    const [courierId, setCourierId] = useState<string>('');
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);

    const { addressId = '', transportModeId = '' } = useLocalSearchParams<{
        addressId: string;
        transportModeId: string;
    }>();

    const { courier, items, summary, fetchCourier, fetchSummary, fetchCheckoutItems } = useCheckout();
    const requiresCourier = transportModeId === COURIER_TRANSPORT_MODE_ID;

    useEffect(() =>
    {
        if (requiresCourier)
        {
            fetchCourier(addressId);
        }

        if (addressId && courierId)
        {
            fetchSummary(addressId, courierId);
        }

        if (initialRef.current)
        {
            fetchCheckoutItems();
        }
        initialRef.current = false;
    }, [addressId, transportModeId, courierId, selectedItems]);

    const updateCheckoutItemAsync = useCallback(async (id: string, isCheckout: boolean) =>
    {
        try
        {
            await api.post(`checkout/updatecheckoutitem`, { id, isCheckout });
            await fetchSummary(addressId, courierId);
            setSelectedItems((preItems) => (isCheckout ? [...preItems, id] : preItems.filter((x) => x !== id)));
        } catch (error)
        {
            if (error instanceof AxiosError && error.response)
            {
                await apiActionAsync(error.response);
            }
        }
    }, [items]);

    useEffect(() =>
    {
        setSelectedItems(() => items.filter((x) => x.isCheckout).map((x) => x.id));
    }, [items]);

    const total = summary.totalAmount + summary.totalShippingAmount;

    const validate = useCallback((): ValidationErrors =>
    {
        const nextErrors: ValidationErrors = {};

        if (!paymentModeId)
        {
            nextErrors.paymentModeId = 'Select a payment mode to continue.';
        }
        if (requiresCourier && !courierId)
        {
            nextErrors.courierId = 'Select a courier option to continue.';
        }
        if (selectedItems.length === 0)
        {
            nextErrors.items = 'Select at least one item to continue.';
        }

        return nextErrors;
    }, [paymentModeId, requiresCourier, courierId, selectedItems]);

    const refreshCheckoutData = useCallback(async () =>
    {
        await fetchCheckoutItems();
        if (addressId && courierId)
        {
            await fetchSummary(addressId, courierId);
        }
    }, [addressId, courierId]);

    const placeOrderAsync = useCallback(async () =>
    {
        const payload = {
            addressId,
            customerId: '',
            paymentModeId,
            transportModeId,
            shippingProviderId: requiresCourier ? courierId : '',
            orderItems: selectedItems,
        };

        setIsPlacingOrder(true);
        try
        {
            const response = await api.post('order/placeorder', {
                addressId: payload.addressId,
                customerId: payload.customerId,
                paymentModeId: payload.paymentModeId,
                transportModeId: payload.transportModeId,
                shippingProviderId: payload.shippingProviderId,
                orderItems: payload.orderItems,
            });

            if (payload.paymentModeId === CCA_GATEWAY_PAYMENT_MODE_ID)
            {
                const { encryptedData, accessCode, paymentUrl } = response.data;
                router.navigate(`payment/${encodeURIComponent(paymentUrl)}/${encodeURIComponent(encryptedData)}/${encodeURIComponent(accessCode)}`)
            }

            if (payload.paymentModeId === INSTANT_PAYMENT_MODE_ID)
            {
                await refreshCheckoutData();
                await apiActionAsync(response);
            }
        } catch (error)
        {
            if (error instanceof AxiosError && error.response)
            {
                await apiActionAsync(error.response);
            }
        } finally
        {
            setIsPlacingOrder(false);
        }
    }, [addressId, paymentModeId, transportModeId, requiresCourier, courierId, selectedItems, refreshCheckoutData]);

    const handleSubmit = useCallback(() =>
    {
        const nextErrors = validate();
        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) return;

        placeOrderAsync();
    }, [validate, placeOrderAsync]);

    useEffect(() =>
    {
        setErrors((prev) =>
        {
            if (!prev.paymentModeId && !prev.courierId && !prev.items) return prev;
            const next = { ...prev };
            if (paymentModeId) delete next.paymentModeId;
            if (!requiresCourier || courierId) delete next.courierId;
            if (selectedItems.length > 0) delete next.items;
            return next;
        });
    }, [paymentModeId, courierId, requiresCourier, selectedItems]);


    useEffect(() =>
    {
        if (summary.totalAmount == 0)
        {
            setCourierId("")
            setPaymentModeId("")
        }

    }, [summary])

    return (
        <View style={[appTheme.styles.screen]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Text style={[styles.headerTitle, { color: colors.foreground }]}>Checkout</Text>
                <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
                    Review your order and complete payment
                </Text>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <SectionCard
                    title="Payment mode"
                    subtitle="Choose how you'd like to pay"
                    icon={CreditCard}
                    error={errors.paymentModeId}
                >
                    <PaymentMode
                        value={paymentModeId}
                        onSelect={setPaymentModeId}
                        disabled={summary.totalAmount == 0}
                    />
                </SectionCard>

                {requiresCourier && (
                    <SectionCard
                        title="Courier"
                        subtitle="Select a shipping option"
                        icon={Truck}
                        error={errors.courierId}
                    >
                        <CourierMode
                            options={courier}
                            selectedValue={courierId}
                            onSelect={setCourierId}
                            disabled={summary.totalAmount == 0}
                        />
                    </SectionCard>
                )}

                <SectionCard
                    title="Items"
                    subtitle={`${selectedItems.length} of ${items.length} selected`}
                    icon={PackageCheck}
                    error={errors.items}
                >
                    <CheckoutLineItem
                        selectedIds={selectedItems}
                        onSelect={updateCheckoutItemAsync}
                    />
                </SectionCard>
            </ScrollView>

            <CheckoutFooter
                isHasNextPage
                isLoading={isPlacingOrder}
                nextPageLabel={`Pay Rs ${total.toFixed(2)}`}
                onPressHandler={handleSubmit}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: spacing * 5,
        paddingTop: spacing * 4,
        paddingBottom: spacing * 4,
        borderBottomWidth: StyleSheet.hairlineWidth,
        gap: spacing * 0.75,
    },
    headerTitle: {
        fontSize: 22,
        fontFamily: fonts.sansBold,
        letterSpacing,
    },
    headerSubtitle: {
        fontSize: 13,
        fontFamily: fonts.sans,
        letterSpacing,
    },
    scroll: {
        flex: 1,
    },
    container: {
        padding: spacing * 4,
        paddingBottom: spacing * 32,
        gap: spacing * 4,
    },
});

export default OrderPayoutScreen;