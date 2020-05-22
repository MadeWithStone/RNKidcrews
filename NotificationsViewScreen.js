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
        let width = this.state.width - 17.5
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
        var price = 0
        var rating = 4.5
        console.log(JSON.stringify(chain))
        return(
        <KeyboardAwareScrollView style={{flex: 1}}>
            <View  style={{paddingTop: 16, alignContent: "center"}}>
                <View style={{flexDirection: 'row', width: width - 96}}>
                    <Image source={{uri: user.profileImage,
                                    cache: 'reload'}} 
                            style={{height: 80, width: 80, borderRadius: 40, marginLeft: 17.5, marginRight: 16}}/>
                    <View style={{justifyContent: 'center', width: width - 136}}>
                        <Text>{user.firstName + " " + user.lastName}</Text>
                        <Text style={{marginTop: 10}}>{user.address}</Text>
                    </View>
                    <View style={{justifyContent: 'center', marginRight: 17.5, width: 40}}>
                        <Text>{yardSize} ${price}</Text>
                        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                            <FontAwesomeIcon style={{color: '#fe5f55', marginRight: 3 }} size={25} icon={faStar} />
                            <Text style={{fontSize: 25, color: '#fe5f55'}}>{rating}</Text>
                        </View>
                    </View>
                    
                </View>
                <Calendar
                style={{alignSelf: 'center', width: 100+"%"}}
                    onDayPress={(day) => {
                        let d = markedDates
                        if (d[day.dateString] != null && d[day.dateString].customStyles.text.color == '#fe5f55') {
                            d[day.dateString] = {customStyles: {
                                container: {
                                    backgroundColor: '#fe5f55'
                                }, 
                                text: {
                                    color: 'white'
                                }
                            }}
                        } else if (d[day.dateString] != null && d[day.dateString].customStyles.text.color == 'white'){
                            d[day.dateString] = {customStyles: {
                                container: {
                                    backgroundColor: '#fff'
                                }, 
                                text: {
                                    color: '#fe5f55'
                                }
                            }}
                        }
                        
                        this.setState({
                            marked: d
                        })
                        console.log("dates: "+JSON.stringify(markedDates))
                    }}

                    theme={{
                        backgroundColor: '#ffffff',
                        calendarBackground: '#ffffff',
                        todayTextColor: '#fe5f55',
                        arrowColor: '#fe5f55'
                    }}
                    //showWeekNumbers={true}
                    //markedDates={markedDates}
                    markingType={'custom'}
                    //disabledByDefault={true}
                />
                <View style={{ marginRight: 17.5, marginLeft: 17.5, flex: 1}}>
                    <View style={{flexDirection: "row"}}>
                        <Text style={{marginRight: 16, fontSize: 20, color: "#fe5f55"}}>25</Text>
                        <Text numberOfLines={2}>Lisa would like to hire you to mow on May 25 for a small yard.</Text>
                    </View>
                    <View style={{flexDirection: "row", justifyContent: "space-around", width: width}}>
                        <TouchableOpacity><Text>Accept</Text></TouchableOpacity>
                        <TouchableOpacity><Text>Decline</Text></TouchableOpacity>
                    </View>
                </View>
            </View>

        </KeyboardAwareScrollView>)
    }
}