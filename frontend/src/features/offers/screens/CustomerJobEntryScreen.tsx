import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text } from "react-native";
import type { CustomerStackParamList } from "../../../app/navigation/navigation.types";
import { Button, SuccessState, ScreenContainer } from "../../../shared/components";
import { aiStyles } from "../../ai-diagnosis/components/AiResults";
export function CustomerJobEntryScreen({ route, navigation }: NativeStackScreenProps<CustomerStackParamList, "CustomerJobEntry">) { return <ScreenContainer><SuccessState message="تم قبول العرض بنجاح" /><Text style={aiStyles.text}>تم تجهيز الطلب للانتقال إلى الصيانة.</Text><Text style={aiStyles.text}>الفني: {route.params.technicianId}</Text><Button onPress={() => navigation.replace("CustomerJob", route.params)}>متابعة إلى التتبع</Button></ScreenContainer>; }
