import { api } from "@/lib/api";
import { useThemedStyles } from "@/lib/useThemedStyles";
import { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useApiAction } from "../api-actions/hook";
import type { WalletInfo } from "./type";

/**
 * NOTE: React's `useTransition` exists in RN too (same React reconciler),
 * so it's kept as-is rather than replaced - it still works for marking a
 * state update as non-urgent. Everything else here ports 1:1 since there
 * was no DOM-specific code in the original besides the JSX tags.
 */

const CurrentBalance = () =>
{
    const { colors } = useThemedStyles();
    const { apiActionAsync } = useApiAction();
    const [loading, setLoading] = useState(true);
    const [walletInfo, setWalletInfo] = useState<WalletInfo>({
        currentBalance: 0,
        totalAddedFund: 0,
        totalSpendFund: 0,
    });

    useEffect(() =>
    {
        let mounted = true;
        (async () =>
        {
            try
            {
                const response = await api.get(`wallet/info`);
                if (mounted && response.status === 200 && response.data)
                {
                    setWalletInfo(response.data);
                }
            } catch (error)
            {
                if (error instanceof AxiosError && error.response)
                {
                    await apiActionAsync(error.response);
                }
            } finally
            {
                if (mounted) setLoading(false);
            }
        })();
        return () =>
        {
            mounted = false;
        };
    }, []);

    return (
        <View
            style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                backgroundColor: colors.card,
                padding: 16,
            }}
        >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Text style={{ fontSize: 18, color: colors.cardForeground, fontFamily: "Inter_400Regular" }}>
                    Current balance Rs:
                </Text>
                <Text style={{ fontSize: 22, fontFamily: "Inter_600SemiBold", color: colors.cardForeground }}>
                    {loading ? 0 : walletInfo.currentBalance}
                </Text>
            </View>
        </View>
    );
};

export default CurrentBalance;