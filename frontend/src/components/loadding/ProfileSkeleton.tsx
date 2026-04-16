function ProfileSkeleton() {
	return (
		<div className="w-full mx-auto py-8 px-4">
			<div className="bg-white dark:bg-gray-900 p-6 rounded-lg animate-pulse">
				<h2 className="text-2xl font-semibold text-dark dark:text-white mb-6">
					Profile
				</h2>

				<div className="flex flex-col md:flex-row items-center md:items-start gap-6">
					{/* Profile picture skeleton */}
					<div className="relative">
						<div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700"></div>
					</div>

					{/* Input skeletons */}
					<div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
						{Array.from({ length: 7 }).map((_, i) => (
							<div key={i} className="space-y-2">
								<div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
								<div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
							</div>
						))}
					</div>
				</div>

				{/* Save button skeleton */}
				<div className="mt-6 text-right">
					<div className="h-10 w-32 bg-gray-300 dark:bg-gray-700 rounded inline-block"></div>
				</div>
			</div>
		</div>
	);
}

export default ProfileSkeleton;