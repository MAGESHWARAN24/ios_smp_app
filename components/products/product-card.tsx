import { fonts, spacing } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import { useRouter } from 'expo-router';
import type { FC } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useAuth } from '../auth/config';
import { ProductItem } from './type';

interface ProductCardProps
{
    product: ProductItem
}

const ProductCard: FC<ProductCardProps> = ({ product }) =>
{
    const { colors, styles, shadows } = useThemedStyles()
    const { isAuthenticated } = useAuth()
    const router = useRouter()
    const onPressHandler = () =>
    {
        router.navigate(isAuthenticated ? `products/${product.id}` : 'auth/login')
    }

    return (
        <Pressable onPress={onPressHandler}>
            <View
                style={[
                    styles.card,
                    {
                        padding: 0,
                        overflow: 'hidden',
                        margin: spacing,
                        ...shadows.sm,
                    },
                ]}
            >
                {/* Image */}
                <View style={{ position: 'relative' }}>
                    <Image
                        source={{ uri: product.imageUrl }}
                        style={{
                            height: 240,
                            width: '100%',
                            backgroundColor: colors.muted,
                        }}
                        resizeMode="cover"
                    />

                    {/* Category badge overlay */}
                    {product.productType && (
                        <View
                            style={{
                                position: 'absolute',
                                top: spacing * 2,
                                left: spacing * 2,
                                ...styles.badge
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 10,
                                    color: colors.accent,
                                    textTransform: 'uppercase',
                                    fontWeight: "bold"
                                }}
                            >
                                {product.productType}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Content */}
                <View style={{ padding: spacing * 3, gap: spacing }}>
                    <Text
                        style={[
                            styles.title,
                            { fontSize: 14, fontWeight: "bold" },
                        ]}
                        numberOfLines={1}
                    >
                        {product.name}
                    </Text>

                    {product.description ? (
                        <Text
                            style={[styles.mutedText, { lineHeight: 16 }]}
                            numberOfLines={2}
                        >
                            {product.description}
                        </Text>
                    ) : null}

                    {product.category && (
                        <Text
                            style={{
                                fontFamily: fonts.sans,
                                fontSize: 11,
                                color: colors.mutedForeground,
                            }}
                            numberOfLines={1}
                        >
                            {product.category}
                        </Text>
                    )}
                </View>
            </View>
        </Pressable>
    );
}

export default ProductCard;