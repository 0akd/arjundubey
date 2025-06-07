
export const serverConfig = {
  cookieName: process.env.AUTH_COOKIE_NAME!,
  cookieSignatureKeys: [process.env.AUTH_COOKIE_SIGNATURE_KEY_CURRENT!, process.env.AUTH_COOKIE_SIGNATURE_KEY_PREVIOUS!],
  cookieSerializeOptions: {
    path: "/",
    httpOnly: true,
    secure: process.env.USE_SECURE_COOKIES === "true",
    sameSite: "lax" as const,
    maxAge: 12 * 60 * 60 * 24,
  },
serviceAccount: {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
  privateKey:'-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCrYQiC62t+nPkE\n8FDpJABTtekwOCS8XRG4iyL37ipmKS0cx4rN4jxC37qmZR2n1IONdg3H0S7P1xv3\noq3W7OHxG8LnXkYOoJyuqNQahWKMJfaLcjGWo4k+Gj5Oj1tUgBSCLMoZvXuf/2RY\n8DsQR88johGLrmdbLNRVtGl426L0y0rY1WH0UD8ZbW9l9HB8mXTuS6AuiiAbvfqw\nkxnLjhb5ORzSAy9ee21PEMEbhlRdgdz00oZL7zMMqYhnhkW5W1XUN6wpjLZS3Hkj\nTg73/YI4raGi/sYWyacqIY7M//7ecu1J0Xs4YiMqNHi2zHFeSpbhVLsxvWJ3ZCoW\n9U8FzTMBAgMBAAECggEACZHQA1t486d5QjzXD8WqXQJF5KLl7jy2Lhta1wROCslW\n0woTZp6w5b0Pc5Ym20XDGMWUTGmSVxm4XpIPafZtQWTe88NwXwW56gjUWyzCjXfb\nNfso6LP2CGk3vHRF0cibHI+6s0hA3HTK2iqD6ctQtjkpCKcy70ToEGcUEqMVDN0r\nytvIaA8Z7nukmuT+0NbIWCSdZoxfM28jYroJcEzmEKa2scv+0RFoGfQ2cQMHU9La\nHi5CQLaKT9snlRPGoWj2EIplOj8+Axg5403/FamqDtCm6Ah9gDXLjP36LYYC1jjt\n2RDqliq8CRbQwlamsBUhurAT/6fMXmpLFAW+auX4gQKBgQDRu6buXmqnONoP3trT\nQ7nAWOBfZAwzbEk8cJseWRtAiKCK1Bv6lBgnP1Yn5fZ2sGe/2x6qL3F5+JZB3z1Z\nbM13yYniS41+V7EZvxPc+NH4qqJMWFsT5oZ9IzV0jmpvwdv9+mlOej0hAmSMZMGf\nlyy2clweVuvtY7qvjGZIUYUMMQKBgQDRL2ZByehkYnEWzpZCU8yzJ6CpHgiymfTF\n9FFffnUM91g4+TPwVdPIyC2TodG9XgpXyk/4BnhDxXLErgkTHGs02wrYRJaDVX/h\nHuj8Qp/JdcpLajs3THftSTzRj68ISs+pz3DfnJQnEa6QtCkJwqb3bSF9Akl2mdL/\nVBx6rfVv0QKBgCZ4Sh1M+jkkB3ODyBWaRZcPdlBo9If2I9TPPtSpOYNzzCbK0zr6\nMRf52R7GYpfQsacSVSSYQTNDMqRwgztE5sdDE2SLwS9cfGKhls4gYbs/6TchucsD\nrMWFUMfJW6KWJ3kFlo1LhKzqWHEcBhv0ycHJZjY2cV4Avfx3P0eilEnxAoGAUPpC\nYZFhzwp0sNmEPWTnRys9/HnN8CW9Jaxwm8D+WuidVGDUBGOVOpKTYiUwZlgzNMzy\nrBcFE2cqCI0+ohFMRwfMaPAUO/8rI+CtXIoGBRz+FLeo+L03Z7oEOzOeFF2xihDt\npwKcL4uewhGcGVUrAXlTj2sFOU5O6dyLscoJyyECgYEAkzjE1cY+HnnZyp+oUGLK\nK8RikyOlVEoHFgCAxlcl3xBgWcaNBGYopGM5z8I0us4Q33mFak9Fhp625vZq2rWk\n2u3hEF7mhz9W01WzuwdtqELzWS56vg17icnc/JMSBlfK5T1hrWAqK7/qypRQnTKv\nU2rCfjvtqmSGBAXZyc/wjkI=\n-----END PRIVATE KEY-----\n'!.replace(/\\n/g, '\n'),
}
  
};

export const clientConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
};