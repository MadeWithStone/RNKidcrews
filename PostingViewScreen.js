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

export default class PostingViewScreen extends Component {

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Listing'
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            post: {user: {}, jobSpecs: {}},
            width: Math.round(Dimensions.get('window').width),
            hiring: false,
            text: "Hire ",
            marked: {},
            hours: 1,
            jobSort: null,
            area: null,
            loading: false,
            img: {uri: ""},
            user: {},
            multi: 1,
            yardSize: 1,
        }
        this.hire = this.hire.bind(this)
        this.changeSort = this.changeSort.bind(this)
        this.chat = this.chat.bind(this)
    }

    async componentDidMount() {
        await this.load("currentUser")
        var post = await this.props.navigation.getParam('post', {})
        post = post.data()
        console.log("passed post: "+post)
        let oMark = {};
        let lat = { latitude: post.location.lat, longitude: post.location.lng}
       let long = { latitude: this.state.user.location.lat, longitude: this.state.user.location.lng}
        let distance = getDistance(lat, long)
        distance = distance / 1609
        post.distance = distance.toFixed(2)
        let specs = post.jobSpecs
        console.log("specs: "+JSON.stringify(specs))
        for (d in specs.available){
            oMark[specs.available[d]] = {customStyles: {
                container: {
                    backgroundColor: '#fff'
                }, 
                text: {
                    color: '#fe5f55'
                }
            }}
        }
        this.setState({
            post: post,
            img: {uri: specs.img},
            marked: oMark,
        })
        console.log("post: "+JSON.stringify(specs.img))
        /*this.setState({
            text: "Hire "+this.state.post.user.username
        })*/
    }

    async load(key) {
        try {
            let dataJ = await AsyncStorage.getItem(key)
            let data = JSON.parse(dataJ)
            //data.profileImage = { uri: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" }
            console.log("image: " + data.profileImage)
            
            
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

    hire() {
        if (this.state.post.user._id == this.state.user._id) {
            alert("You cant hire yourself.")
        } else {
            this.setState({
                hiring: true
            })
        }
        
        
    }

    requestHire() {
        let dates = []
        let marked = {}
        
        for (m in this.state.marked) {
            console.log("m: "+m)
            if (this.state.marked[m].customStyles.text.color == "white") {
                dates.push(m)
            }
        }
        console.log("hire dates: "+JSON.stringify(dates));
        let data = {
            _id: this.state.post._id,
            userId: this.state.post.user._id,
            worker: "false",
            employerId: this.state.user._id,
            dates: dates,
            size: this.state.yardSize
        }

        let server = Config.server + "/jobs/requestHired"
        let body = JSON.stringify({
            data: data

        })
        fetch(server, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                //'authentication': 'Token ' + this.state.user.token
            },
            body: body
        })
            .then((response) => response.status)
            .then(async (responseStatues) => {
                console.log('res: ' + responseStatues)
                await this.setState({
                    hiring: false
                })
                
                Alert.alert('Hire Request Sent')
                
            })
            
            .catch((error) => {
                
                alert("error")
                console.log("error: " + error + "; server: " + server + "; json: " + body)
            })
    }

    chat() {
        fetch(Config.server + "/jobs/message", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': 'Token '+this.state.user.token
            },
            body: JSON.stringify({
                message: {
                    employer: this.state.user._id,
                    employee: this.state.post.user._id,
                    sender: this.state.user._id,
                    message: "Hello World! 2"
                }
            })
        })
    }

    changeSort() {
        console.log('change sorting')
        if (this.state.post.jobSpecs.title == "Babysitting") {
            console.log("babysitting")
                return (
                    <View style={{flex: 1, flexDirection: 'row', alignItems: "center"}}>
                        <Text style={{flex: 0.2}}>Hours: </Text> 
                        <Picker 
                            selectedValue={this.state.multi}
                            style={{flex: 0.7}}
                            onValueChange={(itemValue, itemIndex) => {
                                this.setState({multi: itemValue})
                            }   
                        }>
                        <Picker.Item label="1" value="1" />
                        <Picker.Item label="2" value="2" />
                        <Picker.Item label="3" value="3" />
                        <Picker.Item label="4" value="4" />
                        <Picker.Item label="5" value="5" />
                        <Picker.Item label="6" value="6" />
                        <Picker.Item label="7" value="7" />
                        <Picker.Item label="8" value="8" />
                        </ Picker>
                    </View>
                )

            
        } else if (this.state.post.jobSpecs.title == "Mowing") {
            console.log("mowing")
                return  (
                    <View>
                        <Text style={{textAlign: 'center', padding: 10}}>Yard Size</Text>
                        <SegmentedControlTab
                            values={["Small", "Medium", "Large"]}
                            activeTabStyle={{backgroundColor: '#fe5f55', borderColor: '#fe5f55'}}
                            tabStyle={{borderColor: '#fe5f55'}}
                            tabTextStyle={{color: '#fe5f55'}}
                            selectedIndex={this.state.yardSize}
                            onTabPress={(index) => this.setState({yardSize: index})}
                        />
                    </View>
                )
            
            
            
        } else {
            console.log("null")
            return null
        }
    }

    render() {

        let width = this.state.width

        

        const post = this.state.post
        var cpr
        if (post.cpr) {
            cpr = 'CPR'
        }

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
            },
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
            title: {
                color: "#495867",
                padding: 10,
                fontSize: 28,
                alignSelf: 'center'
            }
        })

        let date = new Date()
        let markedDates = JSON.parse(JSON.stringify(this.state.marked))
        console.log("pre marked: "+JSON.stringify(markedDates))
        let sort = <this.changeSort />
        console.log("price set: "+JSON.stringify(post))
        var price = [0,0,0]
        if (post.jobSpecs.price != null) {
            price = post.jobSpecs.price
        }
        
        return(
            <View>
                <ScrollView>
                    <View style={{ flex: 1, flexDirection: "row", padding: 10 }}>
                        <View style={{flexDirection: 'column'}}>
                            <Image
                                style={{ width: width * 0.3, height: width * 0.3, borderRadius: (width * 0.3) / 2 }}
                                source={{uri: this.state.post.user.profileImage}} />
                            <View style={{flexDirection: 'row', justifyContent: 'center', paddingTop: 10}}>
                                <FontAwesomeIcon style={{color: '#fe5f55', marginRight: 3 }} size={25} icon={faStar} />
                                <Text style={{fontSize: 25, color: '#fe5f55'}}>{post.rating}</Text>
                            </View>
                        </View>
                        <View style={{ flex: 1, flexDirection: "column", padding: 10, justifyContent: 'center', height: width * 0.3 }}>
                            <Text>{this.state.post.user.username}</Text>
                            <Text>{this.state.post.user.firstName}</Text>
                            <Text>{this.state.post.user.zip}</Text>
                            <Text>{this.state.post.distance} mi</Text>
                            <Text style={{fontSize: 15, color: '#495867'}}>{post.jobSpecs.bio}</Text>
                            
                        </View>
                        <View style={{flex: 0.85, alignItems: 'center', marginLeft: 5}}>
                            <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{fontSize: 60, color: '#fe5f55'}}>S ${price[0]}</Text> 
                            <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{fontSize: 60, color: '#fe5f55'}}>M ${price[1]}</Text> 
                            <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{fontSize: 60, color: '#fe5f55'}}>L ${price[2]}</Text> 
                            <Text style={{fontSize: 25, color: '#fe5f55'}}>per hour</Text>
                            <View style={{height: 10}}></View>
                            <Text style={{fontSize: 25, color: '#fe5f55'}}>{cpr}</Text>
                        </View>
                    </View>
                    
                    <View style={{margin: 10}}>
                        <Text style={{alignSelf: "center", color: "#fe5f55", fontSize: 20}}>Available</Text>
                        <View style={{height: 10}} />
                        <Button onPress={() => this.props.navigation.navigate('InitialMsg', {post: this.state.post})} title={"Send Message"} buttonStyle={Config.buttonStyle} />
                        <View style={{height:10}} />
                        <Button onPress={this.hire} title={"Hire"} buttonStyle={Config.buttonStyle} />
                    </View>
                </ScrollView>
                <Modal
            transparent={true}
            animationType={'none'}
            visible={this.state.hiring}>
                
                <View style={styles.modalBackground}>
                
                    <View style={styles.activityIndicatorWrapper}>
                    <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.title}>{this.state.text}</Text>
                    <ActivityIndicator
                        style={styles.acrivityIndicator}
                        animating={this.state.loading} />
                    
                    <View>
                        
                        <Calendar
                            minDate={date}
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
                            markedDates={markedDates}
                            markingType={'custom'}
                            //disabledByDefault={true}
                        />
                        {() => {
                            
                        }}
                        
                    </View>
                    <View>
                        {sort}
                    </View>
                    <Button titleStyle={{color: "#fe5f55"}} buttonStyle={{backgroundColor: "#fff"}} title="Send Hire Request" onPress={async () => {
                        
                        this.requestHire()
                        this.setState({hiring: false})
                    }}/>
                    <Button titleStyle={{color: "#2089dc"}} buttonStyle={{backgroundColor: "#fff"}} title="Cancel" onPress={() => this.setState({hiring: false})}/>
                    </KeyboardAwareScrollView>
                    </View>
                    
                    
                </View>
                
            </Modal>
            </View>

        )
    }
}

