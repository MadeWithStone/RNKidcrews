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

export default class NotificationsViewScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: navigation.getParam('title', 'Notifications')
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            user: {},
            jobs: [],
            chain: {},
            width: Dimensions.get('window').width
        }
        this.onUpdate = this.onUpdate.bind(this)
    }

    async componentDidMount() {
        var chain = await this.props.navigation.getParam('chain', {})
        var user = await this.props.navigation.getParam('user', {})
        this.setState({
            chain: chain,
            user: user,
        })
      }

      
      onUpdate(action) {
        fetch(Config.server + "/jobs/message", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': 'Token '+this.state.user.token
            },
            body: JSON.stringify({
                message: {
                    employer: this.state.message.users[1]._id,
                    employee: this.state.message.users[0]._id,
                    sender: this.state.user._id,
                    message: messages[0]
                }
            })
        }).then((response) => response.json())
        .then((resJSON) => {
            let message = this.state.message
            message.messages = resJSON
            console.log("messages: "+JSON.stringify(message.messages))
            this.setState({message: message})
        })
      }

    render() {
        let chain = this.state.chain
        var user = {}
        let width = this.state.width - 32
        if (chain.pos == 1) {
            user = chain.worker
        } else if (chain.pos == 0) {
            user = chain.employer
        }
        console.log("chain: "+JSON.stringify(chain))
        var yardSize = 'S'
        if (chain.yardSize == 0){
            yardSize = 'S'
        } else if (chain.yardSize == 1) {
            yardSize = 'M'
        } else if (chain.yardSize == 2) {
            yardSize = 'L'
        }
        //var price = chain.price[chain.yardSize]
        console.log(chain.price)
        return(
        <KeyboardAwareScrollView>
            <View  style={{ width: 100+'%', justifyContent: "center", paddingTop: 16}}>
                <View style={{flexDirection: 'row', width: width - 96}}>
                    <Image source={{uri: user.profileImage,
                                    cache: 'reload'}} 
                            style={{height: 80, width: 80, borderRadius: 40, marginLeft: 17.5, marginRight: 16}}/>
                    <View style={{justifyContent: 'center'}}>
                        <Text>{user.firstName + " " + user.lastName}</Text>
                        <Text style={{marginTop: 10}}>{user.address}</Text>
                    </View>
                    <View style={{justifyContent: 'center'}}>
                        <Text>{yardSize} ${price}</Text>
                        <Text style={{marginTop: 10}}>{user.address}</Text>
                    </View>
                    
                </View>
            </View>
        </KeyboardAwareScrollView>)
    }
}