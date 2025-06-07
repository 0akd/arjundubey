// Add this temporarily to debug the issue
console.log('Environment variables check:');
console.log('FIREBASE_ADMIN_PRIVATE_KEY exists:', !!process.env.FIREBASE_ADMIN_PRIVATE_KEY);
console.log('FIREBASE_ADMIN_CLIENT_EMAIL exists:', !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID exists:', !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

export const serverConfig = {
  cookieName: process.env.AUTH_COOKIE_NAME!,
  cookieSignatureKeys: [
    process.env.AUTH_COOKIE_SIGNATURE_KEY_CURRENT!, 
    process.env.AUTH_COOKIE_SIGNATURE_KEY_PREVIOUS!
  ],
  cookieSerializeOptions: {
    path: "/",
    httpOnly: true,
    secure: process.env.USE_SECURE_COOKIES === "true",
    sameSite: "lax" as const,
    maxAge: 12 * 60 * 60 * 24 * 1000,
  },
  serviceAccount: {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
    privateKey: (() => {
      const key = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
      if (!key) {
        console.error('FIREBASE_ADMIN_PRIVATE_KEY is not defined');
        return '';
      }
      return key.replace(/\\n/g, '\n');
    })(),
  }
};

export const clientConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!
};