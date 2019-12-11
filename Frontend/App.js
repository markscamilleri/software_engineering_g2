import React, {useEffect, useState, useContext, useReducer} from 'react';
import { View, ScrollView, TouchableOpacity, Text, TextInput, StyleSheet, Platform, Dimensions, StatusBar, ProgressViewIOS,
ProgressBarAndroid } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { createSwitchNavigator, createAppContainer, NavigationEvents, withNavigationFocus} from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { Toolbar, ThemeContext as TP, COLOR, getTheme } from 'react-native-material-ui';
import { Button, ThemeProvider } from 'react-native-elements';
import Constants from 'expo-constants';
import MapView, { PROVIDER_GOOGLE, Marker }  from 'react-native-maps';
import { CounterContext, CounterProvider, updateRadius } from './Global.js';
import { StateProvider, useStateValue  } from './StateContext.js';
import Rainbow from 'rainbowvis.js';
import MapSearch from './screens/MapSearch.js';
import MapData from './screens/MapData.js';
import { Icon as IconElements } from 'react-native-elements'
import Login from './screens/Login.js';
import Signup from './screens/Signup.js';

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
	var myRainbow = new Rainbow();
	myRainbow.setSpectrum('red', 'yellow', 'green');
	return (
		<>
			<View style={styles.nav}>
			<StatusBar barStyle="dark-content" />
				<TP.Provider value={getTheme(uiTheme)}>
					<Toolbar
						centerElement="ASE Project Group 2 | Home"
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
				<Text style={{color: '#'+myRainbow.colourAt(90)}}>Hello</Text>
				<IconElements
				  name='home'
				  type='font-awesome'
				  size={50}
				  color={'#'+myRainbow.colourAt(90)} />
				  <IconElements
				  name='home'
				  type='font-awesome'
				  size={50}
				  color={'#'+myRainbow.colourAt(50)} />
				<IconElements
				  name='building'
				  type='font-awesome'
				  size={25}
				  reverse={true}
				  raised={true}
				  color={'#'+myRainbow.colourAt(0)} />
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
		<Text style={{textAlign: 'center', marginTop: 10}}>---Change MapView Settings---</Text>
		<View style={styles.button}>

		<Text style={{marginBottom: 5}}>Set Search Radius (Meters):</Text>
		<TextInput
			style={{height: 30, borderWidth: 1, marginBottom: 10, borderRadius: 5}}
			onChangeText={rad => setRadi(rad)}
			defaultValue={mapprops.radius+""}
		/>

		<Text style={{ marginBottom: 5}}>Set Number of Results:</Text>
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
			<Text>{mapprops.radius} | {mapprops.limit}</Text>
		</View>
      </View>
    );
}

const Search = ({navigation}) => {
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
		MapData,
		MapSearch,
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
  Login: { screen: Login },
  Dashboard: { screen: DashboardTabNavigator },
  Signup: {screen: Signup }
});


const App = createAppContainer(AppSwitchNavigator);

export default function mem() {

  const initialState = {
    mapprops: { radius: 100, limit: 100 }
  };

  const reducer = (state, action) => {
    switch (action.type) {
      case 'changeParams':
        return {
          ...state,
          mapprops: action.params
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
