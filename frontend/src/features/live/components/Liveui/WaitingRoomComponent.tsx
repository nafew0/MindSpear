import React from "react";

const WaitingRoomComponent: React.FC = () => {
	const handleLeave = () => {};

	return (
		<div className="flex flex-col justify-center items-center px-4 text-center">
			<div className="max-w-md w-full space-y-6">
				<div className="w-20 h-20 mx-auto rounded-full bg-primary animate-pulse" />

				<h2 className="text-2xl font-semibold text-gray-800">
					{`You're in the waiting room`}
				</h2>

				<p className="text-gray-600 text-sm">
					{`Please wait while we prepare your session. This won't take long.`}
				</p>

				<div className="bg-white p-4 rounded-lg text-sm border text-gray-700">
					Welcome. The host will let you in shortly.
				</div>

				<div className="flex justify-center space-x-2 pt-2">
					<span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
					<span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150" />
					<span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-300" />
				</div>

				<div className="pt-4">
					<button
						onClick={handleLeave}
						className="text-sm text-gray-500 hover:text-red-500 underline transition"
					>
						Leave waiting room
					</button>
				</div>
			</div>
		</div>
	);
};

export default WaitingRoomComponent;
