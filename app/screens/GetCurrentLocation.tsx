/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MovementSdk, {
  CurrentLocation,
  GeofenceEvent,
} from '@foursquare/movement-sdk-react-native';
import MapView, {Marker} from 'react-native-maps';

interface ItemProps {
  geofenceEvent: GeofenceEvent;
}

function Item(props: ItemProps) {
  const venue = props.geofenceEvent.venue;
  if (venue) {
    const locationInformation = venue.locationInformation;
    const category = venue.categories[0];
    const icon = category?.icon;
    const uri = icon ? icon.prefix + '88' + icon.suffix : null;
    return (
      <View>
        <View style={{flexDirection: 'row'}}>
          <Image
            style={{
              width: 25,
              height: 25,
              backgroundColor: '#CCC',
              marginRight: 5,
            }}
            source={{uri: uri || undefined}}
          />
          <Text style={styles.geofenceTitle}>{props.geofenceEvent.name}</Text>
        </View>
        <Text style={styles.geofenceData}>
          {locationInformation?.address || 'Unknown Address'}
        </Text>
        <Text style={styles.geofenceData}>
          {locationInformation?.city || 'Unknown City'},{' '}
          {locationInformation?.state || 'Unknown State'}{' '}
          {locationInformation?.postalCode || 'Unknown Zip'}
        </Text>
      </View>
    );
  } else {
    return (
      <View>
        <View style={{flexDirection: 'row'}}>
          <Text style={styles.geofenceTitle}>{props.geofenceEvent.name}</Text>
        </View>
      </View>
    );
  }
}

export default () => {
  const [currentLocation, setCurrentLocation] = useState<CurrentLocation>();

  useEffect(() => {
    (async function () {
      try {
        setCurrentLocation(await MovementSdk.getCurrentLocation());
      } catch (e) {
        Alert.alert('Movement SDK', `${e}`);
      }
    })();
  });

  const confidenceString = (confidence: number) => {
    switch (confidence) {
      case 0:
        return 'None';
      case 1:
        return 'Low';
      case 2:
        return 'Medium';
      case 3:
        return 'High';
    }
  };

  const locationTypeString = (locationType: number) => {
    switch (locationType) {
      case 0:
        return 'Unknown';
      case 1:
        return 'Home';
      case 2:
        return 'Work';
      case 3:
        return 'Venue';
    }
  };

  let currentLocationMapView;
  let currentLocationDataView;

  const visit = currentLocation?.currentPlace;
  if (visit) {
    const venue = visit.venue;
    const location = visit.location;
    const matchedGeofences = currentLocation?.matchedGeofences || [];

    if (location) {
      currentLocationMapView = (
        <MapView
          style={{flex: 1}}
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}>
          <Marker coordinate={location} />
        </MapView>
      );
    }

    if (venue !== undefined) {
      const locationInformation = venue.locationInformation;
      const icon = venue.categories[0]?.icon;
      const uri = icon ? icon.prefix + '88' + icon.suffix : null;
      currentLocationDataView = (
        <View style={{flex: 1}}>
          <View style={{paddingVertical: 20}}>
            <View style={{flexDirection: 'row'}}>
              <Image
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: '#CCC',
                  marginRight: 10,
                }}
                source={{uri: uri || undefined}}
              />
              <Text style={styles.title}>{venue.name || 'Unknown Venue'}</Text>
            </View>
            <Text style={styles.venueData}>
              {locationInformation?.address || 'Unknown Address'}
            </Text>
            <Text style={styles.venueData}>
              {locationInformation?.city || ''},{' '}
              {locationInformation?.state || 'Unknown State'}{' '}
              {locationInformation?.postalCode || 'Unknown Zip'}
            </Text>
            <Text style={styles.venueData}>
              Confidence: {confidenceString(visit.confidence)}
            </Text>
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.title}>Matched Geofences:</Text>
            <FlatList
              data={matchedGeofences}
              renderItem={({item}) => <Item geofenceEvent={item} />}
              keyExtractor={item => item.id}
            />
          </View>
        </View>
      );
    } else {
      currentLocationDataView = (
        <View style={{flex: 1}}>
          <View style={{paddingVertical: 20}}>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.title}>
                {locationTypeString(visit.locationType)}
              </Text>
            </View>
            <Text style={styles.venueData}>
              Confidence: {confidenceString(visit.confidence)}
            </Text>
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.title}>Matched Geofences:</Text>
            <FlatList
              data={matchedGeofences}
              renderItem={({item}) => <Item geofenceEvent={item} />}
              keyExtractor={item => item.id}
            />
          </View>
        </View>
      );
    }
  } else {
    currentLocationMapView = <MapView style={{flex: 1}} />;
    currentLocationDataView = <View style={{flex: 1}} />;
  }

  return (
    <React.Fragment>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <View style={styles.mapSection}>{currentLocationMapView}</View>
        <View style={styles.dataSection}>{currentLocationDataView}</View>
      </SafeAreaView>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapSection: {
    flex: 1,
  },
  dataSection: {
    flex: 1,
    padding: 20,
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 25,
    lineHeight: 50,
    color: 'black',
  },
  venueData: {
    fontSize: 18,
    color: 'black',
  },
  geofenceTitle: {
    fontSize: 15,
    lineHeight: 25,
    color: 'black',
  },
  geofenceData: {
    fontSize: 15,
    color: 'black',
  },
});
