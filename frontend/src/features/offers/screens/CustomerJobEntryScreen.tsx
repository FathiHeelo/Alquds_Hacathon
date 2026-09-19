import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text } from "react-native";
import type { CustomerStackParamList } from "../../../app/navigation/navigation.types";
import { Button, SuccessState, ScreenContainer } from "../../../shared/components";
import { aiStyles } from "../../ai-diagnosis/components/AiResults";
export function CustomerJobEntryScreen({ route, navigation }: NativeStackScreenProps<CustomerStackParamList, "CustomerJobEntry">) { return <ScreenContainer><SuccessState message="تم قبول العرض بنجاح" /><LocalizedText style={aiStyles.text}>تم تجهيز الطلب للانتقال إلى الصيانة.</LocalizedText><LocalizedText style={aiStyles.text}>الفني: {route.params.technicianId}</LocalizedText><Button onPress={() => navigation.replace("CustomerJob", route.params)}>متابعة إلى التتبع</Button></ScreenContainer>; }
