import { TSession } from "@/lib/database/schema";

export type TNewSession = Omit<TSession, 'id'> & {
    id?: TSession['id'];

}