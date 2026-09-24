import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

type IconName = keyof typeof Feather.glyphMap;

export function Icon({ name, size = 20, color, strokeWidth = 1.6 }: { name: IconName; size?: number; color?: string; strokeWidth?: number }) {
  const colors = useColors();
  return <Feather name={name} size={size} color={color ?? colors.foreground} style={{ opacity: strokeWidth / 1.6 }} />;
}

export function Screen({ children, scroll = true }: { children: React.ReactNode; scroll?: boolean }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const content = (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 92 }]}>
      <LinearGradient colors={[colors.background, colors.backgroundAlt, colors.background]} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={[colors.glow, 'transparent']} style={[styles.ambientGlow, styles.ambientGlowTop, { opacity: 0.16 }]} />
      <LinearGradient colors={[colors.accent, 'transparent']} style={[styles.ambientGlow, styles.ambientGlowBottom, { opacity: 0.1 }]} />
      {children}
    </View>
  );
  return scroll ? (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {content}
    </ScrollView>
  ) : (
    content
  );
}

export function TopBar({ eyebrow, title, action, onAction }: { eyebrow?: string; title: string; action?: IconName; onAction?: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.topBar}>
      <View>
        {eyebrow ? <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow.toUpperCase()}</Text> : null}
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>{title}</Text>
      </View>
      {action && onAction ? (
        <Pressable onPress={onAction} style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.card, opacity: pressed ? 0.65 : 1 }]}>
          <Icon name={action} size={19} color={colors.foreground} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.sectionTitle}>
      <Text style={[styles.sectionHeading, { color: colors.foreground }]}>{title}</Text>
      {action && onAction ? <Pressable onPress={onAction}><Text style={[styles.sectionAction, { color: colors.primary }]}>{action}</Text></Pressable> : null}
    </View>
  );
}

export function ProgressRing({ progress, label, value, detail, size = 142 }: { progress: number; label: string; value: string; detail: string; size?: number }) {
  const colors = useColors();
  return (
    <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2, borderColor: colors.muted, borderTopColor: colors.primary, borderRightColor: progress > 0.5 ? colors.primary : colors.muted, transform: [{ rotate: '-35deg' }] }]}>
      <View style={{ transform: [{ rotate: '35deg' }], alignItems: 'center' }}>
        <Text style={[styles.ringLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.ringValue, { color: colors.foreground }]}>{value}</Text>
        <Text style={[styles.ringDetail, { color: colors.mutedForeground }]}>{detail}</Text>
      </View>
    </View>
  );
}

export function StatPill({ icon, label, value, tone = 'primary' }: { icon: IconName; label: string; value: string; tone?: 'primary' | 'amber' | 'muted' }) {
  const colors = useColors();
  const color = tone === 'amber' ? colors.accent : tone === 'muted' ? colors.mutedForeground : colors.primary;
  return (
    <View style={[styles.statPill, { backgroundColor: colors.card }]}>
      <Icon name={icon} size={17} color={color} />
      <View>
        <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
      </View>
    </View>
  );
}

export function ActionButton({ label, icon, onPress, secondary = false, disabled = false }: { label: string; icon?: IconName; onPress: () => void; secondary?: boolean; disabled?: boolean }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.actionButton, { backgroundColor: secondary ? colors.secondary : colors.primary, opacity: disabled ? 0.42 : pressed ? 0.78 : 1 }]}>
      {icon ? <Icon name={icon} size={17} color={secondary ? colors.foreground : colors.primaryForeground} /> : null}
      <Text style={[styles.actionButtonText, { color: secondary ? colors.foreground : colors.primaryForeground }]}>{label}</Text>
    </Pressable>
  );
}

export function LockBadge() {
  const colors = useColors();
  return <View style={[styles.lockBadge, { backgroundColor: colors.secondary }]}><Icon name="lock" size={13} color={colors.mutedForeground} /></View>;
}

export function ImageCard({ image, title, subtitle, locked = false, onPress }: { image: ImageSourcePropType; title: string; subtitle: string; locked?: boolean; onPress?: () => void }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.imageCard, { backgroundColor: colors.card, opacity: pressed ? 0.82 : 1 }]}>
      <Image source={image} style={styles.cardImage} />
      <View style={styles.imageCardCopy}>
        <Text style={[styles.cardEyebrow, { color: colors.primary }]}>{subtitle}</Text>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>{title}</Text>
      </View>
      {locked ? <View style={styles.cardLock}><LockBadge /></View> : null}
    </Pressable>
  );
}

