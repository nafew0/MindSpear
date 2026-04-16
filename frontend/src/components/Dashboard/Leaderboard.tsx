/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import "./Leaderboard.css";

import { useSelector } from "react-redux";
import GameMode from "./GameMode";
import QuizMode from "./QuizMode";
interface LeaderboardProps {
	scope: "entire" | "slide";
}

const Leaderboard: React.FC<LeaderboardProps> = ({ scope }) => {
	const scopeType = useSelector((state: any) => state?.leaderboard);
	console.log(scopeType, "scope2222scope2222scope2222");
	console.log(scope, "scope2222scope2222scope2222");
	return (
		<>
			{scopeType.scope === "slide" ? (
				<GameMode scope={"slide"} />
			) : (
				<QuizMode scope={"entire"} sessionData="" />
			)}
		</>
	);
};

export default Leaderboard;
