import React, { Component } from 'react'
import { View, Text, Button, TextInput, StyleSheet, ScrollView } from 'react-native'
import { createStackNavigator, createAppContainer, createBottomTabNavigator } from "react-navigation";
import { AsyncStorage } from '@react-native-community/async-storage'
import Config from './config'

export default class ProfileScreen extends Component {
    static navigationOptions = {
        title: 'Profile'
    }
    render() {
        return <Text>Profile</Text>
    }
}