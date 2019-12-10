import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Platform, SafeAreaView, ScrollView } from 'react-native';
import { Button, ThemeProvider } from 'react-native-elements';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import { createDrawerNavigator, DrawerActions } from 'react-navigation-drawer';
import HomeScreen from './screens/HomeScreen.js';
import MapScreen from './screens/MapScreen.js';
import Draw from './screens/Draw.js';

const DrawerNavigation = createDrawerNavigator(
  {
    "Drawer": { screen: Draw,
		navigationOptions: {
          drawerLabel: 'Home'
		}
	},
  },
  {
    drawerWidth: 300,
    drawerPosition: 'left',
    initialRouteName: 'Drawer',
  }
)

const MainNavigator = createStackNavigator({
  Home: {screen: HomeScreen},
  Map: {screen: MapScreen},
  drawerStack: { screen: DrawerNavigation }
});

const App = createAppContainer(MainNavigator);

export default App;