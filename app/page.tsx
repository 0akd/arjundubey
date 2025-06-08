// import { getTokens } from "next-firebase-auth-edge";
// import { cookies } from "next/headers";
// import { notFound } from "next/navigation";
// import { clientConfig, serverConfig } from "../config/config";
import HomePage from "./stats/page";

export default async function Home() {
  // const cookieStore = await cookies();
  // const tokens = await getTokens(cookieStore, {
  //   apiKey: clientConfig.apiKey,
  //   cookieName: serverConfig.cookieName,
  //   cookieSignatureKeys: serverConfig.cookieSignatureKeys,
  //   serviceAccount: serverConfig.serviceAccount,
  // });

  // if (!tokens) {
  //   notFound();
  // }

  return (<HomePage />);
}