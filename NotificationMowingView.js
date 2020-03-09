import React, { Component } from 'react'
import { Modal, Alert, View, Text, TextInput, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity, ActivityIndicator, Picker } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'

import { faStar, faIdCard, faUserCircle} from '@fortawesome/free-solid-svg-icons'

export default class NotificationMowingView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            post: props.post,
            width: props.width
        }
    }

    render() {
        let post = this.state.post
        var cpr
        if (post.cpr) {
            cpr = 'CPR'
        }
        let price = parseInt(post.jobSpecs.price, 10)
        let width = this.state.width
        return (
            <TouchableOpacity activeOpacity={0.7} key={post._id} onPress={() => this.props.navigation.navigate('Post', {post: post})}>
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
            </TouchableOpacity>
        )
    }
}