import localFont from "next/font/local";

export const sfPro = localFont({
  src: [
    {
      path: "../public/fonts/SF-Pro-Display-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/SF-Pro-Display-Medium.woff2",
      weight: "500",
    },
    {
      path: "../public/fonts/SF-Pro-Display-Semibold.woff2",
      weight: "600",
    },
    {
      path: "../public/fonts/SF-Pro-Display-Bold.woff2",
      weight: "700",
    },
  ],
  variable: "--font-sf",
});