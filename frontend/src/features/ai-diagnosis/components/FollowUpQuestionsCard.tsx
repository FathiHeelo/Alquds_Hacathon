import type { DiagnosisAnswer, FollowUpQuestion } from "@ammerha/ai";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Button, Card } from "../../../shared/components";
import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { colors, spacing } from "../../../shared/theme";
import { aiStyles } from "./AiResults";

export function FollowUpQuestionsCard({ questions, busy, onSubmit }: { questions: readonly FollowUpQuestion[]; busy: boolean; onSubmit(answers: DiagnosisAnswer[]): void }) {
  const { language, t } = useI18n();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const complete = questions.every(({ id }) => Boolean(answers[id]));
  return <Card><View style={styles.content}>
    <LocalizedText accessibilityRole="header" style={[aiStyles.text, aiStyles.title]}>{t("diagnosis.questionsTitle")}</LocalizedText>
    <LocalizedText style={[aiStyles.text, aiStyles.muted]}>{t("diagnosis.questionsHint")}</LocalizedText>
    {questions.map((question, index) => <View key={question.id} style={styles.question}>
      <LocalizedText style={[aiStyles.text, styles.prompt]}>{index + 1}. {language === "ar" ? question.promptAr : question.promptEn}</LocalizedText>
      <View style={styles.options}>{question.options.map((item) => {
        const selected = answers[question.id] === item.value;
        return <Pressable accessibilityRole="radio" accessibilityState={{ selected }} key={item.value} onPress={() => setAnswers((current) => ({ ...current, [question.id]: item.value }))} style={[styles.option, selected && styles.selected]}><LocalizedText style={[aiStyles.text, styles.optionText, selected && styles.selectedText]}>{language === "ar" ? item.labelAr : item.labelEn}</LocalizedText></Pressable>;
      })}</View>
    </View>)}
    <Button
      disabled={!complete || busy}
      onPress={() => onSubmit(questions.map(({ id }) => ({ questionId: id, value: answers[id]! })))}
    >
      {t("diagnosis.refine")}
    </Button>
  </View></Card>;
}

const styles = {
  content: { gap: spacing.md },
  question: { borderTopColor: "#ECE7DC", borderTopWidth: 1, gap: spacing.sm, paddingTop: spacing.md },
  prompt: { fontWeight: "700" as const },
  options: { gap: spacing.sm },
  option: { backgroundColor: "#F8FAFC", borderColor: "#CBD5E1", borderRadius: 12, borderWidth: 1, minHeight: 44, justifyContent: "center" as const, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  selected: { backgroundColor: "#FFF8E3", borderColor: colors.primaryPressed, borderWidth: 2 },
  optionText: { textAlign: "center" as const },
  selectedText: { color: colors.primaryPressed, fontWeight: "800" as const }
};
