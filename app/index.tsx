import React, { useEffect, useState, useCallback } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MovementSdk from '@foursquare/movement-sdk-react-native';
import * as Location from 'expo-location';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

let sdkPackage: { version: string; nativeSdkVersions?: { ios: string; android: string } };
try {
  sdkPackage = require('@foursquare/movement-sdk-react-native/package.json');
} catch {
  sdkPackage = { version: '?' };
}

const ACTIONS = [
  { icon: 'location', label: 'Current\nLocation', color: '#3B82F6', route: '/location' },
  { icon: 'flame', label: 'Fire Test\nVisit', color: '#F59E0B', action: 'testVisit' },
  { icon: 'play-circle', label: 'Start\nTracking', color: '#22C55E', action: 'start' },
  { icon: 'stop-circle', label: 'Stop\nTracking', color: '#EF4444', action: 'stop' },
  { icon: 'bug', label: 'Debug\nScreen', color: '#8B5CF6', action: 'debug' },
  { icon: 'person-circle', label: 'User\nInfo', color: '#06B6D4', route: '/user-info' },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const [installId, setInstallId] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    requestPermissions();
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshStatus();
    }, [])
  );

  const refreshStatus = async () => {
    try {
      const [id, enabled] = await Promise.all([
        MovementSdk.getInstallId(),
        MovementSdk.isEnabled(),
      ]);
      setInstallId(id);
      setIsEnabled(enabled);
    } catch {
      /* SDK not initialized yet */
    }
  };

  const requestPermissions = async () => {
    const { status: fg } = await Location.requestForegroundPermissionsAsync();
    if (fg !== 'granted') {
      Alert.alert('Permission Required', 'Location permission is needed. Please enable in Settings.');
      return;
    }
    const { status: bg } = await Location.requestBackgroundPermissionsAsync();
    if (bg !== 'granted') {
      Alert.alert('Background Location', 'Background location is recommended for full visit tracking.');
    }
  };

  const fireTestVisit = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      MovementSdk.fireTestVisit(latitude, longitude);
      Alert.alert('Test Visit Fired', `Location: (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to get location');
    }
  };

  const handleAction = async (action: string) => {
    switch (action) {
      case 'testVisit':
        return fireTestVisit();
      case 'start':
        MovementSdk.start();
        setIsEnabled(await MovementSdk.isEnabled());
        break;
      case 'stop':
        MovementSdk.stop();
        setIsEnabled(await MovementSdk.isEnabled());
        break;
      case 'debug':
        MovementSdk.showDebugScreen();
        break;
    }
  };

  const handlePress = (item: (typeof ACTIONS)[number]) => {
    if ('route' in item && item.route) {
      router.push(item.route as any);
    } else if ('action' in item && item.action) {
      handleAction(item.action);
    }
  };

  const rows = [ACTIONS.slice(0, 2), ACTIONS.slice(2, 4), ACTIONS.slice(4, 6)];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
        <View style={styles.statusRow}>
          <Pressable
            style={styles.statusItem}
            onPress={() => {
              if (installId) {
                Clipboard.setStringAsync(installId);
                Alert.alert('Copied', 'Install ID copied to clipboard');
              }
            }}
          >
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
              INSTALL ID
            </Text>
            <Text style={[styles.statusValue, { color: colors.text }]} numberOfLines={1}>
              {installId ?? '...'}
            </Text>
          </Pressable>
          <View style={[styles.statusDivider, { backgroundColor: colors.border }]} />
          <View style={[styles.statusItem, styles.statusItemRight]}>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
              TRACKING
            </Text>
            <View style={styles.badge}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: isEnabled ? colors.success : colors.danger },
                ]}
              />
              <Text style={[styles.statusValue, { color: colors.text }]}>
                {isEnabled ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.gridRow}>
          {row.map((item, idx) => (
            <Pressable
              key={idx}
              style={({ pressed }) => [
                styles.actionCard,
                { backgroundColor: colors.surface, opacity: pressed ? 0.75 : 1 },
              ]}
              onPress={() => handlePress(item)}
            >
              <View style={[styles.iconWrap, { backgroundColor: item.color + '14' }]}>
                <Ionicons name={item.icon as any} size={28} color={item.color} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.text }]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      ))}

      <Text style={[styles.versionText, { color: colors.textSecondary }]}>
        Plugin {sdkPackage.version}
        {sdkPackage.nativeSdkVersions
          ? ` · iOS SDK ${sdkPackage.nativeSdkVersions.ios} · Android SDK ${sdkPackage.nativeSdkVersions.android}`
          : ''}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  statusCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusItem: { flex: 1 },
  statusItemRight: { alignItems: 'flex-end' },
  statusDivider: { width: 1, height: 36, marginHorizontal: 16 },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  statusValue: { fontSize: 14, fontWeight: '600' },
  badge: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  gridRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  actionLabel: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  versionText: { fontSize: 11, textAlign: 'center', marginTop: 12 },
});
