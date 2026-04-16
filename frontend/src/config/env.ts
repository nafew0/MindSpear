export const env = {
	apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "",
	socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL?.trim() || "",
	socketPath: process.env.NEXT_PUBLIC_SOCKET_PATH?.trim() || "",
	appUrl: process.env.NEXT_PUBLIC_APP_URL?.trim() || "",
} as const;

export function requireEnv(key: keyof typeof env): string {
	const value = env[key];
	if (!value) {
		throw new Error(`Missing environment variable: ${key}`);
	}
	return value;
}
