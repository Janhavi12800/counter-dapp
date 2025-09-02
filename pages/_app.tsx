// pages/_app.tsx
import type { AppProps } from "next/app";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Sepolia } from "@thirdweb-dev/chains";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider
      activeChain={Sepolia}
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
    >
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}
