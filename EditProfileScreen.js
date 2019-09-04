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
            width: Math.round(Dimensions.get('window').width),
            linkedPeople: []
        }
        this.linkedPeopleEle = this.linkedPeopleEle.bind(this)
    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Edit Profile'
        }
    }

    async componentDidMount() {
        let user = this.state.user
        user.linkedPeople = [{
            id: 0,
            firstName: "Lisa",
            lastName: "Stone",
            relationship: "Parent",
            username: "lisa.stone"
        }]
        await this.setState({
            user
        })
        await this.setState({
            linkedPeople: this.linkedPeopleEle()
        })
        console.log('linked: ' + this.state.linkedPeople)
    }

    async linkedPeopleEle() {
        let width = this.state.width
        let list = []
        try {
            await this.state.user.linkedPeople.map((user) => {
                list.push(
                    < TouchableOpacity key={user.id} >
                        <Image style={{ flex: 1, height: width * 0.2, width: width * 0.2, borderRadius: width * 0.1 }} source={this.state.user.profileImage} />
                    </TouchableOpacity >
                )
            })
            return list
        } catch (error) {
            console.log(error)
            return true
        }
    }

    render() {

        const styles = StyleSheet.create({
            textI: {
                borderBottomColor: '#495867',
                borderBottomWidth: StyleSheet.hairlineWidth,
                paddingTop: 10,
                paddingBottom: 10,
            },
            textT: {
                paddingTop: 10,
                paddingBottom: 10 + StyleSheet.hairlineWidth
            }
        })

        let width = this.state.width
        let right = (width - 120)
        return (

            <ScrollView>
                <View style={{ flex: 1, alignItems: 'center', padding: 10, borderBottomColor: "#495867", borderBottomWidth: StyleSheet.hairlineWidth }}>
                    <Image source={this.state.user.profileImage} style={{ width: width * 0.3, height: width * 0.3, borderRadius: (width * 0.3) / 2, marginBottom: 10 }} />
                    <TouchableOpacity style={{}}><Text style={{ color: "#fe5f55" }}>Change Profile Photo</Text></TouchableOpacity>
                </View>
                <View style={{ flex: 1, flexDirection: "row", padding: 5, borderBottomColor: "#495867", alignItems: 'stretch', justifyContent: 'center' }}>
                    <View style={{ marginLeft: 5, marginRight: 5, width: 80 }}>
                        <Text style={styles.textT}>Username</Text>
                        <Text style={styles.textT}>First Name</Text>
                        <Text style={styles.textT}>Last Name</Text>
                        <Text style={styles.textT}>Zipcode</Text>
                        <Text style={styles.textT}>Email</Text>
                        <Text style={styles.textT}>Age</Text>
                        <Text style={styles.textT}>Address</Text>
                    </View>
                    <View style={{ marginLeft: 5, marginRight: 5, width: right }}>
                        <TextInput placeholder="Username" style={styles.textI} autoCapitalize="none" />
                        <TextInput placeholder="First Name" value={this.state.user.firstName} style={styles.textI} />
                        <TextInput placeholder="Last Name" style={styles.textI} />
                        <TextInput placeholder="Zipcode" style={styles.textI} />
                        <TextInput placeholder="Email" style={styles.textI} autoCapitalize="none" />
                        <TextInput placeholder="Age" style={styles.textI} />
                        <TextInput placeholder="Address" style={styles.textI} multiline={true} />
                    </View>
                </View>
                <View style={{ flex: 1, flexDirection: "row", paddingLeft: 5, paddingRight: 5, paddingBottom: 5, borderBottomColor: "#495867", borderBottomWidth: StyleSheet.hairlineWidth, alignItems: 'stretch', justifyContent: 'center' }}>
                    <View style={{ marginLeft: 5, marginRight: 5, width: 80 }}>
                        <Text style={styles.textT}>Bio</Text>
                    </View>
                    <View style={{ marginLeft: 5, marginRight: 5, width: right }}>
                        <TextInput placeholder="Bio" style={[styles.textI, { borderBottomWidth: 0 }]} multiline={true} />
                    </View>
                </View>
                <View>
                    {this.state.linkedPeople}
                </View>
            </ScrollView>
        )
    }
}