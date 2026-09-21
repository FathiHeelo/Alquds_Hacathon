import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, View } from "react-native";

import type { CustomerStackParamList } from "../../../app/navigation/navigation.types";
import { Button, Card, ScreenContainer } from "../../../shared/components";
import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { useTheme } from "../../../shared/theme";
import { urgentDispatchApi, type UrgentDispatchState } from "../../../services/api/urgentDispatchApi";
import { customerJobRepository, technicianRepository } from "../../../services/repositories";
import { createDemoUrgentJob } from "../../../demo/adapters/demoJobRepository";
import { demoTechnicians } from "../../../demo/fixtures/technicians";

type Stage =
  | "detected"
  | "analyzing"
  | "searching3"
  | "noAcceptance"
  | "expanding6"
  | "found"
  | "waiting"
  | "accepted"
  | "jobCreated"
  | "error";

type Props = NativeStackScreenProps<CustomerStackParamList, "CustomerUrgentSearch">;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const stageCopy: Record<Stage, { ar: string; en: string }> = {
  detected: {
    ar: "تم اكتشاف حالة مستعجلة",
    en: "Urgent case detected"
  },
  analyzing: {
    ar: "نحلل التخصص المطلوب...",
    en: "Analyzing required specialty..."
  },
  searching3: {
    ar: "البحث ضمن 3 كم",
    en: "Searching within 3 km"
  },
  noAcceptance: {
    ar: "لم يتم العثور على قبول مناسب",
    en: "No suitable acceptance found"
  },
  expanding6: {
    ar: "جارٍ توسيع نطاق البحث إلى 6 كم...",
    en: "Expanding search to 6 km..."
  },
  found: {
    ar: "تم العثور على فني مؤهل",
    en: "Qualified technician found"
  },
  waiting: {
    ar: "بانتظار قبول الفني...",
    en: "Waiting for technician acceptance..."
  },
  accepted: {
    ar: "وافق الفني على الطلب",
    en: "Technician accepted the request"
  },
  jobCreated: {
    ar: "تم تعيين الفني وإنشاء المهمة",
    en: "Technician assigned and job created"
  },
  error: {
    ar: "تعذر تشغيل البحث العاجل",
    en: "Unable to start urgent search"
  }
};

const steps: readonly Stage[] = [
  "detected",
  "analyzing",
  "searching3",
  "noAcceptance",
  "expanding6",
  "found",
  "waiting",
  "accepted",
  "jobCreated"
];

