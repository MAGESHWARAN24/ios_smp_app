import { api } from '@/lib/api';
import { spacing } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import { AxiosError } from 'axios';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import
{
    ArrowLeft,
    Ban,
    CalendarDays,
    ChevronRight,
    Eye,
    Hash,
    MapPin,
    Package,
    Phone,
    ReceiptText,
    Truck,
    User,
    X,
    XCircle,
} from 'lucide-react-native';
import { useEffect, useMemo, useState, type ComponentType, type FC } from 'react';
import
{
    ActivityIndicator,
    Image,
    Linking,
    Modal,
    Pressable,
    ScrollView,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApiAction } from '../api-actions/hook';
import OrderCancelationBtn from './order-cancelation-btn';
import { OrderAddress, OrderDetails, OrderLineItem } from './type';

interface OrderDetailsScreenProps { }

/* ─── Helpers ────────────────────────────────────────────────────────────── */

const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(n)

const formatIST = (value: string | null | undefined): string | null =>
{
    if (!value) return null
    return new Date(value + 'Z').toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
}

/* ─── Loading state ──────────────────────────────────────────────────────── */

function OrderDetailsSkeleton()
{
    const { colors } = useThemedStyles()
    const bar = (h: any, w: any = '100%') => (
        <View style={{ height: h, width: w, borderRadius: 8, backgroundColor: colors.muted }} />
    )

    return (
        <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator color={colors.primary} />
        </View>
    )
}

/* ─── Stat card ──────────────────────────────────────────────────────────── */

function StatCard({
    icon: Icon,
    label,
    value,
    sub,
    subLabel = '',
    accent = false,
}: {
    icon: ComponentType<{ size?: number; color?: string }>;
    label: string;
    value: string;
    sub?: string;
    subLabel?: string;
    accent?: boolean;
})
{
    const { colors } = useThemedStyles()
    const bg = accent ? colors.primary : colors.card
    const fg = accent ? colors.primaryForeground : colors.foreground
    const mutedFg = accent ? colors.primaryForeground : colors.mutedForeground

    return (
        <View
            style={{
                flexBasis: '48%',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: accent ? colors.primary : colors.border,
                backgroundColor: bg,
                padding: spacing * 3,
                gap: 4,
            }}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, color: mutedFg }}>
                    {label}
                </Text>
                <View style={{ padding: 6, borderRadius: 8, backgroundColor: accent ? 'rgba(255,255,255,0.2)' : colors.muted }}>
                    <Icon size={14} color={fg} />
                </View>
            </View>
            {!!subLabel && (
                <Text style={{ fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', color: fg }}>
                    {subLabel}
                </Text>
            )}
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: fg }}>{value}</Text>
            {!!sub && <Text style={{ fontSize: 11, color: mutedFg }}>{sub}</Text>}
        </View>
    )
}

/* ─── Section header ─────────────────────────────────────────────────────── */

function SectionHeader({
    icon: Icon,
    title,
    right,
    variant = 'default',
}: {
    icon: ComponentType<{ size?: number; color?: string }>;
    title: string;
    right?: React.ReactNode;
    variant?: 'default' | 'destructive';
})
{
    const { colors } = useThemedStyles()
    const isDestructive = variant === 'destructive'
    const tint = isDestructive ? colors.destructive : colors.primary

    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: spacing * 4,
                paddingVertical: spacing * 3,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
            }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View
                    style={{
                        height: 28,
                        width: 28,
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: tint,
                        backgroundColor: colors.muted,
                    }}
                >
                    <Icon size={14} color={tint} />
                </View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: tint }}>{title}</Text>
            </View>
            {right}
        </View>
    )
}

/* ─── Data row (label/value pair used inside item cards) ────────────────── */

function DataRow({ label, children }: { label: string; children: React.ReactNode })
{
    const { colors } = useThemedStyles()
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing * 2 }}>
            <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{label}</Text>
            <View style={{ flexShrink: 1, alignItems: 'flex-end' }}>{children}</View>
        </View>
    )
}

