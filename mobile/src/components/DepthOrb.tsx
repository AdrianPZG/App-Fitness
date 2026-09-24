import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { StyleSheet, Text, View } from 'react-native';
import { useEffect } from 'react';
import { useColors } from '@/hooks/useColors';

type ParticleProps = {
  size: number;
  top: number;
  left?: number;
  right?: number;
  color: string;
  rotation: SharedValue<number>;
  offset: number;
};

function OrbParticle({ size, top, left, right, color, rotation, offset }: ParticleProps) {
  const particleStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateZ: `${rotation.value + offset}deg` },
      { translateX: size * 0.34 },
      { scale: interpolate(Math.sin((rotation.value + offset) * 0.03), [-1, 1], [0.72, 1.28]) },
    ],
  }));

  return <Animated.View style={[orbStyles.particle, { width: size, height: size, borderRadius: size / 2, top, left, right, backgroundColor: color }, particleStyle]} />;
}

export function DepthOrb({ size = 230, label = 'MOVE' }: { size?: number; label?: string }) {
  const colors = useColors();
  const rotation = useSharedValue(0);
  const counterRotation = useSharedValue(0);
  const tilt = useSharedValue(0);
  const pulse = useSharedValue(0.94);
  const shimmer = useSharedValue(-1);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 17000, easing: Easing.linear }), -1, false);
    counterRotation.value = withRepeat(withTiming(-360, { duration: 23000, easing: Easing.linear }), -1, false);
    tilt.value = withRepeat(
      withSequence(
        withTiming(7, { duration: 3200, easing: Easing.inOut(Easing.ease) }),
        withTiming(-7, { duration: 3200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
        withDelay(220, withTiming(0.94, { duration: 2400, easing: Easing.inOut(Easing.ease) })),
      ),
      -1,
      true,
    );
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2100, easing: Easing.inOut(Easing.ease) }),
        withDelay(1000, withTiming(-1, { duration: 100 })),
      ),
      -1,
      false,
    );
  }, [counterRotation, pulse, rotation, shimmer, tilt]);

  const orbitStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { rotateZ: `${rotation.value}deg` },
      { rotateX: `${tilt.value}deg` },
      { rotateY: `${tilt.value / 2}deg` },
    ],
  }));
  const reverseOrbitStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { rotateZ: `${counterRotation.value}deg` },
      { rotateX: `${-tilt.value}deg` },
      { rotateY: `${tilt.value * 0.7}deg` },
    ],
  }));
  const coreStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { scale: pulse.value },
      { rotateY: `${tilt.value * 1.4}deg` },
      { rotateX: `${-tilt.value * 0.5}deg` },
    ],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0.94, 1], [0.12, 0.25]),
    transform: [{ scale: pulse.value * 1.08 }],
  }));
  const scanStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: shimmer.value * size * 0.19 }, { rotateZ: '-22deg' }],
    opacity: interpolate(shimmer.value, [-1, 0, 1], [0.05, 0.8, 0.05]),
  }));

  const coreSize = size * 0.44;
  return (
    <View style={[orbStyles.stage, { width: size, height: size }]}>
      <Animated.View style={[orbStyles.glow, { width: size * 0.6, height: size * 0.6, borderRadius: size * 0.3, backgroundColor: colors.primary }, glowStyle]} />
      <Animated.View style={[orbStyles.latitude, { width: size * 0.86, height: size * 0.3, borderColor: colors.accent }, orbitStyle]} />
      <Animated.View style={[orbStyles.longitude, { width: size * 0.58, height: size * 0.98, borderColor: colors.primary }, reverseOrbitStyle]} />
      <Animated.View style={[orbStyles.latitude, orbStyles.latitudeInner, { width: size * 0.68, height: size * 0.22, borderColor: colors.primary }, orbitStyle]} />
      <Animated.View style={[orbStyles.coreWrap, { width: coreSize, height: coreSize }, coreStyle]}>
        <LinearGradient
          colors={[colors.primary, colors.accent, colors.backgroundAlt, colors.background]}
          start={{ x: 0.12, y: 0.08 }}
          end={{ x: 0.9, y: 0.94 }}
          style={[orbStyles.core, { width: coreSize, height: coreSize, borderRadius: coreSize / 2, borderColor: colors.accent }]}
        >
          <View style={[orbStyles.coreHighlight, { backgroundColor: colors.foreground }]} />
          <Animated.View style={[orbStyles.scan, { height: coreSize * 0.16, width: coreSize * 0.82, backgroundColor: colors.foreground }, scanStyle]} />
        </LinearGradient>
      </Animated.View>
      <Animated.View style={[orbStyles.dot, { backgroundColor: colors.primary }, orbitStyle]} />
      <OrbParticle size={5} top={size * 0.21} left={size * 0.2} color={colors.foreground} rotation={rotation} offset={35} />
      <OrbParticle size={4} top={size * 0.64} right={size * 0.13} color={colors.accent} rotation={counterRotation} offset={125} />
      <OrbParticle size={3} top={size * 0.33} right={size * 0.1} color={colors.primary} rotation={rotation} offset={220} />
      <View style={[orbStyles.caption, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[orbStyles.captionText, { color: colors.primary }]}>{label}</Text>
      </View>
    </View>
  );
}

const orbStyles = StyleSheet.create({
  stage: { alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', opacity: 0.18, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 28, shadowOffset: { width: 0, height: 10 }, elevation: 12 },
  latitude: { position: 'absolute', borderWidth: 1.4, borderRadius: 999, opacity: 0.82 },
  latitudeInner: { opacity: 0.42, borderStyle: 'dotted' },
  longitude: { position: 'absolute', borderWidth: 1.25, borderRadius: 999, opacity: 0.7 },
  coreWrap: { alignItems: 'center', justifyContent: 'center' },
  core: { alignItems: 'flex-start', justifyContent: 'flex-start', padding: 10, borderWidth: 1, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 22, shadowOffset: { width: 8, height: 14 }, elevation: 10 },
  coreHighlight: { width: '27%', height: '27%', borderRadius: 999, opacity: 0.48 },
  scan: { position: 'absolute', left: '8%', top: '42%', opacity: 0.35 },
  dot: { position: 'absolute', width: 8, height: 8, borderRadius: 4, top: '16%', right: '17%' },
  particle: { position: 'absolute', opacity: 0.88 },
  caption: { position: 'absolute', bottom: '10%', borderRadius: 14, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  captionText: { fontSize: 9, fontWeight: '800', letterSpacing: 1.8 },
});