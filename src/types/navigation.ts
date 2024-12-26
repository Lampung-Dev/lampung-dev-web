import { type LucideIcon } from "lucide-react";

export type TNavigation = {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean
    items?: {
        title: string
        url: string
    }[]
}