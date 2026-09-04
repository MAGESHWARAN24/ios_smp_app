import { radius, spacing } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import { AdditionalOptionItem, ImageOptionItem } from '@/types';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { useMemo, useState, type FC } from 'react';
import
{
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useCart } from './config';
import { CartItemData } from './type';

interface CartItemProps
{
    cartItem: CartItemData
    fetchData: () => Promise<void>
}

const STEP_SIZE = 32;

const formatCurrency = (value: number) =>
    `Rs ${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const CartItem: FC<CartItemProps> = ({
    cartItem,
    fetchData
}) =>
{
    const appTheme = useThemedStyles()
    const { updateCartItemAsync, removeToCartItemAsync, cart } = useCart()
    const [noOfUnits, setNoOfUnits] = useState<number>(cartItem.noOfUnits)
    const [isUpdating, setIsUpdating] = useState(false)

    const additionalOperations = useMemo(
        () =>
            cartItem
                .otherSpecificationOptions
                .filter(x => cartItem.otherSpecification.includes(x.value))
                .map(x => x.label),
        [cartItem]
    )

    const price: number = useMemo(() =>
    {
        const quantityCost = cartItem.unitPrice * cartItem.cellCount * noOfUnits;

        const otherSpecificationCost = cartItem.otherSpecificationOptions.reduce(
            (acc: number, curr: AdditionalOptionItem) =>
            {
                const isSelected = cartItem.otherSpecification.includes(curr.value)
                const units = isSelected ? Math.ceil((cartItem.quantity * noOfUnits) / curr.minQuantity) : 0
                return acc + curr.price * units
            },
            0
        )
        return quantityCost + otherSpecificationCost
    }, [cartItem, noOfUnits])

    const designFiles: ImageOptionItem | null = useMemo(
        () => (cartItem.designFiles.length > 0 ? cartItem.designFiles[0] : null),
        [cartItem.designFiles]
    )

    const handleChangeUnits = async (nextUnits: number) =>
    {
        if (nextUnits < 1 || isUpdating) return

        const previousUnits = noOfUnits
        setNoOfUnits(nextUnits)
        setIsUpdating(true)
        try
        {
            await updateCartItemAsync({ id: cartItem.id, noOfUnits: nextUnits, otherSpecification: cartItem.otherSpecification, instruction: cartItem.instruction })
        }
        catch (error)
        {
            setNoOfUnits(previousUnits)
        }
        finally
        {
            setIsUpdating(false)
        }
    }

    const handleRemove = async () =>
    {
        Alert.alert(
            "Confirmation",
            "Do you want to remove this item from the cart?", [
            {
                text: "Cancel",
                style: "destructive"
            },
            {
                text: "Remove",
                style: "default",
                onPress: async () =>
                {
                    await removeToCartItemAsync(cartItem.id)
                    await fetchData()
                }
            }
        ])
    }

    const styles = useMemo(() => StyleSheet.create({
        container: {
            gap: spacing * 3,
            elevation: 1
        },
        topRow: {
            flexDirection: 'row',
            gap: spacing * 3,
        },
        imageContainer: {
            height: 96,
            width: 96,
            borderRadius: radius.lg,
            backgroundColor: appTheme.colors.muted,
            overflow: 'hidden',
        },
        image: {
            height: '100%',
            width: '100%',
        },
        imagePlaceholder: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
        details: {
            flex: 1,
            gap: spacing,
        },
        headerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: spacing * 2,
        },
        title: {
            ...appTheme.styles.title,
            fontSize: 16,
            flexShrink: 1,
        },
        subTitle: {
            ...appTheme.styles.mutedText,
        },
        removeButton: {
            padding: spacing,
        },
        badgeRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing * 1.5,
        },
        badge: {
            ...appTheme.styles.badge,
            borderWidth: 1,
            backgroundColor: appTheme.colors.primary
        },
        badgeText: {
            color: appTheme.colors.background,
            fontSize: 12,
            fontFamily: appTheme.styles.mutedText.fontFamily,
        },
        divider: {
            height: StyleSheet.hairlineWidth,
            backgroundColor: appTheme.colors.border,
        },
        footerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        priceBlock: {
            gap: 2,
        },
        priceLabel: {
            ...appTheme.styles.mutedText,
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        price: {
            color: appTheme.colors.foreground,
            fontFamily: appTheme.styles.title.fontFamily,
            fontSize: 18,
            fontWeight: "bold"
        },
        stepper: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing * 3,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: appTheme.colors.border,
            paddingHorizontal: spacing * 2,
            paddingVertical: spacing,
        },
        stepButton: {
            height: STEP_SIZE,
            width: STEP_SIZE,
            borderRadius: STEP_SIZE / 2,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: appTheme.colors.secondary,
        },
        stepButtonDisabled: {
            opacity: 0.4,
        },
        unitsText: {
            ...appTheme.styles.text,
            minWidth: 24,
            textAlign: 'center',
            fontFamily: appTheme.styles.title.fontFamily,
        },
    }), [appTheme.colors, appTheme.styles])

    return (
        <View style={[appTheme.styles.card, styles.container]}>
            <View style={styles.topRow}>
                <View style={styles.imageContainer}>
                    {designFiles?.label ? (
                        <Image
                            source={{ uri: designFiles.label }}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Text style={appTheme.styles.mutedText}>No preview</Text>
                        </View>
                    )}
                </View>

                <View style={styles.details}>
                    <View style={styles.headerRow}>
                        <View style={{ flexShrink: 1, gap: 2 }}>
                            <Text style={styles.title} numberOfLines={1}>
                                {cartItem.product}
                            </Text>
                            <Text style={styles.subTitle} numberOfLines={2}>
                                {cartItem.productDescription}
                            </Text>
                        </View>

                        <Pressable
                            style={styles.removeButton}
                            onPress={handleRemove}
                        >
                            <Trash2 size={18} color={appTheme.colors.destructive} />
                        </Pressable>
                    </View>

                    <View style={styles.badgeRow}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>QTY {cartItem.quantity}</Text>
                        </View>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Cells {cartItem.cellCount}</Text>
                        </View>
                        {additionalOperations.map((operation, index) => (
                            <View key={index} style={styles.badge}>
                                <Text style={styles.badgeText}>{operation}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
            <View style={styles.footerRow}>
                <View style={styles.priceBlock}>
                    <Text style={styles.priceLabel}>Total</Text>
                    <Text style={styles.price}>{formatCurrency(price)}</Text>
                </View>

                <View style={styles.stepper}>
                    <Pressable
                        style={[
                            styles.stepButton,
                            (noOfUnits <= 1 || isUpdating) && styles.stepButtonDisabled,
                        ]}
                        onPress={() => handleChangeUnits(noOfUnits - 1)}
                        disabled={noOfUnits <= 1 || isUpdating}
                        hitSlop={8}
                    >
                        <Minus size={16} color={appTheme.colors.primary} />
                    </Pressable>

                    {isUpdating ? (
                        <ActivityIndicator size="small" color={appTheme.colors.primary} />
                    ) : (
                        <Text style={styles.unitsText}>{noOfUnits}</Text>
                    )}

                    <Pressable
                        style={[styles.stepButton, isUpdating && styles.stepButtonDisabled]}
                        onPress={() => handleChangeUnits(noOfUnits + 1)}
                        disabled={isUpdating}
                        hitSlop={8}
                    >
                        <Plus size={16} color={appTheme.colors.primary} />
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

export default CartItem;