import Link from "next/link";
import HeaderPublic from "@/components/Layouts/PublicLayout/Header";
export default function NotFound() {
	return (
		<>
			<HeaderPublic />
			<div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-6">
				<h1 className="text-7xl font-bold text-primary mb-4">404</h1>
				<p className="text-xl text-gray-800 mb-6">
					Sorry, the page you’re looking for doesn’t exist.
				</p>
				<Link
					href="/"
					className="px-6 py-2 bg-primary text-white rounded hover:bg-primary transition"
				>
					{" "}
					Go Home
				</Link>
			</div>
		</>
	);
}
