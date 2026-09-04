import { api } from '@/lib/api';
import { useThemedStyles } from '@/lib/useThemedStyles';
import { ImageOptionItem } from '@/types';
import { AxiosError } from 'axios';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState, type FC } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useApiAction } from '../api-actions/hook';

interface ProductCategoriesProps { }

const NUM_COLUMNS = 2
const SCREEN_PADDING = 12
const CARD_GAP = 10
const IMAGE_PADDING = 8

const ProductCategories: FC<ProductCategoriesProps> = () =>
{
    const appTheme = useThemedStyles()
    const { colors, shadows } = appTheme
    const { apiActionAsync } = useApiAction()
    const router = useRouter()

    const [items, setItems] = useState<ImageOptionItem[]>([])
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () =>
    {
        setLoading(true)
        try
        {
            const response = await api.get(`product/producttypes`)
            if (response.status == 200 && response.data)
            {
                setItems(response.data ?? [])
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
    }, [apiActionAsync, setItems])

    useEffect(() =>
    {
        fetchData()
    }, [fetchData])

    const handleSelectCategory = useCallback((item: ImageOptionItem) =>
    {
        router.push({
            pathname: '/(tabs)/products',
            params: { productType: String(item.value) },
        })
    }, [router])

    const cardWidth = useMemo(() =>
    {
        const screenWidth = Dimensions.get('window').width
        const totalGap = CARD_GAP * (NUM_COLUMNS - 1) + SCREEN_PADDING * 2
        return (screenWidth - totalGap) / NUM_COLUMNS
    }, [])

    const styles = useMemo(() => StyleSheet.create({
        wrapper: {
            paddingHorizontal: SCREEN_PADDING,
            paddingBottom: SCREEN_PADDING * 3,
            gap: 12,
        },
        title: {
            fontFamily: 'AvenirNext-DemiBold',
            fontSize: 20,
            color: colors.foreground,
        },
        listContent: {
            gap: CARD_GAP,
        },
        row: {
            gap: CARD_GAP,
        },
        card: {
            width: cardWidth,
            borderRadius: 16,
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: 1,
            overflow: 'hidden',
            ...shadows.xs,
        },
        cardImageWrap: {
            width: '100%',
            height: cardWidth - IMAGE_PADDING * 2,
            padding: IMAGE_PADDING,
        },
        cardImage: {
            width: '100%',
            height: '100%',
            borderRadius: 12,
            backgroundColor: colors.secondary,
        },
        cardLabelWrap: {
            paddingBottom: 10,
            paddingHorizontal: 10,
        },
        cardLabel: {
            fontFamily: 'AvenirNext-Bold',
            fontSize: 12,
            fontWeight: 'bold',
            color: colors.foreground,
            textAlign: 'left',
        },
        cardPressed: {
            opacity: 0.7,
        },
        loadingWrap: {
            paddingVertical: 40,
            alignItems: 'center',
            justifyContent: 'center',
        },
        emptyWrap: {
            paddingVertical: 24,
            alignItems: 'center',
            justifyContent: 'center',
        },
        emptyText: {
            fontFamily: 'AvenirNext-Regular',
            fontSize: 13,
            color: colors.mutedForeground,
        },
    }), [colors, shadows, cardWidth])

    if (loading)
    {
        return (
            <View style={styles.wrapper}>
                <Text style={styles.title}>Categories</Text>
                <View style={styles.loadingWrap}>
                    <ActivityIndicator color={colors.primary} />
                </View>
            </View>
        )
    }

    if (!items.length)
    {
        return (
            <View style={styles.wrapper}>
                <Text style={styles.title}>Categories</Text>
                <View style={styles.emptyWrap}>
                    <Text style={styles.emptyText}>No categories available right now.</Text>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.wrapper}>
            <Text style={styles.title}>Categories</Text>
            <FlatList
                data={items}
                keyExtractor={(item) => item.value}
                numColumns={NUM_COLUMNS}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.listContent}
                scrollEnabled={false}
                renderItem={({ item }) => (
                    <Pressable
                        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                        onPress={() => handleSelectCategory(item)}
                    >
                        <View style={styles.cardImageWrap}>
                            <Image
                                source={{ uri: item.label }}
                                style={styles.cardImage}
                                resizeMode="cover"
                            />
                        </View>
                        <View style={styles.cardLabelWrap}>
                            <Text style={styles.cardLabel} numberOfLines={2}>
                                {item.description}
                            </Text>
                        </View>
                    </Pressable>
                )}
            />
        </View>
    );
}

export default ProductCategories;