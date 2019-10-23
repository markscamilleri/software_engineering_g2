import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import MapView, { PROVIDER_GOOGLE, Marker  }  from 'react-native-maps';

export default function App() {
	
	const [location, setLocation] = useState({location: '', errorMessage: null});
	const [regeion, setRegion] = useState({latitude: 0, longitude: 0, latitudeDelta: 0.015, longitudeDelta: 0.0121});
	const [markers, setMark] = useState({latitude: 0, longitude: 0, title: '', subtitle: ''});
	
	// Similar to componentDidMount and componentDidUpdate:
	useEffect(() => {
		if (Platform.OS === 'android' && !Constants.isDevice) {
			const newLocationObj = {location: location.location, 
			errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!' };
			setLocation(newLocationObj);
		} else {
			getLocationAsync();
		}

	}, []);
	
	const getLocationAsync = async () => {
		
		try {
			let { status } = await Permissions.askAsync(Permissions.LOCATION);
			if (status === 'granted') {
				try {
					let locationdata = await Location.getCurrentPositionAsync({});
					
					let lat = JSON.parse(locationdata.coords.latitude);
					let longg = JSON.parse(locationdata.coords.longitude);
				
					const newLocationObj = {location: locationdata, errorMessage: location.errorMessage };
					setLocation(newLocationObj);
					
					const newRegionObj = {latitude: lat, longitude: longg, latitudeDelta: 0.004, longitudeDelta: 0.01};
					setRegion(newRegionObj);
					
					const newMarkerObj = {latitude: lat, longitude: longg, title: 'Your Location', subtitle: 'Hello'};
					setMark(newMarkerObj);
					
				
				} catch (error) {
					console.log('Permission to turm on phone location was denied: ' + error.message);
					const newLocationObj = {location: '', errorMessage: 'Permission to turm on phone location was denied: ' + error.message };
					setLocation(newLocationObj);
				}
			} else {
				console.log('Permission to access location was denied' + error.message);
				const newLocationObj = {location: '', errorMessage: 'Permission to access location was denied' };
				setLocation(newLocationObj);
			}
			
		} catch (error) {
			console.log('There has been a problem with location: ' + error.message);
			const newLocationObj = {location: location.location, errorMessage: 'Permission to access location was denied' };
			setLocation(newLocationObj);
		}
		
		return Promise.resolve(1);
	};
	
	let text = 'Waiting..';
	let longtude = 0;
	let lattude = 0;
    if (location.errorMessage) {
      text = location.errorMessage;
    } else if (location.location) {
      text = JSON.stringify(location.location);
    }
		
	return (
		<View style={styles.container}>
			<Text style={styles.title}>GPS Location - ASE Group 2</Text>
			<Text style={styles.paragraph} >{text}</Text>
			
			<MapView
			   provider={PROVIDER_GOOGLE} // remove if not using Google Maps
			   style={styles.map}
			   region={regeion}
			   annotations={markers}
			 >
			 <Marker
				coordinate={markers}
			/>
			</MapView>
		</View>
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
    margin: 24,
    fontSize: 18,
	textAlign: 'center',
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
});
