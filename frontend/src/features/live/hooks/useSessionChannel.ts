"use client";

import { useEffect, useState } from "react";
import { getEcho, bindEchoConnection } from "@/lib/echo";
import { publishLiveEvent } from "@/features/live/services/liveEventBus";
import type {
	AnswerAggregatePayload,
	LiveChannelState,
	LiveModule,
	SessionEventPayload,
	SessionSnapshot,
} from "@/features/live/types";

const initialState: LiveChannelState = {
	participantCount: 0,
	currentQuestionId: null,
	currentTaskId: null,
	timerState: null,
	sessionStatus: "pending",
	answerAggregate: null,
	leaderboard: null,
	isConnected: false,
	lastEvent: null,
};

const fromSnapshot = (snapshot: SessionSnapshot): Partial<LiveChannelState> => ({
	participantCount: snapshot.participant_count ?? 0,
	currentQuestionId: snapshot.current_question_id ?? null,
	currentTaskId: snapshot.current_task_id ?? null,
	timerState: snapshot.timer_state ?? null,
	sessionStatus: snapshot.running_status
		? "started"
		: snapshot.end_datetime
			? "ended"
			: "pending",
	answerAggregate: snapshot.current_aggregate ?? null,
});

const publishLegacyEvent = (
	module: LiveModule,
	event: string | undefined,
	payload: SessionEventPayload
) => {
	if (!event) return;

	if (event === "task.changed") {
		publishLiveEvent("legacy", "quest:task.changed", {
			...payload,
			questionId: payload.task_id ?? payload.current_task_id,
			questiQsenStartTime: payload.timer_state?.start_time,
			questiQsenTime:
				payload.timer_state?.duration_seconds ??
				payload.timer_state?.remaining_seconds,
			questiQsenLateStartTime: false,
		});
		return;
	}

	if (event === "question.changed") {
		publishLiveEvent("legacy", "quiz:question.changed", {
			...payload,
			questionId: payload.question_id ?? payload.current_question_id,
			quizQsenStartTime: payload.timer_state?.start_time,
			quizQsenTime:
				payload.timer_state?.duration_seconds ??
				payload.timer_state?.remaining_seconds,
			quizQsenLateStartTime: false,
		});
		return;
	}

	if (event === "participant.joined") {
		publishLiveEvent(
			"legacy",
			module === "quest" ? "participant.joined.quest" : "participant.joined.quiz",
			payload
		);
		return;
	}

	if (event === "session.ended") {
		publishLiveEvent("legacy", module === "quest" ? "quest:ended" : "quiz:ended", payload);
		return;
	}

	if (event === "participant.completed") {
		publishLiveEvent(
			"legacy",
			module === "quest" ? "quest:completed" : "quiz:completed",
			payload
		);
		return;
	}

	if (event === "leaderboard.updated") {
		publishLiveEvent(
			"legacy",
			module === "quest" ? "quest:leaderboard.updated" : "quiz:leaderboard.updated",
			payload
		);
		return;
	}

	if (event === "answer.aggregate.updated") {
		publishLiveEvent(
			"legacy",
			module === "quest"
				? "quest:answer.aggregate.updated"
				: "quiz:answer.aggregate.updated",
			payload
		);
	}
};

export function useSessionChannel(
	module: LiveModule,
	publicChannelKey: string | null | undefined,
	initialSnapshot?: SessionSnapshot | null
) {
	const [state, setState] = useState<LiveChannelState>(() => ({
		...initialState,
		...(initialSnapshot ? fromSnapshot(initialSnapshot) : {}),
	}));

	useEffect(() => {
		if (!initialSnapshot) return;
		setState((previous) => ({ ...previous, ...fromSnapshot(initialSnapshot) }));
	}, [initialSnapshot]);

	useEffect(() => {
		if (!publicChannelKey) return;

		const echo = getEcho();
		const channelName = `session.${module}.${publicChannelKey}`;
		const channel = echo.channel(channelName);

		const setConnected = () => setState((previous) => ({ ...previous, isConnected: true }));
		const setDisconnected = () => setState((previous) => ({ ...previous, isConnected: false }));

		const remember = (payload: SessionEventPayload) => {
			if (payload.event) publishLiveEvent(module, payload.event, payload);
			publishLegacyEvent(module, payload.event, payload);
			setState((previous) => ({ ...previous, lastEvent: payload }));
		};

		channel
			.listen(".session.started", (payload: SessionEventPayload) => {
				remember(payload);
				setState((previous) => ({
					...previous,
					sessionStatus: "started",
					participantCount: payload.participant_count ?? previous.participantCount,
				}));
			})
			.listen(".session.ended", (payload: SessionEventPayload) => {
				remember(payload);
				setState((previous) => ({ ...previous, sessionStatus: "ended" }));
			})
			.listen(".task.changed", (payload: SessionEventPayload) => {
				remember(payload);
				setState((previous) => ({
					...previous,
					currentTaskId: payload.task_id ?? payload.current_task_id ?? previous.currentTaskId,
					timerState: payload.timer_state ?? payload.timer ?? previous.timerState,
					sessionStatus: "started",
				}));
			})
			.listen(".question.changed", (payload: SessionEventPayload) => {
				remember(payload);
				setState((previous) => ({
					...previous,
					currentQuestionId:
						payload.question_id ?? payload.current_question_id ?? previous.currentQuestionId,
					timerState: payload.timer_state ?? payload.timer ?? previous.timerState,
					sessionStatus: "started",
				}));
			})
			.listen(".participant.joined", (payload: SessionEventPayload) => {
				remember(payload);
				setState((previous) => ({
					...previous,
					participantCount:
						payload.participant_count ?? payload.count ?? previous.participantCount,
				}));
			})
			.listen(".participant.count.updated", (payload: SessionEventPayload) => {
				remember(payload);
				setState((previous) => ({
					...previous,
					participantCount:
						payload.participant_count ?? payload.count ?? previous.participantCount,
				}));
			})
			.listen(".participant.completed", (payload: SessionEventPayload) => {
				remember(payload);
				setState((previous) => ({
					...previous,
					participantCount:
						payload.participant_count ?? payload.count ?? previous.participantCount,
				}));
			})
			.listen(".leaderboard.updated", (payload: SessionEventPayload) => {
				remember(payload);
				setState((previous) => ({ ...previous, leaderboard: payload }));
			})
			.listen(".answer.aggregate.updated", (payload: AnswerAggregatePayload) => {
				remember(payload);
				setState((previous) => ({ ...previous, answerAggregate: payload }));
			});

		const unbindConnected = bindEchoConnection("connected", setConnected);
		const unbindDisconnected = bindEchoConnection("disconnected", setDisconnected);
		setConnected();

		return () => {
			unbindConnected();
			unbindDisconnected();
			echo.leave(channelName);
		};
	}, [module, publicChannelKey]);

	return state;
}
