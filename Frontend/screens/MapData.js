import React, {useEffect, useState} from 'react';
import { View, Text, TextInput, StyleSheet, Platform, Dimensions, ProgressViewIOS, ProgressBarAndroid } from 'react-native';
import { Button, ThemeProvider, Icon } from 'react-native-elements';
import { Toolbar, ThemeContext as TP, getTheme } from 'react-native-material-ui';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import MapView, { PROVIDER_GOOGLE, Marker, Circle, Callout}  from 'react-native-maps';
import { useStateValue  } from '../StateContext.js';
import Rainbow from 'rainbowvis.js';

const systemFonts = (Platform.OS === 'android' ? 'Roboto' : 'Arial');

const LiveMap = ({navigation}) => {
	const [{ mapprops }, dispatch] = useStateValue();
	const [errorMess, setErrorMess] = useState('');
	let gradientColours = new Rainbow();
	gradientColours.setSpectrum('green', 'yellow', 'red');
	const [numLoad, setNumLoad] = useState(0);
	const [dataSize, setDataSize] = useState(0);
	const [renderMap, setMapRender] = useState(false);
	const [showLoading, setShowLoading] = useState(false);
	const [phonePosition, setPhonePosition] = useState();
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

	const getPermissions = async () => {

        try {
            let {status} = await Permissions.askAsync(Permissions.LOCATION);
            if (status === 'granted') {
                try {
                    let locationdata = await Location.getCurrentPositionAsync({
						maximumAge: 0, // only for Android
						accuracy: Location.Accuracy.High});
					return locationdata;
                } catch (error) {
					console.log('Permission to turn on phone location was denied: ' + error.message);
					//return false;
                }
            } else {
				console.log('Permission to access location was denied' + error.message);
				//return false;
            }

        } catch (error) {
			console.log('There has been a problem with location: ' + error.message);
			//return false;
        }

    };

	async function getLongLat() {
		setMapRender(false);
		setShowLoading(true);
		setErrorMess('');
		var rad = parseInt(mapprops.radius);
		var lim = parseInt(mapprops.limit);
		console.log('HELLO');
		var phonelocation = await getPermissions();
		console.log(phonelocation.coords.latitude, phonelocation.coords.longitude);
		var phonelat = parseFloat(phonelocation.coords.latitude);
		var phonelon = parseFloat(phonelocation.coords.longitude);

		const res = await fetch('http://34.89.126.252/getHouses', {
			method: 'POST',
			body: JSON.stringify({
				lat: phonelat,
				lon: phonelon,
				radius: rad,
				limit: lim
			}),
			headers: {
				'Accept': 'application/json',
				'Content-type': 'application/json'
			},
		});

		const data = await res.json();
		console.log(JSON.stringify(data));
		console.log(data.length);
		if(data.length > 0) {
			let listOfMarks = [];
			var counter = 0;
			setNumLoad(counter);
			setDataSize(data.length - 1);
			for (let i = 0; i < data.length; i++) {
				setNumLoad(counter++);
				const houselocation = await getLocation(data[i].paon + " " + data[i].street + " " + data[i].postcode);
				let lon = parseFloat(JSON.stringify(houselocation.results[0].geometry.location.lng));
				let lat = parseFloat(JSON.stringify(houselocation.results[0].geometry.location.lat));
				let obj = {
					id: data[i].id,
					num: data[i].paon,
					price: data[i].price,
					address: data[i].paon + " " + data[i].street + " " + data[i].postcode,
					type: data[i].initial,
					latlng: {
						latitude: lat,
						longitude: lon
					}
				}
				listOfMarks.push(obj);
			}
			console.log(JSON.stringify(listOfMarks));

			let max = 0;
			for (let i = 0; i < listOfMarks.length; i++) {
				if (listOfMarks[i].price > max) {
					max = listOfMarks[i].price;
				}
			}

			let min = listOfMarks[0].price;
			for (let i = 0; i < listOfMarks.length; i++) {
				if (listOfMarks[i].price < min) {
					min = listOfMarks[i].price;
				}
			}
			gradientColours.setNumberRange(parseInt(min), parseInt(max));
			console.log("BIG: ", max, " SMALL: ", min);

			for (let i = 0; i < listOfMarks.length; i++) {
				listOfMarks[i].colour = "#" + gradientColours.colourAt(parseInt(listOfMarks[i].price));
			}

			setRegion({latitude: phonelat, longitude: phonelon, latitudeDelta: 0.015, longitudeDelta: 0.0121});
			setPhonePosition({latitude: phonelat, longitude: phonelon});
			setMark(listOfMarks);
			setMapRender(true);
			setShowLoading(false);
		} else {
			setShowLoading(false);
			setErrorMess('No Houses Found In Your Area With Current Settings');
		}
	}
	var i = 0;
	return (
      <View style={styles.nav}>
		<TP.Provider value={getTheme(uiTheme)}>
			<Toolbar
				centerElement="ASE Project Group 2 | Map"
			/>
		</TP.Provider>
		{ renderMap ? <View><MapView
			provider={PROVIDER_GOOGLE}
			style={{height: height*0.7, width: width}}
			initialRegion={region}
			customMapStyle={[
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#181818"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1b1b1b"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8a8a8a"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3c3c3c"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#4e4e4e"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  }
]}
		>
				 {markers.map(marker => (
					<React.Fragment key={""+marker.id+marker.num+(i++)}>
					<Marker
					  coordinate={marker.latlng}
					  zIndex={i++}
					  tracksViewChanges={false}
					>
					{marker.type === 'F' ? <Icon
					  name='building'
					  type='font-awesome'
					  size={26}
					  color={marker.colour} /> : <Icon
					  name='home'
					  type='font-awesome'
					  size={26}
						color={marker.colour} /> }
					<Callout style={{backgroundColor: 'white', minWidth: 250, maxWidth: 400, padding: 5, borderRadius: 5, flex: 1}}>
						<View style={{textAlign: 'center', flex: 1, justifyContent: 'center'}}><Text>-House Info-</Text>
						<Text>----------</Text>
						<Text>Price: £{marker.price}</Text>
						<Text>----------</Text>
						<Text>Type: {marker.type === 'F' ? 'Flat' : marker.type === 'S' ? 'Semi-Detached' : marker.type === 'T' ? 'Terrace' : 'House'}</Text>
						<Text>----------</Text>
						<Text>{marker.address}</Text>
						<Text>----------</Text></View>
					</Callout>
					</Marker>
				  </React.Fragment>
				  ))}

				  <Circle
					  center={phonePosition}
					  radius={10}
				  />
			</MapView>
			<View style={styles.button}>
			<ThemeProvider theme={buttontheme}>
				<Button
				  title="Refresh Position"
				  onPress={()=>{{getLongLat()}}}
				/>
			</ThemeProvider>
			</View></View> : showLoading ?  Platform.OS === 'android' ? <><Text style={{textAlign: 'center'}}>...Loading Map...</Text><Text style={{textAlign: 'center'}}>Loaded {numLoad}/{dataSize}</Text><Text style={{textAlign: 'center'}}>{errorMess}</Text></> : <><Text style={{textAlign: 'center'}}>...Loading Map...</Text><Text style={{textAlign: 'center'}}>Loaded {numLoad}/{dataSize}</Text><Text style={{textAlign: 'center'}}>{errorMess}</Text></> : <View style={styles.button}><ThemeProvider theme={buttontheme}>
				<Button
				  title="Show Map"
				  onPress={()=>{{getLongLat()}}}
				/>
			</ThemeProvider><Text style={{textAlign: 'center'}}>{errorMess}</Text></View> }
      </View>
    );
}

export default LiveMap;

const uiTheme = {
    palette: {
        primaryColor: '#455a64',
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
	 margin: 5,
	 fontFamily: systemFonts,
	},
  });
