import { useThemedStyles } from "@/lib/useThemedStyles";
import React from "react";
import { Text, View } from "react-native";

const WalletHeader = () =>
{
    const { colors } = useThemedStyles();

    return (
        <View style={{ marginBottom: 24 }}>
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 26, color: colors.foreground }}>
                Wallet
            </Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: colors.mutedForeground }}>
                Manage your balance and view transaction history
            </Text>
        </View>
    );
};

export default WalletHeader;