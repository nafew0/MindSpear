import React from 'react';

const ProfileSkeleton = () => {
	return (
		<div className="w-full py-4 px-4">
			<div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
				<div className="animate-pulse">
					<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>

					<div className="flex flex-col md:flex-row items-center md:items-start gap-8">
						{/* Profile picture skeleton */}
						<div className="flex flex-col items-center">
							<div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700"></div>
							<div className="mt-4">
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
							</div>
						</div>

						{/* Form skeleton */}
						<div className="flex-1 w-full">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{[...Array(7)].map((_, i) => (
									<div key={i} className="space-y-2">
										<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
										<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
									</div>
								))}
							</div>

							<div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
									<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
									<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
								</div>
							</div>
						</div>
					</div>

					<div className="mt-8 flex justify-end">
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32"></div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfileSkeleton;