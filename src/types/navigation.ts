import { type LucideIcon } from "lucide-react";

export type TNavigation = {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    adminOnly?: boolean;
    mitraOrAdminOnly?: boolean;
    companyOnly?: boolean;
    roles?: ('ADMIN' | 'MODERATOR' | 'USER' | 'MITRA')[];
    items?: {
        title: string;
        url: string;
        adminOnly?: boolean;
        mitraOrAdminOnly?: boolean;
        companyOnly?: boolean;
        roles?: ('ADMIN' | 'MODERATOR' | 'USER' | 'MITRA')[];
    }[];
};