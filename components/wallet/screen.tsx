import { useThemedStyles } from "@/lib/useThemedStyles";
import type { FC } from "react";
import { ScrollView, View } from "react-native";
import AddFunds from "./add-funds";
import WalletHeader from "./wallet-header";

interface WalletProps { }

const WalletScreen: FC<WalletProps> = () =>
{
    const { styles } = useThemedStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, gap: 16 }}>
            <WalletHeader />
            <View style={{ gap: 16 }}>
                <AddFunds />
            </View>
        </ScrollView>
    );
};

export default WalletScreen;