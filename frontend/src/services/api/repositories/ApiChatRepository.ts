import type { ChatMessage, ChatRepository } from "../../../domain/contracts/chatRepository";
import type { ApiRole } from "../apiSession";
import { apiClient } from "../apiClient";
type ConversationDto = { customerId: string; technicianId: string };
type MessageDto = { id: string; senderId: string; body?: string | null; createdAt: string };
type ChatRole = Exclude<ApiRole, "admin">;
export class ApiChatRepository implements ChatRepository { constructor(private readonly role: ChatRole) {} private map(value: MessageDto, conversation?: ConversationDto): ChatMessage { return { id: value.id, sender: conversation?.technicianId === value.senderId ? "technician" : "customer", text: value.body ?? "", createdAt: new Date(value.createdAt).toLocaleTimeString() }; } async getMessages(jobId: string) { const result = await apiClient.request<{ conversation: ConversationDto; messages: MessageDto[] }>(`/jobs/${jobId}/conversation`, undefined, this.role); return result.messages.map((item) => this.map(item, result.conversation)); } async send(jobId: string, text: string) { const result = this.map(await apiClient.request<MessageDto>(`/jobs/${jobId}/conversation/messages`, { method: "POST", body: JSON.stringify({ type: "text", body: text }) }, this.role)); return { ...result, sender: this.role }; } }
