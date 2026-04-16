"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { MicrosoftIcon } from "@/assets/icons";
import { toast } from "react-toastify";

export default function MicrosoftSigninButton({ text }: { text: string }) {
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleMicrosoftSignin = async () => {
		try {
			setLoading(true);

			// Backend redirect URL 
			const res = await axiosInstance.get("/auth/microsoft/redirect");
			const data = res.data;

			if (data?.status && data.data?.redirect_url) {
				router.push(data.data.redirect_url);
			} else {
				console.error("Microsoft signin failed:", data);
				toast.error("Failed to initiate Microsoft login");
			}
		} catch (error) {
			console.error("Microsoft Signin error:", error);
			toast.error("Something went wrong with Microsoft login");
		} finally {
			setLoading(false);
		}
	};

	return (
		<button
			onClick={handleMicrosoftSignin}
			disabled={loading}
			className="flex w-full items-center justify-center gap-3.5 rounded-lg border border-stroke bg-gray-2 p-[15px] font-medium hover:bg-opacity-50 disabled:opacity-70 dark:border-dark-3 dark:bg-dark-2 dark:hover:bg-opacity-50 my-2"
		>
			{loading ? <Loader2 className="animate-spin" /> : <MicrosoftIcon />}
			{text} with Microsoft
		</button>
	);
}
