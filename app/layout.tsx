import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Satonic — open-source lead-gen chatbot",
  description: "Type one sentence. Get real leads. Free forever.",
  metadataBase: new URL("https://satonic.app"),
  openGraph: {
    title: "Satonic — open-source lead-gen chatbot",
    description: "Free Apollo alternative. Self-host in one Docker command.",
    type: "website",
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
