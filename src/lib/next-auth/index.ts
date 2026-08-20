import { creatSessionService, getSessionByUserIdService, updateSessionService } from "@/services/auth";
import { createUserService, getUserByEmailService } from "@/services/user";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { auth, handlers, signIn, signOut } = NextAuth({
    trustHost: true,
    secret: process.env.AUTH_SECRET,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            try {
                if (!user?.email) return false;

                const existingUser = await getUserByEmailService(user.email);

                if (!existingUser) {
                    // Create new user ONLY during actual login
                    const [newUser] = await createUserService({
                        name: user.name || "Anonymous Member",
                        email: user.email,
                        picture: user.image || "/images/placeholder-image.jpeg",
                        passwordHash: null,
                        title: null,
                        companyId: null,
                    });

                    await creatSessionService({
                        userId: newUser.id,
                        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    });
                } else if (existingUser.status === "BANNED") {
                    return false;
                }

                return true;
            } catch (error) {
                console.error("Error in signIn callback:", error);
                return false;
            }
        },
        async session(params) {
            try {
                if (!params.session?.user?.email) {
                    return params.session;
                }

                const existingUser = await getUserByEmailService(params.session.user.email);

                // If user was deleted or is banned, do NOT recreate them!
                if (!existingUser || existingUser.status === "BANNED") {
                    // Invalidate user from session
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    params.session.user = null;
                    return params.session;
                }

                const existingSession = await getSessionByUserIdService(existingUser.id as string);

                if (existingSession) {
                    await updateSessionService({
                        expiresAt: new Date(params.session.expires),
                        sessionId: existingSession.id as string,
                    });
                }

                // Add id, role, and companyId to session user
                if (params.session.user) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    params.session.user.id = existingUser.id;
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    params.session.user.role = existingUser.role;
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    params.session.user.companyId = existingUser.companyId;
                }

                return params.session;
            } catch (error) {
                console.error("Error in session callback:", error);
                return params.session;
            }
        },
    },
});
