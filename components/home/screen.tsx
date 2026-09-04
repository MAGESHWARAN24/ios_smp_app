import { useThemedStyles } from '@/lib/useThemedStyles';
import type { FC } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import HeroBanner from './hero-banner';
import ProductCategories from './product-categories';
import StatsBar from './status-bar';

interface HomeScreenProps { }

const styles = StyleSheet.create({
    container: {
        paddingVertical: 20
    }
})

const HomeScreen: FC<HomeScreenProps> = () =>
{
    const appTheme = useThemedStyles()
    return (
        <ScrollView style={[appTheme.styles.screen, styles.container]}>
            <HeroBanner />
            <StatsBar />
            <ProductCategories />
        </ScrollView>
    );
}

export default HomeScreen;
