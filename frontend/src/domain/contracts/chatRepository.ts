export interface ChatMessage { id: string; sender: "customer" | "technician"; text: string; createdAt: string; }
export interface ChatRepository { getMessages(jobId: string): Promise<readonly ChatMessage[]>; send(jobId: string, text: string): Promise<ChatMessage>; }
