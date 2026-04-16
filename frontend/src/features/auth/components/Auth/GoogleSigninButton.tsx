"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { GoogleIcon } from "@/assets/icons";
import axiosInstance from "@/utils/axiosInstance";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function GoogleSigninButton({ text }: { text: string }) {
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleGoogleSignin = async () => {
		try {
			setLoading(true);

			// Get redirect URL from backend
			const res = await axiosInstance.get("/auth/google/redirect");
			const data = res.data;

			if (data?.status && data.data?.redirect_url) {
				// ✅ Use Next.js router (best practice)
				router.push(data.data.redirect_url);
			} else {
				console.error("Google signin failed:", data);
				toast.error("Failed to initiate Google login");
			}
		} catch (error) {
			console.error("Google Signin error:", error);
			toast.error("Something went wrong with Google login");
		} finally {
			setLoading(false);
		}
	};

	return (
		<button
			onClick={handleGoogleSignin}
			disabled={loading}
			className="flex w-full items-center justify-center gap-3.5 rounded-lg border border-stroke bg-gray-2 p-[15px] font-medium hover:bg-opacity-50 disabled:opacity-70 dark:border-dark-3 dark:bg-dark-2 dark:hover:bg-opacity-50"
		>
			{loading ? <Loader2 className="animate-spin" /> : <GoogleIcon />}
			{text} with Google
		</button>
	);
}
