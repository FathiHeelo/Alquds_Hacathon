import { Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { TechnicianStackParamList } from "../../../app/navigation/navigation.types";
import { Button, Card, ScreenContainer } from "../../../shared/components";
export function TechnicianRequestScreen({ navigation }: NativeStackScreenProps<TechnicianStackParamList, "TechnicianRequestDetails">) { return <ScreenContainer><Text style={styles.title}>طلب تسريب — البلدة القديمة</Text><Card><Text style={styles.text}>تسريب مياه من أنبوب المجلى عند فتح الحنفية.</Text><Text style={styles.text}>الأولوية: عاجل · السعر العادل: 110–150 ₪</Text></Card><Button onPress={() => navigation.navigate("TechnicianCreateOffer", { requestId: "old_city_plumbing_leak" })}>إنشاء عرض</Button></ScreenContainer>; }
const styles = { title: { fontSize: 22, fontWeight: "700" as const, textAlign: "right" as const, writingDirection: "rtl" as const }, text: { fontSize: 16, textAlign: "right" as const, writingDirection: "rtl" as const, marginVertical: 6 } };
