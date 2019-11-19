import React, {useEffect, useState} from 'react';
import { View, Text, TextInput, StyleSheet, Platform, Dimensions, StatusBar, ProgressViewIOS } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { createSwitchNavigator, createAppContainer} from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { Toolbar, ThemeContext as TP, COLOR, getTheme } from 'react-native-material-ui';
import { Button, ThemeProvider } from 'react-native-elements';
import Constants from 'expo-constants';
import MapView, { PROVIDER_GOOGLE, Marker }  from 'react-native-maps';

import HomeScreen from './screens/HomeScreen.js';
import MapScreen from './screens/MapScreen.js';

const systemFonts = (Platform.OS === 'android' ? 'Roboto' : 'Arial');

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
  map: {
	height: 100,
	width: 100,
  },
  button: {
   margin: 30,
   fontFamily: systemFonts,
  },
});


const WelcomeScreen = ({navigation}) => {
	
	const [load, setLoad] = useState(0.01);
	
	function loading() {
		var time = load;
		setLoad((time + 0.01) % 1);
	}
	var myVar = setTimeout(loading, 10);
	
	useEffect(() => {
		return function cleanup() {
		  clearTimeout(myVar);
		};
	});
	
	return (
		<>
			<View style={styles.nav}>
			<StatusBar barStyle="dark-content" />
				<TP.Provider value={getTheme(uiTheme)}>
					<Toolbar
						centerElement="ASE Project Group 2"
					/>
				</TP.Provider>
				<View style={styles.button}>
					<ThemeProvider theme={buttontheme}>
						<Button
						  title="LOGIN"
						  onPress={()=>{{navigation.navigate('Dashboard')}}}
						/>
					</ThemeProvider>
				</View>
			<ProgressViewIOS progress={load} />
			</View>
		</>
    );
}



const DashboardScreen = ({navigation}) => {
	
	
	return (
     <>
		<View style={styles.nav}>
		<StatusBar barStyle="dark-content" />
			<TP.Provider value={getTheme(uiTheme)}>
				<Toolbar
					leftElement="menu"
					centerElement="ASE Project Group 2"
					onLeftElementPress={ 
						() => navigation.openDrawer()
					}
				/>
			</TP.Provider>
		</View>
	</>
    );
}

const Feed = ({navigation}) => {
	const [location, setLocation] = useState({location: '', errorMessage: null});
	const [region, setRegion] = useState({latitude: 0, longitude: 0, latitudeDelta: 0.015, longitudeDelta: 0.0121});
	const [markers, setMark] = useState({latitude: 0, longitude: 0, title: '', subtitle: ''});
	
	var {height, width} = Dimensions.get('window');
	
	return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Feed {height} </Text>
		<StatusBar barStyle="light-content" />
		<View>
			<MapView
				provider={PROVIDER_GOOGLE}
				style={{height: height, width: width}}
				region={region}
			 >
				 <Marker
					coordinate={markers}
					title="Equator"
					onPress={() => console.log("HEY")}
				/>
			</MapView>
		</View>
      </View>
    );
}

const Settings = ({navigation}) => {
	
	const [value, setValue] = useState(' ');
	const [jsonData, setJsonData] = useState(0);
	
	
	const apikey = Platform.OS === 'android' ? Constants.manifest.android.config.googleMaps.apiKey : Constants.manifest.ios.config.googleMapsApiKey;
	async function getLongLat() {
		const response = await fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + value + '&key=' + apikey);
		const myJson = await response.json();
		setJsonData(JSON.stringify(myJson));
		console.log(JSON.stringify(myJson));
	}
	
	return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
		<StatusBar barStyle="light-content" />
        <Text>Settings</Text>
		<Text>{jsonData}</Text>
		<View style={styles.button}>
		<TextInput 
			style={{height: 40, borderWidth: 2, marginBottom: 10}}
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
      </View>
    );
}

const Profile = ({navigation}) => {
	return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
		<StatusBar barStyle="light-content" />
        <Text>Profile</Text>
      </View>
    );
}

const DashboardTabNavigator = createBottomTabNavigator(
	{
		Settings,
		Profile,
		Feed,
	},
	{
		navigationOptions: ({ navigation }) => {
			const { routeName } = navigation.state.routes[navigation.state.index];
			<StatusBar barStyle="light-content" />
			return {
				headerTitle: routeName,
				headerStyle: { backgroundColor: '#002366' },
				headerTitleStyle: { color: 'white' }
			};
		}
	}
);

const DashboardStackNavigator = createStackNavigator(
  {
    DashboardTabNavigator: DashboardTabNavigator
  },
  {
	
    defaultNavigationOptions: ({ navigation }) => {
      return {
        headerLeft: (
		<>
          <Icon
            style={{ paddingLeft: 10, backgroundColor: '#002366', color: 'white' }}
            onPress={() => navigation.openDrawer()}
            name="md-menu"
            size={30}
          />
		</>
        )
      };
    }
  }
);

const AppDrawerNavigator = createDrawerNavigator({
  Home: {
    screen: DashboardStackNavigator
  },
  DashboardScreen: {
    screen: DashboardScreen
  }
});


const AppSwitchNavigator = createSwitchNavigator({
  Welcome: { screen: WelcomeScreen },
  Dashboard: { screen: AppDrawerNavigator }
});


const App = createAppContainer(AppSwitchNavigator);

export default App;