import type { NextApiRequest, NextApiResponse } from 'next';
import axiosInstance from '@/utils/axiosInstance';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const sessionToken = req.cookies['auth_token'];
    if (!sessionToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const path = req.query.path as string[];
    const url = `/api/v1/${path.join('/')}`;
    
    const response = await axiosInstance({
      method: req.method,
      url,
      data: req.body,
      headers: {
        ...req.headers,
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    res.status(response.status).json(response.data);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Internal Server Error',
    });
  }
}