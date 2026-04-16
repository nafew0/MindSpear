import Image from "next/image";
interface DataProps {
	errorTest?: string;
	errorStatus?: boolean;
}

// function QuizDateClose() {
const QuizDateClose: React.FC<DataProps> = ({ errorTest, errorStatus }) => {
	console.log(errorStatus, "errorStatuserrorStatuserrorStatus");
	return (
		<div>
			<div className=" text-slate-700 min-h-screen flex flex-col items-center justify-center py-4">
				<div className="wrapper grid grid-rows-centered items-center justify-items-center gap-4 w-full px-4">
					<div className="grid w-full items-center gap-8">
						<header className="flex flex-col flex-wrap items-center justify-center md:flex-row">
							<Image
								src="/images/timeout.png"
								alt="Logo"
								width={200}
								height={102}
								className="mb-6"
							/>
							<h2 className="text-center text-5xl sm:inline-block md:ml-4">
								{errorTest}
							</h2>
						</header>

						<main className="text-center text-xl sm:w-[38rem] mx-auto">
							<p className="mb-8">
								The server cannot process the request due
								to&nbsp;a&nbsp;client error caused by&nbsp;bad
								syntax.
							</p>
							<p>
								We&nbsp;apologize for any inconvenience caused.
							</p>
						</main>

						<button
							onClick={() => window.history.back()}
							className="mb-4 justify-self-center border-2 border-solid border-slate-700 bg-slate-700 px-4 py-2 text-slate-200 hover:bg-slate-300 hover:text-slate-700 focus:ring-2 focus:ring-slate-700 focus:ring-offset-4 focus:ring-offset-slate-200 focus-visible:outline-none"
							aria-label="Go back to the previous page"
							title="Go back to the previous page"
						>
							Go&nbsp;back
						</button>
					</div>
				</div>
			</div>

	
		</div>
	);
};

export default QuizDateClose;
