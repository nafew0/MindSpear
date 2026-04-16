/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/utils/axiosInstance";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { IoDuplicateOutline } from "react-icons/io5";
import { toast } from "react-toastify";
function QuestDuplicate({ data }: any) {
	const params = useParams();
	// console.log(data, "datadatadatadatadatadatadatadatadatadata");
	const router = useRouter();

	const taskDuplicate = async () => {
		try {
			const response = await axiosInstance.post(
				`/quests/copy-with-tasks/${params?.id}`,
			);

			if (response?.data?.data) {
				router.push("/my-library/quest-page");
			}
		} catch (error) {
			const axiosError = error as AxiosError<{ message?: string }>;

			if (axiosError.response) {
				console.error(
					"Error verifying token:",
					axiosError.response.data,
				);
				toast.error(
					`Error: ${
						axiosError.response.data?.message ||
						"Verification failed."
					}`,
				);
			} else {
				console.error("Unexpected error:", axiosError);
				console.error("Unexpected error:", axiosError.message);
				toast.error("Unexpected error occurred. Please try again.");
			}
		} finally {
		}
	};

	// const transformed = QuestConvertDataComponent(data?.tasks);
	return (
		<div>
			<button
				className="flex justify-center items-center gap-2"
				onClick={() => taskDuplicate()}
				// onClick={() => setIsModalStatus(true)}
			>
				<IoDuplicateOutline className="w-4 h-4" />
				Duplicate{" "}
			</button>

			{/* <GlobalModal
				title="Duplicate Quest"
				open={isModalStatus}
				onClose={() => setIsModalStatus(false)}
			>
                <span className="font-bold pb-[10px] flex text-[16px]"> Quest Title </span>
				<input
					type="text"
					// placeholder={option?.placeholder}
					// value={editText}
					onChange={(e) =>
						setEditText(e.target.value)
					}
					// onKeyDown={(e) =>
					// 	handleKeyDown(e, option.id)
					// }
					onClick={(e) => e.stopPropagation()}
					className={` bg-white border text-[.875rem] w-full p-3 rounded  text-black  focus:ring-[#fff]  focus:outline-none`}
					autoFocus
					maxLength={70}
				/>

				<div className="flex justify-center items-center mt-[20px] gap-4 ">
					<button className="flex text-[.875rem]  items-center bg-[#bc5eb3] text-[#fff] hover:text-blue-600 font-bold py-3 px-4 w-full justify-center rounded-md">
						{" "}
						Cancel
					</button>
					<button className="flex text-[.875rem]  items-center bg-primary text-[#fff] hover:text-blue-600 font-bold py-3 px-4 w-full justify-center rounded-md">
						{" "}
						Submit{" "}
					</button>
				</div>
			</GlobalModal> */}
		</div>
	);
}

export default QuestDuplicate;
