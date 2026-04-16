"use client";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
// import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_DATA } from "./data";
import { ArrowLeftIcon } from "./icons";
// import { MenuItem } from "./menu-item";
import { useSidebarContext } from "./sidebar-context";
import CreateQuizSidebarContant from "./create-quiz-sidebar-contant";

import { useSelector } from "react-redux";
import { RootState } from "@/stores/store";
import NavData from "./NavData";

type SubItem = {
	title: string;
	url?: string;
	[key: string]: unknown;
};

export function Sidebar() {
	const pathname = usePathname();

	const isDropdownOpen = useSelector(
		(state: RootState) => state.dropdown.isDropdownOpen,
	);
	// console.log(isDropdownOpen, "isDropdownOpenisDropdownOpenisDropdownOpen");

	const { setIsOpen, isOpen, isMobile, toggleSidebar } = useSidebarContext();
	const [expandedItems, setExpandedItems] = useState<string[]>([]);

	const isQuizCreator =
		pathname.includes("quiz-creator") || pathname.includes("quiz-edit");

	const toggleExpanded = (title: string) => {
		setExpandedItems((prev) => (prev.includes(title) ? [] : [title]));

		// Uncomment the following line to enable multiple expanded items
		// setExpandedItems((prev) =>
		//   prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
		// );
	};

	useEffect(() => {
		// Keep collapsible open, when it's subpage is active
		NAV_DATA.some((section) => {
			return section.items.some((item) => {
				return item.items.some((subItem: SubItem) => {
					if (subItem.url === pathname) {
						if (!expandedItems.includes(item.title)) {
							toggleExpanded(item.title);
						}

						// Break the loop
						return true;
					}
				});
			});
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname]);

	return (
		<>
			{/* Mobile Overlay */}
			{isMobile && isOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 "
					onClick={() => setIsOpen(false)}
					aria-hidden="true"
				/>
			)}

			<aside
				className={cn(
					isQuizCreator
						? isMobile
							? ""
							: "max-w-[220px] hidden"
						: "max-w-[220px] h-screen bg-white ",
					isDropdownOpen ? "" : "overflow-y-auto",
					"  transition-[width] duration-200 ease-linear  dark:bg-gray-dark ",
					isMobile
						? "fixed bottom-0 top-0 z-50"
						: isDropdownOpen
							? ""
							: "sticky top-0 h-screen",
					isOpen ? "w-full" : "w-0",
				)}
				aria-label="Main navigation"
				aria-hidden={!isOpen}
				inert={!isOpen}
			>
				<div
					className={`flex h-full rounded-lg flex-col dark:border-none overflow-y-auto${
						isQuizCreator ? " h-screen border-none " : ""
					}`}
				>
					<div
						className={cn(
							isQuizCreator
								? isMobile
									? ""
									: "hidden"
								: "block",
						)}
					>
						<div className="relative py-[13px] pl-[15px] pr-[7px] bg-white  ">
							{/* <Link
								href={"/"}
								onClick={() => isMobile && toggleSidebar()}
								className="px-0 py-2.5 min-[850px]:py-0 "
							>
								<Logo />
							</Link> */}

							{isMobile && (
								<button
									onClick={toggleSidebar}
									className="absolute left-3/4 right-4.5 top-1/2 -translate-y-1/2 text-right"
								>
									<span className="sr-only">Close Menu</span>

									<ArrowLeftIcon className="ml-auto size-7" />
								</button>
							)}
						</div>

						{/* Navigation */}
						{isQuizCreator ? <CreateQuizSidebarContant /> : ""}
					</div>

					<div
						className={`${
							isQuizCreator ? "hidden" : "block"
						} custom-scrollbar flex-1 overflow-y-auto px-3 `}
					>
						<NavData />
					</div>
				</div>
			</aside>

			<div
				className={cn(
					isQuizCreator ? "  !w-[220px]" : "mt-20",
					isMobile ? "hidden" : "block",
				)}
			>
				<div className={cn(isQuizCreator ? " " : " ")}>
					{isMobile && (
						<button
							onClick={toggleSidebar}
							className="absolute left-3/4 right-4.5 top-1/2 -translate-y-1/2 text-right"
						>
							<span className="sr-only">Close Menu</span>

							<ArrowLeftIcon className="ml-auto size-7" />
						</button>
					)}
				</div>

				{/* Navigation */}
				{isQuizCreator ? <CreateQuizSidebarContant /> : ""}
			</div>
		</>
	);
}
