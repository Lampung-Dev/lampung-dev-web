import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function errorHandler({
    error,
    secondErrorMessage,
}: {
    error: Error;
    secondErrorMessage: string;
}) {
    if (error instanceof Error) {
        if (error.message.includes("Rate limit exceeded")) {
            toast.error(error.message);
        } else {
            toast.error(secondErrorMessage);
        }
    }
}

export const truncateString = (str: string, num: number) => {
    if (str.length <= num) {
        return str;
    }
    return str.slice(0, num) + "...";
};
