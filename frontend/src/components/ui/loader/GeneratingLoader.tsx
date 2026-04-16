"use client";
import React from "react";
import { Sparkles } from "lucide-react";
import Image from "next/image";

const letters = "Generating".split("");

export default function GeneratingLoader() {
	return (
		<div className="w-full h-96 flex flex-col items-center justify-center gap-6 font-poppins select-none relative">
			{/* Logo */}
			<Image
				src="/images/logo/logo.svg"
				alt="Logo"
				width={80}
				height={80}
				className="w-40 h-20 object-contain"
				priority
			/>

			{/* Glowing Letters */}
			<div className="relative flex space-x-[2px] text-4xl sm:text-5xl font-bold leading-none tracking-wide">
				{letters.map((letter, index) => (
					<span
						key={index}
						className="relative z-10 animate-letter text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary to-primary drop-shadow-sm"
						style={{
							animationDelay: `${0.1 + index * 0.105}s`,
						}}
					>
						{letter}
					</span>
				))}
				<div className="absolute inset-0 z-0 pointer-events-none animate-mask-glow" />
			</div>

			{/* Subtext */}
			<div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
				<Sparkles className="animate-pulse w-4 h-4 text-primary" />
				<span className="tracking-wide">
					Please wait while we generate
				</span>
			</div>
		</div>
	);
}
