import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SaleHub - Quản lý bán hàng đa kênh",
  description:
    "Hệ thống quản lý bán hàng đa kênh, đồng bộ đơn hàng, tồn kho và báo cáo tập trung.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
