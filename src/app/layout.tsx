import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "나만의 일정 관리",
  description: "개인 일정 및 메모 관리 사이트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen flex flex-col`}>
        <main className="flex-1 max-w-[90rem] w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
