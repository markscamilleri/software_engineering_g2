import React, {useEffect, useState, useContext} from 'react';
import { View, Text, TextInput, StyleSheet, Platform, Dimensions, ProgressViewIOS, ProgressBarAndroid } from 'react-native';
import { Button, ThemeProvider } from 'react-native-elements';
import { Toolbar, ThemeContext as TP, getTheme } from 'react-native-material-ui';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import { StoreContext } from '../Store.js';
import MapView, { PROVIDER_GOOGLE, Marker, Circle, Callout}  from 'react-native-maps';

const systemFonts = (Platform.OS === 'android' ? 'Roboto' : 'Arial');

const MapSearch = ({navigation}) => {
	const {
		radius: [radius, setRadius],
	} = useContext(StoreContext);

	const {
		limit: [limit, setLimit],
	} = useContext(StoreContext);

	const [value, setValue] = useState('');
	const [searchPosition, setSearchPosition] = useState({latitude: 0, longitude: 0});
	const [region, setRegion] = useState({latitude: 0, longitude: 0, latitudeDelta: 0.015, longitudeDelta: 0.0121});
	const [markers, setMark] = useState([{
			id:"d96b7a82-162f-11ea-8d71-362b9e155667",
			num:'123',
			title: 'Test1',
			latlng: {
			  latitude: 0,
			  longitude: 0
			},
		  }]);

	const [load, setLoad] = useState(0.01);

	function loading() {
		var time = load;
		setLoad((time + 0.01) % 1);
	}
	var myVar = setTimeout(loading, 10);
	
	
	var {height, width} = Dimensions.get('window');
	
	const apikey = Platform.OS === 'android' ? Constants.manifest.android.config.googleMaps.apiKey : Constants.manifest.ios.config.googleMapsApiKey;
	
	const getLocation = async (address) => { 
		try{
			const response = await fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=' + apikey);
		    return await response.json();
		}catch (e) {
			console.log(e)
		}
	}
	
	async function getLongLat() {
		
		const response = await fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + value + '&key=' + apikey);
		const myJson = await response.json();
		let radi = radius;
		let limi = limit;
		var lon = parseFloat(JSON.stringify(myJson.results[0].geometry.location.lng));
	    var lat = parseFloat(JSON.stringify(myJson.results[0].geometry.location.lat));

		const res = await fetch('http://34.89.126.252/getHouses', {
			method: 'POST',
			body: JSON.stringify({
				lat: lat,
				lon: lon,
				radius: radi,
				limit: limi
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
					num:data[i].paon,
					price:data[i].price,
					address:data[i].paon + " " + data[i].street + " " + data[i].postcode,
					type:data[i].initial,
					latlng: {
					  latitude:lat,
					  longitude:lon
					}
			}
			listOfMarks.push(obj);
		}
		console.log(JSON.stringify(listOfMarks));

		setRegion({latitude: lat, longitude: lon, latitudeDelta: 0.015, longitudeDelta: 0.0121});
		setSearchPosition({latitude: lat, longitude: lon});
		setMark(listOfMarks);
		clearTimeout(myVar);
	}
	
	return (
      <View style={styles.nav}>
		<TP.Provider value={getTheme(uiTheme)}>
			<Toolbar
				centerElement="ASE Project Group 2 | Map"
			/>
		</TP.Provider>
		<View style={styles.button}>
		<Text style={{textAlign: 'center', marginBottom: 10}}>Enter A Street Address</Text>
		<TextInput 
			style={{height: 30, borderWidth: 1, marginBottom: 10, borderRadius: 5}}
			onChangeText={text => setValue(text)}
			defaultValue={value}
		/>
		<TextInput 
			style={{height: 30, borderWidth: 1, marginBottom: 10, borderRadius: 5, width: 50}}
			onChangeText={text => setValue(text)}
			defaultValue={value}
		/>
			<ThemeProvider theme={buttontheme}>
				<Button
				  title="Search"
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
					<React.Fragment key={""+marker.id+marker.num}>
					<Marker
					  
					  coordinate={marker.latlng}
					  image={marker.type === 'F' ? require('../assets/images/flat.png') : require('../assets/images/hgreen.png')}
					>
					<Callout>
						<View><Text>-House Info-</Text></View>
						<View><Text>----------</Text></View>
						<View><Text>Price: £{marker.price}</Text></View>
						<View><Text>----------</Text></View>
						<View><Text>Type: {marker.type === 'F' ? 'Flat' : marker.type === 'S' ? 'Semi-Detached' : marker.type === 'T' ? 'Terrace' : 'House'}</Text></View>
						<View><Text>----------</Text></View>
						<View><Text>{marker.address}</Text></View>
						<View><Text>----------</Text></View>
					</Callout>
					</Marker>
				  </React.Fragment>
				  ))}

				  <Circle 
					  center={searchPosition}
					  radius={500}
				  />
			</MapView>
      </View>
    );
}

export default MapSearch;

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
	 margin: 20,
	 fontFamily: systemFonts,
	},
  });