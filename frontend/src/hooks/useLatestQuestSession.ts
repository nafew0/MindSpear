import { useCallback, useEffect, useState } from "react";
import { getQuestById } from "@/services/questService";
import { AxiosError } from "axios";

type QuestSession = any;

export default function useLatestQuestSession(questId?: string) {
  const [latestSessionId, setLatestSessionId] = useState<string | null>(null);
  const [latestSession, setLatestSession] = useState<QuestSession | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLatest = useCallback(async () => {
    if (!questId) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await getQuestById(questId);
      const sessions = resp?.data?.data?.questSessions?.data;
      if (Array.isArray(sessions) && sessions.length > 0) {
        // ensure newest first by created_at
        const sorted = sessions.slice().sort((a: any, b: any) => {
          const ta = new Date(a.created_at).getTime();
          const tb = new Date(b.created_at).getTime();
          return tb - ta;
        });
        const pick = sorted[0];
        setLatestSession(pick);
        // prefer id if present, otherwise id
        setLatestSessionId(pick?.id ?? (pick?.id ? String(pick.id) : null));
      } else {
        setLatestSession(undefined);
        setLatestSessionId(null);
      }
    } catch (e) {
      const axiosError = e as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? axiosError.message ?? "Failed to fetch quest sessions");
      setLatestSession(undefined);
      setLatestSessionId(null);
    } finally {
      setLoading(false);
    }
  }, [questId]);

  useEffect(() => {
    if (!questId) return;
    void fetchLatest();
  }, [fetchLatest, questId]);

  return {
    latestSessionId,
    latestSession,
    loading,
    error,
    refresh: fetchLatest,
  } as const;
}
