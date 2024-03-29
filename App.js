/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import { View, Text, StyleSheet, Image, Dimensions, StatusBar } from "react-native";
import { Button } from 'react-native-elements'
import { createStackNavigator, createAppContainer, HeaderBackButton } from "react-navigation";
import SignInScreen from './SignInScreen.js'
import Config from './config.js'
import FeedScreen from "./FeedScreen.js";
import SignUpScreen from "./SignUpScreen.js";
import Instabug from 'instabug-reactnative';

class HomeScreen extends Component {
  static navigationOptions = {
    title: "Welcome"
  }

  constructor(props) {
    super(props)
    Instabug.startWithToken('acb95757317442fcebbf88073b79a399', [Instabug.invocationEvent.shake]);
  }

  componentDidMount() {
    
  }


  render() {
    const win = Dimensions.get('window')
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        margin: 10
      },

      logo_hor: {

        width: 100+'%',
        height: win.width * 384 / 1125,

      }

    })
    
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#495867" barStyle="dark-content" />
        <Image source={Config.logo_horizonatal} style={styles.logo_hor} resizeMode={'contain'} />
        <Button
          title="Sign In"
          onPress={() => this.props.navigation.navigate('SignIn')}
          buttonStyle={Config.buttonStyle}

        />
        <Button
          title="Sign Up"
          onPress={() => this.props.navigation.navigate('SignUp')}
          buttonStyle={Config.buttonStyle}

        />
      </View >
    );
  }
}


const AppNavigator = createStackNavigator(
  {
    Home: HomeScreen,
    SignIn: SignInScreen,
    Feed: {
      screen: FeedScreen,
      navigationOptions: {
        header: null
      }
    },

    SignUp: SignUpScreen
  },
  {
    initialRouteName: "Home",
    defaultNavigationOptions: Config.navBarStyles

  }
)



const AppContainer = createAppContainer(AppNavigator)

export default class App extends Component {
  render() {
    return <AppContainer />;
  }
}



