import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import type { CustomerStackParamList } from "../../../app/navigation/navigation.types";
import { Button, Card, ErrorState, ScreenContainer } from "../../../shared/components";
import { serviceCategories } from "../../../shared/constants/serviceCategories";
import { colors } from "../../../shared/theme";
import { Field, Options, TextField, requestStyles as styles } from "../components/RequestFields";
import { RequestMediaList } from "../components/RequestMediaList";
import { RequestReview } from "../components/RequestReview";
import { useRepairRequest } from "../hooks/useRepairRequest";
import { timeOptions, urgencyOptions } from "../requestOptions";

export function RepairRequestScreen({ route, navigation }: NativeStackScreenProps<CustomerStackParamList, "CustomerRepairRequest">) {
  const form = useRepairRequest(route.params.technicianId);
  const { draft, errors } = form;
  const disabled = !!form.busy;
  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={100}>
    <ScreenContainer>
      {form.reviewing ? <>
        <Field label="مراجعة طلب الصيانة"><Text style={[styles.text, styles.muted]}>تأكد من تفاصيل طلبك قبل الإرسال.</Text></Field>
        <RequestReview draft={draft} />
        <View style={styles.actions}>
          <Button disabled={disabled} onPress={async () => {
            const request = await form.submit();
            if (request) navigation.replace("CustomerAiEntry", { requestId: request.id });
          }}>{form.busy === "submit" ? "جارٍ إرسال الطلب…" : "تأكيد الطلب والمتابعة"}</Button>
          <Button variant="outlined" disabled={disabled} onPress={form.edit}>تعديل التفاصيل</Button>
        </View>
      </> : <>
        <Field label="احكِ المشكلة بصوتك">
          <Button variant="outlined" disabled={disabled} onPress={() => void form.loadVoice()}>
            <Ionicons name="mic-outline" size={20} color={colors.primaryPressed} /> {form.busy === "voice" ? "جارٍ تجهيز الاقتراح…" : "تجربة إدخال صوتي"}
          </Button>
          <Text style={[styles.text, styles.muted]}>عينة صوتية تجريبية، دون تسجيل الميكروفون.</Text>
          {form.suggestion ? <Card>
            <Text style={styles.text}>{form.suggestion.voice.transcript}</Text>
            <Text style={[styles.text, styles.muted]}>{form.suggestion.voice.source === "demo" ? "اقتراح تجريبي" : "اقتراح من المساعد"}</Text>
            <Text style={styles.text}>{form.suggestion.description}</Text>
            <Button onPress={form.applyVoice}>اعتماد الاقتراح</Button>
            <Button variant="outlined" onPress={form.dismissVoice}>متابعة يدوياً</Button>
          </Card> : null}
        </Field>
        <TextField label="وصف المشكلة" value={draft.description} onChange={(description) => form.update({ description })}
          multiline error={errors.description} disabled={disabled} />
        <Options label="نوع الخدمة" value={draft.category} options={serviceCategories} onChange={(category) => form.update({ category })}
          error={errors.category} disabled={disabled} />
        <Field label="صورة / فيديو للعطل">
          <Button variant="outlined" disabled={disabled} onPress={() => void form.attachMedia()}>
            <Ionicons name="images-outline" size={20} color={colors.primaryPressed} /> {form.busy === "media" ? "جارٍ فتح المعرض…" : "إرفاق صورة أو فيديو"}
          </Button>
          <RequestMediaList media={draft.media} onRemove={form.removeMedia} disabled={disabled} />
        </Field>
        <TextField label="موقع الصيانة" value={draft.location.label} onChange={(label) => form.update({ location: { ...draft.location, label } })}
          error={errors.location} disabled={disabled} />
        <Text style={[styles.text, styles.muted]}>{draft.location.source === "demo" ? "الموقع التجريبي: القدس" : "الموقع الحالي"}</Text>
        <Options label="درجة الاستعجال" value={draft.urgency} options={urgencyOptions} onChange={(urgency) => form.update({ urgency })} disabled={disabled} error={errors.urgency} />
        <Options label="الوقت المناسب" value={draft.preferredTime} options={timeOptions} onChange={(preferredTime) => form.update({ preferredTime })} disabled={disabled} error={errors.preferredTime} />
        <Button disabled={disabled} onPress={form.review}>مراجعة الطلب</Button>
      </>}
      {form.error ? <ErrorState message={form.error} /> : null}
    </ScreenContainer>
  </KeyboardAvoidingView>;
}
