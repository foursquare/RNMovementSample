import HomeScreen from './screens/Home';
import GetCurrentLocationScreen from './screens/GetCurrentLocation';

import 'react-native-gesture-handler';
import * as React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

export type RootStackParamList = {
  Home: undefined;
  GetCurrentLocation: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default () => {
  return (
    <SafeAreaView style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{title: 'Movement SDK React Native Sample'}}
          />
          <Stack.Screen
            name="GetCurrentLocation"
            component={GetCurrentLocationScreen}
            options={{title: 'Get Current Location'}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
