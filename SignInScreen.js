import React, { Component } from 'react'
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native'
import { Button } from 'react-native-elements'
import { createStackNavigator, createAppContainer } from "react-navigation";
import AsyncStorage from '@react-native-community/async-storage'
import Config from './config'

export default class SignInScreen extends Component {

    static navigationOptions = {
        title: 'Sign In'
    }

    constructor(props) {
        super(props)
        this.state = {
            email: '',
            emailP: "Email",
            pass: "",
            passP: "Password",
            btn: "Sign In",
            response: ""
        }
        this.signIn = this.signIn.bind(this)
        this.load = this.load.bind(this)
    }

    componentDidMount() {
        this.load('currentUser')
    }

    async signIn() {

        console.log("email: " + this.state.email)

    

        if (this.state.email != null && this.state.pass != null) {

            let server = Config.server + "/api/users/login"
            let body = {
                user: {
                    email: this.state.email,
                    password: this.state.pass
                }

            }
            let fetchStuff = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            }
            console.log("fetching")
            fetch(server, fetchStuff)
                .then((response) => response.json())
                .then(async (responseJson) => {
                    var user = responseJson.user
                    if (user.verified != "true") {
                        alert("You must verify your email first")
                    } else {
                        user.password = this.state.pass
                        await this.save(user, 'currentUser')
                        console.log("user img: "+user.profileImage)
                        this.props.navigation.navigate('Feed')
                    }
                })
                .catch((error) => {
                    alert("error")
                    console.log("error: " + error + "; server: " + server + "; json: " + JSON.stringify(fetchStuff))
                })
        }

    }

    async save(data, key) {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(data))
        } catch (error) {
            console.log("save error: " + error)
        }
    }

    async load(key) {
        try {
            let dataJ = await AsyncStorage.getItem(key)
            let data = JSON.parse(dataJ)
            this.setState({
                email: data.email,
                pass: data.password
            })
            this.signIn()
            return "true"
        } catch (error) {
            console.log("load error: " + error)
            return "false"
        }
    }

    render() {
        const { navigation } = this.props
        const name = navigation.getParam('name', 'NO-NAME')
        const otherParam = navigation.getParam('otherParam', 'some default value')
        return (
            <ScrollView>
                <View style={styles.container}>
                    <TextInput
                        style={styles.input}
                        onChangeText={(email) => this.setState({ email })}
                        value={this.state.email}
                        placeholder={this.state.emailP}
                        autoCompleteType={"email"}
                        textContentType={"emailAddress"}
                        autoCapitalize='none'
                    />

                    <TextInput
                        style={styles.input}
                        onChangeText={(pass) => this.setState({ pass })}
                        placeholder={this.state.passP}
                        value={this.state.pass}
                        textContentType='password'
                        secureTextEntry={true}
                    />

                    <Button
                        buttonStyle={Config.buttonStyle}
                        title={this.state.btn}
                        onPress={this.signIn}
                    />

                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        margin: 10,
        flex: 1
    },
    input: {
        height: 40,
        width: 100 + '%',
        color: '#495867',
        borderColor: '#495867',
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 10,
        padding: 5,
        marginBottom: 10,
    },
    btn: {
        height: 40,
        width: 100 + '%',
        color: '#FE5F55',
        borderColor: '#fe5f55',
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 10,
    }
})