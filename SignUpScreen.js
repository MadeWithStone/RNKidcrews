import React, { Component } from 'react'
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native'
import { Button } from 'react-native-elements'
import { createStackNavigator, createAppContainer } from "react-navigation";
import AsyncStorage from '@react-native-community/async-storage'
import Config from './config'

export default class SignUpScreen extends Component {
    static navigationOptions = {
        title: 'Sign Up'
    }

    constructor(props) {
        super(props)
        this.state = {
            email: '',
            fName: '',
            lName: '',
            zip: '',
            pass: "",
            btn: "Sign Up",
            response: ""
        }
        this.signUp = this.signUp.bind(this)
    }

    signUp() {
        if (this.state.email != '' && this.state.pass != '' && this.state.fName != '' && this.state.lName != '' && this.state.zip != '') {

            let server = Config.server + "/api/users/"
            let body = JSON.stringify({
                user: {
                    email: this.state.email,
                    password: this.state.pass,
                    firstName: this.state.fName,
                    lastName: this.state.lName,
                    zip: this.state.zip
                }

            })
            console.log("fetching")
            fetch(server, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: body
            })
                .then((response) => response.status)
                .then(async (responseStatus) => {
                    if (responseStatus == 200) {
                        alert('You must verify your email through the email sent to you to continue.')
                    } else {
                        console.log("status: " + responseStatus)
                    }

                })
                .catch((error) => {
                    alert("error")
                    console.log("error: " + error + "; server: " + server + "; json: " + body)
                })
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
                        onChangeText={(fName) => this.setState({ fName })}
                        value={this.state.fName}
                        placeholder={"First Name"}
                        autoCompleteType="name"
                        textContentType="givenName"
                        autoCapitalize='words'
                    />
                    <TextInput
                        style={styles.input}
                        onChangeText={(lName) => this.setState({ lName })}
                        value={this.state.lName}
                        placeholder={"Last Name"}
                        autoCompleteType="name"
                        textContentType="familyName"
                        autoCapitalize='words'
                    />
                    <TextInput
                        style={styles.input}
                        onChangeText={(zip) => this.setState({ zip })}
                        value={this.state.zip}
                        placeholder={"Zipcode"}
                        autoCompleteType="postal-code"
                        textContentType="postalCode"
                        autoCapitalize='none'
                    />
                    <TextInput
                        style={styles.input}
                        onChangeText={(email) => this.setState({ email })}
                        value={this.state.email}
                        placeholder={"Email"}
                        autoCompleteType="email"
                        textContentType="emailAddress"
                        autoCapitalize='none'
                    />

                    <TextInput
                        style={styles.input}
                        onChangeText={(pass) => this.setState({ pass })}
                        placeholder={"Password"}
                        value={this.state.pass}
                        textContentType='password'
                        secureTextEntry={true}
                    />

                    <Button
                        buttonStyle={Config.buttonStyle}
                        title={this.state.btn}
                        onPress={this.signUp}
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