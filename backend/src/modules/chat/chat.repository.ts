import { Collections, col } from "../../database/firestore";
import { withId } from "../../shared/firestore.helpers";

interface ConversationDoc {
  jobId: string;
  customerId: string;
  technicianId: string;
  createdAt: FirebaseFirestore.Timestamp | Date;
}

const conversations = () => col(Collections.conversations);

export const chatRepository = {
  findByJob: async (jobId: string) => {
    const snap = await conversations().doc(jobId).get();
    return snap.exists ? withId(snap as FirebaseFirestore.DocumentSnapshot<ConversationDoc>) : null;
  },
  messages: async (conversationId: string, after?: Date) => {
    let query: FirebaseFirestore.Query = conversations().doc(conversationId).collection("messages").orderBy("createdAt", "asc");
    if (after) query = query.where("createdAt", ">", after);
    const snap = await query.limit(200).get();
    return snap.docs.map(withId);
  },
  createMessage: async (conversationId: string, data: { senderId: string; type: string; body?: string; payload?: Record<string, unknown> }) => {
    const ref = conversations().doc(conversationId).collection("messages").doc();
    const doc = { ...data, createdAt: new Date() };
    await ref.set(doc);
    return { id: ref.id, ...doc };
  }
};