export function UrgentSearchScreen({ route, navigation }: Props) {
  const { language } = useI18n();
  const { theme } = useTheme();

  const isDemo = route.params.demo === true;
  const requestId = route.params.requestId;

  const [stage, setStage] = useState<Stage>("detected");
  const [radiusKm, setRadiusKm] = useState(3);
  const [dispatch, setDispatch] = useState<UrgentDispatchState>();
  const [technician, setTechnician] = useState(demoTechnicians[0]);
  const [jobId, setJobId] = useState<string>();
  const [error, setError] = useState<string>();

  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true
        })
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [pulse]);

  useEffect(() => {
    let cancelled = false;

    const openJob = async (createdJobId: string) => {
      if (cancelled) return;

      setJobId(createdJobId);
      setStage("jobCreated");

      await wait(900);

      if (cancelled) return;

      const jobs = await customerJobRepository.list();
      const job = jobs.find((item) => item.id === createdJobId);

      if (job) {
        navigation.replace("CustomerJob", {
          jobId: job.id,
          requestId: job.requestId,
          offerId: job.offerId,
          technicianId: job.technicianId
        });
      }
    };

    const runDemo = async () => {
      setStage("detected");
      await wait(650);
      if (cancelled) return;

      setStage("analyzing");
      await wait(750);
      if (cancelled) return;

      setStage("searching3");
      setRadiusKm(3);
      await wait(1100);
      if (cancelled) return;

      setStage("noAcceptance");
      await wait(950);
      if (cancelled) return;

      setStage("expanding6");
      await wait(1000);
      if (cancelled) return;

      setRadiusKm(6);
      setStage("found");

      const selected = demoTechnicians.find(
        (item) =>
          item.categoryIds.includes("plumbing") &&
          item.isVerified &&
          item.isAvailable
      );

      if (selected) setTechnician(selected);

      await wait(950);
      if (cancelled) return;

      setStage("waiting");
      await wait(1100);
      if (cancelled) return;

      setStage("accepted");
      await wait(800);
      if (cancelled) return;

      const job = createDemoUrgentJob({
        requestId,
        technicianId: selected?.id ?? "tech-tariq-maqdisi",
        price: 190,
        etaMinutes: 20
      });

      await openJob(job.id);
    };

    const pollRealDispatch = async () => {
      try {
        const state = await urgentDispatchApi.get(requestId, "customer");

        if (cancelled) return;

        setDispatch(state);
        setRadiusKm(state.radiusKm);

        if (state.status === "assigned" && state.acceptedTechnicianId) {
          setStage("accepted");

          const selected = await technicianRepository.getById(
            state.acceptedTechnicianId
          );

          if (selected) setTechnician(selected);

          const jobs = await customerJobRepository.list();
          const job = jobs.find((item) => item.requestId === requestId);

          if (job) {
            await openJob(job.id);
          }
        }
      } catch (cause) {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to refresh urgent dispatch."
          );
          setStage("error");
        }
      }
    };

    const runReal = async () => {
      try {
        setStage("detected");
        await wait(600);
        if (cancelled) return;

        setStage("analyzing");
        await wait(700);
        if (cancelled) return;

        const started = await urgentDispatchApi.start(requestId);

        if (cancelled) return;

        setDispatch(started);
        setRadiusKm(started.radiusKm);

        if (started.radiusKm === 3 && started.eligibleCount === 0) {
          setStage("noAcceptance");
          await wait(900);
          if (cancelled) return;

          if (started.canExpand) {
            setStage("expanding6");
            await wait(900);
            if (cancelled) return;

            const expanded = await urgentDispatchApi.expand(requestId);

            if (cancelled) return;

            setDispatch(expanded);
            setRadiusKm(expanded.radiusKm);
          }
        }

        if (cancelled) return;

        if ((started.eligibleCount ?? 0) > 0 || (dispatch?.eligibleCount ?? 0) > 0) {
          setStage("found");
        } else {
          setStage("searching3");
        }

        const interval = setInterval(() => {
          void pollRealDispatch();
        }, 1800);

        if (cancelled) clearInterval(interval);

        return () => clearInterval(interval);
      } catch (cause) {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to start urgent dispatch."
          );
          setStage("error");
        }
      }
    };

    if (isDemo) {
      void runDemo();
    } else {
      void runReal();
    }

    return () => {
      cancelled = true;
    };
  }, [isDemo, navigation, requestId, technicianRepository]);

  const ringScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1.08]
  });

  const ringOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.28, 0.06]
  });

  const radiusSize = radiusKm >= 9 ? 250 : radiusKm >= 6 ? 220 : 180;

  const isTerminal =
    stage === "accepted" || stage === "jobCreated";

  const stageIndex = steps.indexOf(stage);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="flash" size={24} color="#C2410C" />
        </View>

        <LocalizedText
          style={[
            styles.title,
            { color: theme.text, writingDirection: language === "ar" ? "rtl" : "ltr" }
          ]}
        >
          {language === "ar" ? "البحث عن فني بشكل عاجل" : "Urgent technician search"}
        </LocalizedText>

        {isDemo ? (
          <View style={styles.demoBadge}>
            <LocalizedText style={styles.demoBadgeText}>DEMO</LocalizedText>
          </View>
        ) : null}
      </View>

      <Card>
        <View style={styles.radarCard}>
          <View style={styles.radar}>
            <Animated.View
              style={[
                styles.radarPulse,
                {
                  width: radiusSize,
                  height: radiusSize,
                  borderRadius: radiusSize / 2,
                  opacity: ringOpacity,
                  transform: [{ scale: ringScale }]
                }
              ]}
            />

            <View
              style={[
                styles.radarRing,
                {
                  width: radiusSize,
                  height: radiusSize,
                  borderRadius: radiusSize / 2,
                  borderColor: theme.primary
                }
              ]}
            />

            <View
              style={[
                styles.radarRing,
                {
                  width: radiusSize * 0.72,
                  height: radiusSize * 0.72,
                  borderRadius: (radiusSize * 0.72) / 2,
                  borderColor: theme.primary,
                  opacity: 0.55
                }
              ]}
            />

            <View
              style={[
                styles.radarCenter,
                { backgroundColor: theme.primary }
              ]}
            >
              <Ionicons name="location" size={24} color="#1F2937" />
            </View>

            {stage === "found" || isTerminal ? (
              <View style={styles.techMarker}>
                <Ionicons name="person" size={16} color="#FFFFFF" />
              </View>
            ) : null}
          </View>

          <LocalizedText
            style={[styles.radiusLabel, { color: theme.text }]}
          >
            {language === "ar"
              ? `نطاق البحث: ${radiusKm} كم`
              : `Search radius: ${radiusKm} km`}
          </LocalizedText>

          <LocalizedText
            style={[styles.status, { color: theme.textMuted }]}
          >
            {language === "ar"
              ? stageCopy[stage].ar
              : stageCopy[stage].en}
          </LocalizedText>

          {stage === "analyzing" ||
          stage === "searching3" ||
          stage === "expanding6" ||
          stage === "waiting" ? (
            <ActivityIndicator size="small" color={theme.primaryPressed} />
          ) : null}
        </View>
      </Card>

      <Card>
        <View style={styles.sectionHeader}>
          <Ionicons name="list" size={18} color={theme.primaryPressed} />
          <LocalizedText style={[styles.sectionTitle, { color: theme.text }]}>
            {language === "ar" ? "تقدم البحث" : "Search progress"}
          </LocalizedText>
        </View>

        {steps.map((item, index) => {
          const completed =
            stage === "jobCreated"
              ? true
              : stageIndex > index;

          const active = stage === item;

          return (
            <View key={item} style={styles.stepRow}>
              <View
                style={[
                  styles.stepDot,
                  completed && styles.stepDone,
                  active && styles.stepActive
                ]}
              >
                {completed ? (
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                ) : active ? (
                  <View style={styles.activeDot} />
                ) : null}
              </View>

              <LocalizedText
                style={[
                  styles.stepText,
                  {
                    color: active || completed
                      ? theme.text
                      : theme.textMuted
                  }
                ]}
              >
                {language === "ar"
                  ? stageCopy[item].ar
                  : stageCopy[item].en}
              </LocalizedText>
            </View>
          );
        })}
      </Card>

      {stage === "found" ||
      stage === "accepted" ||
      stage === "jobCreated" ? (
        <Card>
          <View style={styles.techHeader}>
            <Ionicons name="person-circle" size={26} color={theme.primaryPressed} />

            <LocalizedText
              style={[styles.sectionTitle, { color: theme.text }]}
            >
              {stage === "accepted" || stage === "jobCreated"
                ? language === "ar"
                  ? "تم قبول الفني"
                  : "Technician accepted"
                : language === "ar"
                  ? "فني مؤهل"
                  : "Qualified technician"}
            </LocalizedText>
          </View>

          <View style={styles.techCard}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={22} color={theme.primaryPressed} />
            </View>

            <View style={styles.techCopy}>
              <LocalizedText style={[styles.techName, { color: theme.text }]}>
                {technician.name}
              </LocalizedText>

              <LocalizedText style={[styles.techSpecialty, { color: theme.textMuted }]}>
                {technician.specialty}
              </LocalizedText>

              <View style={styles.techMeta}>
                <LocalizedText style={styles.metaPill}>
                  ★ {technician.rating.toFixed(1)}
                </LocalizedText>

                {technician.isVerified ? (
                  <LocalizedText style={styles.metaPill}>
                    ✓ {language === "ar" ? "موثّق" : "Verified"}
                  </LocalizedText>
                ) : null}

                <LocalizedText style={styles.metaPill}>
                  {technician.distanceKm ?? "-"} km
                </LocalizedText>
              </View>
            </View>
          </View>

          {dispatch ? (
            <LocalizedText style={[styles.dispatchMeta, { color: theme.textMuted }]}>
              {language === "ar"
                ? `الفنيون المؤهلون ضمن النطاق: ${dispatch.eligibleCount}`
                : `Eligible technicians in radius: ${dispatch.eligibleCount}`}
            </LocalizedText>
          ) : null}
        </Card>
      ) : null}

      {error ? (
        <Card>
          <LocalizedText accessibilityRole="alert" style={styles.errorText}>
            {error}
          </LocalizedText>

          <Button
            variant="outlined"
            onPress={() => navigation.goBack()}
          >
            {language === "ar" ? "العودة" : "Back"}
          </Button>
        </Card>
      ) : null}

      {stage === "jobCreated" && jobId ? (
        <Button
          onPress={() =>
            void customerJobRepository.getJob(jobId).then((job) => {
              if (!job) return;

              navigation.replace("CustomerJob", {
                jobId: job.id,
                requestId: job.requestId,
                offerId: job.offerId,
                technicianId: job.technicianId
              });
            })
          }
        >
          {language === "ar" ? "عرض المهمة" : "View job"}
        </Button>
      ) : null}

      {!isTerminal && !error ? (
        <Button
          variant="outlined"
          onPress={() => navigation.goBack()}
        >
          {language === "ar" ? "إلغاء البحث" : "Cancel search"}
        </Button>
      ) : null}
    </ScreenContainer>
  );
}

