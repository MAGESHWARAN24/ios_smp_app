import { api } from '@/lib/api';
import { useThemedStyles } from '@/lib/useThemedStyles';
import { AxiosError } from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState, useTransition, type FC } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApiAction } from '../api-actions/hook';
import { defaultOptions } from './config';
import Content from './content';
import { ProductConfigOptions } from './type';

interface ProductScreenProps { }

const styles = StyleSheet.create({
    loadingContainer: {
        alignItems: "center",
        justifyContent: "center",
    }
})

const ProductScreen: FC<ProductScreenProps> = () =>
{
    const { productId = "" } = useLocalSearchParams<{ productId: string }>()
    const [loading, startTransition] = useTransition()
    const initialRef = useRef<boolean>(true)
    const appTheme = useThemedStyles()
    const [options, setOptions] = useState<ProductConfigOptions>(defaultOptions)
    const { apiActionAsync } = useApiAction()
    const fetchData = useCallback(async (id: string) =>
    {
        try
        {
            const response = await api.get(`product/dynamicconfiguration?productId=${productId}`)
            if (response.status == 200 && response.data)
            {
                setOptions({ ...defaultOptions, ...response.data })
            }
        }
        catch (error)
        {
            if (error instanceof AxiosError && error.response)
            {
                await apiActionAsync(error.response)
            }
        }
        finally
        {
            initialRef.current = false
        }
    }, [])

    useEffect(() =>
    {
        if (!productId) return;

        startTransition(async () =>
        {
            await fetchData(productId)
        })

    }, [productId])


    if (loading && initialRef.current)
    {
        return (
            <SafeAreaView style={[appTheme.styles.screen, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={appTheme.colors.primary} />
            </SafeAreaView>
        )
    }

    if (!options)
    {
        return (
            <View style={[appTheme.styles.screen]}>
                <Text></Text>
            </View>
        )
    }

    return (
        <View style={[appTheme.styles.screen]}>
            <Content options={options} />
        </View>
    );
}

export default ProductScreen;
