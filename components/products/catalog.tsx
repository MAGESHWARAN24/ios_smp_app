import { useThemedStyles } from '@/lib/useThemedStyles';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { SearchX } from 'lucide-react-native';
import type { FC } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { useProduct } from './config';
import ProductCard from './product-card';

interface CatalogProps { }

function EmptyCatalog({ onReset }: { onReset: () => void })
{
    const { colors, styles: theme } = useThemedStyles()

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32, paddingVertical: 48 }}>
            <View
                style={{
                    height: 72,
                    width: 72,
                    borderRadius: 999,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.muted,
                }}
            >
                <SearchX size={32} color={colors.mutedForeground} />
            </View>
            <Text style={[theme.title, { textAlign: 'center' }]}>No products found</Text>
            <Text style={[theme.mutedText, { textAlign: 'center' }]}>Try adjusting or clearing your filters</Text>
            <Pressable onPress={onReset} style={[theme.primaryButton, { marginTop: 8, alignSelf: 'stretch' }]}>
                <Text style={theme.primaryButtonText}>Reset Filters</Text>
            </Pressable>
        </View>
    )
}

const Catalog: FC<CatalogProps> = () =>
{
    const { items, loading, resetFilter } = useProduct()
    const { styles } = useThemedStyles()
    const tabBarHeight = useBottomTabBarHeight()
    const products = items?.products ?? []

    if (loading)
    {
        return (
            <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator />
            </View>
        )
    }

    return (
        <FlatList
            data={products}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={[
                { paddingBottom: tabBarHeight + 30 },
                // products.length === 0 && { flex: 1 },
            ]}
            ListEmptyComponent={<EmptyCatalog onReset={resetFilter} />}
            renderItem={({ item }) => (
                <ProductCard product={item} />
            )}
        />
    );
}

export default Catalog;