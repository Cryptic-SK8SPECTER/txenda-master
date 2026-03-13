import { customFetch } from "@/utils/index"; // Ajuste o caminho conforme o seu projeto

export interface Notification {
  _id: string;
  recipient: string;
  sender?: string;
  title: string;
  message: string;
  type: "info" | "subscription" | "message" | "alert";
  link?: string;
  read: boolean;
  createdAt: string;
}

// Interface para bater com a estrutura do seu backend (JSend pattern)
interface ApiResponse<T> {
  status: string;
  results?: number;
  data: {
    data: T;
  };
}

// GET /notifications/my-notifications
export const getMyNotifications = async (): Promise<Notification[]> => {
  const response = await customFetch.get<ApiResponse<Notification[]>>(
    "/notifications/my-notifications",
  );
  // No Axios, o corpo da resposta do servidor está em 'data'
  // No seu backend, os dados reais estão em 'data.data'
  return response.data.data.data;
};

// PATCH /notifications/:id/read
export const markNotificationAsRead = async (
  id: string,
): Promise<Notification> => {
  const response = await customFetch.patch<ApiResponse<Notification>>(
    `/notifications/${id}/read`,
  );
  return response.data.data.data;
};

// GET /notifications (admin)
export const getAllNotifications = async (): Promise<Notification[]> => {
  const response =
    await customFetch.get<ApiResponse<Notification[]>>("/notifications");
  return response.data.data.data;
};

// GET /notifications/:id
export const getNotification = async (id: string): Promise<Notification> => {
  const response = await customFetch.get<ApiResponse<Notification>>(
    `/notifications/${id}`,
  );
  return response.data.data.data;
};

// POST /notifications (admin)
export const createNotification = async (
  payload: Pick<
    Notification,
    "recipient" | "title" | "message" | "type" | "link"
  >,
): Promise<Notification> => {
  const response = await customFetch.post<ApiResponse<Notification>>(
    "/notifications",
    payload,
  );
  return response.data.data.data;
};

// DELETE /notifications/:id (admin)
export const deleteNotification = async (id: string): Promise<void> => {
  await customFetch.delete(`/notifications/${id}`);
};
