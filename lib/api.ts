import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { Alert } from "react-native";


export interface ApiConfigItem
{
    name: string;
    email: string;
    avatar: string;
    createdAt: string
    token: string
}

const baseURL = process.env.EXPO_PUBLIC_BASE_URL as string;
const AUTH_COOKIE_KEY = process.env.EXPO_PUBLIC_AUTH_COOKIE as string;
const api = axios.create({
    baseURL,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json; charset=utf-8;",
    },
});

api.interceptors.request.use(
    async (config) =>
    {

        try
        {
            const raw = await AsyncStorage.getItem(AUTH_COOKIE_KEY);
            if (raw)
            {
                const auth: ApiConfigItem = JSON.parse(raw);
                if (auth?.token)
                {
                    config.headers.Authorization = `Bearer ${auth.token}`;
                }
            }
        } catch (e)
        {
            console.warn('Failed to parse stored auth data', e);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async function (error)
    {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry)
        {
            originalRequest._retry = true;
            try
            {
                const response = await axios.post(`${baseURL}/auth/refreshtoken`);

                Alert.alert("Auth Redirect")
                if (response.status === 200 && response.data)
                {
                    if (response.data.token)
                    {
                        await AsyncStorage.setItem(AUTH_COOKIE_KEY, response.data.token);
                    }
                    return api(originalRequest);
                }

                if (response.status === 440)
                {
                    await AsyncStorage.removeItem(AUTH_COOKIE_KEY);
                    redirectToLogin();
                }
            } catch (refreshError)
            {
                await AsyncStorage.removeItem(AUTH_COOKIE_KEY);
                redirectToLogin();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

function redirectToLogin()
{
    router.replace("/auth/login");
}

export { api };

