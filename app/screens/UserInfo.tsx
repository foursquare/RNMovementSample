import MovementSdk, {
  UserInfo,
  UserInfoUserIdKey,
  UserInfoGenderKey,
  UserInfoBirthdayKey,
  UserInfoGenderMale,
} from '@foursquare/movement-sdk-react-native';
import React, {useEffect, useState} from 'react';
import {StatusBar, SafeAreaView, StyleSheet, Text} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';

export default () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    (async () => {
      MovementSdk.setUserInfo(
        {
          [UserInfoUserIdKey]: 'userId',
          [UserInfoGenderKey]: UserInfoGenderMale,
          [UserInfoBirthdayKey]: new Date(2000, 0, 1).getTime(),
          otherKey: 'otherVal',
        },
        true,
      );
      setUserInfo(await MovementSdk.userInfo());
    })();
  }, []);

  return (
    <React.Fragment>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        {userInfo && (
          <FlatList
            data={Object.entries(userInfo)}
            renderItem={({item}) => (
              <Text style={styles.item}>
                {item[0]}: {item[1]}
              </Text>
            )}
          />
        )}
        <Text style={styles.item}>Set more values in UserInfo.tsx</Text>
      </SafeAreaView>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  item: {
    padding: 10,
    textAlign: 'center',
    fontSize: 18,
  },
});
