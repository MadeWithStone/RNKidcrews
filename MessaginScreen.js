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
import { GiftedChat } from 'react-native-gifted-chat';

export default class MessaginScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: navigation.getParam('title', 'Messages')
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            user: {},
            messages: [],
            message: {},
            width: Dimensions.get('window').width
        }
        this.onSend = this.onSend.bind(this)
    }

    async componentDidMount() {
        var message = await this.props.navigation.getParam('message', {})
        var user = await this.props.navigation.getParam('user', {})
        this.setState({
            message: message,
            user: user,
          messages: [
            {
              _id: 1,
              text: 'Hello developer',
              createdAt: new Date(Date.UTC(2016, 7, 30, 17, 20, 0)),
              user: {
                _id: 2,
                name: 'React Native',
                avatar: 'https://facebook.github.io/react/img/logo_og.png',
              },
            },
          ],
        });
        
      }

      
      onSend(messages = []) {
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
        return(<GiftedChat 
        messages={this.state.message.messages}
        onSend={this.onSend}
        user={{
            _id: this.state.user._id
        }}/>)
    }
}