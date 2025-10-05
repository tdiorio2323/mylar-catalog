import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import { sans, display, inter, script } from "@/lib/fonts";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${inter.variable} ${script.variable}`}
    >
      <body
        className="min-h-screen bg-bg text-ink antialiased"
        style={{
          backgroundImage: "url('/lovable-uploads/td-studios-black-marble.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="mx-auto max-w-5xl p-6">{children}</div>
        <Toaster richColors />
      </body>
    </html>
  );
}
