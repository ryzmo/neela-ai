import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      </Head>
      <body className="antialiased bg-[#0c0c0b] text-[#e9e2d5]">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
