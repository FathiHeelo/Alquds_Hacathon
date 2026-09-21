import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import type { CustomerStackParamList } from "../../../app/navigation/navigation.types";
import { Button, EmptyState, ErrorState, LoadingState, ScreenContainer } from "../../../shared/components";
import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { TechnicianPreview } from "../../map/components/TechnicianPreview";
import { RequestReview } from "../../repair-request/components/RequestReview";
import { aiStyles, Detail, DiagnosisCard, PriceCard } from "../components/AiResults";
import { useAiCustomerFlow } from "../hooks/useAiCustomerFlow";
import { RequestNotFoundError } from "../services/loadCustomerAiFlow";
import { presentMatchingReason } from "../../../services/ai/aiPresentation";

export function AiCustomerFlowScreen({ route, navigation }: NativeStackScreenProps<CustomerStackParamList, "CustomerAiEntry">) {
  const flow = useAiCustomerFlow(route.params.requestId);
  const continueToOffers = (technicianId?: string) => navigation.navigate("CustomerOffersEntry", {
    requestId: route.params.requestId, technicianId: technicianId ?? flow.request?.technicianId
  });
  return <ScreenContainer>
    {flow.error ? <ErrorState message={flow.error instanceof RequestNotFoundError ? flow.error.message : "تعذر تحميل الطلب. حاول مجدداً."} onRetry={() => void flow.retry()} /> : null}
    {flow.loading ? <LoadingState message="نجهز التشخيص المبدئي والسعر وترشيحات الفنيين…" /> : null}
    {flow.request ? <>
      <View style={aiStyles.section}>
        <LocalizedText style={[aiStyles.text, aiStyles.title]}>ملخص طلبك</LocalizedText>
        <RequestReview draft={flow.request} />
        {flow.request.voice && flow.result?.structured ? <Detail label="تفسير الطلب الصوتي" value={flow.result.structured.normalizedDescription} /> : null}
      </View>
      {flow.result ? <>
        {flow.result.unavailable.length ? <View style={aiStyles.section}>
          <LocalizedText accessibilityRole="alert" style={aiStyles.text}>بعض المساعدة الذكية غير متاحة الآن. تفاصيل طلبك محفوظة ويمكنك المتابعة.</LocalizedText>
          <Button variant="outlined" onPress={() => void flow.retry()}>إعادة المحاولة</Button>
        </View> : null}
        <View style={aiStyles.section}>{flow.result.diagnosis
          ? <DiagnosisCard result={flow.result.diagnosis} request={flow.request} />
          : <EmptyState message="التشخيص غير متاح حالياً. يمكنك متابعة طلبك دون تشخيص." />}</View>
        <View style={aiStyles.section}>{flow.result.price
          ? <PriceCard result={flow.result.price} />
          : <EmptyState message="تقدير السعر غير متاح حالياً." />}</View>
        {flow.result.risk ? <View style={aiStyles.section}>
          <Detail label="فحص الثقة" value={flow.result.risk.signals.length ? `رصد جابر ${flow.result.risk.signals.length} إشارة للمراجعة البشرية دون اتخاذ إجراء تلقائي.` : "لم يرصد جابر إشارات تستدعي المراجعة."} />
        </View> : null}
        <View style={aiStyles.section}>
          <LocalizedText style={[aiStyles.text, aiStyles.title]}>{flow.result.unavailable.includes("matching") ? "الفنيون في فئة طلبك" : "الفنيون المقترحون"}</LocalizedText>
          {flow.result.unavailable.includes("technicians") ? <ErrorState message="تعذر تحميل الفنيين." onRetry={() => void flow.retry()} /> :
            !flow.result.recommendations.length ? <EmptyState message="لا توجد ترشيحات حالياً. يمكنك المتابعة للعروض أو العودة للخريطة." /> : null}
          {flow.result.recommendations.map(({ technician, match }) => <TechnicianPreview key={technician.id} technician={technician}
            onProfile={() => continueToOffers(technician.id)} onRepairRequest={() => continueToOffers(technician.id)} actionLabel="متابعة للعروض">
            {match ? <View style={aiStyles.content}>
              <LocalizedText style={aiStyles.text}>درجة المطابقة: {match.score}</LocalizedText>
              {match.reasons.map((reason, index) => <LocalizedText key={`${index}-${reason}`} style={[aiStyles.text, aiStyles.muted]}>{presentMatchingReason(reason)}</LocalizedText>)}
            </View> : null}
          </TechnicianPreview>)}
        </View>
      </> : null}
      <View style={aiStyles.section}><Button onPress={() => continueToOffers()}>{flow.loading ? "متابعة بالطلب دون انتظار" : "الانتقال للعروض"}</Button></View>
    </> : null}
    <Button variant="outlined" onPress={() => navigation.popTo("CustomerTabs")}>العودة للخريطة</Button>
  </ScreenContainer>;
}
