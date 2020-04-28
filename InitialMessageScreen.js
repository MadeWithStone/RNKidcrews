import React, { Component } from 'react'
import { Modal, Alert, View, Text, TextInput, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity, ActivityIndicator, Picker } from 'react-native'
import { createStackNavigator, createAppContainer, createBottomTabNavigator } from "react-navigation";
import AsyncStorage from '@react-native-community/async-storage'
import Config from './config'
import { Button } from 'react-native-elements'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';

import { faStar, faIdCard, faUserCircle} from '@fortawesome/free-solid-svg-icons'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import SegmentedControlTab from "react-native-segmented-control-tab";
import { getDistance, getPreciseDistance } from 'geolib';
import Moment from 'moment';

export default class InitialMessageScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: "Personal Message",
            headerRight: (
                <Button title="Send" onPress={
                    navigation.getParam('send')
                }
                buttonStyle={{ backgroundColor: '#ffffff' }} 
                titleStyle={{ color: '#fe5f55' }}/>
            ),
        }
    }

    constructor (props) {
        super(props)
        this.state = {
            width: Math.round(Dimensions.get('window').width),
            post: {},
            user: {},
            message: ""
        }
        this.sendMessage = this.sendMessage.bind(this)
    }

    async componentDidMount() {
        const { navigation } = this.props;
        this.props.navigation.setParams({ send: this.sendMessage})
        var post = await this.props.navigation.getParam('post', {})
        await this.load("currentUser")
        this.setState({post: post})
    }

    async load(key) {
        try {
            let dataJ = await AsyncStorage.getItem(key)
            let data = JSON.parse(dataJ)
            //data.profileImage = { uri: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" }
            console.log("image: " + data.profileImage)
            
            
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

    async sendMessage() {
        if (this.state.message == "") {
            Alert.alert("You must write a message.")
        } else {
            await fetch(Config.server + "/jobs/message", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': 'Token '+this.state.user.token
                },
                body: JSON.stringify({
                    message: {
                        employer: this.state.user._id,
                        employee: this.state.post.user._id,
                        sender: this.state.user._id,
                        message: {
                            text: this.state.message,
                            user: {
                                _id: this.state.user._id
                            },
                            createdAt: Moment().utcOffset('00:00').format('YYYY-MM-DDTHH:mm:ss.SSS')+"Z",
                            _id: String(Moment().utcOffset('00:00').format('YYYY-MM-DDTHH:mm:ss.SSS'))+"Z"
                        }
                    }
                })
            }).then((response) => response.json())
            .then((resJSON) => {
            })
            const { navigation } = this.props;
            Alert.alert("Message Sent")
            navigation.goBack()
        }
        
    }

    render() {
        return(
            <KeyboardAwareScrollView>
                <View>
                    <Text style={{borderBottomColor: "#495867", borderBottomWidth: 1, marginLeft: 8, paddingTop: 8}}>Write a Message</Text>
                    <Text style={{borderBottomColor: "#495867", borderBottomWidth: StyleSheet.hairlineWidth, paddingLeft: 8, marginTop: 8}}>To: Person</Text>
                    <TextInput style={{borderBottomColor: "#495867", borderBottomWidth: StyleSheet.hairlineWidth, paddingLeft: 8, marginTop: 8, paddingBottom: 8, paddingRight: 8}}
                        placeholder="Message"
                        multiline={true}
                        onChangeText={(message) => { this.setState({ message: message }) }}
                        value={String(this.state.message)}/>
                </View>
            </KeyboardAwareScrollView>
        )

    }
}