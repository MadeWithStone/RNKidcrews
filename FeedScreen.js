import React, { Component } from 'react'
import { Alert, View, Text, TextInput, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity } from 'react-native'
import { createStackNavigator, createAppContainer, createBottomTabNavigator } from "react-navigation";
import { AsyncStorage } from '@react-native-community/async-storage'
import Config from './config'
import ProfileScreen from './ProfileScreen';
import EditProfileScreen from './EditProfileScreen'
import PostViewScreen from './PostingViewScreen'
import CreatePostScreen from './CreatePostScreen'
import { Button } from 'react-native-elements'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'

import { faStar, faIdCard, faUserCircle} from '@fortawesome/free-solid-svg-icons'

class FeedScreen extends Component {

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Listings',
            headerRight: (
                <Button title="Filter" onPress={() => Alert.alert(
                    "Filters",
                    "Apply filters to refine the listings",
                    [
                        {text: 'Price'},
                        {text: 'Rating'},
                        {text: 'Distance'},
                        {text: 'Job'},
                        {text: "Cancel"}
                    ]
                )}
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
            listings: [{
                _id: 0,
                img: "https://dhuh3lqp0wlh3.cloudfront.net/7c/95ceb08b9511e7a0adfd737ef850d9/sitter-miranda-flerx-lexington-f4014404.jpg",
                username: "melissa999",
                name: "Melissa",
                distance: 0.5,
                bio: "I have been babysitting for 4 years and have a number of returning clients. I am very good with all ages of children from 3 - 10.",
                cpr: true,
                price: 15,
                zip: 20016,
                rating: 4.5
            },
            {
                _id: 1,
                img: "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcR9ZigRPiV4tEa7qIaEIh-hsABx_0quCy1Bm34Mb31ldiPKDrmY",
                username: "danny123",
                name: "Danny",
                distance: 0.6,
                bio: "Been mowing 4 years.",
                cpr: false,
                price: 8,
                zip: 20009,
                rating: 5.0
            },
            {
                _id: 2,
                img: "https://www.wikihow.com/images/f/ff/Draw-a-Cute-Cartoon-Person-Step-14.jpg",
                username: "andy555",
                name: "Andy",
                distance: 0.7,
                bio: "Been babysitting 4 years.",
                cpr: true,
                price: 13,
                zip: 20015,
                rating: 4.8
            },
            {
                _id: 3,
                img: "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcRERzRycAuBSpObFve8pmw00F-86_NwkDHtGL02g7pzUobeTQxV",
                username: "bossyMcFly",
                name: "Bob",
                distance: 0.3,
                bio: "I own my own mower",
                cpr: true,
                price: 10,
                zip: 20002,
                rating: 4.9
            },
            {
                _id: 4,
                img: "http://clipartshare.com/wp-content/uploads/2019/01/Clown-Big-Eyes-Cartoon-Person-232x300.png",
                username: "marty543",
                name: "Marty",
                distance: 0.1,
                bio: "I have a bright red mower.",
                cpr: true,
                price: 7,
                zip: 20019,
                rating: 1.0
            }]
        }
    }

    render() {
        let width = this.state.width
        let listings = []
        let l = this.state.listings
        l.map((post) => {
            console.log('post')
            var cpr
            if (post.cpr) {
                cpr = 'CPR'
            } 
            listings.push(
            <TouchableOpacity activeOpacity={0.7} key={post._id} onPress={() => this.props.navigation.navigate('Post', {post: post})}>
                <View style={{padding: 10, flex: 1, flexDirection: "row", alignItems: 'stretch', justifyContent: 'space-between', borderBottomColor: '#495867', borderBottomWidth: StyleSheet.hairlineWidth}}>
                    <View style={{width: width*0.2, alignItems: "center"}}>
                        <Image 
                            source={{uri: post.img}} 
                            style={{width: width*0.2, height: width*0.2, borderRadius: width*0.3*0.5, marginRight: 5}}
                        />
                        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                            <FontAwesomeIcon style={{color: '#fe5f55', marginRight: 3 }} size={25} icon={faStar} />
                            <Text style={{fontSize: 25, color: '#fe5f55'}}>{post.rating}</Text>
                        </View>
                    </View>
                    <View style={{flex: 1.5, flexDirection: "column", marginLeft: 5, marginRight: 5, alignSelf: 'stretch'}}>
                        <Text style={{fontSize: 25, color: '#fe5f55'}}>{post.username}</Text>
                        <Text style={{fontSize: 20, color: '#495867'}}>{post.name}</Text>
                        <Text style={{fontSize: 15, color: '#495867'}}>{post.distance} mi</Text>
                        <Text style={{fontSize: 15, color: '#495867'}}>{post.bio}</Text>
                        
                    </View>
                    <View style={{flex: 0.85, alignItems: 'center', marginLeft: 5}}>
                        <Text style={{fontSize: 50, color: '#fe5f55'}}>${post.price}</Text> 
                        <Text style={{fontSize: 25, color: '#fe5f55'}}>per hour</Text>
                        <View style={{height: 7}}></View>
                        <Text style={{fontSize: 25, color: '#fe5f55'}}>{cpr}</Text>
                        
                    </View>
                </View>
            </TouchableOpacity>);
        })
        return (
            <ScrollView>
                {listings}
                
            </ScrollView>
        )
    }
}


const feed = createStackNavigator({
     Listings: FeedScreen,
     Post: PostViewScreen,
     Create: CreatePostScreen
}, { defaultNavigationOptions: Config.navBarStyles })
const profile = createStackNavigator({
    Profile: ProfileScreen,
    Edit: EditProfileScreen
}, { defaultNavigationOptions: Config.navBarStyles })

const TabNavigator = createBottomTabNavigator(
    {
        Listings: feed,
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