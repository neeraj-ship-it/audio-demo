import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="hi">
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#e50914" />
        <meta name="application-name" content="STAGE fm" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="STAGE fm" />

        {/* Default OG Tags */}
        <meta property="og:site_name" content="STAGE fm - AI Audio Stories" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/stage-logo.png" />
        <meta property="og:locale" content="hi_IN" />

        {/* Twitter defaults */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@stagefm" />

        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
