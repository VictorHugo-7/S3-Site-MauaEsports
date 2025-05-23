import { PublicClientApplication } from "@azure/msal-browser";

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${
      import.meta.env.VITE_TENANT_ID
    }`,
    redirectUri: "http://localhost:5173/",
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