function InlineBadge({ text }: { text: string })
{
    const { colors } = useThemedStyles()
    return (
        <View
            style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 999,
                alignSelf: "flex-start",
                backgroundColor: colors.muted,
            }}
        >
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>{text}</Text>
        </View>
    )
}

/* ─── Image preview modal ─────────────────────────────────────────────────── */

function ImagePreviewModal({ url, onClose }: { url: string | null; onClose: () => void })
{
    const { colors } = useThemedStyles()
    return (
        <Modal visible={!!url} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable
                onPress={onClose}
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center' }}
            >
                <Pressable
                    onPress={onClose}
                    style={{ position: 'absolute', top: 50, right: 20, padding: 8, borderRadius: 999, backgroundColor: colors.card }}
                >
                    <X size={20} color={colors.foreground} />
                </Pressable>
                {url && (
                    <Image source={{ uri: url }} style={{ width: '90%', height: '70%' }} resizeMode="contain" />
                )}
            </Pressable>
        </Modal>
    )
}

/* ─── Item card (active + cancelled share this, styled differently) ─────── */

function ItemCard({
    lineItem,
    isCustomJob,
    isPaymentSucceeded,
    fetchOrderDetailsAsync,
    cancelled = false,
    onPreview,
}: {
    lineItem: OrderLineItem;
    isCustomJob: boolean;
    isPaymentSucceeded: boolean;
    fetchOrderDetailsAsync: () => Promise<void>;
    cancelled?: boolean;
    onPreview: (url: string) => void;
})
{
    const { colors, styles, shadows } = useThemedStyles()

    const onCopyTracking = async () =>
    {
        if (!lineItem.trackingNumber) return
        await Clipboard.setStringAsync(lineItem.trackingNumber)
        if (lineItem.trackingUrl)
        {
            Linking.openURL(lineItem.trackingUrl)
        }
    }

    return (
        <View
            style={[
                styles.card,
                {
                    ...shadows.sm,
                    padding: spacing * 3,
                    gap: spacing * 2,
                    borderColor: cancelled ? colors.destructive : colors.border,
                    opacity: cancelled ? 0.8 : 1,
                },
            ]}
        >
            {lineItem.designFileUrl.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {lineItem.designFileUrl.map((url, i) => (
                        <Pressable key={i} onPress={() => onPreview(url)}>
                            <View style={{ height: 90, width: 90, borderRadius: 10, overflow: 'hidden', backgroundColor: colors.muted }}>
                                <Image source={{ uri: url }} style={{ flex: 1 }} resizeMode="cover" />
                                <View style={{ position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 999, padding: 4 }}>
                                    <Eye size={12} color="#fff" />
                                </View>
                            </View>
                        </Pressable>
                    ))}
                </ScrollView>
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, gap: 4 }}>
                    <InlineBadge text={lineItem.referecnceNo} />
                    <Text style={[styles.title, { fontSize: 14, fontWeight: 'bold' }]}>{lineItem.productName}</Text>
                    {!!lineItem.subProductName && (
                        <Text style={[styles.mutedText, { fontSize: 12 }]}>{lineItem.subProductName}</Text>
                    )}
                </View>

                {cancelled ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: colors.destructive + '20' }}>
                        <XCircle size={10} color={colors.destructive} />
                        <Text style={{ fontSize: 10, fontWeight: '600', color: colors.destructive }}>Cancelled</Text>
                    </View>
                ) : lineItem.isBatched ? (
                    <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: '#f59e0b20' }}>
                        <Text style={{ fontSize: 10, fontWeight: '600', color: '#f59e0b' }}>
                            {lineItem.batchItemStatus === 'Waiting for Mockfile' ? 'Batched' : lineItem.batchItemStatus}
                        </Text>
                    </View>
                ) : isPaymentSucceeded ? (
                    <OrderCancelationBtn orderItemId={lineItem.id} fetchOrderDetailsAsync={fetchOrderDetailsAsync} />
                ) : (
                    <InlineBadge text="Payment failed" />
                )}
            </View>

            <View style={{ height: 1, backgroundColor: colors.border }} />

            <DataRow label="Quantity">
                <Text style={{ fontSize: 12, color: colors.foreground }}>{lineItem.quantity}</Text>
            </DataRow>
            <DataRow label="Qty ordered">
                <Text style={{ fontSize: 12, color: colors.foreground }}>
                    {isCustomJob ? lineItem.customQuantity : lineItem.noOfUnits}
                </Text>
            </DataRow>
            <DataRow label="Product amount">
                <Text style={{ fontSize: 12, color: colors.foreground }}>{fmt(lineItem.totalamount)}</Text>
            </DataRow>
            {!!lineItem.instruction && (
                <DataRow label="Instructions">
                    <Text style={{ fontSize: 12, color: colors.foreground, textAlign: 'right' }}>{lineItem.instruction}</Text>
                </DataRow>
            )}
            {lineItem.additionProcessing.length > 0 && (
                <DataRow label="Additional processing">
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end' }}>
                        {lineItem.additionProcessing.map((p, i) => <InlineBadge key={i} text={p} />)}
                    </View>
                </DataRow>
            )}
            <DataRow label="Shipping">
                <Text style={{ fontSize: 12, color: colors.foreground }}>
                    {lineItem.shippingamount > 0 ? fmt(lineItem.shippingamount) : '—'}
                </Text>
            </DataRow>
            <DataRow label="Courier">
                <Text style={{ fontSize: 12, color: colors.foreground }}>{lineItem.courierName ?? '—'}</Text>
            </DataRow>
            <DataRow label="Tracking no">
                {lineItem.trackingNumber && lineItem.trackingUrl ? (
                    <Pressable onPress={onCopyTracking}>
                        <Text style={{ fontSize: 12, color: colors.accent, fontWeight: '600' }}>{lineItem.trackingNumber}</Text>
                    </Pressable>
                ) : (
                    <Text style={{ fontSize: 12, color: colors.foreground }}>{lineItem.trackingNumber ?? '—'}</Text>
                )}
            </DataRow>
            <DataRow label="Processing amt">
                <Text style={{ fontSize: 12, color: colors.foreground }}>
                    {lineItem.additionprocessingamount > 0 ? fmt(lineItem.additionprocessingamount) : '—'}
                </Text>
            </DataRow>

            <View style={{ height: 1, backgroundColor: colors.border }} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.mutedForeground }}>Total</Text>
                <Text
                    style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: colors.foreground,
                        textDecorationLine: cancelled ? 'line-through' : 'none',
                    }}
                >
                    {fmt(lineItem.grandTotal)}
                </Text>
            </View>
        </View>
    )
}

