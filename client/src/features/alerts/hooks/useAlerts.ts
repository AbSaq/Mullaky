import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../api/api";

export function useAlerts(buildingId: string) {
  const queryClient = useQueryClient();
  const lastSeenKey = `alerts_seen_${buildingId}`;

  const { data: alerts = [] } = useQuery({
    queryKey: ["liveAlerts", buildingId],
    queryFn: async (): Promise<any[]> => {
      if (!buildingId) return [];
      const { data } = await api.get(`/alerts?buildingId=${buildingId}`);
      return data;
    },
    enabled: !!buildingId,
    refetchInterval: 1000 * 15,
  });

  const lastSeenTime = Number(localStorage.getItem(lastSeenKey) || "0");
  const unreadCount = alerts.filter(
    (a: any) => new Date(a.createdAt).getTime() > lastSeenTime,
  ).length;

  const markAllRead = () => {
    localStorage.setItem(lastSeenKey, Date.now().toString());
    queryClient.setQueryData(["liveAlerts", buildingId], (prev: any) =>
      prev ? [...prev] : [],
    );
  };

  return { alerts, unreadCount, markAllRead };
}
