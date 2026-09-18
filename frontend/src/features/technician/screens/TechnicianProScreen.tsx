import { Text } from "react-native";
import { Button, Card, ScreenContainer } from "../../../shared/components";
export function TechnicianProScreen() { return <ScreenContainer><Text style={styles.title}>عَمِّرها Pro</Text><Card><Text style={styles.text}>شارة Pro · ظهور أعلى · تحليلات الأداء · وصول أولوية · محفظة أعمال أكبر</Text><Text style={styles.text}>مساعد العروض الذكي متاح لأعضاء Pro.</Text></Card><Button onPress={() => undefined}>تجربة حالة Pro في العرض</Button></ScreenContainer>; }
const styles = { title: { fontSize: 24, fontWeight: "700" as const, textAlign: "right" as const, writingDirection: "rtl" as const }, text: { fontSize: 16, textAlign: "right" as const, writingDirection: "rtl" as const, marginVertical: 8 } };
