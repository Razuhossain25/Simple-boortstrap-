import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

// No baseURL: the auth API lives on the same origin as the client app.
export const authClient = createAuthClient({ plugins: [jwtClient()] });
