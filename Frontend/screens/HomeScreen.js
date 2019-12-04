import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Platform, SafeAreaView, ScrollView, ViewPropTypes } from 'react-native';
import { Button, ThemeProvider } from 'react-native-elements';
import Constants from 'expo-constants';
import { Toolbar, ThemeContext as TP, COLOR, getTheme } from 'react-native-material-ui';
import { createDrawerNavigator, DrawerActions } from 'react-navigation-drawer';
import * as Font from 'expo-font';
import { AppLoading } from 'expo';

const systemFonts = (Platform.OS === 'android' ? 'Roboto' : 'Farah');

const uiTheme = {
    palette: {
        primaryColor: COLOR.green500,
    },
    toolbar: {
        container: {
            height: 50,
        },
    },
	fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Farah'
};

const HomeScreen = ({navigation}) => {
	
	const [isFontLoaded, setFonts] = useState(true);
	
	
	if(isFontLoaded) {
		return ( 
		
			<>
				<View style={styles.nav}>
					<TP.Provider value={getTheme(uiTheme)}>
						<Toolbar
							leftElement="menu"
							onLeftElementPress={
								() => {
									console.log("Hey");
									navigation.navigate('Drawer');
								}
							}
							centerElement="ASE Project"
							searchable={{
								autoFocus: true,
								placeholder:'Search'
							}}
							rightElement={{
								menu: {
									icon: "menu",
									labels: ["Home", "View Location"]
								}
							}}
							onRightElementPress={ 
								function click() { 
									console.log("Heyy");
									
								}
							}
						/>
					</TP.Provider>
				</View>
			</>
		)
		
	} else {
		return ( 
			<View><Text style={{fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Farah'}}>Hello World</Text></View>
		)
		
	}

	
	/*<View style={styles.button}>
						<Text style={{fontFamily:'System'}}>
					<ThemeProvider theme={theme}>
						<Button
							title="Go To Map"
							onPress={()=>{{navigation.navigate('Map')}}}
						/>
					</ThemeProvider>
					</Text>
				</View>*/
}

HomeScreen.navigationOptions = {
	header: null,
	
};

const theme = {
  Button: {
    raised: true,
	titleStyle: {
		color: 'white',
		fontFamily: systemFonts,
	},
	fontFamily: systemFonts,
  },
  fontFamily: systemFonts,
};

const styles = StyleSheet.create({
	
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
	fontFamily: systemFonts,
  }, 
 /* tool: {
	  leftElement: {
		fontFamily: systemFonts,  
	  }
  },*/
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
   height: 200,
   width: 360,
  },
  button: {
   margin: 30,
   fontFamily: systemFonts,
  },
});

export default HomeScreen;