import { Text } from "react-native";
import { Button, Card, ScreenContainer } from "../../../shared/components";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { TechnicianStackParamList } from "../../../app/navigation/navigation.types";
export function TechnicianAccountScreen() { const navigation = useNavigation<NativeStackNavigationProp<TechnicianStackParamList>>(); return <ScreenContainer><Text style={styles.title}>حسابي</Text><Card><Text style={styles.text}>طارق المقدسي</Text><Text style={styles.text}>الدور: فني · AMMERHA Pro</Text><Text style={styles.text}>الحالة: متاح الآن</Text></Card><Button onPress={() => navigation.navigate("TechnicianProfile")}>الملف المهني</Button><Button variant="secondary" onPress={() => navigation.navigate("TechnicianPro")}>مزايا Pro</Button></ScreenContainer>; }
const styles = { title: { fontSize: 22, fontWeight: "700" as const, textAlign: "right" as const, writingDirection: "rtl" as const }, text: { fontSize: 16, textAlign: "right" as const, writingDirection: "rtl" as const, marginVertical: 6 } };