export function Divider() {
  const colors = useColors();
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

export const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20 },
  scrollContent: { flexGrow: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.3, marginBottom: 7 },
  pageTitle: { fontSize: 30, fontWeight: '700', letterSpacing: -0.8 },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 13, marginTop: 24 },
  sectionHeading: { fontSize: 18, fontWeight: '600', letterSpacing: -0.3 },
  sectionAction: { fontSize: 13, fontWeight: '600' },
  ring: { borderWidth: 10, alignItems: 'center', justifyContent: 'center' },
  ringLabel: { fontSize: 11, marginBottom: 4 },
  ringValue: { fontSize: 26, fontWeight: '700', letterSpacing: -0.8 },
  ringDetail: { fontSize: 11, marginTop: 3 },
  statPill: { flex: 1, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  statValue: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  statLabel: { fontSize: 11 },
  actionButton: { minHeight: 48, borderRadius: 13, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionButtonText: { fontSize: 14, fontWeight: '700', letterSpacing: 0.1 },
  lockBadge: { width: 27, height: 27, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  imageCard: { borderRadius: 16, overflow: 'hidden', minHeight: 184, position: 'relative' },
  cardImage: { width: '100%', height: 184, position: 'absolute' },
  imageCardCopy: { marginTop: 112, padding: 15, backgroundColor: 'rgba(19, 21, 18, 0.82)' },
  cardEyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.1, textTransform: 'uppercase', marginBottom: 5 },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  cardLock: { position: 'absolute', right: 12, top: 12 },
  divider: { height: 1, marginVertical: 12 },
  heroPanel: { borderRadius: 18, padding: 18, minHeight: 192, flexDirection: 'row', overflow: 'hidden' },
  heroTitle: { fontSize: 25, lineHeight: 29, fontWeight: '700', letterSpacing: -0.7, maxWidth: 190 },
  bodyCopy: { fontSize: 13, lineHeight: 19 },
  heroOrb: { width: 104, height: 104, borderRadius: 52, alignItems: 'center', justifyContent: 'center', marginTop: 18 },
  heroOrbInner: { position: 'absolute', width: 96, height: 96, borderRadius: 48, borderWidth: 2, borderLeftColor: 'transparent', transform: [{ rotate: '34deg' }] },
  heroOrbText: { fontSize: 30, fontWeight: '700', letterSpacing: -1 },
  heroOrbLabel: { fontSize: 11, marginTop: 2 },
  miniNotice: { borderRadius: 14, borderWidth: 1, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 12 },
  noticeIcon: { width: 27, height: 27, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  noticeTitle: { fontSize: 13, fontWeight: '700', marginBottom: 3 },
  noticeBody: { fontSize: 11, lineHeight: 16 },
  filterChip: { height: 35, paddingHorizontal: 15, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  exerciseRow: { borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  exerciseCheck: { width: 23, height: 23, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  exerciseName: { fontSize: 13, fontWeight: '600', marginBottom: 3 },
  exerciseDetail: { fontSize: 11, lineHeight: 16 },
  libraryRow: { borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11 },
  libraryIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  lockedBanner: { borderRadius: 14, borderWidth: 1, marginTop: 18, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  caloriePanel: { borderRadius: 17, padding: 18 },
  calorieValue: { fontSize: 30, fontWeight: '700', letterSpacing: -0.8, marginVertical: 4 },
  calorieUnit: { fontSize: 14, fontWeight: '500' },
  calorieBar: { height: 7, borderRadius: 4, overflow: 'hidden', marginTop: 19 },
  calorieFill: { height: '100%', borderRadius: 4 },
  macroCard: { flex: 1, borderRadius: 14, padding: 13 },
  macroValue: { fontSize: 17, fontWeight: '700', marginBottom: 3 },
  macroLabel: { fontSize: 11 },
  macroTrack: { height: 4, borderRadius: 2, overflow: 'hidden', marginTop: 11 },
  macroFill: { height: '100%', borderRadius: 2 },
  macroTarget: { fontSize: 9, marginTop: 5 },
  nutritionMetricRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  mealRow: { borderRadius: 14, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 11 },
  mealImage: { width: 62, height: 62, borderRadius: 11 },
  mealType: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
  mealName: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  mealMeta: { fontSize: 11 },
  legalNote: { borderWidth: 1, borderRadius: 13, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 18, marginBottom: 14 },
  legalText: { fontSize: 11, lineHeight: 16 },
  watchHero: { borderRadius: 18, padding: 19, alignItems: 'flex-start' },
  watchIcon: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  watchTitle: { fontSize: 23, fontWeight: '700', lineHeight: 28, letterSpacing: -0.5, marginBottom: 8 },
  deviceRow: { borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11 },
  deviceStatus: { fontSize: 10, fontWeight: '700' },
  connectedMetricRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  syncCard: { borderRadius: 14, borderWidth: 1, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18, marginBottom: 14 },
  profileHero: { borderRadius: 17, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 17, fontWeight: '700' },
  profileName: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  subscriptionCard: { borderRadius: 17, padding: 17, flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  subscriptionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  subscriptionBody: { fontSize: 11, opacity: 0.85 },
  settingsGroup: { borderRadius: 15, paddingHorizontal: 13 },
  settingRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 11 },
  signOut: { textAlign: 'center', fontSize: 13, fontWeight: '700', paddingVertical: 9 },
  loginMark: { width: 58, height: 58, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginBottom: 23 },
  loginTitle: { fontSize: 32, fontWeight: '700', letterSpacing: -1, marginBottom: 8 },
  input: { height: 52, borderWidth: 1, borderRadius: 13, paddingHorizontal: 15, fontSize: 14 },
  smallInput: { flex: 1, minWidth: 0 },
  formLabel: { fontSize: 13, fontWeight: '700', marginTop: 4 },
  formHint: { fontSize: 10, marginTop: -8 },
  choiceChip: { borderRadius: 18, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9 },
  loginDivider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 22 },
  loginLine: { height: 1, flex: 1 },
  featureList: { borderRadius: 15, padding: 14, gap: 15, marginVertical: 22 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureCheck: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  detailTitle: { fontSize: 21, fontWeight: '700', letterSpacing: -0.5 },
  workoutHero: { height: 252, borderRadius: 22, overflow: 'hidden', position: 'relative', marginBottom: 12 },
  workoutHeroImage: { width: '100%', height: '100%', position: 'absolute' },
  workoutHeroGradient: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  workoutHeroCopy: { flex: 1, padding: 17, justifyContent: 'flex-end' },
  workoutTag: { alignSelf: 'flex-start', backgroundColor: 'rgba(240, 120, 50, 0.92)', borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5, marginBottom: 9 },
  workoutTagText: { fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  workoutHeroTitle: { fontSize: 27, lineHeight: 30, fontWeight: '700', letterSpacing: -0.8, maxWidth: 290 },
  workoutHeroDescription: { fontSize: 12, lineHeight: 17, opacity: 0.78, marginTop: 7, maxWidth: 285 },
  workoutMetricStrip: { flexDirection: 'row', gap: 8 },
  workoutProgressCard: { borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 12 },
  workoutSectionTitle: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  muscleChip: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 7 },
  muscleDot: { width: 6, height: 6, borderRadius: 3 },
  muscleChipText: { fontSize: 11, fontWeight: '600' },
  workoutListHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 24, marginBottom: 10 },
  workoutExerciseRow: { borderRadius: 15, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11 },
  exerciseNumber: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  exerciseNumberText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  exerciseTarget: { fontSize: 10, fontWeight: '600', marginTop: 4 },
  recipeImage: { width: '100%', height: 230, borderRadius: 18 },
  recipeTitle: { fontSize: 29, lineHeight: 32, fontWeight: '700', letterSpacing: -0.8, marginVertical: 7 },
  recipeStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 22, paddingVertical: 15, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#353932' },
  recipeStat: { fontSize: 11, lineHeight: 20 },
  ingredient: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 10 },
  weekCard: { borderRadius: 16, padding: 15, marginTop: 12 },
  weekCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  weekTitle: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  weekBars: { height: 96, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 14 },
  weekBarColumn: { alignItems: 'center', gap: 6, flex: 1 },
  weekBarTrack: { height: 72, width: 8, borderRadius: 5, justifyContent: 'flex-end', overflow: 'hidden' },
  weekBar: { width: '100%', borderRadius: 5 },
  weekDay: { fontSize: 10, fontWeight: '600' },
  recoveryCard: { flex: 1, minHeight: 105, borderRadius: 15, padding: 14 },
  recoveryValue: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5, marginVertical: 6 },
  restCard: { borderRadius: 14, borderWidth: 1, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  hydrationCard: { borderRadius: 15, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  hydrationIcon: { width: 35, height: 35, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  hydrationTrack: { height: 5, borderRadius: 3, marginTop: 8, overflow: 'hidden' },
  hydrationFill: { height: '100%', borderRadius: 3 },
  focusCard: { borderRadius: 15, padding: 15, marginTop: 17 },
  focusTitle: { fontSize: 17, fontWeight: '700', lineHeight: 22, marginVertical: 6 },
  recoveryScore: { borderRadius: 15, borderWidth: 1, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 6 },
  scoreCircle: { width: 66, height: 66, borderRadius: 33, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  scoreValue: { fontSize: 22, fontWeight: '700' },
  scoreLabel: { fontSize: 9, marginTop: -1 },
  bentoHero: { height: 238, borderRadius: 24, overflow: 'hidden', position: 'relative', marginBottom: 12 },
  bentoHeroImage: { width: '100%', height: '100%', position: 'absolute' },
  bentoHeroGradient: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  bentoHeroContent: { flex: 1, padding: 17, justifyContent: 'space-between' },
  bentoTopline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bentoLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  bentoHeroTitle: { fontSize: 28, lineHeight: 30, fontWeight: '700', letterSpacing: -0.8, maxWidth: 220 },
  bentoHeroMeta: { fontSize: 11, marginTop: 5 },
  bentoTimeRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 12 },
  bentoTime: { fontSize: 60, lineHeight: 60, fontWeight: '300', letterSpacing: -3 },
  bentoTimeUnit: { fontSize: 11, fontWeight: '700', marginBottom: 10, letterSpacing: 1 },
  bentoMetricRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 7 },
  bentoMetric: { fontSize: 11 },
  bentoGrid: { flexDirection: 'row', gap: 10 },
  activityCard: { flex: 1.1, minHeight: 192, borderRadius: 22, padding: 15 },
  timerCard: { flex: 0.9, minHeight: 192, borderRadius: 22, padding: 13, overflow: 'hidden' },
  bentoCardTitle: { fontSize: 22, lineHeight: 24, fontWeight: '600', letterSpacing: -0.7, marginTop: 4 },
  bentoCardMeta: { fontSize: 10, marginTop: 4 },
  calendarRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  calendarDay: { width: 22, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center', gap: 2 },
  calendarNumber: { fontSize: 10, fontWeight: '700' },
  calendarLetter: { fontSize: 8 },
  bentoRule: { height: 1, marginVertical: 13 },
  bentoStatRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bentoStatValue: { fontSize: 12, fontWeight: '700' },
  bentoStatLabel: { fontSize: 10 },
  timerPlus: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  timerCircle: { width: 108, height: 108, borderRadius: 54, borderWidth: 2, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 12 },
  timerInnerCircle: { position: 'absolute', width: 92, height: 92, borderRadius: 46, borderWidth: 1, borderTopColor: 'transparent', borderLeftColor: 'transparent', transform: [{ rotate: '-25deg' }] },
  timerValue: { fontSize: 20, fontWeight: '500', letterSpacing: -0.7 },
  timerCaption: { fontSize: 9, marginTop: 3 },
  sessionList: { borderRadius: 22, overflow: 'hidden' },
  sessionRow: { minHeight: 66, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 11 },
  sessionIndex: { width: 31, height: 31, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  sessionIndexText: { fontSize: 11, fontWeight: '700' },
  sessionName: { fontSize: 13, fontWeight: '700', marginBottom: 3 },
  sessionMeta: { fontSize: 10 },
  sessionValue: { fontSize: 25, fontWeight: '300', letterSpacing: -1 },
  sessionUnit: { fontSize: 9, marginLeft: 2 },
  ambientGlow: { position: 'absolute', width: 300, height: 300, borderRadius: 150 },
  ambientGlowTop: { top: -225, right: -110, transform: [{ rotate: '24deg' }] },
  ambientGlowBottom: { bottom: -240, left: -130, transform: [{ rotate: '-22deg' }] },
  entryScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 22 },
  entryTitle: { fontSize: 27, lineHeight: 32, fontWeight: '700', letterSpacing: -0.7, marginTop: 22, marginBottom: 6 },
  entryLoading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 42 },
  entryLoadingDot: { width: 7, height: 7, borderRadius: 4 },
  appearanceCard: { borderRadius: 15, padding: 13, gap: 13 },
  themeOptions: { flexDirection: 'row', gap: 7 },
  themeOption: { flex: 1, minHeight: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center', gap: 3 },
  programHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 23, marginBottom: 12 },
  programTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5, marginTop: 3 },
  programCount: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  programCard: { width: 184, minHeight: 144, borderRadius: 17, borderWidth: 1, padding: 14, overflow: 'hidden' },
  programMarker: { width: 27, height: 4, borderRadius: 2, marginBottom: 15 },
  programTone: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 7 },
  programName: { fontSize: 18, fontWeight: '700', letterSpacing: -0.4, marginBottom: 5 },
  programDetail: { fontSize: 11 },
  programProgress: { height: 4, borderRadius: 2, overflow: 'hidden', backgroundColor: 'rgba(120, 107, 99, 0.25)', marginTop: 16 },
  programProgressFill: { height: '100%', borderRadius: 2 },
});