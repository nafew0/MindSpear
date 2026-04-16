import axiosInstance from "@/utils/axiosInstance";

export const getAllQuests = () => axiosInstance.get("/quests");

export const getQuestById = (id: string) =>
	axiosInstance.get(`/quests/show/${id}`);

export const deleteQuestById = (id: string) =>
	axiosInstance.delete(`/quests/delete/${id}`);
