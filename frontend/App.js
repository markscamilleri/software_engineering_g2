import React, { useEffect, useState } from 'react';
import {
 StyleSheet, Text, View, Platform, SafeAreaView, ScrollView,
} from 'react-native';
import { Button, ThemeProvider } from 'react-native-elements';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { Toolbar } from 'react-native-material-ui';

const theme = {
  Button: {
    raised: true,
	titleStyle: {
		color: 'white',
	},
  },
};

export default function App() {
	const [location, setLocation] = useState({ location: '', errorMessage: null });
	const [region, setRegion] = useState({
latitude: 0, longitude: 0, latitudeDelta: 0.015, longitudeDelta: 0.0121,
});
	const [markers, setMark] = useState({
 latitude: 0, longitude: 0, title: '', subtitle: '',
});

	useEffect(() => {
		if (Platform.OS === 'android' && !Constants.isDevice) {
			const newLocationObj = {
location: location.location,
			errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
};
			setLocation(newLocationObj);
		} else {
			getLocationAsync();
		}
	}, []);

	const getLocationAsync = async () => {
		try {
			const { status } = await Permissions.askAsync(Permissions.LOCATION);
			if (status === 'granted') {
				try {
					const locationdata = await Location.getCurrentPositionAsync({});

					const lat = JSON.parse(locationdata.coords.latitude);
					const longg = JSON.parse(locationdata.coords.longitude);

					const newLocationObj = { location: locationdata, errorMessage: location.errorMessage };
					setLocation(newLocationObj);

					const newRegionObj = {
 latitude: lat, longitude: longg, latitudeDelta: 0.004, longitudeDelta: 0.01,
};
					setRegion(newRegionObj);

					const newMarkerObj = {
 latitude: lat, longitude: longg, title: 'Your Location', subtitle: 'Hello',
};
					setMark(newMarkerObj);
				} catch (error) {
					console.log(`Permission to turm on phone location was denied: ${error.message}`);
					const newLocationObj = { location: '', errorMessage: `Permission to turm on phone location was denied: ${error.message}` };
					setLocation(newLocationObj);
				}
			} else {
				console.log(`Permission to access location was denied${error.message}`);
				const newLocationObj = { location: '', errorMessage: 'Permission to access location was denied' };
				setLocation(newLocationObj);
			}
		} catch (error) {
			console.log(`There has been a problem with location: ${error.message}`);
			const newLocationObj = { location: location.location, errorMessage: 'Permission to access location was denied' };
			setLocation(newLocationObj);
		}
	};

	const refresh = async () => {
		const newLocationObj = { location: '', errorMessage: null };
		setLocation(newLocationObj);
		const newRegionObj = {
latitude: 0, longitude: 0, latitudeDelta: 0.004, longitudeDelta: 0.01,
};
		setRegion(newRegionObj);
		const newMarkerObj = {
latitude: 0, longitude: 0, title: 'Your Location', subtitle: 'Hello',
};
		setMark(newMarkerObj);
		try {
			const { status } = await Permissions.askAsync(Permissions.LOCATION);
			if (status === 'granted') {
				try {
					const locationdata = await Location.getCurrentPositionAsync({});

					const lat = JSON.parse(locationdata.coords.latitude);
					const longg = JSON.parse(locationdata.coords.longitude);

					const newLocationObj = { location: locationdata, errorMessage: location.errorMessage };
					setLocation(newLocationObj);

					const newRegionObj = {
 latitude: lat, longitude: longg, latitudeDelta: 0.004, longitudeDelta: 0.01,
};
					setRegion(newRegionObj);

					const newMarkerObj = {
latitude: lat, longitude: longg, title: 'Your Location', subtitle: 'Hello',
};
					setMark(newMarkerObj);
				} catch (error) {
					console.log(`Permission to turm on phone location was denied: ${error.message}`);
					const newLocationObj = { location: '', errorMessage: `Permission to turm on phone location was denied: ${error.message}` };
					setLocation(newLocationObj);
				}
			} else {
				console.log(`Permission to access location was denied${error.message}`);
				const newLocationObj = { location: '', errorMessage: 'Permission to access location was denied' };
				setLocation(newLocationObj);
			}
		} catch (error) {
			console.log(`There has been a problem with location: ${error.message}`);
			const newLocationObj = { location: location.location, errorMessage: 'Permission to access location was denied' };
			setLocation(newLocationObj);
		}
	};

	let text = 'Waiting..';
	const longtude = 0;
	const lattude = 0;
    if (location.errorMessage) {
      text = location.errorMessage;
    } else if (location.location) {
      text = JSON.stringify(location.location);
    }

	return (
  <>
    <SafeAreaView style={styles.container}>
      <ScrollView className="" style={styles.scrollView}>
        <View style={styles.nav}>
          <Toolbar
            theme={theme}
            leftElement="menu"
            centerElement="GPS Location"
            searchable={{
							  autoFocus: true,
							  placeholder: 'Search',
							}}
            rightElement={{
								menu: {
									icon: "more-vert",
									labels: ["item 1", "item 2"],
								},
							}}
            onRightElementPress={(label) => { console.log(label); }}
          />
        </View>
        <Text style={styles.title}>GPS Location - ASE Group 2</Text>
        <Text style={styles.paragraph}>{text}</Text>
        <View style={styles.mapbox}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={region}
          >
            <Marker
              coordinate={markers}
            />
          </MapView>
        </View>
        <View style={styles.button}>
          <ThemeProvider theme={theme}>
            <Button
              title="Refresh Position"
              onPress={refresh}
            />
          </ThemeProvider>
        </View>
      </ScrollView>
    </SafeAreaView>
  </>
	);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: Constants.statusBarHeight + 20,
    fontSize: 18,
	textAlign: 'center',
  },
  nav: {
    marginTop: Constants.statusBarHeight,
  },
  paragraph: {
    margin: 24,
    fontSize: 14,
	textAlign: 'center',
  },
  map: {
   height: 200,
   width: 360,
  },
  button: {
   margin: 10,
  },
});
