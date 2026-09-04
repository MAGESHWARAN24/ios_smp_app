// import { useThemedStyles } from '@/lib/useThemedStyles';
// import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
// import { X } from 'lucide-react-native';
// import { useCallback, useEffect, useMemo, useRef, type FC } from 'react';
// import { Alert, BackHandler, TouchableOpacity, View } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import WebView, { WebViewNavigation } from 'react-native-webview';

// interface ScreenProps { }

// function templateToRegex(template: string)
// {
//     const parts = template.split(/\{(\w+)\}/g)
//     let pattern = ''
//     for (let i = 0; i < parts.length; i++)
//     {
//         pattern += i % 2 === 0
//             ? parts[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
//             : `(?<${parts[i]}>[^/?&]+)`
//     }
//     return new RegExp(`^${pattern}(?:[?&].*)?$`)
// }

// function plainUrlToRegex(url: string)
// {
//     const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
//     return new RegExp(`^${escaped}(?:[?&].*)?$`)
// }

// const Screen: FC<ScreenProps> = () =>
// {
//     const { accessCode = "", encryptedData = "", paymentUrl = "" } = useLocalSearchParams<{ paymentUrl: string, accessCode: string, encryptedData: string }>()
//     const appTheme = useThemedStyles()
//     const router = useRouter()
//     const navigation = useNavigation()
//     const navigatingAwayRef = useRef(false)
//     const successRegex = useMemo(() => templateToRegex(process.env.EXPO_PUBLIC_CCAVENUE_ORDER_SUCCESS_URL!), [])
//     const cancelRegex = useMemo(() => templateToRegex(process.env.EXPO_PUBLIC_CCAVENUE_CANCEL_SUCCESS_URL!), [])
//     const walletRegex = useMemo(() => plainUrlToRegex(process.env.EXPO_PUBLIC_CCAVENUE_WALLET_URL!), [])

//     const html = `
//       <html><body onload="document.forms[0].submit()">
//         <form method="POST" action="${paymentUrl}">
//           <input type="hidden" name="encRequest" value="${encryptedData}" />
//           <input type="hidden" name="access_code" value="${accessCode}" />
//         </form>
//       </body></html>
//     `

//     const goToIndex = useCallback(() =>
//     {
//         router.replace('(tabs)/index') // swap for router.dismissTo('/') if this screen is pushed on a stack
//     }, [router])

//     // --- Force back navigation (hardware button + swipe gesture) to index ---
//     useEffect(() =>
//     {
//         // Android hardware back button
//         const backHandler = BackHandler.addEventListener('hardwareBackPress', () =>
//         {
//             goToIndex()
//             return true // true = we handled it, prevent default pop behavior
//         })

//         // iOS swipe-back gesture / any React Navigation "go back" attempt
//         const unsubscribe = navigation.addListener('beforeRemove', (e) =>
//         {
//             if (navigatingAwayRef.current)
//             {
//                 // this removal IS our own goToIndex navigation — let it through
//                 return
//             }
//             e.preventDefault()
//             goToIndex()
//         })

//         return () =>
//         {
//             backHandler.remove()
//             unsubscribe()
//         }
//     }, [navigation, goToIndex])

//     const handleRedirect = useCallback((url: string) =>
//     {
//         if (!url) return

//         const successMatch = url.match(successRegex)
//         if (successMatch?.groups)
//         {
//             const { orderNumber, ReferenceNo } = successMatch.groups
//             router.replace({
//                 pathname: '/order/[orderNumber]/complete',
//                 params: { orderNumber, referenceNo: decodeURIComponent(ReferenceNo) },
//             })
//             return
//         }

//         const cancelMatch = url.match(cancelRegex)
//         if (cancelMatch?.groups)
//         {
//             const { orderNumber } = cancelMatch.groups
//             router.replace({
//                 pathname: '/order/[orderNumber]/paymentfailed',
//                 params: { orderNumber },
//             })
//             return
//         }

//         if (walletRegex.test(url))
//         {
//             router.replace('/wallet')
//             return
//         }
//     }, [successRegex, cancelRegex, walletRegex, router])

//     const handleNavigationStateChange = useCallback((event: WebViewNavigation) =>
//     {
//         handleRedirect(event.url)
//     }, [handleRedirect])

//     const handleShouldStartLoad = useCallback((request: WebViewNavigation) =>
//     {
//         if (successRegex.test(request.url) || cancelRegex.test(request.url) || walletRegex.test(request.url))
//         {
//             handleRedirect(request.url)
//             return false
//         }
//         return true
//     }, [successRegex, cancelRegex, walletRegex, handleRedirect])

