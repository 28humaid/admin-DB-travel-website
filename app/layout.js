// app/layout.js
import "./globals.css";
import { AuthProvider } from "./Providers";
import ProvidersWrapper from "./ProvidersWrapper";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ProvidersWrapper>
            {children}
          </ProvidersWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}