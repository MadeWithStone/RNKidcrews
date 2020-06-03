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

export default class NotificationsScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: "Notifications"
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            user: {},
            notifications: [],
            width: Dimensions.get('window').width,
            refreshing: false,
        }
        this.downloadNotifications = this.downloadNotifications.bind(this)
        this.load = this.load.bind(this)
    }

    async componentDidMount() {
        await this.load("currentUser")
        const { navigation } = this.props;
        this.focusListener = navigation.addListener("didFocus", () => {
            this.downloadNotifications()
            
            
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
            this.downloadNotifications()
            console.log("getting messagis 1")
            return "true"
        } catch (error) {
            console.log("load error: " + error)
            return "false"
        }
    }

    async downloadNotifications() {
        this.setState({refreshing: true})
        console.log("getting messages")
        var notifications = {}
        
        console.log("fetching")
        await fetch(Config.server+"/jobs/getNotifications", {
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
            notifications = resJson.hireChains
            
            let parsedNotifications = []
            for (i in notifications) {
                if (notifications[i] != null) {
                    console.log("user: "+notifications[i].firstName+"; "+notifications[i]._id)
                    if (notifications[i].worker._id == this.state.user._id) {
                        notifications[i].pos = 0
                        console.log("current user is worker should show as employer")
                    } else {
                        notifications[i].pos = 1
                        console.log("current user is employer show as worker")
                    }
                    parsedNotifications.push(notifications[i])
                }
            }
            console.log("messages: "+JSON.stringify(parsedNotifications))
            this.setState({notifications: parsedNotifications})
        })
        this.setState({refreshing: false})
        
        

    }

    render() {
        let notifications = this.state.notifications
        var notificationObjs = []
        let width = this.state.width - 35 - 30 - 16
        notifications.map((notification) => {
            let user = {}
            let title = ""
            console.log("current notification: "+JSON.stringify(notification))
            if (notification.pos == 1) {
                user = notification.worker
                title = "Worker"
            } else {
                user = notification.employer
                title = "Employer"
            }
            notificationObjs.push(
                <View key={notification._id} style={{height: 65, width: 100+'%', justifyContent: "center"}}>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('View', {chain: notification, user: this.state.user, title: user.firstName + " " + user.lastName})} style={{flexDirection: 'row'}}>
                        <Image source={{uri: user.profileImage,
                                        cache: 'reload'}} 
                                style={{height: 30, width: 30, borderRadius: 15, marginLeft: 17.5, marginRight: 16}}/>
                        <View>
                            <Text>{user.firstName + " " + user.lastName}</Text>
                            <Text>{title}</Text>
                        </View>
                        
                    </TouchableOpacity>
                </View>
            )
        })
        console.log("messagesObjs: "+notificationObjs.length)
        return (<ScrollView 
                    refreshControl={
                        <RefreshControl refreshing={this.state.refreshing} onRefresh={this.downloadNotifications} />
                    }>{notificationObjs}</ScrollView>)
    }
}