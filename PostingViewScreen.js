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
            post: {}
        }
    }

    componentDidMount() {
        this.setState({
            post: this.props.navigation.getParam('post', {})
        })
    }

    render() {
        
        return(
            <Text>{this.state.post.username}</Text>
        )
    }
}