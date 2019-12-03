import React, {useEffect, useState} from 'react';
import { View, ScrollView, Text, TextInput, StyleSheet, Platform, Dimensions } from 'react-native';
import { Button, ThemeProvider } from 'react-native-elements';
import { Toolbar, ThemeContext as TP, getTheme } from 'react-native-material-ui';
import Constants from 'expo-constants';
import MapView, { PROVIDER_GOOGLE, Marker, Circle, Callout}  from 'react-native-maps';

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
			id:31241334214312441324124342,
			title: 'Hey',
			latlng: {
			  latitude: 0,
			  longitude: 0
			},
		  },
		  {
			id:13243424132142331241243214,
			title: 'Hey2',
			latlng: {
			  latitude: 0.144282,
			  longitude: 0.782743
			},  
		}]);
	const [markers2, setMark2] = useState({latitude: 0.782743, longitude: 0.144282});
	
	
	var {height, width} = Dimensions.get('window');
	
	const apikey = Platform.OS === 'android' ? Constants.manifest.android.config.googleMaps.apiKey : Constants.manifest.ios.config.googleMapsApiKey;
	
	const getLocation = async (address) => { 
		//let locationData = await Location.getCurrentPositionAsync({});
		//let latitude = JSON.parse(locationData.coords.latitude);
		//let longitude = JSON.parse(locationData.coords.longitude);

		try{
			const response = await fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=' + apikey);
		    return await response.json();
		}catch (e) {
			console.log(e)
		}
	
	}
	
	async function getLongLat() {
		/*const response = await fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + value + '&key=' + apikey);
		const myJson = await response.json();
		setJsonData(JSON.stringify(myJson));
		
		var lon = parseFloat(JSON.stringify(myJson.results[0].geometry.location.lng));
	    var lat = parseFloat(JSON.stringify(myJson.results[0].geometry.location.lat));
		var swlon = parseFloat(JSON.stringify(myJson.results[0].geometry.viewport.southwest.lng));
	    var swlat = parseFloat(JSON.stringify(myJson.results[0].geometry.viewport.southwest.lat));
		var nelon = parseFloat(JSON.stringify(myJson.results[0].geometry.viewport.northeast.lng));
	    var nelat = parseFloat(JSON.stringify(myJson.results[0].geometry.viewport.northeast.lat));*/
		
		const res = await fetch('http://34.89.126.252/getHouses', {
			method: 'POST',
			body: JSON.stringify({
				lat: 50.8445258,
				lon: -0.1259262,
				radius: 500,
				limit: 100
			}),
			headers: {
				'Content-Type': 'application/json'
			},
		});
		
		const data = await res.json();
		console.log(JSON.stringify(data));
		console.log(data.length);
		
		let listOfMarks = [];
		var i;
		for(i = 0; i < data.length; i++) {
			const houselocation = await getLocation(data[i].paon + " " + data[i].street + " " + data[i].postcode);
			let lon = await parseFloat(JSON.stringify(houselocation.results[0].geometry.location.lng));
			let lat = await parseFloat(JSON.stringify(houselocation.results[0].geometry.location.lat));
			let obj = {
					id:data[i].id,
					price:data[i].price,
					address:data[i].paon + " " + data[i].street + "\n" + data[i].postcode,
					latlng: {
					  latitude:lat,
					  longitude:lon
					}
			}
			listOfMarks.push(obj);
		}
		console.log(JSON.stringify(listOfMarks));
		
		
		
		setRegion({latitude: 50.8445258, longitude: -0.1259262, latitudeDelta: 0.015, longitudeDelta: 0.0121});
		setMark(listOfMarks); 
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
					  key={marker.id}
					  coordinate={marker.latlng}
					  image={marker.title === 'Heyy' ? require('../assets/images/hgreen.png') : require('../assets/images/hgreen.png')}
					>
					<Callout>
					<View style={{textAlign: 'center'}}><Text>£{marker.price}</Text></View>
					<View><Text>{marker.address}</Text></View>
					</Callout>
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