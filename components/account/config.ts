import { IconOptionItem } from "@/types";
import { Landmark, MapPinned, MessageCircleQuestionMark, PackageCheck, Wallet } from "lucide-react-native";

export const presetNavigationItems: IconOptionItem[] = [
    {
        icon: Wallet,
        label: "Wallet",
        value: "(presets)/wallet"
    },
    {
        icon: PackageCheck,
        label: "Orders",
        value: "(tabs)/orders"
    },
    {
        icon: MessageCircleQuestionMark,
        label: "Support",
        value: "(presets)/support"
    },
    {
        icon: MapPinned,
        label: "Address",
        value: "(presets)/address"
    },
    {
        icon: Landmark,
        label: "Wallet Transactions",
        value: "(presets)/wallettransactions"
    },
    {
        icon: MapPinned,
        label: "Wallet Approval",
        value: "(presets)/walletapproval"
    },

]