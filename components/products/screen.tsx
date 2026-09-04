import { useThemedStyles } from '@/lib/useThemedStyles';
import type { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import Catalog from './catalog';
import CategoryBadge from './category-badge';
import ProductSearchBar from './product-search-bar';
import Provider from './provider';

interface ProductScreenProps { }

const styles = StyleSheet.create({
    container: {
        padding: 10,
        gap: 5
    }
})

const ProductScreen: FC<ProductScreenProps> = () =>
{
    const appTheme = useThemedStyles()
    return (
        <Provider>
            <View style={[styles.container]}>
                <ProductSearchBar />
                <CategoryBadge />
                <Catalog />
            </View>
        </Provider>
    );
}

export default ProductScreen;
