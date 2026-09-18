import { Text } from "react-native";
import { Card, ScreenContainer } from "../../../shared/components";
const items = ["تم قبول عرض طارق المقدسي", "الفني في الطريق إلى البلدة القديمة", "بدأ العمل في طلب التسريب", "أكملت المهمة — قيّم تجربتك", "أضيفت 240 نقطة إلى رصيدك"];
export function NotificationsScreen() { return <ScreenContainer><Text style={styles.title}>التنبيهات والمحادثة</Text>{items.map((item) => <Card key={item}><Text style={styles.text}>{item}</Text></Card>)}</ScreenContainer>; }
const styles = { title: { fontSize: 22, fontWeight: "700" as const, textAlign: "right" as const, writingDirection: "rtl" as const }, text: { fontSize: 16, textAlign: "right" as const, writingDirection: "rtl" as const } };
