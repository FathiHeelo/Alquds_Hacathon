import { useEffect, useState } from "react";
import { Text } from "react-native";
import { Button, Card, EmptyState, LoadingState, ScreenContainer } from "../../../shared/components";
import { chatRepository } from "../../../demo/adapters/demoChatRepository";
import type { ChatMessage } from "../../../domain/contracts/chatRepository";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { TechnicianStackParamList } from "../../../app/navigation/navigation.types";
export function TechnicianMessagesScreen() { const navigation = useNavigation<NativeStackNavigationProp<TechnicianStackParamList>>(); const [messages, setMessages] = useState<readonly ChatMessage[]>(); useEffect(() => { void chatRepository.getMessages("demo-job-offer-tariq-plumbing").then(setMessages); }, []); if (!messages) return <ScreenContainer><LoadingState /></ScreenContainer>; return <ScreenContainer><Text style={styles.title}>الرسائل</Text><Card><Text style={styles.text}>عميل عَمِّرها · مهمة تسريب البلدة القديمة</Text>{messages.length ? <Text style={styles.text}>آخر رسالة: {messages[messages.length - 1]?.text}</Text> : <EmptyState message="لا توجد رسائل." />}<Button onPress={() => navigation.navigate("TechnicianChat")}>فتح المحادثة</Button></Card></ScreenContainer>; }
const styles = { title: { fontSize: 22, fontWeight: "700" as const, textAlign: "right" as const, writingDirection: "rtl" as const }, text: { fontSize: 16, textAlign: "right" as const, writingDirection: "rtl" as const, marginVertical: 6 } };
