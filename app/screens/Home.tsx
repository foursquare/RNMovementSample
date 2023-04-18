import React, {useEffect, useState} from 'react';
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  StatusBar,
  Text,
  View,
} from 'react-native';
import MovementSdk from '@foursquare/movement-sdk-react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParamList} from '../App';
import Geolocation, {
  GeolocationResponse,
} from '@react-native-community/geolocation';

type HomeProps = StackScreenProps<RootStackParamList, 'Home'>;

export default (props: HomeProps) => {
  const [installId, setInstallId] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    requestLocationPermission();
    (async function () {
      setInstallId(await MovementSdk.getInstallId());
      setIsEnabled(await MovementSdk.isEnabled());
    })();
  });

  const requestLocationPermission = async () => {
    function alertPermissionError() {
      Alert.alert(
        'Movement SDK',
        'Location permission is required please enable in Settings',
      );
    }
    const grantedWhenInUse = await new Promise(resolve => {
      Geolocation.setRNConfiguration({
        skipPermissionRequests: false,
        authorizationLevel: 'whenInUse',
        locationProvider: 'playServices',
      });
      Geolocation.requestAuthorization(
        () => resolve(true),
        () => resolve(false),
      );
    });
    if (grantedWhenInUse) {
      const grantedAlways = await new Promise(resolve => {
        Geolocation.setRNConfiguration({
          skipPermissionRequests: false,
          authorizationLevel: 'always',
          locationProvider: 'playServices',
        });
        Geolocation.requestAuthorization(
          () => resolve(true),
          () => resolve(false),
        );
      });
      if (!grantedAlways) {
        alertPermissionError();
      }
    } else {
      alertPermissionError();
    }
  };

  const getEnabledText = () => {
    if (isEnabled) {
      return 'Yes';
    } else {
      return 'No';
    }
  };

  const fireTestVisit = async () => {
    try {
      const location: GeolocationResponse = await new Promise(
        (resolve, reject) => {
          Geolocation.getCurrentPosition(
            info => resolve(info),
            err => reject(err),
          );
        },
      );
      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;
      MovementSdk.fireTestVisit(latitude, longitude);
      Alert.alert(
        'Movement SDK',
        `Sent test visit with location: (${latitude},${longitude})`,
      );
    } catch (e) {
      Alert.alert('Movement SDK', `${e.message}`);
    }
  };

  const startMovement = async () => {
    MovementSdk.start();
    setIsEnabled(await MovementSdk.isEnabled());
  };

  const stopMovement = async () => {
    MovementSdk.stop();
    setIsEnabled(await MovementSdk.isEnabled());
  };

  return (
    <React.Fragment>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.container}>
        <Button
          title="Get Current Location"
          onPress={() => props.navigation.navigate('GetCurrentLocation')}
        />
        <View style={styles.separator} />
        <Button title="Fire Test Visit" onPress={() => fireTestVisit()} />
        <View style={styles.separator} />
        <Button title="Start" onPress={() => startMovement()} />
        <View style={styles.separator} />
        <Button title="Stop" onPress={() => stopMovement()} />
        <View style={styles.separator} />
        <Button
          title="Show Debug Screen"
          onPress={() => MovementSdk.showDebugScreen()}
        />
        <View style={styles.separator} />
        <Button
          title="User Info"
          onPress={() => props.navigation.navigate('UserInfo')}
        />
        <View style={styles.separator} />
        <Text style={styles.footer}>Install ID: {installId}</Text>
        <Text style={styles.footer}>Enabled: {getEnabledText()}</Text>
      </ScrollView>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  footer: {
    textAlign: 'center',
    padding: 10,
    fontSize: 13,
    color: 'black',
  },
  separator: {
    height: 20,
  },
});
