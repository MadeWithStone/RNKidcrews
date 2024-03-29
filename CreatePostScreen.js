import React, { Component } from 'react'
import { Alert, View, Text, TextInput, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity, Picker } from 'react-native'
import { createStackNavigator, createAppContainer, createBottomTabNavigator } from "react-navigation";
import AsyncStorage from '@react-native-community/async-storage'
import Config from './config'
import { Button } from 'react-native-elements'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import ImagePicker from 'react-native-image-picker';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
import Loader from './loader'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'


export default class CreatePostScreen extends Component {

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'New Listing',
            headerRight: (
                <Button title="Post" onPress={navigation.getParam('Post')}
                buttonStyle={{ backgroundColor: '#ffffff' }} 
                titleStyle={{ color: '#fe5f55' }}/>
            )
        }
    }


    constructor(props) {
        super(props)
        this.state = {
            job: "M",
            cpr: {style: styles.unchecked, value: false},
            image: null,
            width: Math.round(Dimensions.get('window').width),
            height: 0,
            bio: "",
            sPrice: 0,
            mPrice: 0,
            lPrice: 0,
            marked: {},
            priceTitle: "Price: (per hour)",
            user: {},
            imgName: "",
            loading: false,
            loadingText: "Uploading Data"
        }
        this.chooseImage = this.chooseImage.bind(this)
        this.postJob = this.postJob.bind(this)
        this.load = this.load.bind(this)
    }

    async componentDidMount() {
        this.props.navigation.setParams({ Post: this.postJob })
        await this.load("currentUser")
        let alertText = "You must update the following information in order to create a listing: "
        let showAlert = false
        if (this.state.user.address == null) {
            alertText = alertText + "\n Address"
            showAlert = true
        } if (this.state.user.profileImage == null) {
            alertText = alertText + "\n Profile Image"
            showAlert = true
        } if (this.state.user.age == null) {
            alertText = alertText + "\n Age"
            showAlert = true
        } 
        if (showAlert) {
            Alert.alert(
                "Information is Required",
                alertText,
                [
                { text: "OK", onPress: () => this.props.navigation.goBack()  }
                ],
                { cancelable: false }
            );
        }
    }

    async postJob() {
        let cont = true
        let alertText = "You must update the following profile information in order to create a listing: "
        let showAlert = false
        if (this.state.user.address == null) {
            alertText = alertText + "\n Address"
            showAlert = true
        } if (this.state.user.profileImage == null) {
            alertText = alertText + "\n Profile Image"
            showAlert = true
        } 
        if (showAlert) {
            cont = false
            await Alert.alert(
                "Information is Required",
                alertText,
                [
                { text: "OK", onPress: () => {this.props.navigation.goBack(); cont = false} }
                ],
                { cancelable: false }
            );
        }
        const arr = Object.keys(this.state.marked)
        let alertText2 = "You must update the following fields need to be updated:"
        let showAlert2 = false
        if (this.state.sPrice <= 0 || this.state.mPrice <= 0 || this.state.lPrice <= 0) {
            alertText = alertText + "\n One price is invalid"
            showAlert = true
        } if (this.state.bio.length < 10) {
            alertText = alertText + "\n Bio is not long enough"
            showAlert = true
        } if (arr.length < 1) {
            alertText = alertText + "\n You must add at least one available date"
            showAlert = true
        } 
        
        if (showAlert) {
            cont = false
            await Alert.alert(
                "Information is Required",
                alertText,
                [
                { text: "OK", onPress: () =>   cont = false}
                ],
                { cancelable: false }
            );
        }
        if (cont) {
        this.setState({
            loading: true,
            loadingText: "Uploading Data"
        })
        var job = ''
        if (this.state.job == 'BS') {
            job = "Babysitting"
        } else if (this.state.job == 'M') {
            job = "Mowing"
        }

        
        console.log("user: "+this.state.user)

        let date = new Date()
        console.log(date)
        var day = date.getDate()
        if (day < 10) {
            day = 0+""+day
            day = parseInt(day, 10)
        }
        var month = date.getMonth() + 1
        if (month < 10) {
            month = 0+""+month
            month = parseInt(month, 10)
        }
        let d = date.getFullYear()+""+month+""+day
        let ds = parseInt(d, 10)
        console.log("day: "+ds)
        var source = { uri: this.state.image };
        let fileName = this.state.imgName
        let post = {
            _id: this.state.user._id,
            dateUp: ds,
            ratings: [],
            jobSpecs: {
                title: job,
                bio: this.state.bio,
                cpr: this.state.cpr.value,
                price: [parseFloat(this.state.sPrice), parseFloat(this.state.mPrice), parseFloat(this.state.lPrice)],
                available: arr,
            }
        }
        if (this.state.image != null) {
            console.log('image: '+this.state.image)

            fileName = job+"_"+this.state.user._id + '.jpg'
            source = { uri: this.state.image, fileName };

            let server = Config.server + "/jobs/image"
            const body = new FormData()
            let name = fileName

            body.append(
                'file', {
                uri: this.state.image,
                type: "image/" + this.state.imgName,
                name: name,
            })
            body.append(
                '_id', this.state.user._id
            )

            console.log(body)
            console.log("fetching")
            await fetch(server, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'authorization': 'Token ' + this.state.user.token
                },
                body: body
            })
                .then((response) => response.json())
                .then(async (responseJSON) => {
                    console.log(responseJSON)
                    var data = responseJSON
                    console.log('responseJSON: ' + data)
                    post.jobSpecs.img = data.url

                })
                .catch((error) => {
                    alert("error")
                    console.log("error: " + error + "; server: " + server + "; json: " + body)
                })
        }

        this.setState({
            loading: true,
            loadingText: "Posting"
        })
        

        

        let server = Config.server + "/jobs/create"
        let body = JSON.stringify({
            job: post

        })
        console.log("fetching")
        fetch(server, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': 'Token ' + this.state.user.Token
            },
            body: body
        })
            .then((response) => response.status)
            .then(async (responseStatues) => {
                console.log("got result")
                console.log('res: ' + responseStatues)
                await this.setState({
                    loading: false,
                    loadingText: "Uploading Data"
                })
                const { goBack } = this.props.navigation;
                var delayInMilliseconds = 200;

                setTimeout(function() {
                    Alert.alert(
                        'Posted',
                        'Your listing was posted successfully',
                        [
                            {text: 'OK', onPress: () => goBack()},
                        ],
                        {cancelable: false},
                        );
                    }, delayInMilliseconds);
                
                
            })
            
            .catch((error) => {
                this.setState({
                    loading: false,
                    loadingText: "Uploading Data"
                })
                alert("error")
                console.log("error: " + error + "; server: " + server + "; json: " + body)
            })
        }
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

    check(item){
        let s = this.state
        if (item == "cpr"){
            if (!s.cpr.value) {
                this.setState({cpr: {style: styles.checked, value: true}})
            } else if (s.cpr.value) {
                this.setState({cpr: {style: styles.unchecked, value: false}})
            }
        }
    }

    chooseImage(){
        let width = this.state.width - 20
        this.setState({height: width})
        const options = {
            title: 'Image',
            maxWidth: 512,
            maxHeight: 512,
            storageOptions: {
              skipBackup: true,
              path: 'images',
            },
          };

        ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response);
          
            if (response.didCancel) {
              console.log('User cancelled image picker');
            } else if (response.error) {
              console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
              console.log('User tapped custom button: ', response.customButton);
            } else {
              const source = response.uri;
          
              // You can also display the image using data:
              // const source = { uri: 'data:image/jpeg;base64,' + response.data };
          
              this.setState({
                image: source,
                imgName: response.fileName
              });
            }
          });
    }

    render() {
        var cprStyle = this.state.cpr.style
        let width = this.state.width - 20
        let height = this.state.height
        var date = new Date();
        
        let sDate = date.getFullYear()+"-"+date.getMonth()+"-"+date.getDay()
        console.log("date: "+sDate)
        let markedDates = JSON.parse(JSON.stringify(this.state.marked))
        const available = {key: 'available', color: '#fe5f55', selectedDotColor: '#495867'}
        var source = {uri: ""}
        if (this.state.image != null) {
            source = {uri: this.state.image}
        }
        
        return (
            <View>
            <Loader
            loading={this.state.loading} text={this.state.loadingText} />
            <KeyboardAwareScrollView style={styles.scroll}>
                <Picker 
                    selectedValue={this.state.job}
                    style={{width: 100+'%'}}
                    onValueChange={(itemValue, itemIndex) => {
                        this.setState({job: itemValue})
                        /*if (itemIndex == 0) {
                            this.setState({priceTitle: "Price: (per hour)"})
                            this.setState({job: "BS"})
                            console.log(itemIndex)
                        } else if (itemIndex == 1) {*/
                            this.setState({priceTitle: "Price: (per square foot)"})
                            this.setState({job: "M"})
                            console.log(itemIndex)
                        //}
                    }   
                    }>
                    <Picker.Item label="Babysitting" value="BS" />
                    <Picker.Item label="Mowing" value="M" />
                </Picker>
                <View style={styles.view}>
                    <Text style={styles.text}>Bio: (description of tools and work experience)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Bio"
                        multiline={true}
                        onChangeText={(bio) => {this.setState({ bio })}}
                    />
                 </View>
                 <View style={styles.view}>
                     <Text style={styles.text}>Certifications: (select any certifications you have)</Text>
                     <TouchableOpacity onPress={() => this.check("cpr")}><Text style={cprStyle}>CPR</Text></TouchableOpacity>
                 </View>
                 <View style={styles.view}>
                    <Text style={styles.text}>{this.state.priceTitle}</Text>
                    <View style={{flex: 1, flexDirection: 'row', alighnItems: 'center'}}>
                        <Text style={styles.dollar}>
                            Small Yard: $
                        </Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="price"
                            multiline={false}
                            onChangeText={(sPrice) => (this.setState({sPrice}))}

                            autoCompleteType="cc-number"
                            textContentType="telephoneNumber"
                            autoCapitalize='none'
                            keyboardType={'numeric'}
                        />
                    </View>
                    <View style={{flex: 1, flexDirection: 'row', alighnItems: 'center'}}>
                        <Text style={styles.dollar}>
                            Medium Yard: $
                        </Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="price"
                            multiline={false}
                            onChangeText={(mPrice) => (this.setState({mPrice}))}

                            autoCompleteType="cc-number"
                            textContentType="telephoneNumber"
                            autoCapitalize='none'
                            keyboardType={'numeric'}
                        />
                    </View>
                    
                    <View style={{flex: 1, flexDirection: 'row', alighnItems: 'center'}}>
                        <Text style={styles.dollar}>
                            Large Yard: $
                        </Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="price"
                            multiline={false}
                            onChangeText={(lPrice) => (this.setState({lPrice}))}

                            autoCompleteType="cc-number"
                            textContentType="telephoneNumber"
                            autoCapitalize='none'
                            keyboardType={'numeric'}
                        />
                    </View>
                    
                    
                 </View>
                 <View style={styles.view}>
                    <Button title="Choose Image" onPress={this.chooseImage} buttonStyle={styles.btn}/>
                    <View style={{height: 10}}/>
                    <Image source={source} style={{width: width, height: height}}/>
                    <View style={{height: 10}}/>
                 </View>
                 
                 <View>
                     <Text style={styles.text}>Availability: (Please select the dates you are available)</Text>
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
                 </View>
                 <View style={{height: 20}}/>
            </KeyboardAwareScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    text: {
        color: "#fe5f55",
        paddingTop: 10,
        paddingBottom: 10,
        fontSize: 18
    },
    input: {
        paddingTop: 10,
        paddingBottom: 5,
        marginBottom: 5,
        color: "#495867"

    },
    dollar: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingRight: 3,
        color: "#495867"
    },
    scroll: {
        padding: 10
    },
    view: {
        paddingTop: 5,
        paddingBottom: 1,
        borderBottomColor: "#495867",
        borderBottomWidth: StyleSheet.hairlineWidth,
        marginBottom: 4

    },
    btn: {
        backgroundColor: "#fe5f55",
        borderRadius: 20,
    },
    checked: {
        paddingTop: 5,
        marginTop: 5,
        color: "#fe5f55",
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#fe5f55",
        paddingBottom: 5,
        marginBottom: 5,
    },
    unchecked: {
        paddingTop: 5,
        marginTop: 5,
        color: "#495867",
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#495867",
        paddingBottom: 5,
        marginBottom: 5,
    }
})

/*
data: {
    _id: User id,
    jobSpecs: [JobSpecs],
    dateUp: Current Date,
    ratings: [empty],

}

*/