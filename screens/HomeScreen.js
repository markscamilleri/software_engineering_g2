import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Platform, SafeAreaView, ScrollView } from 'react-native';
import { Button, ThemeProvider } from 'react-native-elements';
import Constants from 'expo-constants';
import { Toolbar } from 'react-native-material-ui';
import * as Font from 'expo-font';
import { AppLoading } from 'expo';

const HomeScreen = ({navigation}) => {
	
	const [isFontLoaded, setFonts] = useState(false);
	
	/*useEffect(() => {
		getFonts();
		setFonts(true);
	}, []);*/
	
	const getFonts = async () => { 
		
		await Font.loadAsync({
			'Roboto' : require('../assets/fonts/farah.ttf')
		});
		
	}
	
	return !isFontLoaded ? ( <AppLoading
				  startAsync={this.getFonts}
				  onFinish={() => setFonts(true)}
				  onError={console.warn}
			/>
		) : ( 
		
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
				
			
		</>
		
		)
	
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
	},
	fontFamily: 'System',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
	fontFamily: 'System',
  }, 
  title: {
    marginTop: Constants.statusBarHeight + 20,
    fontSize: 18,
	textAlign: 'center',
	fontFamily: 'System',
  },
  nav: {
    marginTop: Constants.statusBarHeight,
	fontFamily: 'System',
  },
  paragraph: {
    margin: 24,
    fontSize: 14,
	textAlign: 'center',
	fontFamily: 'System',
  },
  map: {
   height: 200,
   width: 360,
  },
  button: {
   margin: 30,
   fontFamily: 'System',
  },
});

export default HomeScreen;