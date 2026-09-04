import { IconOptionItem } from "@/types";
import { Building2, Bus, TruckElectric } from "lucide-react-native";

export const transportMode: IconOptionItem[] = [
    {
        label: "Pick from Maruthi",
        value: "f7ba2a38-0191-ab37-c57d-c65e0d95c45c",
        icon: Building2
    },
    {
        label: "Courier",
        value: "f4d52b0d-a4fa-4dbb-b855-c215ac55e509",
        icon: TruckElectric
    },
    {
        label: "Transportation",
        value: "426dd7ed-4cf8-4d63-da5e-a641e9cca771",
        icon: Bus
    }
]