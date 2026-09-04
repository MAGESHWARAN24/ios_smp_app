import { useApiAction } from "@/components/api-actions/hook";
import { api } from "@/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { AuthProviderContext } from "./config";
import type {
    AuthProviderProps,
    AuthUser,
    SignIn
} from "./type";


const AUTH_COOKIE_KEY = process.env.EXPO_PUBLIC_AUTH_COOKIE as string;

// Fields whose UI value is a Combobox-shaped { label, value } option, but
// whose API value should just be the underlying id (`value`).
const OPTION_ID_FIELDS = [
    "pincodeId",
    "countryId",
    "stateId",
    "districtId",
    "cityId",
] as const;

function isOptionItem(value: unknown): value is { label: string; value: string }
{
    return (
        !!value &&
        typeof value === "object" &&
        "label" in (value as any) &&
        "value" in (value as any)
    );
}

function isPickedFile(value: unknown): value is { uri: string; name: string; mimeType?: string; type?: string }
{
    return !!value && typeof value === "object" && "uri" in (value as any) && "name" in (value as any);
}

function buildSignUpFormData(payload: Record<string, any>)
{
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) =>
    {
        if (value === null || value === undefined) return;

        if (isPickedFile(value))
        {
            formData.append(key, {
                uri: value.uri,
                name: value.name,
                type: value.mimeType ?? value.type ?? "application/octet-stream",
            } as any);
        } else if (isOptionItem(value))
        {
            // Combobox fields (pincodeId, countryId, etc.) — send just the id,
            // not the whole { label, value } object, or the API receives a
            // JSON string where it expects a plain id and rejects it.
            formData.append(`${key}.label`, value.label);
            formData.append(`${key}.value`, value.value);
        } else if (typeof value === "object")
        {
            formData.append(key, JSON.stringify(value));
        } else
        {
            formData.append(key, String(value));
        }
    });
    return formData;
}

// FormData isn't a plain object, so JSON.stringify(formData) just logs "{}".
// Use this instead when you need to see what's actually being sent.
function logFormData(formData: FormData)
{
    // @ts-ignore - React Native's FormData supports iteration even though
    // the TS lib.dom typings for FormData used here may not declare it.
    for (const [key, value] of (formData as any)._parts ?? [])
    {
        console.log(key, value);
    }
}

function Provider({ children }: AuthProviderProps)
{
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isHydrating, setIsHydrating] = useState(true);

    const { apiActionAsync } = useApiAction();

    // Runs once on mount only. The previous `[user]` dependency re-ran this
    // effect every time setUser fired inside it, causing a hydration loop.
    useEffect(() =>
    {
        let mounted = true;
        (async () =>
        {
            try
            {
                const stored = await AsyncStorage.getItem(AUTH_COOKIE_KEY);
                if (mounted)
                {
                    setUser(stored ? (JSON.parse(stored) as AuthUser) : null);
                }
            } finally
            {
                if (mounted) setIsHydrating(false);
            }
        })();
        return () =>
        {
            mounted = false;
        };
    }, []);

    const signInAsync = useCallback(async (payload: SignIn) =>
    {
        try
        {
            const response = await api.post(`auth/signin`, payload);

            if (response.status == 200 && response.data)
            {
                await AsyncStorage.setItem(AUTH_COOKIE_KEY, JSON.stringify(response.data.payload))
                setUser(response.data.payload)
            }

            await apiActionAsync(response);
        } catch (error)
        {
            if (error instanceof AxiosError && error.response)
            {
                await apiActionAsync(error.response);
            }
        }
    }, [apiActionAsync]);

    const signUpAsync = useCallback(async (values: any) =>
    {
        try
        {
            const payload = {
                ...values,
                shopBannerFile:
                    Array.isArray(values.shopBannerFile) && values.shopBannerFile.length >= 1
                        ? values.shopBannerFile[0]
                        : null,
                visitingCardFile:
                    Array.isArray(values.visitingCardFile) && values.visitingCardFile.length >= 1
                        ? values.visitingCardFile[0]
                        : null,
            };

            const formData = buildSignUpFormData(payload);

            // if (__DEV__)
            // {
            //     logFormData(formData);
            // }

            const response = await api.post(`auth/signup`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            await apiActionAsync(response);
        } catch (error)
        {
            if (error instanceof AxiosError && error.response)
            {
                // if (__DEV__)
                // {
                //     Alert.alert("Warning", JSON.stringify(error.response.data));
                // }
                await apiActionAsync(error.response);
            }
        }
    }, [apiActionAsync]);

    const signOutAsync = useCallback(async () =>
    {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: async () =>
                    {
                        try
                        {
                            const response = await api.post(`auth/signout`);
                            await AsyncStorage.removeItem(AUTH_COOKIE_KEY);
                            setUser(null);
                            await apiActionAsync(response);
                        } catch (error)
                        {
                            if (error instanceof AxiosError && error.response)
                            {
                                await apiActionAsync(error.response);
                            }
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    }, [apiActionAsync]);

    return (
        <AuthProviderContext.Provider value={{
            user,
            isAuthenticated: !!user,
            signInAsync,
            signOutAsync,
            signUpAsync,
        }}>
            {children}
        </AuthProviderContext.Provider>
    );
}

export default Provider