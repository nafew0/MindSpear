"use client";

import { EmailIcon, PasswordIcon, EyeIcon, EyeSlashIcon } from "@/assets/icons";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import InputGroup from "../FormElements/InputGroup";
import { Checkbox } from "../FormElements/checkbox";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "@/features/auth/store/authSlice";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type { RootState, AppDispatch } from "@/stores/store";

const formSchema = z.object({
	email: z.string().email("Enter a valid email"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormSchema = z.infer<typeof formSchema>;

export default function SigninWithPassword() {
	const dispatch = useDispatch<AppDispatch>();
	const router = useRouter();
	const { loading, error } = useSelector((state: RootState) => state.auth);

	const [showPassword, setShowPassword] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
	});

	// Clear error on component mount
	useEffect(() => {
		dispatch(clearError());
	}, [dispatch]);

	const onSubmit = async (data: FormSchema) => {
		const result = await dispatch(loginUser(data));

		if (loginUser.fulfilled.match(result)) {
			reset();
			router.push("/dashboard");
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<InputGroup
				type="email"
				label="Email"
				className="mb-4 [&_input]:py-[15px]"
				placeholder="Enter your email"
				{...register("email")}
				icon={<EmailIcon className="text-[25px]" />}
				required
			/>
			{errors.email && (
				<p className="text-red-500 mb-2">{errors.email.message}</p>
			)}

			<InputGroup
				type={showPassword ? "text" : "password"}
				label="Password"
				className="mb-5 [&_input]:py-[15px]"
				placeholder="Enter your password"
				{...register("password")}
				icon={<PasswordIcon className="text-[25px]" />}
				suffixIcon={
					showPassword ? (
						<EyeSlashIcon className="text-[20px]" />
					) : (
						<EyeIcon className="text-[20px]" />
					)
				}
				suffixIconClick={() => setShowPassword(!showPassword)}
				required
			/>
			{errors.password && (
				<p className="text-red-500 mb-2">{errors.password.message}</p>
			)}

			<div className="mb-5 flex items-center justify-between gap-2 py-2 font-medium">
				<Checkbox
					label="Remember me"
					name="remember"
					withIcon="check"
					minimal
					radius="md"
				/>
				<Link
					href="/auth/forgot-password"
					className="hover:text-primary hover:underline dark:text-white dark:hover:text-primary"
				>
					Forgot Password?
				</Link>
			</div>

			{error && <p className="text-red-500 mb-4">{error}</p>}

			<div className="mb-4.5">
				<button
					type="submit"
					className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90"
					disabled={loading}
				>
					Sign In
					{loading && (
						<span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent dark:border-primary dark:border-t-transparent" />
					)}
				</button>
			</div>
		</form>
	);
}
