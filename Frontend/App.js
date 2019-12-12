import React, {useState} from 'react';
import { View, ScrollView, TouchableOpacity, Text, TextInput, StyleSheet, Platform, Dimensions, StatusBar, ProgressViewIOS,
ProgressBarAndroid } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { createSwitchNavigator, createAppContainer} from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack';
import { Toolbar, ThemeContext as TP, COLOR, getTheme } from 'react-native-material-ui';
import { Button, ThemeProvider, Divider  } from 'react-native-elements';
import Constants from 'expo-constants';
import { StateProvider, useStateValue  } from './StateContext.js';
import Rainbow from 'rainbowvis.js';
import MapSearch from './screens/MapSearch.js';
import LiveMap from './screens/MapData.js';
import Login from './screens/Login.js';
import Signup from './screens/Signup.js';

const systemFonts = (Platform.OS === 'android' ? 'Roboto' : 'Arial');

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
  map: {
	height: 100,
	width: 100,
  },
  button: {
   margin: 30,
   fontFamily: systemFonts,
  },
});


const Welcome = ({navigation}) => {
	var myRainbow = new Rainbow();
	myRainbow.setSpectrum('red', 'yellow', 'green');
	const [{ userDetails }, dispatch] = useStateValue();
	return (
		<>
			<View style={styles.nav}>
				<TP.Provider value={getTheme(uiTheme)}>
					<Toolbar
						centerElement="ASE Project Group 2 | Home"
					/>
				</TP.Provider>
			</View>
			<View style={{alignContent: 'center'}}>
			<Text style={{fontSize: 20, marginTop: 10, textAlign: 'center'}}>Welcome {userDetails.username}</Text>
			<Text style={{textAlign: 'center'}}>Welcome to the Map App</Text>
			<Text style={{textAlign: 'center', marginTop: 10}}>Choose to display your current location and view property prices in 'LiveMap'
			or enter a given location to view property prices within a given radius in 'MapSearch'. Enjoy!</Text>
			<Text style={{textAlign: 'center', marginTop: 10}}>Edit your settings within the 'Settings' page. These you can customize
			your given radius and number of postcodes searched for within the radius. The logout button is located here! </Text>
			<Text style={{textAlign: 'center', marginTop: 10}}>Properties are colour coded with a gradient effect to visually show their prices where red is the
			most expensive and green is the cheapest in the radius.</Text>
				</View>
		</>
    );
}

const Settings = ({navigation}) => {
	const [value, setValue] = useState('');
	const [{ mapprops }, dispatch] = useStateValue();
	const [radi, setRadi] = useState(mapprops.radius);
	const [limi, setLimi] = useState(mapprops.limit);

	return (
		<View style={styles.nav}>
		<TP.Provider value={getTheme(uiTheme)}>
			<Toolbar
				centerElement="ASE Project Group 2 | Settings"
			/>
		</TP.Provider>
		<Text style={{textAlign: 'center', marginTop: 10, fontSize: 20}}>Change MapView Settings</Text>
		<View style={styles.button}>

		<Text style={{marginBottom: 5}}>Set Search Radius (Meters):</Text>
		<TextInput
			style={{height: 30, borderWidth: 1, marginBottom: 10, borderRadius: 5}}
			onChangeText={rad => setRadi(rad)}
			defaultValue={mapprops.radius+""}
		/>

		<Text style={{ marginBottom: 5}}>Set Number of Postcodes:</Text>
		<TextInput
			style={{height: 30, borderWidth: 1, marginBottom: 10, borderRadius: 5}}
			onChangeText={lim => setLimi(lim)}
			defaultValue={mapprops.limit+""}
		/>

			<ThemeProvider theme={buttontheme}>
				<Button
				  title="Submit"
				  onPress={() => dispatch({
					type: 'changeParams',
					params: { radius: radi, limit: limi}
				  })}
				/>
			</ThemeProvider>

			<Divider style={{ marginTop: 10, backgroundColor: '#455a64' , height: 5}} />

			<View style={styles.button}><ThemeProvider theme={buttontheme}>
				<Button
				  title="LOGOUT"
				  onPress={()=>{{console.log("LOGOUT")} {navigation.navigate("Login")}}}
				/>
			</ThemeProvider></View>
		</View>
      </View>
    );
}


const DashboardTabNavigator = createBottomTabNavigator(
	{
		Welcome,
		LiveMap,
		MapSearch,
		Settings,
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


const AppSwitchNavigator = createSwitchNavigator({
	Login: { screen: Login },
	Dashboard: { screen: DashboardTabNavigator },
	Signup: {screen: Signup }
});


const App = createAppContainer(AppSwitchNavigator);

export default function mem() {

  const initialState = {
  	  mapprops: { radius: 100, limit: 100 },
	  userDetails: {username: ''}
  };

  const reducer = (state, action) => {
    switch (action.type) {
      case 'changeParams':
        return {
          ...state,
          mapprops: action.params
        };
		case 'addUsername':
			return {
				...state,
				userDetails: action.params
			};

      default:
        return state;
    }
  };

  return (
	<StateProvider initialState={initialState} reducer={reducer}>
	  <App />
	</StateProvider>
  );
}
