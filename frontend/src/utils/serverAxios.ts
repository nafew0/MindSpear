import axios from "axios";
import { cookies } from "next/headers";

export async function serverAxios() {
	const token = (await cookies()).get("auth_token")?.value;

	return axios.create({
		baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
}
