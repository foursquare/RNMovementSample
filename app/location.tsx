import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MovementSdk, {
  CurrentLocation,
  GeofenceEvent,
} from '@foursquare/movement-sdk-react-native';
import MapView, { Marker } from 'react-native-maps';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const CONFIDENCE = ['None', 'Low', 'Medium', 'High'] as const;
const LOCATION_TYPE = ['Unknown', 'Home', 'Work', 'Venue'] as const;

const CONFIDENCE_COLORS: Record<string, string> = {
  None: '#94A3B8',
  Low: '#F59E0B',
  Medium: '#3B82F6',
  High: '#22C55E',
};

function GeofenceItem({ geofenceEvent }: { geofenceEvent: GeofenceEvent }) {
  const venue = geofenceEvent.venue;
  const info = venue?.locationInformation;
  const icon = venue?.categories?.[0]?.icon;
  const uri = icon ? `${icon.prefix}88${icon.suffix}` : null;

  return (
    <View style={geoStyles.row}>
      {uri && <Image style={geoStyles.icon} source={{ uri }} />}
      <View style={geoStyles.info}>
        <Text style={geoStyles.name}>{geofenceEvent.name}</Text>
        {info && (
          <Text style={geoStyles.address}>
            {info.address ?? 'Unknown Address'}
          </Text>
        )}
      </View>
    </View>
  );
}

const geoStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    marginRight: 12,
  },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  address: { fontSize: 12, color: '#64748B', marginTop: 2 },
});

export default function LocationScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const [data, setData] = useState<CurrentLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const result = await MovementSdk.getCurrentLocation();
        setData(result);
      } catch (e: any) {
        setError(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const visit = data?.currentPlace;
  const venue = visit?.venue;
  const location = visit?.location;
  const geofences = data?.matchedGeofences ?? [];
  const venueInfo = venue?.locationInformation;
  const icon = venue?.categories?.[0]?.icon;
  const iconUri = icon ? `${icon.prefix}88${icon.suffix}` : null;
  const confidence = visit ? CONFIDENCE[visit.confidence] ?? 'Unknown' : null;
  const locationType = visit ? LOCATION_TYPE[visit.locationType] ?? 'Unknown' : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.mapContainer}>
        <MapView
          style={StyleSheet.absoluteFill}
          region={
            location
              ? {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.008,
                  longitudeDelta: 0.008,
                }
              : undefined
          }
        >
          {location && <Marker coordinate={location} />}
        </MapView>
      </View>

      <View style={[styles.panel, { backgroundColor: colors.surface }]}>
        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.tint} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Fetching location...
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.centered}>
            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
          </View>
        )}

        {!loading && !error && visit && (
          <FlatList
            data={geofences}
            keyExtractor={(item, idx) => (item.geofenceId ?? '') + idx}
            contentContainerStyle={styles.panelContent}
            ListHeaderComponent={
              <>
                <View style={styles.venueHeader}>
                  {iconUri && (
                    <Image style={styles.venueIcon} source={{ uri: iconUri }} />
                  )}
                  <View style={styles.venueHeaderText}>
                    <Text style={[styles.venueName, { color: colors.text }]}>
                      {venue?.name ?? locationType}
                    </Text>
                    {venueInfo && (
                      <Text style={[styles.venueAddress, { color: colors.textSecondary }]}>
                        {venueInfo.address ?? ''}
                        {venueInfo.city ? `, ${venueInfo.city}` : ''}
                        {venueInfo.state ? `, ${venueInfo.state}` : ''}
                        {venueInfo.postalCode ? ` ${venueInfo.postalCode}` : ''}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.badges}>
                  {confidence && (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: (CONFIDENCE_COLORS[confidence] ?? '#94A3B8') + '18' },
                      ]}
                    >
                      <View
                        style={[
                          styles.badgeDot,
                          { backgroundColor: CONFIDENCE_COLORS[confidence] ?? '#94A3B8' },
                        ]}
                      />
                      <Text
                        style={[
                          styles.badgeText,
                          { color: CONFIDENCE_COLORS[confidence] ?? '#94A3B8' },
                        ]}
                      >
                        {confidence} confidence
                      </Text>
                    </View>
                  )}
                  {locationType && locationType !== 'Unknown' && (
                    <View style={[styles.badge, { backgroundColor: colors.tint + '18' }]}>
                      <Text style={[styles.badgeText, { color: colors.tint }]}>
                        {locationType}
                      </Text>
                    </View>
                  )}
                </View>

                {geofences.length > 0 && (
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Matched Geofences
                  </Text>
                )}
              </>
            }
            renderItem={({ item }) => <GeofenceItem geofenceEvent={item} />}
            ItemSeparatorComponent={() => (
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
            )}
          />
        )}

        {!loading && !error && !visit && (
          <View style={styles.centered}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              No location data available
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: { height: '45%' },
  panel: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  panelContent: { padding: 24 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { fontSize: 14, marginTop: 12 },
  errorText: { fontSize: 14, textAlign: 'center' },
  venueHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  venueIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    marginRight: 14,
  },
  venueHeaderText: { flex: 1 },
  venueName: { fontSize: 20, fontWeight: '700' },
  venueAddress: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  badges: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  separator: { height: 1 },
});
