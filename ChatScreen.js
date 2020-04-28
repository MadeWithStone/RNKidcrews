import React, { Component } from 'react'
import { Modal, Alert, View, Text, TextInput, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity, ActivityIndicator, Picker, RefreshControl } from 'react-native'
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
import { Route53 } from 'aws-sdk';

export default class ChatScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: "Messages"
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            user: {},
            messages: [],
            width: Dimensions.get('window').width,
            refreshing: false,
        }
        this.downloadMessages = this.downloadMessages.bind(this)
        this.load = this.load.bind(this)
    }

    async componentDidMount() {
        await this.load("currentUser")
        const { navigation } = this.props;
        this.focusListener = navigation.addListener("didFocus", () => {
            this.downloadMessages()
            
            
        });
        //this.downloadMessages
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
            this.downloadMessages()
            console.log("getting messagis 1")
            return "true"
        } catch (error) {
            console.log("load error: " + error)
            return "false"
        }
    }

    async downloadMessages() {
        this.setState({refreshing: true})
        console.log("getting messages")
        var messages = {}
        
        console.log("fetching")
        fetch(Config.server+"/jobs/getMessages", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'authorization': 'Token ' + this.state.user.token
            },
            body: JSON.stringify({
                data: {
                    _id: this.state.user._id
                }
            })
        }).then((response) => response.json())
        .then((resJson) => {
            messages = resJson
            
            let parsedMessages = []
            for (i in messages) {
                if (messages[i] != null) {
                    if (messages[i].users[0]._id == this.state.user._id) {
                        messages[i].pos = 0
                    } else {
                        messages[i].pos = 1
                    }
                    parsedMessages.push(messages[i])
                }
            }
            console.log("messages: "+JSON.stringify(parsedMessages))
            this.setState({messages: parsedMessages})
        })
        this.setState({refreshing: false})
        
        

    }

    render() {
        let messages = this.state.messages
        var messageObjs = []
        let width = this.state.width - 35 - 30 - 16
        messages.map((message) => {
            let user = {}
            console.log("messages i: "+JSON.stringify(message))
            if (message.pos = 1) {
                user = message.users[0]
            } else {
                user = message.users[1]
            }
            messageObjs.push(
                <View key={message._id} style={{height: 65, width: 100+'%', justifyContent: "center"}}>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('Messaging', {message: message, user: this.state.user, title: user.firstName + " " + user.lastName})} style={{flexDirection: 'row'}}>
                        <Image source={{uri: user.profileImage,
                                        cache: 'reload'}} 
                                style={{height: 30, width: 30, borderRadius: 15, marginLeft: 17.5, marginRight: 16}}/>
                        <View>
                            <Text>{user.firstName + " " + user.lastName}</Text>
                            <View style={{marginRight: 17.5, flexDirection: 'row', width: width}}>
                                
                                <Text style={{width: width - 90, marginRight: 10}}  ellipsizeMode='tail' numberOfLines={1}>{message.messages[0].text}</Text>
                                <Text style={{ paddingLeft: 10, marginLeft: 'auto'}}>{Moment(message.messages[0].createdAt).format("M/D h:mm A")}</Text>
                            </View>
                        </View>
                        
                    </TouchableOpacity>
                </View>
            )
        })
        console.log("messagesObjs: "+messageObjs.length)
        return (<ScrollView 
                    refreshControl={
                        <RefreshControl refreshing={this.state.refreshing} onRefresh={this.downloadMessages} />
                    }>{messageObjs}</ScrollView>)
    }
}