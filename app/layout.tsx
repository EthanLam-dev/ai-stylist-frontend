import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CursorGlow from "../components/CursorGlow"; 

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Stylist | Advanced",
  description: "Your Personal Fashion Advisor",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      {/* 套用我們在 CSS 寫好的流動漸層背景 bg-animated-gradient */}
      <body className="min-h-full flex flex-col relative overflow-auto bg-animated-gradient text-white">
        
        {/* 🌟 暗色玻璃遮罩 (讓漸層背景變得有質感且不刺眼) */}
        <div className="fixed inset-0 bg-black/60 z-[-1]"></div>

        {/* 🌟 這是你的滑鼠光暈！ */}
        <CursorGlow />

        {/* 🧹 已清理：刪除重複的導覽列，只保留一個 */}
        <nav className="relative z-20 p-4 flex gap-6 justify-center bg-black/30 backdrop-blur-md border-b border-white/10 shadow-lg">
          <Link href="/" className="font-bold text-white/80 hover:text-white hover:scale-105 transition-all tracking-widest text-sm uppercase">
            生物顧問
          </Link>
        </nav>

        {/* 🚀 關鍵修復：把 relative 和 z-10 拿掉了！
            現在裡面的 3D 遊戲只要設定 z-50，就能真正突破天際，不會被 nav 蓋住了！ */}
        <main className="flex-grow pt-8">
          {children}
        </main>
        
      </body>
    </html>
  );
}