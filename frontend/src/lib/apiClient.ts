import { unstable_cacheTag as cacheTag, revalidateTag } from 'next/cache';
import { RequestOptions } from '@/types/api';

export async function apiRequest<TResponse, TBody>(
  url: string,
  options: RequestOptions<TBody>
): Promise<TResponse> {
  const { method, body, headers, cacheTag: tag } = options;

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = (await response.json()) as TResponse;

  if (method === 'GET' && tag) {
    cacheTag(tag);
  }

  return data;
}

export async function revalidateCache(tag: string) {
  await revalidateTag(tag);
}
