"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import InputGroup from "@/components/FormElements/InputGroup";
import { PasswordIcon, EmailIcon } from "@/assets/icons";
import axiosInstance from "@/utils/axiosInstance";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const formSchema = z
	.object({
		email: z.string().email({ message: "Invalid email address" }),
		password: z.string().min(8, "Minimum 8 characters"),
		password_confirmation: z.string().min(8),
	})
	.refine((data) => data.password === data.password_confirmation, {
		message: "Passwords do not match",
		path: ["password_confirmation"],
	});

type FormSchema = z.infer<typeof formSchema>;

export default function ResetPasswordPage() {
	const router = useRouter();
	const { token: rawToken } = useParams();
	const [isLoading, setIsLoading] = useState(false);

	// Extract actual token from the raw token path, which is like: token=abc123
	const token = (rawToken as string).split("=")[1];

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<FormSchema>({ resolver: zodResolver(formSchema) });

	const onSubmit = async (data: FormSchema) => {
		if (!token) {
			toast.error("Invalid or expired reset link.");
			return;
		}

		try {
			setIsLoading(true);
			const formData = new FormData();
			formData.append("email", data.email);
			formData.append("password", data.password);
			formData.append(
				"password_confirmation",
				data.password_confirmation
			);
			formData.append("token", token);

			await axiosInstance.post("/reset-password", formData);
			toast.success("Password reset successful!");
			reset();
			router.push("/auth/sign-in");
		} catch (error: unknown) {
			const axiosError = error as {
				response?: {
					data?: {
						data?: {
							validation_errors?: Record<string, string[]>;
						};
						message?: string;
					};
				};
			};

			const errorMessage =
				axiosError?.response?.data?.data?.validation_errors
					?.email?.[0] ||
				axiosError?.response?.data?.data?.validation_errors
					?.password?.[0] ||
				axiosError?.response?.data?.data?.validation_errors
					?.token?.[0] ||
				axiosError?.response?.data?.message ||
				"Failed to reset password. Please try again.";

			toast.error(errorMessage);
			console.error("Error resetting password:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100 dark:from-dark-1 dark:to-dark-2 px-4">
			<div className="w-full max-w-md bg-white dark:bg-dark-2 rounded-2xl p-8">
				{/* Logo */}
				<div className="flex flex-col items-center mb-6">
					<Link href="/" className="flex items-center justify-center">
						<Image
							src="/images/logo/logo.svg"
							alt="Logo"
							width={176}
							height={32}
						/>
					</Link>
					<h2 className="text-2xl font-bold text-gray-800 dark:text-white">
						Reset Password
					</h2>
					<p className="text-sm text-gray-500 mt-2 text-center">
						Enter your email and set a new password to regain access
						to your account.
					</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
					<InputGroup
						type="email"
						label="Email"
						placeholder="Enter your email"
						{...register("email")}
						icon={<EmailIcon className="text-gray-400" />}
						disabled={isLoading}
					/>
					{errors.email && (
						<p className="text-red-500 text-sm mt-1">
							{errors.email.message}
						</p>
					)}

					<InputGroup
						type="password"
						label="New Password"
						placeholder="Enter new password"
						{...register("password")}
						icon={<PasswordIcon className="text-gray-400" />}
						disabled={isLoading}
					/>
					{errors.password && (
						<p className="text-red-500 text-sm mt-1">
							{errors.password.message}
						</p>
					)}

					<InputGroup
						type="password"
						label="Confirm Password"
						placeholder="Confirm your password"
						{...register("password_confirmation")}
						icon={<PasswordIcon className="text-gray-400" />}
						disabled={isLoading}
					/>
					{errors.password_confirmation && (
						<p className="text-red-500 text-sm mt-1">
							{errors.password_confirmation.message}
						</p>
					)}

					<button
						type="submit"
						className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent"></span>
								Resetting...
							</>
						) : (
							"Reset Password"
						)}
					</button>
				</form>

				{/* Back to login */}
				<div className="mt-6 text-center">
					<Link
						href="/auth/sign-in"
						className="text-sm text-primary hover:underline font-medium"
					>
						Back to Login
					</Link>
				</div>
			</div>
		</div>
	);
}
