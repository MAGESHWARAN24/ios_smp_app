import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef, type FC, type PropsWithChildren } from 'react';
import { Alert } from 'react-native';

const NetworkProvider: FC<PropsWithChildren> = ({ children }) =>
{
    const wasOffline = useRef(false);
    const alertShown = useRef(false);

    useEffect(() =>
    {
        const unsubscribe = NetInfo.addEventListener((state) =>
        {
            const isConnected = Boolean(state.isConnected && state.isInternetReachable !== false);

            if (!isConnected && !alertShown.current)
            {
                alertShown.current = true;
                wasOffline.current = true;
                Alert.alert(
                    'No Internet Connection',
                    'Please check your internet connection and try again.',
                    [
                        {
                            text: 'OK',
                            onPress: () =>
                            {
                                alertShown.current = false;
                            },
                        },
                    ],
                    { cancelable: false }
                );
            }

            if (isConnected)
            {
                alertShown.current = false;
            }
        });

        return () => unsubscribe();
    }, []);

    return <>{children}</>;
};

export default NetworkProvider;