/* ─── Address block ──────────────────────────────────────────────────────── */

function AddressSection({ title, address }: { title: string; address: OrderAddress })
{
    const { colors, styles } = useThemedStyles()
    const parts = [
        address.addressLine1,
        address.addressLine2,
        address.area,
        address.district,
        address.state,
        address.pinCode,
        address.country,
    ].filter(Boolean)

    return (
        <View style={[styles.card, { overflow: 'hidden', padding: 0 }]}>
            <SectionHeader icon={MapPin} title={title} />
            <View style={{ padding: spacing * 4, gap: spacing * 4 }}>
                <View style={{ gap: 8 }}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, color: colors.mutedForeground }}>
                        Contact person
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                        <View style={{ height: 36, width: 36, borderRadius: 10, backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center' }}>
                            <User size={16} color={colors.primary} />
                        </View>
                        <View>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground }}>{address.contactPersonName}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                <Phone size={11} color={colors.mutedForeground} />
                                <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{address.mobileNo}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={{ gap: 8 }}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, color: colors.mutedForeground }}>
                        Address
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                        <View style={{ height: 36, width: 36, borderRadius: 10, backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center' }}>
                            <MapPin size={16} color={colors.primary} />
                        </View>
                        <Text style={{ flex: 1, fontSize: 13, color: colors.foreground, lineHeight: 19 }}>
                            {parts.join(', ')}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    )
}

