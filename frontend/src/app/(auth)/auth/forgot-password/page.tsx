"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { EmailIcon } from "@/assets/icons";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "react-toastify";
import InputGroup from "@/components/FormElements/InputGroup";
import Image from "next/image";
import Link from "next/link";

const formSchema = z.object({
	email: z.string().email("Enter a valid email"),
});

type FormSchema = z.infer<typeof formSchema>;

const ForgotPasswordPage = () => {
	const [isLoading, setIsLoading] = React.useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<FormSchema>({ resolver: zodResolver(formSchema) });

	const onSubmit = async (data: FormSchema) => {
		try {
			setIsLoading(true);
			const formData = new FormData();
			formData.append("email", data.email);

			await axiosInstance.post("/forgot-password", formData);
			
			toast.success("Reset link sent to your email!");
			reset();
		} catch (error:unknown) {
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
                axiosError?.response?.data?.data?.validation_errors?.email?.[0] ||
                axiosError?.response?.data?.message ||
                "Failed to send reset link.";

            toast.error(errorMessage);
            console.error("Error resetting password:", error);
		}
		finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100 dark:from-dark-1 dark:to-dark-2 px-4">
			<div className="w-full max-w-md bg-white dark:bg-dark-2  rounded-2xl p-8">
				{/* Logo */}
				<div className="flex flex-col items-center mb-6">
					<Link href="/" className="flex items-center justify-center">
						<Image
							src="/images/logo/logo.svg"
							alt="Logo"
							width={176}
							height={32}
							className="mb-4"
						/>
					</Link>
					<h2 className="text-2xl font-bold text-gray-800 dark:text-white">
						Forgot your password?
					</h2>
					<p className="text-sm text-gray-500 mt-2 text-center">
						No worries! Enter your email and we’ll send you a link
						to reset your password.
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
					/>
					{errors.email && (
						<p className="text-red-500 text-sm mt-1">
							{errors.email.message}
						</p>
					)}

					<button
						type="submit"
						className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition font-medium"
						disabled={isLoading}
					>
						{isLoading ? (
                            <div className="flex items-center justify-center gap-2">

                                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent"></span>
                                Sending...
                            </div>
                        ) : (
                            "Send Reset Link"
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
};

export default ForgotPasswordPage;