const styles = {
  header: {
    alignItems: "center" as const,
    gap: 8,
    paddingBottom: 8
  },

  headerIcon: {
    alignItems: "center" as const,
    backgroundColor: "#FFF7ED",
    borderRadius: 18,
    height: 48,
    justifyContent: "center" as const,
    width: 48
  },

  title: {
    fontSize: 20,
    fontWeight: "800" as const,
    textAlign: "center" as const
  },

  demoBadge: {
    backgroundColor: "#FEF3C7",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4
  },

  demoBadgeText: {
    color: "#92400E",
    fontSize: 9,
    fontWeight: "800" as const
  },

  radarCard: {
    alignItems: "center" as const,
    gap: 12
  },

  radar: {
    alignItems: "center" as const,
    height: 270,
    justifyContent: "center" as const,
    width: "100%" as const
  },

  radarRing: {
    borderWidth: 2,
    position: "absolute" as const
  },

  radarPulse: {
    backgroundColor: "#F59E0B",
    position: "absolute" as const
  },

  radarCenter: {
    alignItems: "center" as const,
    borderColor: "#FFFFFF",
    borderRadius: 999,
    borderWidth: 4,
    height: 54,
    justifyContent: "center" as const,
    width: 54
  },

  techMarker: {
    alignItems: "center" as const,
    backgroundColor: "#176B51",
    borderColor: "#FFFFFF",
    borderRadius: 999,
    borderWidth: 3,
    height: 36,
    justifyContent: "center" as const,
    position: "absolute" as const,
    right: "21%" as const,
    top: "24%" as const,
    width: 36
  },

  radiusLabel: {
    fontSize: 18,
    fontWeight: "800" as const
  },

  status: {
    fontSize: 12,
    textAlign: "center" as const
  },

  sectionHeader: {
    alignItems: "center" as const,
    flexDirection: "row-reverse" as const,
    gap: 8,
    marginBottom: 10
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "800" as const
  },

  stepRow: {
    alignItems: "center" as const,
    flexDirection: "row-reverse" as const,
    gap: 10,
    paddingVertical: 6
  },

  stepDot: {
    alignItems: "center" as const,
    backgroundColor: "#E2E8F0",
    borderRadius: 999,
    height: 22,
    justifyContent: "center" as const,
    width: 22
  },

  stepDone: {
    backgroundColor: "#176B51"
  },

  stepActive: {
    backgroundColor: "#F59E0B"
  },

  activeDot: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    height: 7,
    width: 7
  },

  stepText: {
    flex: 1,
    fontSize: 10,
    textAlign: "right" as const
  },

  techHeader: {
    alignItems: "center" as const,
    flexDirection: "row-reverse" as const,
    gap: 8,
    marginBottom: 10
  },

  techCard: {
    alignItems: "center" as const,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    flexDirection: "row-reverse" as const,
    gap: 10,
    padding: 12
  },

  avatar: {
    alignItems: "center" as const,
    backgroundColor: "#FFF8E3",
    borderRadius: 28,
    height: 52,
    justifyContent: "center" as const,
    width: 52
  },

  techCopy: {
    flex: 1
  },

  techName: {
    fontSize: 13,
    fontWeight: "800" as const,
    textAlign: "right" as const
  },

  techSpecialty: {
    fontSize: 9,
    marginTop: 3,
    textAlign: "right" as const
  },

  techMeta: {
    flexDirection: "row-reverse" as const,
    flexWrap: "wrap" as const,
    gap: 5,
    marginTop: 8
  },

  metaPill: {
    backgroundColor: "#ECFDF5",
    borderRadius: 999,
    color: "#176B51",
    fontSize: 8,
    fontWeight: "700" as const,
    paddingHorizontal: 7,
    paddingVertical: 4
  },

  dispatchMeta: {
    fontSize: 9,
    marginTop: 8,
    textAlign: "right" as const
  },

  errorText: {
    color: "#BE123C",
    fontSize: 11,
    fontWeight: "700" as const,
    marginBottom: 10,
    textAlign: "right" as const
  }
};