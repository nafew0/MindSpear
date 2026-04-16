/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSelector } from "react-redux";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Check } from "lucide-react";

interface UserInfoState {
	id: number;
	full_name: string;
	email: string;
	profile_picture?: string | null;
}

export default function AccountSettingsPage() {
	const user = useSelector(
		(state: any) => state.auth.user
	) as UserInfoState;

	const [inAppNotifications, setInAppNotifications] = useState(true);
	const [emailNotifications, setEmailNotifications] = useState(true);
	if (!user) return <p className="text-center mt-10">Loading user data...</p>;

	const profileImg = user.profile_picture;
	const initials = user.full_name
		?.split(" ")
		.map((n: string) => n[0])
		.join("")
		.slice(0, 1)
		.toUpperCase();

	return (
		<main className="w-full mx-auto px-4 py-4 space-y-8">
			<section className="bg-white dark:bg-gray-900 shadow-sm rounded-xl p-6">
				<h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
					Account Settings
				</h2>

				<div className="flex items-center gap-4">
					<div className="w-16 h-16 rounded-full overflow-hidden border">
						{profileImg ? (
							<Image
								src={profileImg}
								alt="Profile Picture"
								width={64}
								height={64}
								className="object-cover"
							/>
						) : (
							<div className="w-full h-full bg-primary text-white flex items-center justify-center text-sm font-semibold uppercase">
								{initials}
							</div>
						)}
					</div>
					<div>
						<p className="text-lg font-medium text-gray-800 dark:text-gray-100">
							{user.full_name}
						</p>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Logged in as <strong>{user.email}</strong>
						</p>
					</div>
				</div>

				<div className="mt-6">
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Email
					</label>
					<input
						type="email"
						value={user.email}
						disabled
						className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-black dark:text-gray-400"
					/>
				</div>

				<div className="mt-4 text-sm text-black dark:text-gray-400">
					{`You haven't created a password yet. You can create a
					password by`}
					<Link
						href="/auth/forgot-password"
						className="text-blue-500 hover:underline ml-1"
					>
						resetting it here
					</Link>
				</div>
			</section>

			<section className="bg-white dark:bg-gray-900 shadow-sm rounded-xl p-6 space-y-6">
				<h3 className="text-xl font-semibold text-gray-900 dark:text-white">
					Preferences
				</h3>

				<div className="flex items-center justify-between">
					<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
						In-app notifications
					</span>
					<div
						onClick={() =>
							setInAppNotifications(!inAppNotifications)
						}
						className={`relative w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${inAppNotifications
							? "bg-primary"
							: "bg-gray-300 dark:bg-gray-700"
							}`}
					>
						<div
							className={`absolute left-1 top-1 transition-all duration-300 ${inAppNotifications
								? "translate-x-5"
								: "translate-x-0"
								}`}
						>
							<div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-primary shadow-md">
								{inAppNotifications ? (
									<Check size={14} />
								) : (
									<X size={14} />
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="flex items-center justify-between">
					<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
						Email notifications
					</span>
					<div
						onClick={() =>
							setEmailNotifications(!emailNotifications)
						}
						className={`relative w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${emailNotifications
							? "bg-primary"
							: "bg-gray-300 dark:bg-gray-700"
							}`}
					>
						<div
							className={`absolute left-1 top-1 transition-all duration-300 ${emailNotifications
								? "translate-x-5"
								: "translate-x-0"
								}`}
						>
							<div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-primary shadow-md">
								{emailNotifications ? (
									<Check size={14} />
								) : (
									<X size={14} />
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="flex items-center justify-between">
					<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
						Appearance
					</span>
					<span className="text-sm text-gray-500 dark:text-gray-400">
						{`	You're currently using light mode.`}
					</span>
				</div>
			</section>
		</main>
	);
}
