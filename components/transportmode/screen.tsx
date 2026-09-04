import { useThemedStyles } from '@/lib/useThemedStyles';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, type FC } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import CheckoutFooter from '../checkout/checkout-footer';
import { transportMode } from './config';
import TransportModeItem from './transport-mode-item';

interface TransportModeScreenProps { }

const styles = StyleSheet.create({
    container: {
        padding: 10,
        gap: 10
    }
})

const TransportModeScreen: FC<TransportModeScreenProps> = () =>
{
    const appTheme = useThemedStyles()
    const [transportModeId, setTransportModeId] = useState<string>("")
    const { addressId = '' } = useLocalSearchParams<{
        addressId: string;
        transportModeId: string;
    }>();

    return (
        <View style={[appTheme.styles.screen]}>
            <View style={[styles.container]}>
                {transportMode.map(item => (
                    <TransportModeItem
                        key={item.value}
                        isSelected={item.value == transportModeId}
                        item={item}
                        onSelect={() =>
                        {
                            setTransportModeId(item.value)
                            if (item.value == "f7ba2a38-0191-ab37-c57d-c65e0d95c45c")
                            {
                                Alert.alert(
                                    "Pick from Maruthi",
                                    "you have chose pick up from maruthi and you should collect the product from Shree Maruthi Printers Coimbatore"
                                )
                            }
                        }}
                    />
                ))}
            </View>
            <CheckoutFooter
                isHasNextPage={!!transportModeId}
                nextPageLabel='Next'
                onPressHandler={() =>
                {
                    router.push(`checkout/${addressId}/${transportModeId}/payment`)
                }}
            />
        </View>
    );
}

export default TransportModeScreen;