/* ─── Main screen ─────────────────────────────────────────────────────────── */

const OrderDetailsScreen: FC<OrderDetailsScreenProps> = () =>
{
    const { orderId = '' } = useLocalSearchParams<{ orderId: string }>()
    const router = useRouter()
    const { apiActionAsync } = useApiAction()
    const { colors, styles } = useThemedStyles()

    const [item, setItem] = useState<OrderDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const activeItems = item?.items ?? []
    const canceledItems = item?.canceledItems ?? []

    const grandTotal = useMemo(
        () => (item?.totalAmount ?? 0) - canceledItems.reduce((acc, curr) => acc + curr.grandTotal, 0),
        [item?.totalAmount, canceledItems]
    )

    const fetchOrderDetailsAsync = async () =>
    {
        try
        {
            const response = await api.get(`order/getdetails?orderId=${orderId}`)
            if (response.status === 200 && response.data)
            {
                setItem(response.data)
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
    }

    useEffect(() =>
    {
        setLoading(true)
        fetchOrderDetailsAsync()
    }, [orderId])

    if (loading)
    {
        return <OrderDetailsSkeleton />
    }

    if (!item)
    {
        return (
            <View style={[styles.screen, { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: spacing * 6 }]}>
                <View style={{ height: 64, width: 64, borderRadius: 16, backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={28} color={colors.mutedForeground} />
                </View>
                <Text style={{ fontSize: 17, fontWeight: '600', color: colors.foreground }}>Order not found</Text>
                <Text style={{ fontSize: 13, color: colors.mutedForeground, textAlign: 'center' }}>
                    The order you're looking for doesn't exist or was removed.
                </Text>
                <Pressable
                    onPress={() => router.push('/orders')}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}
                >
                    <ArrowLeft size={14} color={colors.foreground} />
                    <Text style={{ fontSize: 13, color: colors.foreground }}>Back to Orders</Text>
                </Pressable>
            </View>
        )
    }

    const { shippingAddress, billingAddress } = item

    return (
        <SafeAreaView style={[styles.screen, { flex: 1 }]}>
            <ScrollView contentContainerStyle={{ padding: spacing * 4, gap: spacing * 4 }} showsVerticalScrollIndicator={false}>

                {/* Back + header */}
                <View>
                    <Pressable
                        onPress={() => router.push('/orders')}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}
                    >
                        <ArrowLeft size={14} color={colors.mutedForeground} />
                        <Text style={{ fontSize: 13, color: colors.mutedForeground }}>Back to order history</Text>
                    </Pressable>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                        <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Orders</Text>
                        <ChevronRight size={11} color={colors.mutedForeground} />
                        <Text style={{ fontSize: 11, fontWeight: '600', color: colors.foreground }}>{item.orderReferenceNumber}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Text style={{ fontSize: 21, fontWeight: 'bold', color: colors.foreground }}>
                            Order <Text style={{ color: colors.primary }}>#{item.orderReferenceNumber}</Text>
                        </Text>
                        {item.isCustomJob && <InlineBadge text="Custom Job" />}
                        {canceledItems.length > 0 && (
                            <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: colors.destructive + '20' }}>
                                <Text style={{ fontSize: 10, fontWeight: '600', color: colors.destructive }}>
                                    {canceledItems.length} item{canceledItems.length > 1 ? 's' : ''} cancelled
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <CalendarDays size={13} color={colors.mutedForeground} />
                        <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{formatIST(item.orderDate)}</Text>
                    </View>
                </View>

                {/* Stat cards */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing * 2 }}>
                    <StatCard icon={ReceiptText} label="Grand Total" value={fmt(item.totalAmount)} accent />
                    <StatCard
                        icon={Truck}
                        label="Shipping"
                        subLabel={item.shippingMethod}
                        value={item.totalShippingAmount > 0 ? fmt(item.totalShippingAmount) : ''}
                        sub="across all items"
                    />
                    <StatCard icon={Hash} label="Payment Method" value={item.paymentMode} sub="Payment mode" />
                </View>

                <AddressSection title="Billing Address" address={billingAddress} />
                <AddressSection title="Delivery Address" address={shippingAddress} />

                {/* Active items */}
                <View style={[styles.card, { overflow: 'hidden', padding: 0 }]}>
                    <SectionHeader
                        icon={Package}
                        title="Order Items"
                        right={
                            <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: colors.muted }}>
                                <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
                                    {activeItems.length} item{activeItems.length !== 1 ? 's' : ''}
                                </Text>
                            </View>
                        }
                    />

                    <View style={{ padding: spacing * 3, gap: spacing * 3 }}>
                        {activeItems.length === 0 ? (
                            <Text style={{ textAlign: 'center', paddingVertical: 24, fontSize: 13, color: colors.mutedForeground }}>
                                No active items in this order.
                            </Text>
                        ) : (
                            activeItems.map((lineItem) => (
                                <ItemCard
                                    key={lineItem.id}
                                    lineItem={lineItem}
                                    isCustomJob={item.isCustomJob}
                                    isPaymentSucceeded={item.isPaymentSucceeded}
                                    fetchOrderDetailsAsync={fetchOrderDetailsAsync}
                                    onPreview={setPreviewUrl}
                                />
                            ))
                        )}
                    </View>

                    <View style={{ borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.muted, padding: spacing * 4 }}>
                        <View style={{ gap: 6 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Product Amount</Text>
                                <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{fmt(grandTotal)}</Text>
                            </View>
                            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 2 }} />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.foreground }}>Grand Total</Text>
                                <Text style={{ fontSize: 17, fontWeight: 'bold', color: colors.primary }}>{fmt(grandTotal)}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Cancelled items */}
                {canceledItems.length > 0 && (
                    <View style={[styles.card, { overflow: 'hidden', padding: 0, borderColor: colors.destructive + '40' }]}>
                        <SectionHeader
                            icon={Ban}
                            title="Cancelled Items"
                            variant="destructive"
                            right={
                                <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: colors.destructive + '15' }}>
                                    <Text style={{ fontSize: 11, color: colors.destructive }}>
                                        {canceledItems.length} item{canceledItems.length !== 1 ? 's' : ''}
                                    </Text>
                                </View>
                            }
                        />

                        <View style={{ padding: spacing * 3, gap: spacing * 3 }}>
                            {canceledItems.map((lineItem) => (
                                <ItemCard
                                    key={lineItem.id}
                                    lineItem={lineItem}
                                    isCustomJob={item.isCustomJob}
                                    isPaymentSucceeded={item.isPaymentSucceeded}
                                    fetchOrderDetailsAsync={fetchOrderDetailsAsync}
                                    cancelled
                                    onPreview={setPreviewUrl}
                                />
                            ))}
                        </View>

                        <View style={{ borderTopWidth: 1, borderTopColor: colors.destructive + '20', padding: spacing * 4 }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, color: colors.destructive, marginBottom: 8 }}>
                                Refunded
                            </Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Items Total</Text>
                                <Text style={{ fontSize: 12, color: colors.mutedForeground, textDecorationLine: 'line-through' }}>
                                    {fmt(canceledItems.reduce((s, i) => s + i.grandTotal, 0))}
                                </Text>
                            </View>
                            <View style={{ height: 1, backgroundColor: colors.destructive + '15', marginVertical: 6 }} />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.destructive }}>Cancelled Total</Text>
                                <Text style={{ fontSize: 15, fontWeight: 'bold', color: colors.destructive, textDecorationLine: 'line-through' }}>
                                    {fmt(canceledItems.reduce((s, i) => s + i.grandTotal, 0))}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            <ImagePreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
        </SafeAreaView>
    )
}

export default OrderDetailsScreen;