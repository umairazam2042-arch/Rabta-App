import api from "./api";

export const getShots = async (limit = 8) => {
  const { data } = await api.get("/shots", { params: { limit } });
  const payload = data?.data ?? data;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.shots)) return payload.shots;
  return [];
};