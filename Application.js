import React, {useEffect, useState} from 'react';
import { View, ScrollView, TouchableOpacity, Text, TextInput, StyleSheet, Platform, Dimensions, StatusBar, ProgressViewIOS,
ProgressBarAndroid } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { createSwitchNavigator, createAppContainer} from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { Toolbar, ThemeContext as TP, COLOR, getTheme } from 'react-native-material-ui';
import { Button, ThemeProvider } from 'react-native-elements';
import Constants from 'expo-constants';

import MapSearch from './screens/MapSearch.js';
import MapData from './screens/MapData.js';

const systemFonts = (Platform.OS === 'android' ? 'Roboto' : 'Arial');

global.radius = 500;
global.houseLimit = 100;

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
	//const [raduisVal, setRadiusVal] = useState('');
	//const [raduisVal, setRadiusVal] = useState('');
	
	return (
		<View style={styles.nav}>
		<TP.Provider value={getTheme(uiTheme)}>
			<Toolbar
				centerElement="ASE Project Group 2 | Map"
			/>
		</TP.Provider>
		<Text style={{textAlign: 'center', marginTop: 10}}>---Change MapView Settings---</Text>
		<View style={styles.button}>

		<Text style={{marginBottom: 5}}>Set Search Radius (Meters):</Text>
		<TextInput 
			style={{height: 30, borderWidth: 1, marginBottom: 10, borderRadius: 5}}
			onChangeText={text => global.radius = text}
			defaultValue={"500"}
		/>

		<Text style={{ marginBottom: 5}}>Set Number of Results:</Text>
		<TextInput 
			style={{height: 30, borderWidth: 1, marginBottom: 10, borderRadius: 5}}
			onChangeText={text => global.houseLimit = text}
			defaultValue={"100"}
		/>

			<ThemeProvider theme={buttontheme}>
				<Button
				  title="Submit"
				  onPress={()=>{{}}}
				/>
			</ThemeProvider>
		</View>
      </View>
    );
}

const DashboardTabNavigator = createBottomTabNavigator(
	{
		MapData,
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
		},
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

const AppSwitchNavigator = createSwitchNavigator({
  Welcome: { screen: WelcomeScreen },
  Dashboard: { screen: DashboardTabNavigator }
});


const Application = createAppContainer(AppSwitchNavigator);

export default Application;