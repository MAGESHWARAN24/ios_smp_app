import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AxiosResponse } from "axios";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import { LocalStorageEnum, NavigationEnum, NextStepEnum, type BaseResponse } from "./type";

export function useApiAction()
{
    const router = useRouter();

    const apiActionAsync = useCallback(async (axiosResponse: AxiosResponse) =>
    {
        const { data }: { data: BaseResponse<any> } = axiosResponse;

        if (!data)
        {
            return;
        }

        if (!("isSuccess" in data))
        {
            return;
        }

        if (!Array.isArray(data.actions))
        {
            return;
        }

        // use a for...of loop instead of forEach so async actions run in order and are awaited
        for (const action of data.actions)
        {
            const { type, step } = action;

            switch (type)
            {
                case NextStepEnum.NOTIFICATION: {
                    const { message, variant } = step;
                    Toast.show({
                        type: variant,
                        text1: message.category,
                        text2: message.description,
                    });
                    break;
                }

                case NextStepEnum.NAVIGATION: {
                    const { variant, path, baseUrl, state } = step;
                    const url = `${baseUrl}${path ? `/${path}` : ''}`
                    switch (variant)
                    {
                        case NavigationEnum.INTERNAL:
                        case NavigationEnum.TEMPORARY: {
                            router.push({ pathname: url, params: state })
                            break;
                        }
                        case NavigationEnum.PERMENENT: {
                            router.replace({ pathname: url, params: state })
                            break;
                        }
                        case NavigationEnum.EXTERNAL: {
                            const { baseUrl } = step;
                            const externalUrl = `${baseUrl}${path ? `/${path}` : ""}`;
                            const { Linking } = await import("react-native");
                            const supported = await Linking.canOpenURL(externalUrl);
                            if (supported)
                            {
                                await Linking.openURL(externalUrl);
                            }
                            break;
                        }
                    }
                    break;
                }

                case NextStepEnum.LOCALSTORAGE: {
                    const { variant, propertyName, propertyValue } = step;
                    switch (variant)
                    {
                        case LocalStorageEnum.SET: {
                            await AsyncStorage.setItem(propertyName, JSON.stringify(propertyValue));
                            break;
                        }
                        case LocalStorageEnum.REMOVE: {
                            await AsyncStorage.removeItem(propertyName);
                            break;
                        }
                    }
                    break;
                }
                case NextStepEnum.DIALOGBOX: {
                    const { action, message, icon } = step
                    Alert.alert(message.category, `${message.description}, ${action}`)
                    break;
                }
            }
        }
    }, [router]);

    return { apiActionAsync };
}