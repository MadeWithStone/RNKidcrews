import React, { Component } from 'react'
import { View, Text, TextInput, StyleSheet, ScrollView, Image, Dimensions } from 'react-native'
import { Button } from 'react-native-elements'
import { createStackNavigator, createAppContainer, createBottomTabNavigator } from "react-navigation";
import AsyncStorage from '@react-native-community/async-storage'
import Config from './config'
//import image from './assets/blank-profile.png'

export default class ProfileScreen extends Component {

    constructor(props) {
        super(props)
        this.state = {
            user: {
                _id: "0",
                username: "",
                firstName: "",
                lastName: "",
                zip: '',
                email: "",
                verified: "false",
                age: '',
                jobsList: [],
                ratings: [],
                password: "",
                address: ""
            }
        }
        this.load = this.load.bind(this)
    }
    static navigationOptions = {
        title: 'Profile'
    }

    componentDidMount() {
        const { navigation } = this.props
        this.focusListener = navigation.addListener("didFocus", () => {
            this.load("currentUser")
        })
    }

    componentWillUnmount() {
        this.focusListener.remove()
    }

    async save(data, key) {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(data))
        } catch (error) {
            console.log("save error: " + error)
        }
    }

    async load(key) {
        try {
            let dataJ = await AsyncStorage.getItem(key)
            let data = JSON.parse(dataJ)
            this.setState({
                user: data
            })
            console.log(data)
            return "true"
        } catch (error) {
            console.log("load error: " + error)
            return "false"
        }
    }

    render() {

        let width = Math.round(Dimensions.get('window').width) * 0.3

        return (
            <ScrollView>
                <View style={{ flex: 1, flexDirection: "row", padding: 10 }}>
                    <Image
                        style={{ width: width, height: width, borderRadius: width / 2 }}
                        source={require("./assets/blank-profile.png"
                        )} />
                    <View style={{ flex: 1, flexDirection: "column", padding: 10, justifyContent: 'center', height: width }}>
                        <Text>Username: {this.state.user.username}</Text>
                        <Text>First Name: {this.state.user.firstName}</Text>
                        <Text>Last Name: {this.state.user.lastName}</Text>
                        <Text>Zipcode: {this.state.user.zip}</Text>
                    </View>
                </View>
                <View style={{ flex: 1, padding: 10 }}>
                    <Text>Email: {this.state.user.email}</Text>
                    <Text>Address: {this.state.user.address}</Text>
                    <Button buttonStyle={Config.buttonStyle2} titleStyle={Config.buttonTitleStyle2} title="Edit Profile" />
                </View>
            </ScrollView>
        )
    }
}