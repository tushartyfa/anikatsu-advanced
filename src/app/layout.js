import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "JustAnime - Watch Anime Online",
  description: "Watch the latest anime episodes for free. Stream all your favorite anime shows in HD quality.",
  keywords: "anime, streaming, watch anime, free anime, anime online, just , justanime",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-[#0a0a0a] min-h-screen flex flex-col antialiased`}>
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}
