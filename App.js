import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Platform, SafeAreaView, ScrollView } from 'react-native';
import { Button, ThemeProvider } from 'react-native-elements';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import HomeScreen from './screens/HomeScreen.js';
import MapScreen from './screens/MapScreen.js';


const MainNavigator = createStackNavigator({
  Home: {screen: HomeScreen},
  Map: {screen: MapScreen},
});

const App = createAppContainer(MainNavigator);

export default App;