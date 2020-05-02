import React, { Component } from 'react'
import { Modal, Alert, View, Text, TextInput, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity, ActivityIndicator, Picker, RefreshControl } from 'react-native'
import { createStackNavigator, createAppContainer, createBottomTabNavigator } from "react-navigation";
import AsyncStorage from '@react-native-community/async-storage'
import Config from './config'
import { Button } from 'react-native-elements'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';

import { faStar, faIdCard, faUserCircle} from '@fortawesome/free-solid-svg-icons'
import NotificationMowingView from './NotificationMowingView.js'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { getDistance, getPreciseDistance } from 'geolib';

export default class NotificationsScreen extends Component {

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Notifications',
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            jobsList: [],
            user: {},
            refreshing: false,
            width: Math.round(Dimensions.get('window').width),
        }
    }

    async componentDidMount() {
        
        const { navigation } = this.props;
        this.focusListener = navigation.addListener("didFocus", () => {
            this.load("currentUser")
        });


    }

    async downloadPosts() {    
        console.log("setting up server")

        let server = Config.server + "/jobs/userJobsList"
        let body = JSON.stringify(
            {
                data: {
                    jobsList: this.state.user.jobsList
                }
            }
            

        )
        console.log("fetching: "+server)
        try {
            let resp = await fetch(server, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': 'Token ' + this.state.user.token
                },
                body: body
            })
            let data = await resp.json()
            for(i in data) {
                let lat = { latitude: data[i].location.lat, longitude: data[i].location.lng}
                let long = { latitude: this.state.user.location.lat, longitude: this.state.user.location.lng}
                console.log("lat: "+JSON.stringify(lat), "; long: "+JSON.stringify(long))
                let distance = getDistance(lat, long)
                distance = distance / 1609
                data[i].distance = distance.toFixed(2)
            }
            this.setState({
                jobsList: data
            })
            console.log(JSON.stringify(this.state.listings))

        } catch (err) {
            alert(err)
            console.log("error: " + err + "; server: " + server + "; json: " + body)
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
            this.downloadPosts()
            console.log(data)
            return "true"
        } catch (error) {
            console.log("load error: " + error)
            return "false"
        }
    }

    render() {
        let jobs = []

        let bs = []
        let m = []
        let bsR = []
        let mR = []
        let mowing = {hired: [], hiredR: [], worker: [], workerR: []}
        let babysitting = {hired: [], hiredR: [], worker: [], workerR: []}
        let width = this.state.width
        if (this.state.jobsList.length > 0){
            this.state.jobsList.map((post) => {
                console.log("jobslist post: Title: "+post.title)
                var cpr
                if (post.cpr) {
                    cpr = 'CPR'
                }
                let price = parseInt(post.jobSpecs.price, 10)
                if (post.jobSpecs.title == "Babysitting") {
                    /*bs.push(
                        <TouchableOpacity activeOpacity={0.7} key={post._id} onPress={() => this.props.navigation.navigate('View', {post: post})}>
                            <View style={{padding: 10, flex: 1, flexDirection: "row", alignItems: 'stretch', justifyContent: 'space-between', borderBottomColor: '#495867', borderBottomWidth: StyleSheet.hairlineWidth}}>
                                <View style={{width: width*0.2, alignItems: "center"}}>
                                    <Image 
                                        source={{uri: post.user.profileImage}} 
                                        style={{width: width*0.2, height: width*0.2, borderRadius: width*0.3*0.5, marginRight: 5}}
                                    />
                                    <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                                        <FontAwesomeIcon style={{color: '#fe5f55', marginRight: 3 }} size={25} icon={faStar} />
                                        <Text style={{fontSize: 25, color: '#fe5f55'}}>{post.rating}</Text>
                                    </View>
                                </View>
                                <View style={{flex: 1.5, flexDirection: "column", marginLeft: 5, marginRight: 5, alignSelf: 'stretch'}}>
                                    <Text style={{fontSize: 22, color: '#fe5f55'}}>{post.jobSpecs.title}</Text>
                                    <Text style={{fontSize: 20, color: '#fe5f55'}}>{post.user.username}</Text>
                                    <Text style={{fontSize: 17, color: '#495867'}}>{post.user.firstName}</Text>
                                    <Text style={{fontSize: 12, color: '#495867'}}>{post.distance} mi</Text>
                                    <Text style={{fontSize: 12, color: '#495867'}}>{post.jobSpecs.bio}</Text>
                                    
                                </View>
                                <View style={{flex: 0.85, alignItems: 'center', marginLeft: 5}}>
                                    <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{fontSize: 50, color: '#fe5f55'}}>${price}</Text> 
                                    <Text>Per Hour</Text>
                                    <View style={{height: 7}}></View>
                                    <Text style={{fontSize: 25, color: '#fe5f55'}}>{cpr}</Text>
                                    
                                </View>
                            </View>
                        </TouchableOpacity>);*/
                        bs.push(post)
                } else if (post.jobSpecs.title == "Mowing") {
                    var cpr
                    if (post.cpr) {
                        cpr = 'CPR'
                    }
                    let price = parseInt(post.jobSpecs.price, 10)
                    /*m.push(
                        <TouchableOpacity activeOpacity={0.7} key={post._id} onPress={() => this.props.navigation.navigate('Post', {post: post})}>
                    m.push(
                        <TouchableOpacity activeOpacity={0.7} key={post._id} onPress={() => this.props.navigation.navigate('View', {post: post})}>
                            <View style={{padding: 10, flex: 1, flexDirection: "row", alignItems: 'stretch', justifyContent: 'space-between', borderBottomColor: '#495867', borderBottomWidth: StyleSheet.hairlineWidth}}>
                                <View style={{width: width*0.2, alignItems: "center"}}>
                                    <Image 
                                        source={{uri: post.user.profileImage}} 
                                        style={{width: width*0.2, height: width*0.2, borderRadius: width*0.3*0.5, marginRight: 5}}
                                    />
                                    <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                                        <FontAwesomeIcon style={{color: '#fe5f55', marginRight: 3 }} size={25} icon={faStar} />
                                        <Text style={{fontSize: 25, color: '#fe5f55'}}>{post.rating}</Text>
                                    </View>
                                </View>
                                <View style={{flex: 1.5, flexDirection: "column", marginLeft: 5, marginRight: 5, alignSelf: 'stretch'}}>
                                    <Text style={{fontSize: 22, color: '#fe5f55'}}>{post.jobSpecs.title}</Text>
                                    <Text style={{fontSize: 20, color: '#fe5f55'}}>{post.user.username}</Text>
                                    <Text style={{fontSize: 17, color: '#495867'}}>{post.user.firstName}</Text>
                                    <Text style={{fontSize: 12, color: '#495867'}}>{post.distance} mi</Text>
                                    <Text style={{fontSize: 12, color: '#495867'}}>{post.jobSpecs.bio}</Text>
                                    
                                </View>
                                <View style={{flex: 0.85, alignItems: 'center', marginLeft: 5}}>
                                    <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{fontSize: 50, color: '#fe5f55'}}>${price}</Text>
                                    <Text>Per Square FT</Text> 
                                    <View style={{height: 7}}></View>
                                    <Text style={{fontSize: 25, color: '#fe5f55'}}>{cpr}</Text>
                                    
                                </View>
                            </View>
                        </TouchableOpacity>);*/
                    m.push(post)

                }
            })

            m.map((mower) => {
                let hired = mower.hired
                let employer = false
                for (i in hired) {
                    console.log("user id: " + hired[i][2]._id +"; "+this.state.user._id)
                    if (hired[i][2]._id == this.state.user._id) {
                        if (hired[i][1] == true) {
                            //hired
                            mowing.hired.push(<NotificationMowingView post={mower} width={this.state.width} key={mower._id} navigation={this.props.navigation}/>)
                        } else if (hired[i][1] == false) {
                            //hire requested
                            mowing.hiredR.push(<NotificationMowingView post={mower} width={this.state.width} key={mower._id} navigation={this.props.navigation}/>)
                        }
                        employer = true
                    } 
                }
                if (!employer) {
                    //worker
                    for (i in hired) {
                        if (hired[i][1] == true) {
                            //worker hired
                            console.log("worker hired")
                            mowing.worker.push(<NotificationMowingView post={mower} width={this.state.width} key={mower._id} navigation={this.props.navigation}/>)
                        } else if (hired[i][1] == false) {
                            //worker requested 5e4bf93f83c80e12236ccd4f
                            console.log("worker requested")
                            mowing.workerR.push(<NotificationMowingView post={mower} width={this.state.width} key={mower._id} navigation={this.props.navigation}/>)
                        }
                    }
                }
            })

            bs.map((sitter) => {
                let hired = sitter.hired
                let employer = false
                for (i in hired) {
                    if (hired[i][2]._id == this.state.user._id) {
                        if (hired[i][1] == true) {
                            //hired
                            babysitting.hired.push(sitter)
                        } else if (hired[i][1] == false) {
                            //hire requested
                            babysitting.hiredR.push(sitter)
                        }
                        employer = true
                    } 
                }
                if (!employer) {
                    //worker
                    for (i in hired) {
                        if (hired[i][1] == true) {
                            //worker hired
                            babysitting.worker.push(sitter)
                        } else if (hired[i][1] == false) {
                            //worker requested
                            babysitting.workerR.push(sitter)
                        }
                    }
                }
            })

        }

        if (mowing.hired.length > 0) {
            jobs.push(<View style={styles.subHeaderView} key={"hired"}><Text style={styles.subHeaderTitle}>Hired</Text></View>)
            mowing.hired.map((mower) => {
                jobs.push(mower)
            })
        }
        
        if (mowing.hiredR.length > 0) {
            jobs.push(<View style={styles.subHeaderView} key={"hire requested"}><Text style={styles.subHeaderTitle}>Hire Requested</Text></View>)
            mowing.hiredR.map((mower) => {
                jobs.push(mower)
            })
        }
        
        if (mowing.worker.length > 0) {
            jobs.push(<View style={styles.subHeaderView} key={"worker"}><Text style={styles.subHeaderTitle}>Hired You</Text></View>)
            mowing.worker.map((mower) => {
                jobs.push(mower)
            })
        }
        
        if (mowing.workerR.length > 0) {
            jobs.push(<View style={styles.subHeaderView} key={"worker requested"}><Text style={styles.subHeaderTitle}>Requested to Hire You</Text></View>)
            mowing.workerR.map((mower) => {
                jobs.push(mower)
            })
        }
        
        /*if (bs.length > 0) {
            jobs.push(<View style={styles.subHeaderView} key={"babysitters"}><Text style={styles.subHeaderTitle}>Babysitters</Text></View>)
            
            bs.map((babysitter) => {
                console.log("babysitter problem: "+JSON.stringify(babysitter))
                jobs.push(babysitter)
            })
        }*/
        

        return (
            <ScrollView refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.downloadPosts} />}>
                {jobs}
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-around',
        backgroundColor: '#00000040',
        paddingBottom: 100,
        paddingTop: 100
    },
    activityIndicatorWrapper: {
        backgroundColor: '#FFFFFF',
        //height: 900,
        width: 300,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingLeft: 20,
        paddingRight: 20,
    },
    acrivityIndicator: {
        height: 50,
        width: 50
    },
    loadingText: {
        color: "#fe5f55",
        padding: 10,
        fontSize: 18
    },
    subHeaderTitle: {
        color: "#495867",
        
    },
    subHeaderView: {
        padding: 10,
        paddingTop: 20,
        borderBottomColor: "#495867",
        borderBottomWidth: StyleSheet.hairlineWidth,
    }
    
});