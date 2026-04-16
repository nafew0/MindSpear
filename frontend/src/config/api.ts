import { env } from "./env";

export const apiConfig = {
	baseURL: env.apiBaseUrl || undefined,
	timeoutMs: 10000,
	jsonHeaders: {
		"Content-Type": "application/json",
	},
} as const;
