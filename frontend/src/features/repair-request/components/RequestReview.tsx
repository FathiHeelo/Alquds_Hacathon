import { Text } from "react-native";
import type { RepairRequestDraft } from "../../../domain/models/repairRequest";
import { serviceCategories } from "../../../shared/constants/serviceCategories";
import { Field, requestStyles } from "./RequestFields";
import { RequestMediaList } from "./RequestMediaList";
import { urgencyOptions, timeOptions } from "../requestOptions";

export function RequestReview({ draft }: { draft: RepairRequestDraft }) {
  return <>
    <Field label="وصف المشكلة"><Text style={requestStyles.text}>{draft.description}</Text></Field>
    <Field label="نوع الخدمة"><Text style={requestStyles.text}>{serviceCategories.find(({ id }) => id === draft.category)?.label}</Text></Field>
    <Field label="موقع الصيانة"><Text style={requestStyles.text}>{draft.location.label}</Text></Field>
    <Field label="درجة الاستعجال"><Text style={requestStyles.text}>{urgencyOptions.find(({ id }) => id === draft.urgency)?.label}</Text></Field>
    <Field label="الوقت المناسب"><Text style={requestStyles.text}>{timeOptions.find(({ id }) => id === draft.preferredTime)?.label}</Text></Field>
    {draft.media.length ? <Field label="المرفقات"><RequestMediaList media={draft.media} /></Field> : null}
  </>;
}
