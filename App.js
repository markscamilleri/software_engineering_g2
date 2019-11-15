import React, {useEffect, useState} from 'react';
import { View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
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

const uiTheme = {
    palette: {
        primaryColor: COLOR.green500,
    },
    toolbar: {
        container: {
            height: 60,
        },
    },
	fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Farah'
};

const systemFonts = (Platform.OS === 'android' ? 'Roboto' : 'Farah');

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
	return (
		<>
			<View style={styles.nav}>
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
			</View>
		</>
    );
}



const DashboardScreen = ({navigation}) => {
	
	
	return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>DashboardScreen1</Text>
      </View>
    );
}

const Feed = ({navigation}) => {
	const [location, setLocation] = useState({location: '', errorMessage: null});
	const [region, setRegion] = useState({latitude: 0, longitude: 0, latitudeDelta: 0.015, longitudeDelta: 0.0121});
	const [markers, setMark] = useState({latitude: 0, longitude: 0, title: '', subtitle: ''});
	
	useEffect(() => {
		
	}, []);
	
	let text = 'Waiting..';
	let longtude = 0;
	let lattude = 0;
    if (location.errorMessage) {
      text = location.errorMessage;
    } else if (location.location) {
      text = JSON.stringify(location.location);
    }
	
	var {height, width} = Dimensions.get('window');
	
	return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Feed {height} </Text>
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
	return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Settings</Text>
      </View>
    );
}

const Profile = ({navigation}) => {
	return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Profile</Text>
      </View>
    );
}

const DashboardTabNavigator = createBottomTabNavigator(
	{
		Feed,
		Profile,
		Settings,
		DashboardScreen
	},
	{
		navigationOptions: ({ navigation }) => {
			const { routeName } = navigation.state.routes[navigation.state.index];
			return {
				headerTitle: routeName
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
          <Icon
            style={{ paddingLeft: 10 }}
            onPress={() => navigation.openDrawer()}
            name="md-menu"
            size={30}
          />
        )
      };
    }
  }
);

const AppDrawerNavigator = createDrawerNavigator({
  Dashboard: {
    screen: DashboardStackNavigator
  },
  DashboardHome: {
    screen: DashboardScreen
  }
});


const AppSwitchNavigator = createSwitchNavigator({
  Welcome: { screen: WelcomeScreen },
  Dashboard: { screen: AppDrawerNavigator }
});


const App = createAppContainer(AppSwitchNavigator);

export default App;