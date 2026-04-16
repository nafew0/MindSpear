import axios, {
	AxiosInstance,
	AxiosResponse,
	InternalAxiosRequestConfig,
	AxiosHeaders,
} from "axios";

interface ApiResponse<T = unknown> {
	data: T;
	message?: string;
	success: boolean;
	statusCode: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const resolvedBaseURL =
	API_URL && API_URL.trim().length > 0 ? API_URL : undefined;
if (!resolvedBaseURL && typeof window !== "undefined") {
	console.warn(
		"NEXT_PUBLIC_API_BASE_URL is not defined; axios will use relative URLs."
	);
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
	_retry?: boolean;
}
const axiosInstance: AxiosInstance = axios.create({
	baseURL: resolvedBaseURL,
	headers: {
		"Content-Type": "application/json",
	},
	// withCredentials: true,
	timeout: 10000,
	// withCredentials: true,
});

// Request interceptor with proper typing
axiosInstance.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const customConfig = config as CustomAxiosRequestConfig;

		if (typeof window !== "undefined") {
			const token = localStorage.getItem("auth_token");
			if (token) {
				customConfig.headers =
					customConfig.headers || new AxiosHeaders();
				customConfig.headers.set("Authorization", `Bearer ${token}`);
			}

			const csrfToken = document.cookie
				.split("; ")
				.find((row) => row.startsWith("XSRF-TOKEN="))
				?.split("=")[1];

			if (csrfToken) {
				customConfig.headers =
					customConfig.headers || new AxiosHeaders();
				customConfig.headers.set("X-XSRF-TOKEN", csrfToken);
			}
		}
		return customConfig;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// ##### Response interceptor with proper typing and error handling #####
axiosInstance.interceptors.response.use(
	(response: AxiosResponse<ApiResponse>) => {
		return response;
	},
	(error) => {
		if (error.response) {
			switch (error.response.status) {
				case 400:
					console.error("Bad request:", error.response.data);
					break;
				case 401:
					if (typeof window !== "undefined") {
						localStorage.removeItem("auth_token");
						window.location.href = "/";
					}
					break;
				case 403:
					console.error("Forbidden access:", error.response.data);
					break;
				case 404:
					console.error("Resource not found:", error.config?.url);
					break;
				case 500:
					console.error("Server error:", error.response.data);
					break;
				default:
					console.error(
						"Unhandled error status:",
						error.response.status
					);
					console.error("Response headers:", error.response.headers);
					console.error("Response data:", error.response.data);
					console.error("Request URL:", error.config?.url);
			}
		} else if (error.request) {
			console.error("No response received:", error.request);
		} else {
			console.error("Request setup error:", error.message);
		}

		return Promise.reject(error);
	}
);

// ##### Create a typed wrapper function for API calls #####
export const api = {
	get: async <T>(
		url: string,
		config?: CustomAxiosRequestConfig
	): Promise<ApiResponse<T>> => {
		const response = await axiosInstance.get<ApiResponse<T>>(url, config);
		return response.data;
	},
	post: async <T>(
		url: string,
		data?: unknown,
		config?: CustomAxiosRequestConfig
	): Promise<ApiResponse<T>> => {
		const response = await axiosInstance.post<ApiResponse<T>>(
			url,
			data,
			config
		);
		return response.data;
	},
	put: async <T>(
		url: string,
		data?: unknown,
		config?: CustomAxiosRequestConfig
	): Promise<ApiResponse<T>> => {
		const response = await axiosInstance.put<ApiResponse<T>>(
			url,
			data,
			config
		);
		return response.data;
	},
	delete: async <T>(
		url: string,
		config?: CustomAxiosRequestConfig
	): Promise<ApiResponse<T>> => {
		const response = await axiosInstance.delete<ApiResponse<T>>(
			url,
			config
		);
		return response.data;
	},
};

export default axiosInstance;
