import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MovementSdk, {
  UserInfo,
  UserInfoUserIdKey,
  UserInfoGenderKey,
  UserInfoBirthdayKey,
  UserInfoGenderMale,
} from '@foursquare/movement-sdk-react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function UserInfoScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        MovementSdk.setUserInfo(
          {
            [UserInfoUserIdKey]: 'userId',
            [UserInfoGenderKey]: UserInfoGenderMale,
            [UserInfoBirthdayKey]: new Date(2000, 0, 1).getTime(),
            source: 'sampleApp',
          },
          true,
        );
        setUserInfo(await MovementSdk.userInfo());
      } catch {
        /* SDK not ready */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const entries = userInfo ? Object.entries(userInfo) : [];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      )}

      {!loading && entries.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {entries.map(([key, value], idx) => (
            <View key={key}>
              {idx > 0 && (
                <View style={[styles.separator, { backgroundColor: colors.border }]} />
              )}
              <View style={styles.row}>
                <Text style={[styles.key, { color: colors.textSecondary }]}>{key}</Text>
                <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>
                  {String(value)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {!loading && entries.length === 0 && (
        <View style={styles.centered}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No user info available
          </Text>
        </View>
      )}

      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        Edit user-info.tsx to set different values
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  separator: { height: 1, marginLeft: 20 },
  key: { fontSize: 14, fontWeight: '500', flex: 1 },
  value: { fontSize: 14, fontWeight: '600', textAlign: 'right', flex: 1 },
  emptyText: { fontSize: 15 },
  hint: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 24,
    fontStyle: 'italic',
  },
});
