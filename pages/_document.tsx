import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html>
            <Head />
            <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@200;300;400;600;700;900&display=swap"
            />
            <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css2?family=Bubblegum+Sans&display=swap"
            />
            <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&family=Roboto+Slab:wght@300;400;500;600;700&display=swap"
            />
            <link rel="stylesheet" href="/globalstyles/icons.css" />
            <body>
                <Main />
                <NextScript />
                <script
                    src="https://kit.fontawesome.com/130bb4f0d8.js"
                    crossOrigin="anonymous"
                ></script>
            </body>
        </Html>
    );
}
