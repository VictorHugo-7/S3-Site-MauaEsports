import { PublicClientApplication } from "@azure/msal-browser";

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_CLIENT_ID, // Registre um app no Azure AD para obter isso
    authority: `https://login.microsoftonline.com/${
      import.meta.env.VITE_TENANT_ID
    }`,
    redirectUri:
      "https://6e3b-2804-7f0-18-48bc-c008-f94d-3eca-98d2.ngrok-free.app",
  },
  cache: {
    cacheLocation: "localStorage", // IMPORTANTE: mantém o login após reload
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["openid", "profile", "User.Read"],
};
// Verifica se as variáveis necessárias estão definidas
if (!import.meta.env.VITE_CLIENT_ID || !import.meta.env.VITE_TENANT_ID) {
  console.error("Variáveis de ambiente necessárias não estão definidas!");
}
export const msalInstance = new PublicClientApplication(msalConfig);
await msalInstance.initialize?.();
