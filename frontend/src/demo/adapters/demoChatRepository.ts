import type { ChatMessage, ChatRepository } from "../../domain/contracts/chatRepository";
const initialMessages: ChatMessage[] = [{ id: "m1", sender: "technician", text: "أهلاً، أنا في الطريق إلى البلدة القديمة.", createdAt: "10:05" }];
const messages = new Map<string, ChatMessage[]>([["default", [...initialMessages]]]);
export class DemoChatRepository implements ChatRepository { async getMessages(jobId: string) { return [...(messages.get(jobId) ?? messages.get("default")!)]; } async send(jobId: string, text: string) { return this.sendAs(jobId, text, "customer"); } async sendAs(jobId: string, text: string, sender: ChatMessage["sender"]) { const message = { id: `m-${Date.now()}`, sender, text, createdAt: "الآن" }; const list = messages.get(jobId) ?? []; list.push(message); messages.set(jobId, list); return message; } }
export const chatRepository = new DemoChatRepository();
export function resetDemoChat() { messages.clear(); messages.set("default", [...initialMessages]); }
