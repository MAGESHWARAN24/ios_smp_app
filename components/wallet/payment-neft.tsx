import { useThemedStyles } from "@/lib/useThemedStyles";
import type { OptionItem } from "@/types";
import * as Clipboard from "expo-clipboard";
import { Check, Copy } from "lucide-react-native";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

/**
 * NOTES ON PORTING FROM WEB
 * -------------------------------------------------------------------------
 * - `navigator.clipboard.writeText` -> `expo-clipboard`'s
 *   `Clipboard.setStringAsync`. (If this isn't an Expo project, use
 *   `@react-native-clipboard/clipboard` instead - same idea, `Clipboard.setString`.)
 * - `sonner`'s `toast` -> `react-native-toast-message`, same as in the
 *   other converted files - keep consistent across the app.
 * - CSS `divide-y divide-border` (border between siblings) has no RN
 *   equivalent utility - implemented as a bottom border on every row
 *   except the last.
 * -------------------------------------------------------------------------
 */

const PaymentNEFTDetails: OptionItem[] = [
    { label: "Account Name", value: "SHREE MARUTHI PRINTERS" },
    { label: "Account Number", value: "154805005088" },
    { label: "IFSC Code", value: "ICIC0001548" },
    { label: "Bank Name", value: "ICIC Bank" },
    { label: "Branch", value: "Siddhapudur Branch,Coimbatore" },
    { label: "Account Type", value: "Current Account" },
];

function CopyField({ item, isLast }: { item: OptionItem; isLast: boolean })
{
    const { colors } = useThemedStyles();
    const [copied, setCopied] = useState(false);

    const handleCopy = async () =>
    {
        try
        {
            await Clipboard.setStringAsync(item.value);
            setCopied(true);
            Toast.show({ type: "success", text1: `${item.label} copied to clipboard` });
            setTimeout(() => setCopied(false), 2000);
        } catch
        {
            Toast.show({ type: "error", text1: "Failed to copy to clipboard" });
        }
    };

    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 12,
                borderBottomWidth: isLast ? 0 : 1,
                borderBottomColor: colors.border,
            }}
        >
            <View style={{ gap: 2, flexShrink: 1 }}>
                <Text
                    style={{
                        fontSize: 11,
                        fontFamily: "Inter_500Medium",
                        color: colors.mutedForeground,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                    }}
                >
                    {item.label}
                </Text>
                <Text
                    numberOfLines={1}
                    style={{ fontSize: 14, fontFamily: "FiraCode_400Regular", fontWeight: "600", color: colors.foreground }}
                >
                    {item.value}
                </Text>
            </View>
            <TouchableOpacity
                onPress={handleCopy}
                accessibilityLabel={`Copy ${item.label}`}
                style={{ marginLeft: 16, height: 32, width: 32, alignItems: "center", justifyContent: "center" }}
            >
                {copied ? (
                    <Check size={16} color="#22c55e" />
                ) : (
                    <Copy size={16} color={colors.mutedForeground} />
                )}
            </TouchableOpacity>
        </View>
    );
}

export default function PaymentNEFT()
{
    const { colors } = useThemedStyles();

    return (
        <View
            style={{
                width: "100%",
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                backgroundColor: colors.card,
                padding: 16,
            }}
        >
            {PaymentNEFTDetails.map((item, index) => (
                <CopyField key={item.label} item={item} isLast={index === PaymentNEFTDetails.length - 1} />
            ))}
        </View>
    );
}