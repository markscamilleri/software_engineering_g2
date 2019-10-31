import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Platform, SafeAreaView, ScrollView } from 'react-native';
import { Button, ThemeProvider } from 'react-native-elements';
import Constants from 'expo-constants';
import { Toolbar } from 'react-native-material-ui';

const HomeScreen = ({navigation}) => {
	return (
		<>	
			<View style={styles.nav}>
				<Toolbar
					theme={theme}
					leftElement="menu"
					centerElement="ASE Project"
					searchable={{
						autoFocus: true,
						placeholder: 'Search',
					}}
					rightElement={{
						menu: {
							icon: "more-vert",
							labels: ["Home", "View Location"]
						}
					}}
					onRightElementPress={ 
						(label) => { 
							console.log(label);
							if(label.index == 1) {
								navigation.navigate('Map');
							} else if(label.index == 0) {
								navigation.navigate('Home');
							}
						}
					}
				/>
			</View>
			<View style={styles.button}>
				<ThemeProvider theme={theme}>
					<Button
						title="Go To Map"
						onPress={()=>{{navigation.navigate('Map')}}}
					/>
				</ThemeProvider>
			</View>
		</>
	);
}

HomeScreen.navigationOptions = {
	header: null,
	
};

const theme = {
  Button: {
    raised: true,
	titleStyle: {
		color: 'white',
	}
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }, 
  title: {
    marginTop: Constants.statusBarHeight + 20,
    fontSize: 18,
	textAlign: 'center',
  },
  nav: {
    marginTop: Constants.statusBarHeight,
  },
  paragraph: {
    margin: 24,
    fontSize: 14,
	textAlign: 'center',
  },
  map: {
   height: 200,
   width: 360,
  },
  button: {
   margin: 30,
  },
});

export default HomeScreen;