//     const handleClosePress = useCallback(() =>
//     {
//         Alert.alert(
//             'Cancel Payment?',
//             'Are you sure you want to cancel this payment?',
//             [
//                 { text: 'Continue Payment', style: 'cancel' },
//                 { text: 'Yes, Cancel', style: 'destructive', onPress: goToIndex },
//             ]
//         )
//     }, [goToIndex])

//     return (
//         <SafeAreaView style={[appTheme.styles.screen]}>
//             <View
//                 style={{
//                     flexDirection: 'row',
//                     justifyContent: 'flex-end',
//                     alignItems: 'center',
//                     paddingHorizontal: 16,
//                     paddingVertical: 12,
//                 }}
//             >
//                 <TouchableOpacity
//                     onPress={handleClosePress}
//                     hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
//                     accessibilityLabel="Cancel payment"
//                     accessibilityRole="button"
//                 >
//                     <X size={24} color={appTheme.colors.accent} />
//                 </TouchableOpacity>
//             </View>
//             <WebView
//                 source={{ html }}
//                 originWhitelist={['*']}
//                 onNavigationStateChange={handleNavigationStateChange}
//                 onShouldStartLoadWithRequest={handleShouldStartLoad}
//                 startInLoadingState
//             />
//         </SafeAreaView>
//     );
// }

