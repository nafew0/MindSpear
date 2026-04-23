"use client";

import { useEffect, useRef } from "react";
import { getEcho } from "@/lib/echo";
import { publishLiveEvent } from "@/features/live/services/liveEventBus";
import type {
	HostAnswerPayload,
	HostParticipantPayload,
	LiveModule,
	SessionEventPayload,
} from "@/features/live/types";

type HostChannelHandlers = {
	onAnswerReceived?: (payload: HostAnswerPayload) => void;
	onParticipantJoined?: (payload: HostParticipantPayload) => void;
	onParticipantCountUpdated?: (payload: HostParticipantPayload) => void;
	onSessionStarted?: (payload: SessionEventPayload) => void;
	onSessionEnded?: (payload: SessionEventPayload) => void;
};

export function useHostChannel(
	module: LiveModule,
	sessionId: number | string | null | undefined,
	handlers: HostChannelHandlers
) {
	const handlersRef = useRef(handlers);
	handlersRef.current = handlers;

	useEffect(() => {
		if (!sessionId) return;

		const echo = getEcho();
		const channelName = `host.${module}.${sessionId}`;
		const channel = echo.private(channelName);

		channel
			.error((error: unknown) => {
				console.error(`Live ${module} host channel subscription failed:`, {
					channel: channelName,
					error,
				});
			})
			.listen(".answer.submitted", (payload: HostAnswerPayload) => {
				publishLiveEvent(
					"legacy",
					module === "quest"
						? "quest:answer.submitted"
						: "quiz:answer.submitted",
					payload
				);
				handlersRef.current.onAnswerReceived?.(payload);
			})
			.listen(".participant.joined", (payload: HostParticipantPayload) => {
				publishLiveEvent(
					"legacy",
					module === "quest"
						? "participant.joined.quest"
						: "participant.joined.quiz",
					payload
				);
				handlersRef.current.onParticipantJoined?.(payload);
			})
			.listen(".participant.count.updated", (payload: HostParticipantPayload) => {
				publishLiveEvent(
					"legacy",
					module === "quest"
						? "participant.joined.quest"
						: "participant.joined.quiz",
					payload
				);
				handlersRef.current.onParticipantCountUpdated?.(payload);
			})
			.listen(".session.started", (payload: SessionEventPayload) => {
				handlersRef.current.onSessionStarted?.(payload);
			})
			.listen(".session.ended", (payload: SessionEventPayload) => {
				handlersRef.current.onSessionEnded?.(payload);
			});

		return () => {
			echo.leave(channelName);
		};
	}, [module, sessionId]);
}
