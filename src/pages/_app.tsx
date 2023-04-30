import type { AppProps } from "next/app";
import localFont from "next/font/local";

import { NextUIProvider, createTheme } from "@nextui-org/react";

export const calSansFont = localFont({
  src: "../assets/fonts/CalSans-SemiBold.woff2",
  variable: "--font-sans",
});

const theme = createTheme({
  type: "dark",
  theme: {
    fonts: {
      sans: `var(${calSansFont.variable}), -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;`,
    },
    letterSpacings: {
      tighter: "0.01em",
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextUIProvider theme={theme}>
      <main className={calSansFont.className}>
        <Component {...pageProps} />
      </main>
    </NextUIProvider>
  );
}
