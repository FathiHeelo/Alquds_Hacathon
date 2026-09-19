import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import type { CustomerStackParamList } from "../../../app/navigation/navigation.types";
import { Button, EmptyState, ScreenContainer } from "../../../shared/components";
import { aiStyles } from "../components/AiResults";

export function CustomerOffersEntryScreen({ route, navigation }: NativeStackScreenProps<CustomerStackParamList, "CustomerOffersEntry">) {
  return <ScreenContainer><View style={aiStyles.section}>
    <EmptyState message="العروض وملف الفني غير متاحين بعد." />
    <Text style={aiStyles.text}>رقم الطلب: {route.params.requestId}</Text>
    <Button variant="outlined" onPress={() => navigation.goBack()}>العودة لملخص الطلب</Button>
    <Button onPress={() => navigation.popTo("CustomerTabs")}>العودة للخريطة</Button>
  </View></ScreenContainer>;
}
