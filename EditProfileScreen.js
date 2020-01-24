import React, { Component } from 'react'
import { View, Text, TextInput, StyleSheet, ScrollView, Image, Dimensions, TouchableWithoutFeedback, TouchableOpacity} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Button } from 'react-native-elements'
import { createStackNavigator, createAppContainer, createBottomTabNavigator } from "react-navigation";
import AsyncStorage from '@react-native-community/async-storage'
import Config from './config'
import ImagePicker from 'react-native-image-picker'
import RNHeicConverter from 'react-native-heic-converter'
import Loader from './loader'
import RNGooglePlaces from 'react-native-google-places';
//import AWS from 'aws-sdk'

export default class EditProfileScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            user: props.navigation.getParam('user', {}),
            width: Math.round(Dimensions.get('window').width),
            linkedPeople: [],
            profileImage: [],
            token: '',
            loading: false,
            loadingText: "",
        }
        this.linkedPeopleEle = this.linkedPeopleEle.bind(this)
        this.userImage = this.userImage.bind(this)
        this.getUserData = this.getUserData.bind(this)
        this.save = this.save.bind(this)
        this.saveUserData = this.saveUserData.bind(this)
        this.openSearchModal = this.openSearchModal.bind(this)
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
            return "true"
        } catch (error) {
            console.log("load error: " + error)
            return "false"
        }
    }



    async componentDidMount() {
        this.props.navigation.setParams({ Save: this.saveUserData })
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
        console.log('image: ' + this.state.user.profileImage)
        //this.getUserData()
    }

    openSearchModal() {
        RNGooglePlaces.openAutocompleteModal()
        .then((place) => {
            console.log(place);
            oUser = this.state.user
            oUser.address = place.address
            this.setState({
                user: oUser
            })
            // place represents user's selection from the
            // suggestions and it is a simplified Google Place object.
        })
        .catch(error => console.log(error.message));  // error is a Javascript Error object
      }

    async linkedPeopleEle() {
        let width = this.state.width
        let list = []
        try {
            await this.state.user.linkedPeople.map((user) => {
                list.push(
                    < TouchableOpacity key={user.id} >
                        <Image style={{ flex: 1, height: width * 0.2, width: width * 0.2, borderRadius: width * 0.1 }} source={{ uri: this.state.user.profileImage }} />
                    </TouchableOpacity >
                )
            })
            return list
        } catch (error) {
            console.log(error)
            return true
        }
    }

    async saveUserData() {
        this.setState({
            loading: true,
            loadingText: "Uploading New Data"
        })

        let server = Config.server + "/api/users/update"
        //let body = this.createFormData(this.state.userImage, {})
        let oUser = this.state.user
        console.log("setting up")
        const user = {
            _id: oUser._id,
            firstName: oUser.firstName,
            lastName: oUser.lastName,
            zip: parseInt(oUser.zip, 10),
            email: oUser.email,
        }
        console.log("bio")
        if (oUser.bio != null) {
            user['bio'] = oUser.bio
        }
        console.log("age")
        if (oUser.age != null) {
            user['age'] = parseInt(oUser.age, 10)
        }
        console.log("address")
        if (oUser.address != null) {
            user['address'] = oUser.address
        }
        console.log("username")
        if (oUser.username != null) {
            console.log("in username")
            user['username'] = oUser.username
        }
        const body = JSON.stringify({
            user: user
        })


        console.log(body)
        console.log("saving user data")
        fetch(server, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                //'authorization': 'Token ' + this.state.user.token
            },
            body: body
        })
            .then((response) => response.status)
            .then(async (responseStatus) => {
                if (responseStatus == 200) {
                    this.getUserData
                }
                this.setState({
                    loading: false
                })


            })
            .catch((error) => {
                alert("error")
                console.log("error: " + error + "; server: " + server + "; json: " + body)
            })

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

                fileName = this.state.user._id + '_pi.jpg'
                source = { uri: response.uri, fileName };

                // You can also display the image using data:
                // const source = { uri: 'data:image/jpeg;base64,' + response.data };
                var image = this.state.user
                image.profileImage = response.uri

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
                const body = new FormData()
                let name = fileName

                body.append(
                    'file', {
                    uri: this.state.user.profileImage,
                    type: "image/" + response.fileName,
                    name: name,
                })
                body.append(
                    '_id', this.state.user._id
                )

                console.log(body)
                console.log("fetching")
                fetch(server, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Token': 'Token ' + this.state.user.token
                    },
                    body: body
                })
                    .then((response) => response.json())
                    .then(async (responseJSON) => {
                        console.log(responseJSON)
                        var data = responseJSON
                        console.log('responseJSON: ' + data)
                        this.getUserData()

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

    async getUserData() {
        if (this.state.user._id != null) {
            this.setState({
                loading: true,
                loadingText: "Saving Data"
            })

            let server = Config.server + "/api/users/current"
            let body = JSON.stringify({
                id: this.state.user._id
            })

            let headers = {
                'Content-Type': 'application/json',
                "authorization": "Token " + this.state.user.token
            }
            fetch(server, {
                method: 'POST',
                headers: headers,
                body: body
            })
                .then((response) => response.json())
                .then(async (responseJson) => {
                    var user = responseJson.user
                    user.password = this.state.user.password
                    await this.save(user, 'currentUser')
                    console.log('user: ' + JSON.stringify(user))
                    //await this.save(user, 'currentUser')
                    this.setState({
                        loading: false
                    })

                    this.props.navigation.goBack()

                })
                .catch((error) => {
                    alert("error")
                    console.log("error: " + error + "; server: " + server + "; json: " + body + "; headers: " + headers)
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

    render() {

        const styles = StyleSheet.create({
            textI: {
                borderBottomColor: '#495867',
                borderBottomWidth: StyleSheet.hairlineWidth,
                paddingTop: 10,
                paddingBottom: 10,
                color: '#495867'
            },
            textT: {
                paddingTop: 10,
                paddingBottom: 10 + StyleSheet.hairlineWidth
            }
        })

        let width = this.state.width
        let right = (width - 120)
        console.log('image: ' + this.state.user.profileImage)
        var addressView;
        if (this.state.user.address != null) {
            addressView = (<Text style={styles.textI}

                /*placeholder="Address"
                onChangeText={(add) => { let user = this.state.user; user.address = add; this.setState({ user }) }}
                value={this.state.user.address}
                style={styles.textI}
                multiline={true}
                autoCompleteType='street-address'
                textContentType='fullStreetAddress'*/
            >{this.state.user.address}</Text>)
        } else {
            addressView = (<Text style={[styles.textI, {color: "#C7C7CD"}]}

                /*placeholder="Address"
                onChangeText={(add) => { let user = this.state.user; user.address = add; this.setState({ user }) }}
                value={this.state.user.address}
                style={styles.textI}
                multiline={true}
                autoCompleteType='street-address'
                textContentType='fullStreetAddress'*/
            >Address</Text>)
        }
        return (
            <View>
            <Loader loading={this.state.loading} text={this.state.loadingText} />
            
            <KeyboardAwareScrollView
                style={{ backgroundColor: '#fffffff' }}
                resetScrollToCoords={{ x: 0, y: 0 }}
                contentContainerStyle={styles.container}
                scrollEnabled={true}
            >
                <View style={{ flex: 1, alignItems: 'center', padding: 10, borderBottomColor: "#495867", borderBottomWidth: StyleSheet.hairlineWidth }}>
                    <Image source={{ uri: this.state.user.profileImage }} style={{ width: width * 0.3, height: width * 0.3, borderRadius: (width * 0.3) / 2, marginBottom: 10 }} />
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
                        <TextInput
                            placeholder="Username"
                            onChangeText={(username) => { let user = this.state.user; user.username = username; this.setState({ user }) }}
                            value={this.state.user.username}
                            style={styles.textI}
                            autoCapitalize="none"
                            autoCompleteType='username'
                            textContentType='username'
                        />
                        <TextInput
                            placeholder="First Name"
                            onChangeText={(fName) => { let user = this.state.user; user.firstName = fName; this.setState({ user }) }}
                            value={this.state.user.firstName}
                            style={styles.textI}
                            autoCompleteType='name'
                            textContentType='givenName'
                        />
                        <TextInput
                            placeholder="Last Name"
                            onChangeText={(lName) => { let user = this.state.user; user.lastName = lName; this.setState({ user }) }}
                            value={this.state.user.lastName}
                            style={styles.textI}
                            autoCompleteType='name'
                            textContentType='familyName'
                        />

                        <TextInput
                            placeholder="Zipcode"
                            onChangeText={(zip) => { let user = this.state.user; user.zip = zip; this.setState({ user }) }}
                            value={String(this.state.user.zip)}
                            style={styles.textI}
                            placeholder={"Zipcode"}
                            autoCompleteType="postal-code"
                            textContentType="postalCode"
                            autoCapitalize='none'
                            keyboardType='number-pad'
                        />

                        <TextInput
                            placeholder="Email"
                            onChangeText={(email) => { let user = this.state.user; user.email = email; this.setState({ user }) }}
                            value={this.state.user.email}
                            style={styles.textI}
                            autoCapitalize="none"
                            autoCompleteType='email'
                            textContentType='emailAddress'
                        />
                        <TextInput
                            placeholder="Age"
                            onChangeText={(age) => { let user = this.state.user; user.age = age; this.setState({ user }) }}
                            value={String(this.state.user.age)}
                            style={styles.textI}
                            autoCapitalize='none'
                            keyboardType='number-pad'
                        />
                        <TouchableOpacity onPress={() => this.openSearchModal()}>
                            {
                                addressView
                            }
                        
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ flex: 1, flexDirection: "row", paddingLeft: 5, paddingRight: 5, paddingBottom: 5, borderBottomColor: "#495867", borderBottomWidth: StyleSheet.hairlineWidth, alignItems: 'stretch', justifyContent: 'center' }}>
                    <View style={{ marginLeft: 5, marginRight: 5, width: 80 }}>
                        <Text style={styles.textT}>Bio</Text>
                    </View>
                    <View style={{ marginLeft: 5, marginRight: 5, width: right }}>
                        <TextInput
                            placeholder="Bio"
                            style={[styles.textI, { borderBottomWidth: 0 }]}
                            multiline={true}
                            onChangeText={(bio) => { let user = this.state.user; user.bio = bio; this.setState({ user }) }}
                        />
                    </View>
                </View>
                <View>
                </View>
            </KeyboardAwareScrollView>
            </View>
        )
    }
}