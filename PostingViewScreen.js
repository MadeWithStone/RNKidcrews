import React, { Component } from 'react'
import { Alert, View, Text, TextInput, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity } from 'react-native'
import { createStackNavigator, createAppContainer, createBottomTabNavigator } from "react-navigation";
import { AsyncStorage } from '@react-native-community/async-storage'
import Config from './config'
import { Button } from 'react-native-elements'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'

import { faStar, faIdCard, faUserCircle} from '@fortawesome/free-solid-svg-icons'

export default class PostingViewScreen extends Component {

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Listing'
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            post: {},
            width: Math.round(Dimensions.get('window').width)
        }
    }

    componentDidMount() {
        this.setState({
            post: this.props.navigation.getParam('post', {})
        })
    }

    hire() {
        Alert.alert(
            "Hire Requested",
            "your hiring request has been sent"
        )
    }

    render() {

        let width = this.state.width

        const styles = StyleSheet.create({
            postBtn: {
                width: width * 0.5,
                paddingTop: 10,
                paddingBottom: 10,
                alignContent: 'center',
                justifyContent: "center",
                borderBottomColor: this.state.pColor,
                borderBottomWidth: this.state.pBorderWidth
            },
            linkBtn: {
                width: width * 0.5,
                paddingTop: 10,
                paddingBottom: 10,
                alignContent: 'center',
                justifyContent: "center",
                borderBottomColor: this.state.lColor,
                borderBottomWidth: this.state.lBorderWidth
            },
            postBtnTxt: {
                textAlign: 'center',
                height: 30,
                alignContent: 'center',
                justifyContent: 'center',
                color: this.state.pColor
            },
            linkBtnTxt: {
                textAlign: 'center',
                height: 30,
                alignContent: 'center',
                justifyContent: 'center',
                color: this.state.lColor
            }
        })

        const post = this.state.post
        var cpr
        if (post.cpr) {
            cpr = 'CPR'
        }
        
        return(
            <ScrollView>
                <View style={{ flex: 1, flexDirection: "row", padding: 10 }}>
                    <Image
                        style={{ width: width * 0.3, height: width * 0.3, borderRadius: (width * 0.3) / 2 }}
                        source={{ uri: this.state.post.img }} />
                    <View style={{ flex: 1, flexDirection: "column", padding: 10, justifyContent: 'center', height: width * 0.3 }}>
                        <Text>Username: {this.state.post.username}</Text>
                        <Text>First Name: {this.state.post.name}</Text>
                        <Text>Zipcode: {this.state.post.zip}</Text>
                        <Text>Distance: {this.state.post.distance} mi</Text>
                        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                            <FontAwesomeIcon style={{color: '#fe5f55', marginRight: 3 }} size={25} icon={faStar} />
                            <Text style={{fontSize: 25, color: '#fe5f55'}}>{post.rating}</Text>
                        </View>
                    </View>
                    <View style={{flex: 0.85, alignItems: 'center', marginLeft: 5}}>
                        <Text style={{fontSize: 60, color: '#fe5f55'}}>${post.price}</Text> 
                        <Text style={{fontSize: 25, color: '#fe5f55'}}>per hour</Text>
                        <View style={{height: 10}}></View>
                        <Text style={{fontSize: 25, color: '#fe5f55'}}>{cpr}</Text>
                    </View>
                </View>
                <View style={{margin: 10}}>
                    <Text style={{alignSelf: "center", color: "#fe5f55", fontSize: 20}}>Available</Text>
                    <View style={{height: 10}} />
                    <Button onPress={this.hire} title={"Hire"} buttonStyle={Config.buttonStyle} />
                </View>
            </ScrollView>
        )
    }
}