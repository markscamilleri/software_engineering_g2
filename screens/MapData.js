import React, {useEffect, useState} from 'react';
import { View, ScrollView, Text, TextInput, StyleSheet, Platform, Dimensions } from 'react-native';
import { Button, ThemeProvider } from 'react-native-elements';
import { Toolbar, ThemeContext as TP, getTheme } from 'react-native-material-ui';
import Constants from 'expo-constants';
import MapView, { PROVIDER_GOOGLE, Marker, Circle}  from 'react-native-maps';

const systemFonts = (Platform.OS === 'android' ? 'Roboto' : 'Arial');

const MapData = ({navigation}) => {
	let WeightedLatLng = [{
		latitude: 0,
		longitude: 0,
		weight: 10,
	  },
	  {
		latitude: 0.144282,
		longitude: 0.782743,
		weight: 5,
	  },
	]
	const [value, setValue] = useState(' ');
	const [jsonData, setJsonData] = useState(0);
	
	const [region, setRegion] = useState({latitude: 0, longitude: 0, latitudeDelta: 0.015, longitudeDelta: 0.0121});
	const [markers, setMark] = useState([{
			title: 'Hey',
			latlng: {
			  latitude: 0,
			  longitude: 0
			},
		  },
		  {
			title: 'Hey2',
			latlng: {
			  latitude: 0.144282,
			  longitude: 0.782743
			},  
		}]);
	const [markers2, setMark2] = useState({latitude: 0.782743, longitude: 0.144282});
	
	var {height, width} = Dimensions.get('window');
	const apikey = Platform.OS === 'android' ? Constants.manifest.android.config.googleMaps.apiKey : Constants.manifest.ios.config.googleMapsApiKey;
	async function getLongLat() {
		const response = await fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + value + '&key=' + apikey);
		const myJson = await response.json();
		setJsonData(JSON.stringify(myJson));
		
		var lon = parseFloat(JSON.stringify(myJson.results[0].geometry.location.lng));
	    var lat = parseFloat(JSON.stringify(myJson.results[0].geometry.location.lat));
		var swlon = parseFloat(JSON.stringify(myJson.results[0].geometry.viewport.southwest.lng));
	    var swlat = parseFloat(JSON.stringify(myJson.results[0].geometry.viewport.southwest.lat));
		var nelon = parseFloat(JSON.stringify(myJson.results[0].geometry.viewport.northeast.lng));
	    var nelat = parseFloat(JSON.stringify(myJson.results[0].geometry.viewport.northeast.lat));
		
		const marking = [{
			title: 'Heyy',
			latlng: {
			  latitude: lat,
			  longitude: lon
			}
		  },
		  {
			title: 'Heyy2',
			latlng: {
			  latitude: swlat,
			  longitude: swlon
			}  
		  },
		  {
			title: 'Heyy3',
			latlng: {
			  latitude: nelat,
			  longitude: nelon
			}  
		  },
		  
		]
		
		setRegion({latitude: lat, longitude: lon, latitudeDelta: 0.015, longitudeDelta: 0.0121});
		//setMark({latitude: lat, longitude: lon, title: '', subtitle: ''});
		setMark(marking);
		console.log(JSON.stringify(myJson)); 
	}
	
	return (
      <ScrollView style={styles.nav}>
		<TP.Provider value={getTheme(uiTheme)}>
			<Toolbar
				centerElement="ASE Project Group 2 | Map"
			/>
		</TP.Provider>
        <Text>Settings</Text>
		<Text>{jsonData}</Text>
		<View style={styles.button}>
		<TextInput 
			style={{height: 40, borderWidth: 1, marginBottom: 10, borderRadius: 5}}
			onChangeText={text => setValue(text)}
			defaultValue={value}
		/>
			<ThemeProvider theme={buttontheme}>
				<Button
				  title="Get LongLat"
				  onPress={()=>{{getLongLat()}}}
				/>
			</ThemeProvider>
		</View>
		<MapView
				provider={PROVIDER_GOOGLE}
				style={{height: height*0.6, width: width}}
				region={region}
			 >
				 {markers.map(marker => (
					<>
					<Marker
					   key={marker.title}
					  coordinate={marker.latlng}
					  title={marker.title}
					  description="This is a house"
					  image={marker.title === 'Heyy' ? require('../assets/images/home3.png') : require('../assets/images/home2.png')}
					  onPress={()=>{{navigation.navigate('Feed')}}}
					>
					</Marker>
				  </>
				  ))}
			</MapView>
      </ScrollView>
    );
}

export default MapData;

const uiTheme = {
    palette: {
        primaryColor: '#002366',
    },
    toolbar: {
        container: {
            height: 60,
        },
    },
	fontFamily: systemFonts 
};

const buttontheme = {
  Button: {
    raised: true,
	titleStyle: {
		color: 'white',
		fontFamily: systemFonts,
	},
  }
}
const styles = StyleSheet.create({
	
	container: {
	  flex: 1,
	  backgroundColor: '#fff',
	  alignItems: 'center',
	  justifyContent: 'center',
	  fontFamily: systemFonts,
	}, 
	title: {
	  marginTop: Constants.statusBarHeight + 20,
	  fontSize: 18,
	  textAlign: 'center',
	  fontFamily: systemFonts,
	},
	nav: {
	  marginTop: Constants.statusBarHeight,
	  fontFamily: systemFonts,
	},
	paragraph: {
	  margin: 24,
	  fontSize: 14,
	  textAlign: 'center',
	  fontFamily: systemFonts,
	},
	button: {
	 margin: 30,
	 fontFamily: systemFonts,
	},
  });