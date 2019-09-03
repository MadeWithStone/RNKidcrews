import React, { Component } from 'react'
import { View, Text, TextInput, StyleSheet, ScrollView, Image, Dimensions, TouchableWithoutFeedback, TouchableOpacity } from 'react-native'
import { Button } from 'react-native-elements'
import { createStackNavigator, createAppContainer, createBottomTabNavigator } from "react-navigation";
import AsyncStorage from '@react-native-community/async-storage'
import Config from './config'

export default class EditProfileScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            user: props.navigation.getParam('user', {}),
            width: Math.round(Dimensions.get('window').width)
        }
    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Edit Profile'
        }
    }

    render() {

        const styles = StyleSheet.create({
            textI: {
                borderBottomColor: '#495867',
                borderBottomWidth: StyleSheet.hairlineWidth
            }
        })

        let width = this.state.width
        return (
            <ScrollView>
                <View style={{ flex: 1, alignItems: 'center', padding: 10, borderBottomColor: "#495867", borderBottomWidth: StyleSheet.hairlineWidth }}>
                    <Image source={this.state.user.profileImage} style={{ width: width * 0.3, height: width * 0.3, borderRadius: (width * 0.3) / 2, marginBottom: 10 }} />
                    <TouchableOpacity style={{}}><Text style={{ color: "#fe5f55" }}>Change Profile Photo</Text></TouchableOpacity>
                </View>
                <View style={{ flex: 1, flexDirection: "row", padding: 5, borderBottomColor: "#495867", borderBottomWidth: StyleSheet.hairlineWidth }}>
                    <View style={{ flex: 1, margin: 5, width: 5 }}>
                        <Text>Username</Text>
                        <Text>First Name</Text>
                        <Text>Last Name</Text>
                        <Text>Zipcode</Text>
                        <Text>Bio</Text>
                    </View>
                    <View style={{ flex: 1, margin: 5, width: 100 + '%' }}>
                        <TextInput placeholder="Username" style={styles.textI} />
                    </View>
                </View>
            </ScrollView>
        )
    }
}