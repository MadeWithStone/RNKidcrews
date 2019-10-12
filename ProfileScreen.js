import React, { Component } from 'react'
import { View, Text, TextInput, StyleSheet, ScrollView, Image, Dimensions, TouchableWithoutFeedback, TouchableOpacity } from 'react-native'
import { Button } from 'react-native-elements'
import { createStackNavigator, createAppContainer, createBottomTabNavigator } from "react-navigation";
import AsyncStorage from '@react-native-community/async-storage'
import Config from './config'
//import image from './assets/blank-profile.png'

export default class ProfileScreen extends Component {

    constructor(props) {
        super(props)
        this.state = {
            user: {
                _id: "0",
                username: "",
                firstName: "",
                lastName: "",
                zip: '',
                email: "",
                verified: "false",
                age: '',
                jobsList: [],
                ratings: [],
                password: "",
                address: "",
                Token: "",
                profileImage: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
            },
            jobsList: [

            ],
            posts: [{
                id: 0,
                title: "Lawn Mowing",
                image: { uri: "https://image.shutterstock.com/image-photo/beautiful-water-drop-on-dandelion-260nw-789676552.jpg" }
            },
            {
                id: 1,
                title: "Babysitting",
                image: { uri: "https://studio5.ksl.com/wp-content/uploads/2019/04/babysittingkids-740x494.jpg" }
            },
            {
                id: 2,
                title: "Leaf Blowing",
                image: { uri: "http://blog.hondalawnparts.com/wp-content/uploads/2017/05/Leaf_blowing-tips-HOnda.jpg" }
            }],
            postObjs: {

            },
            pColor: "#fe5f55",
            lColor: "#495867",
            pBorderWidth: 1,
            lBorderWidth: StyleSheet.hairlineWidth,
            pScreen: 0,
            width: Math.round(Dimensions.get('window').width)

        }
        this.load = this.load.bind(this)
        this.downloadPosts = this.downloadPosts.bind(this)
        this.postsView = this.postsView.bind(this)
        this.linkedView = this.linkedView.bind(this)
    }
    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Profile',
            headerRight: (
                <Button title="Edit" onPress={navigation.getParam('edit')} buttonStyle={{ backgroundColor: '#ffffff' }} titleStyle={{ color: '#fe5f55' }} />
            )
        }

    }

    async componentDidMount() {
        const { navigation } = this.props
        navigation.setParams({ edit: () => navigation.navigate('Edit', { user: this.state.user }) })
        this.focusListener = navigation.addListener("didFocus", async () => {
            await this.load("currentUser")
            
            //this.downloadPosts()
        })
    }

    componentWillUnmount() {
        this.focusListener.remove()
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
            //data.profileImage = { uri: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" }
            console.log("image: " + data.profileImage)
            data.zip = String(data.zip)
            if (data.age != null) {
                data.age = String(data.age)
            } 
            
            this.setState({
                user: data
            })
            console.log(data)
            return "true"
        } catch (error) {
            console.log("load error: " + error)
            return "false"
        }
    }

    async downloadPosts() {
        let server = Config.server + "/jobs/userJobsList"
        let body = JSON.stringify({
            data: {
                jobsList: this.state.jobsList
            }

        })
        console.log("fetching: " + this.state.jobsList)
        fetch(server, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Token': 'Token ' + this.state.user.Token
            },
            body: body
        })
            .then((response) => console.log(response))
            /*.then(async (responseJson) => {
                //console.log('list: ' + responseJson)
                this.setState({
                    jobsList: responseJson
                })
            })*/
            .catch((error) => {
                alert("error")
                console.log("error: " + error + "; server: " + server + "; json: " + body)
            })
    }

    postsView(props) {
        let width = this.state.width
        return (
            <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start" }}>
                {
                    props.ps.map((post) => <TouchableOpacity style={{ margin: 2 }} key={post.id}>
                        <View>
                            <Image source={post.image} style={{ height: (width * 0.5) - 34, width: (width * 0.5) - 4 }} />
                            <Text style={{ padding: 5, height: 30, width: 100 + '%', textAlign: "center" }}>{post.title}</Text>
                        </View>
                    </TouchableOpacity>)
                }
            </View>
        )
    }

    linkedView(props) {
        let width = this.state.width
        return (
            <View style={{ flex: 1, flexDirection: "column", alignItems: "flex-start" }}>
                <Text>Linked View</Text>
            </View>
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
        var ps = {}
        ps = this.state.posts
        var pView;
        if (this.state.pScreen == 0) {
            pView = <this.postsView ps={ps} />
        } else if (this.state.pScreen == 1) {
            pView = <this.linkedView />
        }
        return (
            < ScrollView >
                <View style={{ flex: 1, flexDirection: "row", padding: 10 }}>
                    <Image
                        style={{ width: width * 0.3, height: width * 0.3, borderRadius: (width * 0.3) / 2 }}
                        source={{ uri: this.state.user.profileImage }} />
                    <View style={{ flex: 1, flexDirection: "column", padding: 10, justifyContent: 'center', height: width * 0.3 }}>
                        <Text>Username: {this.state.user.username}</Text>
                        <Text>First Name: {this.state.user.firstName}</Text>
                        <Text>Last Name: {this.state.user.lastName}</Text>
                        <Text>Zipcode: {this.state.user.zip}</Text>
                    </View>
                </View>
                <View style={{ flex: 1, padding: 10 }}>
                    <Text>Email: {this.state.user.email}</Text>
                    <Text>Address: {this.state.user.address}</Text>

                </View>
                <View style={{ flex: 1, flexDirection: "row", borderTopColor: "#495867", borderTopWidth: StyleSheet.hairlineWidth }} >
                    <TouchableWithoutFeedback onPress={() => {
                        this.setState({
                            pBorderWidth: 1,
                            lBorderWidth: StyleSheet.hairlineWidth,
                            lColor: "#495867",
                            pColor: "#fe5f55",
                            pScreen: 0,
                        })
                    }}>
                        <View style={styles.postBtn}><Text style={styles.postBtnTxt}>Posts</Text></View>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPress={() => {
                        this.setState({
                            pBorderWidth: StyleSheet.hairlineWidth,
                            lBorderWidth: 1,
                            lColor: "#fe5f55",
                            pColor: "#495867",
                            pScreen: 1,
                        })
                    }}>
                        <View style={styles.linkBtn}><Text style={styles.linkBtnTxt}>Linked People</Text></View>
                    </TouchableWithoutFeedback>
                </View>
                {pView}

            </ScrollView>
        )
    }
}
