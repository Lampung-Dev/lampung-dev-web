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
        async session(params) {
            try {
                const existingUser = await getUserByEmailService(params.session.user.email)

                if (!existingUser) {
                    // If user doesn't exist, create a new user
                    const [newUser] = await createUserService({
                        name: params.session.user.name!,
                        email: params.session.user.email,
                        picture: params.session.user.image!,
                        passwordHash: null,
                        title: null
                    })

                    await creatSessionService({
                        userId: newUser.id,
                        expiresAt: new Date(params.session.expires),
                    })
                } else {
                    const existingSession = await getSessionByUserIdService(existingUser.id as string)

                    await updateSessionService({
                        expiresAt: new Date(params.session.expires),
                        sessionId: existingSession?.id as string
                    })
                }

                params.session.user.role = existingUser?.role

                return params.session

            } catch (error) {
                console.error("Error in session callback:", error);
                throw error;
            }
        }

    },
});
