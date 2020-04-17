import React, { Component } from 'react'
import { Alert, View, Text, TextInput, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity, Modal, ActivityIndicator, Picker, KeyboardAvoidingView, Switch  } from 'react-native'
import { createStackNavigator, createAppContainer, createBottomTabNavigator } from "react-navigation";
import AsyncStorage from '@react-native-community/async-storage'
import Config from './config'
import ProfileScreen from './ProfileScreen';
import EditProfileScreen from './EditProfileScreen'
import PostViewScreen from './PostingViewScreen'
import CreatePostScreen from './CreatePostScreen'
import GooglePlacesInput from './GoogleAddress'
import { Button, CheckBox } from 'react-native-elements'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';

import { faStar, faIdCard, faUserCircle, faBell, faCircle as fasCircle} from '@fortawesome/free-solid-svg-icons'
import {faCircle as farCircle } from '@fortawesome/free-regular-svg-icons'
import Filter from './FilterModel'
import { ConsoleLogger } from '@aws-amplify/core';
import NotificationsScreen from './NotificationsScreen';
import NotificationsViewScreen from './NotificationsPostScreen';
import { getDistance, getPreciseDistance } from 'geolib';
import Job from './Job.js'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

class FeedScreen extends Component {

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Listings',
            headerRight: (
                <Button title="Filter" onPress={
                    navigation.getParam('filter')
                }
                buttonStyle={{ backgroundColor: '#ffffff' }} 
                titleStyle={{ color: '#fe5f55' }}/>
            ),
            headerLeft: (
                <Button title="Create" onPress={() => navigation.navigate('Create')} 
                buttonStyle={{ backgroundColor: '#ffffff' }} 
                titleStyle={{ color: '#fe5f55' }}/>
            )
        }
    }

    constructor (props) {
        super(props)
        this.state = {
            width: Math.round(Dimensions.get('window').width),
            user: {},
            listings: [],
            filtering: false,
            loading: false,
            text: "",
            job: "BS",
            marked: {},
            multi: 1,
            jobSort: null,
            area: null,
            filters: {},
            switch: true,
            maxDistance: null
        }
        this.downloadPosts = this.downloadPosts.bind(this)
        this.startFiltering = this.startFiltering.bind(this)
        this.changeSort = this.changeSort.bind(this)
        this.loadFilters = this.loadFilters.bind(this)
        this.switcher = this.switcher.bind(this)
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

    changeSort() {
        
        if (this.state.job == "M") {
            
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

            
        } else if (this.state.job == "BS") {
            
                return  (
                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <Text style={{paddingRight: 3}}>Area: (in square feet) </Text> 
                        <TextInput 
                            style={{flex: 0.8}}
                            placeholder="price"
                            multiline={false}
                            onChangeText={(multi) => (this.setState({multi}))}

                            autoCompleteType="cc-number"
                            textContentType="telephoneNumber"
                            autoCapitalize='none'
                            keyboardType={'numeric'}
                        />
                    </View>
                )
            
            
            
        }
    }

    async save(key) {
        let data = {}
        data['job'] = this.state.job
        data['marked'] = this.state.marked
        data['hours'] = this.state.hours
        data['switch'] = this.state.switch
        data['maxDistance'] = this.state.maxDistance
        try {
            await AsyncStorage.setItem(key, JSON.stringify(data))
        } catch (error) {
            console.log("save error: " + error)
        }
    }

    startFiltering() {
        this.setState({filtering: true})
        
    }
    switcher() {
        let s = !this.state.switch
        this.setState({switch: s})
    }

    async componentDidMount() {
        this.changeSort()
        this.props.navigation.setParams({ filter: this.startFiltering })
        await this.load("currentUser")

        this.downloadPosts()
        const { navigation } = this.props;
        this.focusListener = navigation.addListener("didFocus", () => {
            this.downloadPosts()
            
            
        });
    }

    async loadFilters() {
        try {
            let dataJ = await AsyncStorage.getItem("filters")
            let data = JSON.parse(dataJ)
            var marked = []
            var dates = false
            
            if (data.marked != null) {
                marked = data.marked
                dates = true
            }
            console.log("sort by dates: "+dates)
            this.setState({
                job: data.job,
                hours: data.hours,
                marked: data.marked,
                filters: {
                    data: {
                        dates: dates,
                        dSent: Object.keys(marked),
                        job: data.job,
                        switch: data.switch,
                        maxDistance: data.maxDistance
                    }
                },
                switch: data.switch,
                maxDistance: data.maxDistance,
            })
            return "true"
        } catch (error) {
            console.log("load error: " + error)
            return "false"
        }
    }

    async downloadPosts() {    
        console.log("setting up server")
        await this.loadFilters()
        var jobsList = []
        let server = Config.server + "/jobs/get"
        let body = JSON.stringify(
            this.state.filters

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
            for (i in data) {
                let newJob =  new Job()
                let lat = { latitude: data[i].location.lat, longitude: data[i].location.lng}
                let long = { latitude: this.state.user.location.lat, longitude: this.state.user.location.lng}
                console.log("lat: "+JSON.stringify(lat), "; long: "+JSON.stringify(long))
                let distance = getDistance(lat, long)
                distance = distance / 1609
                data[i].distance = distance.toFixed(2)
                newJob.props = data[i]
                console.log("Job Class: "+newJob.data())
                var maxDistance = this.state.filters.data.maxDistance
                if (maxDistance == '') {
                    maxDistance = 10
                    console.log("max distance is null")
                }
                console.log("max distance is: "+maxDistance)
                if (data[i].distance < maxDistance) {
                    jobsList.push(newJob)
                }
            }
            console.log("filtering: "+this.state.filters.data.switch)
            if (this.state.filters.data.switch) {
                console.log("filtering")
                jobsList = jobsList.sort(this.compare)
            }
            this.setState({
                listings: jobsList
            })
            console.log(JSON.stringify(this.state.listings))

        } catch (err) {
            alert(err)
            console.log("error: " + err + "; server: " + server + "; json: " + body)
        }
                
    }

    compare( a, b ) {
        if ( a.data().distance > b.data().distance ){
          console.log("-1")
          return 1;
        }
        if ( a.data().distance < b.data().distance ){
          console.log("1")
          return -1;
        }
        return 0;
      }

    

    render() {
        let width = this.state.width
        let listings = []
        let l = this.state.listings
        let filtering = JSON.parse(JSON.stringify(this.state.filtering))

        
        console.log("ldmap: "+JSON.stringify(l))
        console.log("filtering: "+filtering)
        l.map((post) => {
            console.log('post')
            var cpr
            if (post.data().cpr) {
                cpr = 'CPR'
            }
            let p = parseInt(post.data().jobSpecs.price, 10)
            const price = p * parseInt(this.state.multi, 10)
            console.log("profile image: "+JSON.stringify(post))
            listings.push(
            <TouchableOpacity activeOpacity={0.7} key={post.data()._id} onPress={() => this.props.navigation.navigate('Post', {post: post})}>
                <View style={{padding: 10, flex: 1, flexDirection: "row", alignItems: 'stretch', justifyContent: 'space-between', borderBottomColor: '#495867', borderBottomWidth: StyleSheet.hairlineWidth}}>
                        <View style={{width: width*0.2, alignItems: "center"}}>
                            <Image 
                                source={{uri: post.data().user.profileImage,
                                        cache: 'reload'}} 
                                style={{width: width*0.2, height: width*0.2, borderRadius: width*0.3*0.5, marginRight: 5}}
                            />
                            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                                <FontAwesomeIcon style={{color: '#fe5f55', marginRight: 3 }} size={25} icon={faStar} />
                                <Text style={{fontSize: 25, color: '#fe5f55'}}>{post.data().rating}</Text>
                            </View>
                        </View>
                        <View style={{flex: 1.5, flexDirection: "column", marginLeft: 5, marginRight: 5, alignSelf: 'stretch'}}>
                            <Text style={{fontSize: 22, color: '#fe5f55'}}>{post.data().jobSpecs.title}</Text>
                            <Text style={{fontSize: 20, color: '#fe5f55'}}>{post.data().user.username}</Text>
                            <Text style={{fontSize: 17, color: '#495867'}}>{post.data().user.firstName}</Text>
                            <Text style={{fontSize: 12, color: '#495867'}}>{post.data().distance} mi</Text>
                            <Text style={{fontSize: 12, color: '#495867'}}>{post.data().jobSpecs.bio}</Text>
                            
                        </View>
                        
                        <View style={{flex: 0.85, alignItems: 'center', marginLeft: 5}}>
                            <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{fontSize: 50, color: '#fe5f55'}}>${price}</Text> 
                            <View style={{height: 7}}></View>
                            <Text style={{fontSize: 25, color: '#fe5f55'}}>{cpr}</Text>
                            
                        </View>
                    
                </View>
            </TouchableOpacity>);
        })
        let date = new Date()
        let markedDates = JSON.parse(JSON.stringify(this.state.marked))
        
        let sort = <this.changeSort />
        return (
            <KeyboardAvoidingView>
            <Modal
            transparent={true}
            animationType={'none'}
            visible={filtering}>
                
                <View style={styles.modalBackground}>
                
                    <View style={styles.activityIndicatorWrapper}>
                    <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
                    <View>
                    <ActivityIndicator
                        style={styles.acrivityIndicator}
                        animating={this.state.loading} />
                    <Picker 
                        selectedValue={this.state.job}
                        style={{width: 100+'%', height: 200}}
                        onValueChange={(itemValue, itemIndex) => {
                            this.setState({job: ""})
                            if (itemValue == "BS") {
                                this.setState({job: "BS"})
                            } else if (itemValue == "M") {
                                this.setState({job: "M"})
                            }
                            console.log("job: "+this.state.job)
                        }   
                    }>
                    <Picker.Item label="Babysitting" value="M" />
                    <Picker.Item label="Mowing" value="BS" />
                    </ Picker>
                    <View style={{flexDirection: "row", justifyContent: 'space-between', alignItems: 'center'}}>
                        <Text>Sort By Distance</Text>
                        <Switch
                            trackColor={{ false: "#495867", true: "#fe5f55"}}
                            thumbColor={"#fff"}
                            ios_backgroundColor="#495867"
                            onValueChange={this.switcher}
                            value={this.state.switch}
                            stlye={{alignSelf: 'center'}}
                        />
                    </View>
                    <View style={{flexDirection: "row", justifyContent: 'space-between', paddingTop: 10, paddingBottom: 10}}>
                        <Text>Max Distance: (Miles) </Text> 
                        <TextInput 
                        placeholder="miles"
                        style={{textAlign: 'right'}}
                        value={this.state.maxDistance}
                        onChangeText={(maxDistance) => this.setState({maxDistance: maxDistance})}/>
                    </View>
                    <View>
                        
                        <Calendar
                            minDate={date}
                            onDayPress={(day) => {
                                let d = markedDates
                                if (d[day.dateString] == null) {
                                    d[day.dateString] = {customStyles: {
                                        container: {
                                            backgroundColor: '#fe5f55'
                                        }, 
                                        text: {
                                            color: 'white'
                                        }
                                    }}
                                } else {
                                    delete d[day.dateString]
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
                        />
                        {() => {
                            
                        }}
                        
                    </View>
                    
                    <View>
                        {sort}
                    </View>
                    <Button titleStyle={{color: "#fe5f55"}} buttonStyle={{backgroundColor: "#fff"}} title="Save" onPress={async () => {
                        await this.save("filters")
                        this.downloadPosts()
                        this.setState({filtering: false})
                    }}/>
                    <Button titleStyle={{color: "#2089dc"}} buttonStyle={{backgroundColor: "#fff"}} title="Cancel" onPress={() => this.setState({filtering: false})}/>
                    </View>
                    </KeyboardAwareScrollView>
                    </View>
                    
                    
                </View>
                
            </Modal>
            <ScrollView>
                {listings}
                
            </ScrollView>
            </KeyboardAvoidingView>
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
        paddingTop: 100,
    },
    activityIndicatorWrapper: {
        backgroundColor: '#FFFFFF',
        //height: 900,
        width: 100+'%',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        //justifyContent: 'space-around',
        paddingLeft: 10,
        paddingRight: 10, 
    },
    acrivityIndicator: {
        height: 50,
        width: 50
    },
    loadingText: {
        color: "#fe5f55",
        padding: 10,
        fontSize: 18
    }
    
});

const feed = createStackNavigator({
     Listings: FeedScreen,
     Post: PostViewScreen,
     Create: CreatePostScreen
}, { defaultNavigationOptions: Config.navBarStyles })
const profile = createStackNavigator({
    Profile: ProfileScreen,
    Edit: EditProfileScreen,
    Address: GooglePlacesInput,
}, { defaultNavigationOptions: Config.navBarStyles })

const notifications = createStackNavigator({
    Notes: NotificationsScreen,
    View: NotificationsViewScreen,
}, { defaultNavigationOptions: Config.navBarStyles })

const TabNavigator = createBottomTabNavigator(
    {
        Listings: feed,
        Notifications: notifications,
        Profile: profile
    },
    {
      defaultNavigationOptions: ({ navigation }) => ({
        tabBarIcon: ({ focused, horizontal, tintColor }) => {
          const { routeName } = navigation.state;
          let icon;
          if (routeName === 'Listings') {
            icon = <FontAwesomeIcon icon={faIdCard} size={25} color={tintColor} />;
            // Sometimes we want to add badges to some icons.
            // You can check the implementation below.
          } else if (routeName === 'Profile') {
            icon = <FontAwesomeIcon icon={faUserCircle} size={25} color={tintColor} />;
          } else if (routeName === 'Notifications') {
            icon = <FontAwesomeIcon icon={faBell} size={25} color={tintColor} />;
          }
  
          // You can return any component that you like here!
          return icon
        },
      }),
      tabBarOptions: {
        activeTintColor: 'tomato',
        inactiveTintColor: 'gray',
      },
    },
    {
        tabBarOptions: {
            activeTintColor: "#fe5f55"
        }
    }
)

TabNavigator.navigationOptions = ({ navigation }) => {
    const { routes, index } = navigation.state
    const navigationOptions = {}

    if (routes[index].routeName === "Listings") {
        navigationOptions.title = "Listings"
    }

    return navigationOptions
}

export default createAppContainer(TabNavigator)