// export default Screen;
import { useThemedStyles } from '@/lib/useThemedStyles';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, type FC } from 'react';
import { Alert, BackHandler, Linking, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView, { WebViewNavigation } from 'react-native-webview';
import { WebViewErrorEvent } from 'react-native-webview/lib/WebViewTypes';

interface ScreenProps { }

function templateToRegex(template: string)
{
    const parts = template.split(/\{(\w+)\}/g)
    let pattern = ''
    for (let i = 0; i < parts.length; i++)
    {
        pattern += i % 2 === 0
            ? parts[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            : `(?<${parts[i]}>[^/?&]+)`
    }
    return new RegExp(`^${pattern}(?:[?&].*)?$`)
}

function plainUrlToRegex(url: string)
{
    const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`^${escaped}(?:[?&].*)?$`)
}

const Screen: FC<ScreenProps> = () =>
{
    const { accessCode = "", encryptedData = "", paymentUrl = "" } = useLocalSearchParams<{ paymentUrl: string, accessCode: string, encryptedData: string }>()
    const appTheme = useThemedStyles()
    const router = useRouter()
    const navigation = useNavigation()
    const navigatingAwayRef = useRef(false)

    const successRegex = useMemo(() => templateToRegex(process.env.EXPO_PUBLIC_CCAVENUE_ORDER_SUCCESS_URL!), [])
    const cancelRegex = useMemo(() => templateToRegex(process.env.EXPO_PUBLIC_CCAVENUE_CANCEL_SUCCESS_URL!), [])
    const walletRegex = useMemo(() => plainUrlToRegex(process.env.EXPO_PUBLIC_CCAVENUE_WALLET_URL!), [])
    const paymentFailedRegex = useMemo(() => plainUrlToRegex(process.env.EXPO_PUBLIC_CCAVENUE_PAYMENT_FAILED_URL!), [])

    const html = `
      <html><body onload="document.forms[0].submit()">
        <form method="POST" action="${paymentUrl}">
          <input type="hidden" name="encRequest" value="${encryptedData}" />
          <input type="hidden" name="access_code" value="${accessCode}" />
        </form>
      </body></html>
    `

    // --- Single source of truth for leaving this screen ---
    const goToIndex = useCallback(() =>
    {
        if (navigatingAwayRef.current) return // guard against double-taps / double-triggers
        navigatingAwayRef.current = true
        router.replace('/(tabs)/')
    }, [router])

    // --- Force back navigation (hardware button + swipe gesture) to index ---
    useEffect(() =>
    {
        // Android hardware back button
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () =>
        {
            goToIndex()
            return true // true = we handled it, prevent default pop behavior
        })

        // iOS swipe-back gesture / any React Navigation "go back" attempt
        const unsubscribe = navigation.addListener('beforeRemove', (e) =>
        {
            if (navigatingAwayRef.current)
            {
                // this removal IS our own goToIndex navigation (or a redirect below) — let it through
                return
            }
            e.preventDefault()
            goToIndex()
        })

        return () =>
        {
            backHandler.remove()
            unsubscribe()
        }
    }, [navigation, goToIndex])

    const handleRedirect = useCallback((url: string) =>
    {
        if (!url) return

        const successMatch = url.match(successRegex)
        if (successMatch?.groups)
        {
            navigatingAwayRef.current = true // this is a programmatic redirect too — don't let beforeRemove intercept it
            const { orderNumber, ReferenceNo } = successMatch.groups
            router.replace({
                pathname: '/order/[orderNumber]/complete',
                params: { orderNumber, referenceNo: decodeURIComponent(ReferenceNo) },
            })
            return
        }

        const cancelMatch = url.match(cancelRegex)
        if (cancelMatch?.groups)
        {
            navigatingAwayRef.current = true
            const { orderNumber } = cancelMatch.groups
            router.replace({
                pathname: '/order/[orderNumber]/paymentfailed',
                params: { orderNumber },
            })
            return
        }

        if (walletRegex.test(url))
        {
            navigatingAwayRef.current = true
            router.replace('/wallet')
            return
        }

        if (paymentFailedRegex.test(url))
        {
            navigatingAwayRef.current = true
            router.replace('/(tabs)/')
            return
        }
    }, [successRegex, cancelRegex, walletRegex, router])

    const handleNavigationStateChange = useCallback((event: WebViewNavigation) =>
    {
        handleRedirect(event.url)
    }, [handleRedirect])

    // const handleShouldStartLoad = useCallback((request: WebViewNavigation) =>
    // {
    //     if (
    //         successRegex.test(request.url) ||
    //         cancelRegex.test(request.url) ||
    //         walletRegex.test(request.url) ||
    //         paymentFailedRegex.test(request.url)
    //     )
    //     {
    //         handleRedirect(request.url)
    //         return false
    //     }
    //     return true
    // }, [successRegex, cancelRegex, walletRegex, paymentFailedRegex, handleRedirect])
    const openExternally = useCallback((url: string) =>
    {
        Linking.canOpenURL(url)
            .then((supported) =>
            {
                if (supported)
                {
                    Linking.openURL(url)
                }
                else
                {
                    Alert.alert(
                        'No UPI app found',
                        'Please install a UPI app like GPay, PhonePe, or Paytm to continue.'
                    )
                }
            })
            .catch((err) => console.warn('Error opening external URL', err))
    }, [])
    const handleShouldStartLoad = useCallback((request: WebViewNavigation) =>
    {
        if (
            successRegex.test(request.url) ||
            cancelRegex.test(request.url) ||
            walletRegex.test(request.url) ||
            paymentFailedRegex.test(request.url)
        )
        {
            handleRedirect(request.url)
            return false
        }

        if (!request.url.startsWith('http://') && !request.url.startsWith('https://'))
        {
            openExternally(request.url)
            return false
        }

        return true
    }, [successRegex, cancelRegex, walletRegex, paymentFailedRegex, handleRedirect, openExternally])
    const handleClosePress = useCallback(() =>
    {
        Alert.alert(
            'Cancel Payment?',
            'Are you sure you want to cancel this payment?',
            [
                { text: 'Continue Payment', style: 'cancel' },
                { text: 'Yes, Cancel', style: 'destructive', onPress: goToIndex },
            ]
        )
    }, [goToIndex])

    const handleError = useCallback((syntheticEvent: WebViewErrorEvent) =>
    {
        const { nativeEvent } = syntheticEvent
        console.log('WebView error:', nativeEvent)

        if (
            nativeEvent.code === -10 ||
            nativeEvent.description === 'net::ERR_UNKNOWN_URL_SCHEME'
        )
        {
            const { url } = nativeEvent
            if (url && !url.startsWith('http'))
            {
                openExternally(url)
            }
        }
    }, [openExternally])

    return (
        <SafeAreaView style={[appTheme.styles.screen]}>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                }}
            >
                <TouchableOpacity
                    onPress={handleClosePress}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Cancel payment"
                    accessibilityRole="button"
                >
                    <X size={24} color={appTheme.colors.accent} />
                </TouchableOpacity>
            </View>
            <WebView
                source={{ html }}
                originWhitelist={['*']}
                onNavigationStateChange={handleNavigationStateChange}
                onShouldStartLoadWithRequest={handleShouldStartLoad}
                startInLoadingState
                onError={handleError}
            />
        </SafeAreaView>
    );
}

export default Screen;