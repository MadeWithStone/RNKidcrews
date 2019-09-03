import React, { Component } from 'react'
import { View, Text, Button, TextInput, StyleSheet, ScrollView } from 'react-native'
import { createStackNavigator, createAppContainer, createBottomTabNavigator } from "react-navigation";
import { AsyncStorage } from '@react-native-community/async-storage'
import Config from './config'
import ProfileScreen from './ProfileScreen';
import EditProfileScreen from './EditProfileScreen'

class FeedScreen extends Component {

    static navigationOptions = {
        title: 'Feed'
    }

    render() {
        return <Text>Hello World!</Text>
    }
}


const feed = createStackNavigator({ FeedScreen }, { defaultNavigationOptions: Config.navBarStyles })
const profile = createStackNavigator({
    Profile: ProfileScreen,
    Edit: EditProfileScreen
}, { defaultNavigationOptions: Config.navBarStyles })

const TabNavigator = createBottomTabNavigator(
    {
        Feed: feed,
        Profile: profile
    },
    {
        tabBarOptions: {
            activeTintColor: "#fe5f55"
        }
    }
)

TabNavigator.navigationOptions = ({ navigation }) => {
    const { routes, index } = navigation.state
    const navigationOptions = {}

    if (routes[index].routeName === "Feed") {
        navigationOptions.title = "Feed"
    }

    return navigationOptions
}

export default createAppContainer(TabNavigator)