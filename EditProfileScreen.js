import React, { Component } from 'react'
import { View, Text, TextInput, StyleSheet, ScrollView, Image, Dimensions, TouchableWithoutFeedback, TouchableOpacity } from 'react-native'
import { Button } from 'react-native-elements'
import { createStackNavigator, createAppContainer, createBottomTabNavigator } from "react-navigation";
import AsyncStorage from '@react-native-community/async-storage'
import Config from './config'
import ImagePicker from 'react-native-image-picker'
import RNHeicConverter from 'react-native-heic-converter'
//import AWS from 'aws-sdk'

export default class EditProfileScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            user: props.navigation.getParam('user', {}),
            width: Math.round(Dimensions.get('window').width),
            linkedPeople: [],
            profileImage: [],
            token: ''
        }
        this.linkedPeopleEle = this.linkedPeopleEle.bind(this)
        this.userImage = this.userImage.bind(this)

    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Edit Profile',
            headerRight: (
                <Button title="Save" onPress={navigation.getParam('Save')} buttonStyle={{ backgroundColor: '#ffffff' }} titleStyle={{ color: '#fe5f55' }} />
            )
        }
    }

    async load(key) {
        try {
            let dataJ = await AsyncStorage.getItem(key)
            let data = JSON.parse(dataJ)
            this.setState({
                token: data.Token
            })
            this.signIn()
            return "true"
        } catch (error) {
            console.log("load error: " + error)
            return "false"
        }
    }



    async componentDidMount() {
        let user = this.state.user
        user.linkedPeople = [{
            id: 0,
            firstName: "Lisa",
            lastName: "Stone",
            relationship: "Parent",
            username: "lisa.stone"
        }]
        await this.setState({
            user
        })
        await this.setState({
            linkedPeople: this.linkedPeopleEle()
        })
        this.load('currentUser')
        console.log('linked: ' + this.state.linkedPeople)

    }

    async linkedPeopleEle() {
        let width = this.state.width
        let list = []
        try {
            await this.state.user.linkedPeople.map((user) => {
                list.push(
                    < TouchableOpacity key={user.id} >
                        <Image style={{ flex: 1, height: width * 0.2, width: width * 0.2, borderRadius: width * 0.1 }} source={this.state.user.profileImage} />
                    </TouchableOpacity >
                )
            })
            return list
        } catch (error) {
            console.log(error)
            return true
        }
    }

    async userImage() {
        const options = {
            title: 'Select Profile Image',
            color: 'blue',
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
        };

        /**
         * The first arg is the options object for customization (it can also be null or omitted for default options),
         * The second arg is the callback which sends object: response (more info in the API Reference)
         */
        ImagePicker.showImagePicker(options, async (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                var source = { uri: response.uri };
                let fileName = response.fileName
                if (Platform.OS === 'ios' && (fileName.endsWith('.heic') || fileName.endsWith('.HEIC'))) {
                    fileName = `${fileName.split(".")[0]}.JPG`;
                }
                source = { uri: response.uri, fileName };

                // You can also display the image using data:
                // const source = { uri: 'data:image/jpeg;base64,' + response.data };
                var image = this.state.user
                image.profileImage = source
                console.log('response data', response.data)

                this.setState({
                    user: image,
                    userImage: response
                });

                /*var s3 = new AWS.S3({ accessKeyId: 'AKIAZQ2OPAJ25DM23QK4', secretAccessKey: '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', region: 'USEast' })
                var params = { Bucket: 'kidcrews', Key: 'user_images/', ContentType: 'image/jpeg' }
                s3.getSignedUrl('putObject', params, function (err, url) {
                    console.log('Your generated pre-signed ULR is', url)
                })*/

                let server = Config.server + "/api/users/image"
                //let body = this.createFormData(this.state.userImage, {})
                let body = {
                    'photo': this.state.user.profileImage
                }
                console.log(body)
                console.log("fetching")
                fetch(server, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'image/jpg',
                        'Token': 'Token ' + this.state.token
                    },
                    body: body
                })
                    .then((response) => response.text())
                    .then(async (responseJSON) => {
                        console.log(responseJSON)

                    })
                    .catch((error) => {
                        alert("error")
                        console.log("error: " + error + "; server: " + server + "; json: " + body)
                    })
            }
        });
    }

    createFormData(photo, body) {
        const data = new FormData();

        data.append("photo", {
            name: photo.fileName,
            type: photo.type,
            uri:
                Platform.OS === "android" ? photo.uri : photo.uri.replace("file://", "")
        });

        Object.keys(body).forEach(key => {
            data.append(key, body[key]);
        });

        return data;
    };

    render() {

        const styles = StyleSheet.create({
            textI: {
                borderBottomColor: '#495867',
                borderBottomWidth: StyleSheet.hairlineWidth,
                paddingTop: 10,
                paddingBottom: 10,
            },
            textT: {
                paddingTop: 10,
                paddingBottom: 10 + StyleSheet.hairlineWidth
            }
        })

        let width = this.state.width
        let right = (width - 120)
        return (

            <ScrollView>
                <View style={{ flex: 1, alignItems: 'center', padding: 10, borderBottomColor: "#495867", borderBottomWidth: StyleSheet.hairlineWidth }}>
                    <Image source={this.state.user.profileImage} style={{ width: width * 0.3, height: width * 0.3, borderRadius: (width * 0.3) / 2, marginBottom: 10 }} />
                    <TouchableOpacity onPress={this.userImage} style={{}}><Text style={{ color: "#fe5f55" }}>Change Profile Photo</Text></TouchableOpacity>
                </View>
                <View style={{ flex: 1, flexDirection: "row", padding: 5, borderBottomColor: "#495867", alignItems: 'stretch', justifyContent: 'center' }}>
                    <View style={{ marginLeft: 5, marginRight: 5, width: 80 }}>
                        <Text style={styles.textT}>Username</Text>
                        <Text style={styles.textT}>First Name</Text>
                        <Text style={styles.textT}>Last Name</Text>
                        <Text style={styles.textT}>Zipcode</Text>
                        <Text style={styles.textT}>Email</Text>
                        <Text style={styles.textT}>Age</Text>
                        <Text style={styles.textT}>Address</Text>
                    </View>
                    <View style={{ marginLeft: 5, marginRight: 5, width: right }}>
                        <TextInput placeholder="Username" style={styles.textI} autoCapitalize="none" />
                        <TextInput placeholder="First Name" value={this.state.user.firstName} style={styles.textI} />
                        <TextInput placeholder="Last Name" style={styles.textI} />
                        <TextInput placeholder="Zipcode" style={styles.textI} />
                        <TextInput placeholder="Email" style={styles.textI} autoCapitalize="none" />
                        <TextInput placeholder="Age" style={styles.textI} />
                        <TextInput placeholder="Address" style={styles.textI} multiline={true} />
                    </View>
                </View>
                <View style={{ flex: 1, flexDirection: "row", paddingLeft: 5, paddingRight: 5, paddingBottom: 5, borderBottomColor: "#495867", borderBottomWidth: StyleSheet.hairlineWidth, alignItems: 'stretch', justifyContent: 'center' }}>
                    <View style={{ marginLeft: 5, marginRight: 5, width: 80 }}>
                        <Text style={styles.textT}>Bio</Text>
                    </View>
                    <View style={{ marginLeft: 5, marginRight: 5, width: right }}>
                        <TextInput placeholder="Bio" style={[styles.textI, { borderBottomWidth: 0 }]} multiline={true} />
                    </View>
                </View>
                <View>
                </View>
            </ScrollView>
        )
    }
}