import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { rewardRepository } from "../../../demo/adapters/demoRewardRepository";
import type { Reward, RewardAccount } from "../../../domain/models/reward";
import { LoadingState } from "../../../shared/components";
import { colors, shadows, typography } from "../../../shared/theme";

const rewardIcons: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; background: string }> = {
  "reward-electric": { icon: "flash", color: "#A16207", background: "#FEF3C7" },
  "reward-plumbing": { icon: "water", color: "#1D4ED8", background: "#DBEAFE" },
  "reward-stone": { icon: "business", color: "#57534E", background: "#E7E5E4" }
};

export function RewardsScreen() {
  const [account, setAccount] = useState<RewardAccount>();
  const [rewards, setRewards] = useState<readonly Reward[]>([]);

  useEffect(() => {
    void Promise.all([rewardRepository.getAccount(), rewardRepository.getRewards()]).then(([nextAccount, nextRewards]) => { setAccount(nextAccount); setRewards(nextRewards); });
  }, []);

  if (!account) return <SafeAreaView style={styles.safe}><LoadingState /></SafeAreaView>;

  const redeem = async (reward: Reward) => {
    try {
      setAccount(await rewardRepository.redeem(reward.id));
      Alert.alert("تم الاستبدال بنجاح", `تمت إضافة قسيمة ${reward.partner} إلى حسابك.`);
    } catch {
      Alert.alert("الرصيد غير كافٍ", "أكمل طلبات صيانة وقيّم الفنيين لجمع نقاط إضافية.");
    }
  };

  return <SafeAreaView edges={["top"]} style={styles.safe}>
    <View style={styles.header}><View><Text style={styles.title}>مكافآت القدس</Text><Text style={styles.subtitle}>نقاط عَمِّرها وقسائم الشركاء المحليين</Text></View><View style={styles.headerIcon}><Ionicons name="star" size={21} color={colors.primaryPressed} /></View></View>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.balanceCard}>
        <View style={styles.coinGhost}><Ionicons name="star" size={72} color="rgba(19,42,36,0.12)" /></View>
        <Text style={styles.balanceLabel}>رصيدك الحالي من نقاط عَمِّرها</Text>
        <View style={styles.balanceRow}><Text style={styles.balance}>{account.balance}</Text><Text style={styles.balanceUnit}>نقطة ذهبية</Text></View>
        <Text style={styles.balanceNote}>جمعت 50 نقطة جديدة من تقييم صيانة السباكة بالبلدة القديمة.</Text>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min(100, (account.balance / 1000) * 100)}%` }]} /></View>
        <Text style={styles.progressText}>{1000 - account.balance > 0 ? `باقي ${1000 - account.balance} نقطة لتصل للمستوى الذهبي` : "وصلت للمستوى الذهبي"}</Text>
      </View>

      <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>قسائم خصم في القدس</Text><Text style={styles.sectionSubtitle}>استخدم نقاطك عند شركائنا المعتمدين</Text></View><View style={styles.approved}><Ionicons name="shield-checkmark" size={13} color="#8C6D14" /><Text style={styles.approvedText}>متاجر معتمدة</Text></View></View>

      <View style={styles.rewardsList}>
        {rewards.map((reward) => {
          const icon = rewardIcons[reward.id] ?? rewardIcons["reward-stone"];
          const canRedeem = account.balance >= reward.pointsCost;
          return <View key={reward.id} style={styles.rewardCard}>
            <View style={styles.rewardTop}>
              <View style={[styles.rewardIcon, { backgroundColor: icon.background }]}><Ionicons name={icon.icon} color={icon.color} size={21} /></View>
              <View style={styles.rewardCopy}><Text style={styles.partner}>{reward.partner}</Text><Text style={styles.rewardTitle}>{reward.title}</Text><Text style={styles.rewardDescription}>{reward.description}</Text></View>
            </View>
            <View style={styles.rewardFooter}>
              <View style={styles.cost}><Ionicons name="star" size={13} color="#B58100" /><Text style={styles.costText}>{reward.pointsCost} نقطة</Text></View>
              <Pressable disabled={!canRedeem} onPress={() => void redeem(reward)} style={({ pressed }) => [styles.redeemButton, !canRedeem && styles.disabled, pressed && styles.pressed]}><Text style={styles.redeemText}>{canRedeem ? "استبدال" : "نقاط غير كافية"}</Text></Pressable>
            </View>
          </View>;
        })}
      </View>

      <View style={styles.earnCard}><View style={styles.earnIcon}><Ionicons name="sparkles" size={20} color="#8C6D14" /></View><View style={styles.earnCopy}><Text style={styles.earnTitle}>كيف تجمع نقاطًا أكثر؟</Text><Text style={styles.earnText}>أكمل طلب صيانة واكتب تقييمًا موثوقًا لتحصل على 50 نقطة.</Text></View></View>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: "#F8F7F4", flex: 1 }, header: { alignItems: "center", flexDirection: "row-reverse", justifyContent: "space-between", paddingBottom: 12, paddingHorizontal: 16, paddingTop: 10 }, title: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 22, fontWeight: "800", textAlign: "right" }, subtitle: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 10, textAlign: "right" }, headerIcon: { alignItems: "center", backgroundColor: "#FFF4C8", borderRadius: 13, height: 42, justifyContent: "center", width: 42 },
  content: { padding: 14, paddingBottom: 30 }, balanceCard: { ...shadows.raised, backgroundColor: colors.primary, borderRadius: 24, overflow: "hidden", padding: 18 }, coinGhost: { bottom: -12, left: -8, position: "absolute" }, balanceLabel: { color: "rgba(19,42,36,0.78)", fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "700", textAlign: "right" }, balanceRow: { alignItems: "baseline", flexDirection: "row-reverse", gap: 7, justifyContent: "flex-start", marginVertical: 2 }, balance: { color: colors.secondary, fontFamily: typography.fontFamily, fontSize: 36, fontWeight: "900" }, balanceUnit: { color: colors.secondary, fontFamily: typography.fontFamily, fontSize: 12, fontWeight: "800" }, balanceNote: { color: "rgba(19,42,36,0.84)", fontFamily: typography.fontFamily, fontSize: 10, lineHeight: 16, textAlign: "right", width: "84%" }, progressTrack: { backgroundColor: "rgba(255,255,255,0.45)", borderRadius: 4, height: 6, marginTop: 13, overflow: "hidden" }, progressFill: { backgroundColor: colors.secondary, borderRadius: 4, height: 6 }, progressText: { color: "rgba(19,42,36,0.75)", fontFamily: typography.fontFamily, fontSize: 8, marginTop: 4, textAlign: "right" },
  sectionHeading: { alignItems: "center", flexDirection: "row-reverse", justifyContent: "space-between", marginBottom: 10, marginTop: 19 }, sectionTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 14, fontWeight: "800", textAlign: "right" }, sectionSubtitle: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 9, textAlign: "right" }, approved: { alignItems: "center", backgroundColor: "#FFF8E3", borderRadius: 9, flexDirection: "row-reverse", gap: 3, paddingHorizontal: 7, paddingVertical: 5 }, approvedText: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "700" }, rewardsList: { gap: 10 },
  rewardCard: { ...shadows.subtle, backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 18, borderWidth: 1, padding: 12 }, rewardTop: { alignItems: "center", flexDirection: "row-reverse", gap: 10 }, rewardIcon: { alignItems: "center", borderRadius: 13, height: 44, justifyContent: "center", width: 44 }, rewardCopy: { flex: 1 }, partner: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 12, fontWeight: "700", textAlign: "right" }, rewardTitle: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 10, marginTop: 2, textAlign: "right" }, rewardDescription: { color: "#94A3B8", fontFamily: typography.fontFamily, fontSize: 8, marginTop: 2, textAlign: "right" }, rewardFooter: { alignItems: "center", borderTopColor: "#F0ECE3", borderTopWidth: 1, flexDirection: "row-reverse", justifyContent: "space-between", marginTop: 10, paddingTop: 9 }, cost: { alignItems: "center", flexDirection: "row-reverse", gap: 4 }, costText: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 10, fontWeight: "700" }, redeemButton: { backgroundColor: colors.secondary, borderRadius: 11, minWidth: 82, paddingHorizontal: 11, paddingVertical: 8 }, redeemText: { color: colors.primary, fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "800", textAlign: "center" }, disabled: { backgroundColor: "#CBD5E1" }, pressed: { opacity: 0.75, transform: [{ scale: 0.96 }] },
  earnCard: { alignItems: "center", backgroundColor: "#FFF8E3", borderColor: "#EEDB9D", borderRadius: 16, borderWidth: 1, flexDirection: "row-reverse", gap: 9, marginTop: 14, padding: 12 }, earnIcon: { alignItems: "center", backgroundColor: "white", borderRadius: 11, height: 38, justifyContent: "center", width: 38 }, earnCopy: { flex: 1 }, earnTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "700", textAlign: "right" }, earnText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 9, lineHeight: 15, textAlign: "right" }
});
