// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserAuthProvider } from "@/context/AuthFormContext";
import { CartProvider } from "@/context/CartContext";
import { ToastContainer } from "react-toastify";
import LayoutWrapper from "@/components/shared/layoutwrapper";
import ReactQueryProvider from "@/components/providers/reactQueryProvider";
import { Toaster } from "react-hot-toast";
import { NotificationProvider } from "@/context/notificationContext";
import { LanguageProvider } from "@/context/LanguageContext";
import GuestSessionProvider from "@/lib/GuestSessionProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { OfflineProvider } from "@/context/OfflineContext"; // Add this import
// import UserPointsWrapper from "@/components/shared/pointsWrapper";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KaraKeeb",
  description: "Recycle website for exchange anything old with cash",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <UserAuthProvider>
            <ReactQueryProvider>
              <CartProvider>
                <OfflineProvider>
                  {" "}
                  {/* Add OfflineProvider here */}
                  <Toaster
                    position="top-center"
                    toastOptions={{
                      duration: 5000,
                      style: {
                        direction: "ltr",
                        textAlign: "left",
                      },
                    }}
                  />
                  <NotificationProvider>
                    <ToastContainer
                      position="bottom-left" // top-center works well for RTL
                      autoClose={4000}
                      hideProgressBar={false}
                      newestOnTop={false}
                      closeOnClick
                      rtl={false} // set false to avoid misbehavior
                      pauseOnFocusLoss
                      draggable
                      pauseOnHover
                      className="!text-left !flex !items-center" // force text left inside toast
                    />
                    <GuestSessionProvider>
                      <GoogleOAuthProvider
                        clientId={
                          process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? ""
                        }
                      >
                        <ThemeProvider defaultTheme="system">
                          <LayoutWrapper>{children}</LayoutWrapper>
                        </ThemeProvider>
                      </GoogleOAuthProvider>
                    </GuestSessionProvider>
                  </NotificationProvider>
                </OfflineProvider>
              </CartProvider>
            </ReactQueryProvider>
          </UserAuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
