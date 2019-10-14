import React, { Component } from 'react'
import { View, Text, Button, TextInput, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity } from 'react-native'
import { createStackNavigator, createAppContainer, createBottomTabNavigator } from "react-navigation";
import { AsyncStorage } from '@react-native-community/async-storage'
import Config from './config'

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
            <View style={{ flex: 1, flexDirection: "row", padding: 10 }}>
                <Image
                    style={{ width: width * 0.3, height: width * 0.3, borderRadius: (width * 0.3) / 2 }}
                    source={{ uri: this.state.post.img }} />
                <View style={{ flex: 1, flexDirection: "column", padding: 10, justifyContent: 'center', height: width * 0.3 }}>
                    <Text>Username: {this.state.post.username}</Text>
                    <Text>First Name: {this.state.post.name}</Text>
                    <Text>Zipcode: {this.state.post.zip}</Text>
                </View>
                <View style={{flex: 0.85, alignItems: 'center', marginLeft: 5}}>
                    <Text style={{fontSize: 60, color: '#fe5f55'}}>${post.price}</Text> 
                    <Text style={{fontSize: 25, color: '#fe5f55'}}>per hour</Text>
                    <View style={{height: 10}}></View>
                    <Text style={{fontSize: 25, color: '#fe5f55'}}>{cpr}</Text>
                </View>
            </View>
        )
    }
}