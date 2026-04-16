import "@/styles/satoshi.css";
import "@/styles/style.css";
import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";
import ToastProvider from '@/components/ToastProvider';
import { GoogleTagManager } from '@next/third-parties/google'
import { GoogleAnalytics } from '@next/third-parties/google'

import type { Metadata } from "next";
import ClientProviders from "./ClientLayout";

export const metadata: Metadata = {
	title: "MindSpear",
	description: "MindSpear - Quiz, Quest and Survey Platform",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<GoogleTagManager gtmId="GTM-KZQCJTWJ" />
			<body suppressHydrationWarning>
				<ClientProviders>
					{children}
					<ToastProvider />
				</ClientProviders>
			</body>
			<GoogleAnalytics gaId="G-XYZ" />
		</html>
	);
}
