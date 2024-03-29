import React, { Component } from 'react'
import { Modal, Alert, Text, TextInput, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity, ActivityIndicator, Picker } from 'react-native'
import {View, Colors, Typography, Spacings} from 'react-native-ui-lib';
import { createStackNavigator, createAppContainer, createBottomTabNavigator } from "react-navigation";
import AsyncStorage from '@react-native-community/async-storage'
import Config from './config'
import { Button, Rating, AirbnbRating } from 'react-native-elements'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
import Moment from 'moment';

import { faStar, faIdCard, faUserCircle} from '@fortawesome/free-solid-svg-icons'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import SegmentedControlTab from "react-native-segmented-control-tab";
import { getDistance, getPreciseDistance } from 'geolib';

export default class NotificationsViewScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: navigation.getParam('title', 'Notifications')
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            user: {},
            jobs: [],
            chain: {},
            width: Dimensions.get('window').width,
            size: 0,
            lowerView: {day: 0, },
            currentJob: {},
            markedDates: {},
            worker: false,
            currentDate: "",
            yardSize: 1,
            newRating: 3,
        }
        this.putTogetherDates = this.putTogetherDates.bind(this)
        this.lowerViewObj = this.lowerViewObj.bind(this)
        this.ratingCompleted = this.ratingCompleted.bind(this)
        this.rate = this.rate.bind(this)
    }

    async componentDidMount() {
        var chain = await this.props.navigation.getParam('chain', {})
        var user = await this.props.navigation.getParam('user', {})
        var worker = false
        if (chain.pos == 1) {
            worker = true
        } 
        console.log("worker: "+worker)
        this.setState({
            chain: chain,
            user: user,
            currentJob: chain.jobs[chain.jobs.length - 1],
            size: chain.jobs[0].size,
            worker: worker
        })
        console.log("putting dates together")
        this.putTogetherDates()
    }
    ratingCompleted(rating) {
        this.setState({
            newRating: rating
        })
    }
    async rate() {
        console.log("rating")
        let day = new Date()
        await fetch(Config.server+"/jobs/rate", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'authorization': 'Token ' + this.state.user.token
            },
            body: JSON.stringify({
                data: {
                    job: this.state.chain.job._id,
                    rating: this.state.newRating,
                    hireJob: this.state.currentDate,
                    date: Moment(day).format(),
                    chain: this.state.chain._id
                }
            })
        }).then((response) => response.json())
        .then((resJson) => {
            let updatedJobs = resJson.jobs
            let updatedChain = this.state.chain
            updatedChain.jobs = updatedJobs
            
            var updatedCurrentJob = {}
            updatedChain.jobs.map(j => {
                if (j._id == this.state.currentJob._id) {
                    updatedCurrentJob = j
                }
            })
            console.log("updatedChain: "+JSON.stringify(updatedChain.worker))
            this.setState({chain: updatedChain, currentJob: updatedCurrentJob})
            this.putTogetherDates()
        })
      }
    
    putTogetherDates() {
        let jobs = this.state.chain.jobs
        let dateList = {requests: [], accepted: [], declined: [], done: []}
        let dateObjs = {}
        jobs.map(job => {
            console.log("new job")
            if (job.jobStatus == 0) {
                dateList.requests.push(job.dateOfJob)
                dateObjs[job.dateOfJob] = {customStyles: {
                    container: {
                        backgroundColor: '#495867'
                    }, 
                    text: {
                        color: 'white'
                    }
                }
                }
            } else if (job.jobStatus == 1) {
                dateList.accepted.push(job.dateOfJob)
                dateObjs[job.dateOfJob] = {customStyles: {
                    container: {
                        backgroundColor: '#fe5f55'
                    }, 
                    text: {
                        color: 'white'
                    }
                }
                }
            } else if (job.jobStatus == 2) {
                dateList.declined.push(job.dateOfJob)
                dateObjs[job.dateOfJob] = {customStyles: {
                    container: {
                        backgroundColor: '#d3d3d3'
                    }, 
                    text: {
                        color: 'white'
                    }
                }
                }
            } else if (job.jobStatus == 3) {
                dateList.done.push(job.dateOfJob)
                dateObjs[job.dateOfJob] = {customStyles: {
                    container: {
                        backgroundColor: '#0cc22d'
                    }, 
                    text: {
                        color: 'white'
                    }
                }
                }
            }
        })
        
        this.setState({markedDates:dateObjs})

    }

    lowerViewObj(job) {
        console.log("setting up lower view: "+job.jobStatus)
        let yardSize = "small"
        if (job.size == 1) {
            yardSize = "medium"
        } else if (job.size == 2) [
            yardSize = "large"
        ]
        if (this.state.currentDate == "") {
            if (this.state.worker){
                if (job.jobStatus == 0) {
                    console.log("returning view")
                    return (
                        <View>
                            <View row>
                                <Text style={{marginRight: 16, fontSize: 20, color: "#fe5f55"}}>{Moment(job.dateOfJob).format('D')}</Text>
                                <Text numberOfLines={2} style={{flex: 1}}>You requested {this.state.chain.worker.firstName} {this.state.chain.worker.lastName} to mow your {yardSize} lawn on {Moment(job.dateOfJob).format('MMMM D')}.</Text>
                            </View>
                            <View row style={{justifyContent: "space-around", marginTop: 16}}>
                                <TouchableOpacity onPress={() => this.lowerAction(6)}><Text style={{color: "#495867"}}>Remove Request</Text></TouchableOpacity>
                            </View>
                        </View>)
                } else if (job.jobStatus == 1) {
                    console.log("returning view")
                    return (
                        <View>
                            <View row>
                                <Text style={{marginRight: 16, fontSize: 20, color: "#fe5f55"}}>{Moment(job.dateOfJob).format('D')}</Text>
                                <Text numberOfLines={2} style={{flex: 1}}>{this.state.chain.worker.firstName} {this.state.chain.worker.lastName} accepted your request to mow your {yardSize} yard on {Moment(job.dateOfJob).format('MMMM D')}.</Text>
                            </View>
        
                            <View row style={{justifyContent: "space-around", marginTop: 16}}>
                                
                            </View>
                        </View>)
                } else if (job.jobStatus == 2) {
                    console.log("returning view")
                    return (
                        <View>
                            <View row>
                                <Text style={{marginRight: 16, fontSize: 20, color: "#fe5f55"}}>{Moment(job.dateOfJob).format('D')}</Text>
                                <Text numberOfLines={2} style={{flex: 1}}>{this.state.chain.worker.firstName} {this.state.chain.worker.lastName} declined your request to mow your {yardSize} yard on {Moment(job.dateOfJob).format('MMMM D')}.</Text>
                            </View>
                        </View>)
                } else if (job.jobStatus == 3) {
                    console.log("returning view")
                    return (
                        <View>
                            <View row>
                                <Text style={{marginRight: 16, fontSize: 20, color: "#fe5f55"}}>{Moment(job.dateOfJob).format('D')}</Text>
                                <Text numberOfLines={2} style={{flex: 1}}>{this.state.chain.worker.firstName} {this.state.chain.worker.lastName} finished mowing your {yardSize} yard on {Moment(job.dateOfJob).format('MMMM D')}.</Text>
                            </View>
                            <View row style={{justifyContent: "space-around", marginTop: 16}}>
                                <TouchableOpacity onPress={() => this.rate()}><Text style={{color: "#fe5f55"}}>Rate</Text></TouchableOpacity>
                            </View>
                        </View>)
                }
            } else {
                if (job.jobStatus == 0) {
                    console.log("returning view")
                    return (
                        <View>
                            <View row>
                                <Text style={{marginRight: 16, fontSize: 20, color: "#fe5f55"}}>{Moment(job.dateOfJob).format('D')}</Text>
                                <Text numberOfLines={2} style={{flex: 1}}>{this.state.chain.employer.firstName} {this.state.chain.employer.lastName} would like to hire you to mow on {Moment(job.dateOfJob).format('MMMM D')} for a {yardSize} yard.</Text>
                            </View>
                            <View row style={{justifyContent: "space-around", marginTop: 16}}>
                                <TouchableOpacity onPress={() => this.lowerAction(1)}><Text style={{color: "#fe5f55"}}>Accept</Text></TouchableOpacity>
                                <TouchableOpacity onPress={() => this.lowerAction(2)}><Text style={{color: "#495867"}}>Decline</Text></TouchableOpacity>
                            </View>
                        </View>)
                } else if (job.jobStatus == 1) {
                    console.log("returning view")
                    return (
                        <View>
                            <View row>
                                <Text style={{marginRight: 16, fontSize: 20, color: "#fe5f55"}}>{Moment(job.dateOfJob).format('D')}</Text>
                                <Text numberOfLines={2} style={{flex: 1}}>You are set to mow {this.state.chain.employer.firstName} {this.state.chain.employer.lastName}'s {yardSize} yard on {Moment(job.dateOfJob).format('MMMM D')}.</Text>
                            </View>
        
                            <View row style={{justifyContent: "space-around", marginTop: 16}}>
                                <TouchableOpacity onPress={() => this.lowerAction(3)}><Text style={{color: "#fe5f55"}}>Job Done</Text></TouchableOpacity>
                            </View>
                        </View>)
                } else if (job.jobStatus == 2) {
                    console.log("returning view")
                    return (
                        <View>
                            <View row>
                                <Text style={{marginRight: 16, fontSize: 20, color: "#fe5f55"}}>{Moment(job.dateOfJob).format('D')}</Text>
                                <Text numberOfLines={2} style={{flex: 1}}>You declined a job to mow {this.state.chain.employer.firstName} {this.state.chain.employer.lastName}'s {yardSize} yard on {Moment(job.dateOfJob).format('MMMM D')}.</Text>
                            </View>
                        </View>)
                } else if (job.jobStatus == 3) {
                    console.log("returning view")
                    return (
                        <View>
                            <View row>
                                <Text style={{marginRight: 16, fontSize: 20, color: "#fe5f55"}}>{Moment(job.dateOfJob).format('D')}</Text>
                                <Text numberOfLines={2} style={{flex: 1}}>You finished a job to mow {this.state.chain.employer.firstName} {this.state.chain.employer.lastName}'s {yardSize} yard on {Moment(job.dateOfJob).format('MMMM D')}.</Text>
                            </View>
                            <AirbnbRating
                                count={5}
                                reviews={["Terrible", "Bad", "Ok", "Fair", "Great"]}
                                defaultRating={3}
                                size={20}
                                color={"#fe5f55"}
                                onFinishRating={this.ratingCompleted}
                                />
                            <View row style={{justifyContent: "space-around", marginTop: 16}}>
                                

                                

                                


                                
                                <TouchableOpacity onPress={() => this.rate()}><Text style={{color: "#fe5f55"}}>Rate</Text></TouchableOpacity>
                            </View>
                        </View>)
                }
            }
        } else {
            if (this.state.worker) {
                return (
                    <View>
                        <View row>
                            <Text style={{marginRight: 16, fontSize: 20, color: "#fe5f55"}}>{Moment(job.dateOfJob).format('D')}</Text>
                            <Text numberOfLines={2} style={{flex: 1}}>{this.state.chain.worker.firstName} {this.state.chain.worker.lastName} is available to mow your {yardSize} yard on {Moment(job.dateOfJob).format('MMMM D')}.</Text>
                        </View>
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
                        <View row style={{justifyContent: "space-around", marginTop: 16}}>
                            <TouchableOpacity onPress={() => this.requestHire()}><Text style={{color: "#fe5f55"}}>Send Hire Request</Text></TouchableOpacity>
                        </View>
                    </View> 
                )
            }
            
        }
        
    }

    requestHire() {
        let dates = [this.state.currentDate]
        let marked = {}
        
        
        console.log("hire dates: "+JSON.stringify(dates));
        let data = {
            _id: this.state.chain.job._id,
            worker: this.state.chain.worker._id,
            employer: this.state.chain.employer._id,
            dateOfJob: dates[0],
            size: this.state.yardSize,
            job: this.state.chain.job._id
        }

        let server = Config.server + "/jobs/sendHireRequest"
        let body = JSON.stringify({
            data: data

        })
        fetch(server, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': 'Token ' + this.state.user.token
            },
            body: body
        })
            .then((response) => response.json())
            .then(async (responseJson) => {
                await this.setState({
                })
                
                Alert.alert('Hire Request Sent')
                let updatedJobs = responseJson.jobs
                let updatedChain = this.state.chain
                updatedChain.jobs = updatedJobs
                
                var updatedCurrentJob = {}
                updatedChain.jobs.map(j => {
                    if (j._id == this.state.currentJob._id) {
                        updatedCurrentJob = j
                    }
                })
                console.log("updatedChain: "+JSON.stringify(updatedChain.worker))
                this.setState({chain: updatedChain, currentJob: updatedCurrentJob, currentDate: ""})
                this.putTogetherDates()
            })
            
            .catch((error) => {
                
                alert("error")
                console.log("error: " + error + "; server: " + server + "; json: " + body)
            })
    }

    async lowerAction(action) {
        await fetch(Config.server+"/jobs/updateHireRequest", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'authorization': 'Token ' + this.state.user.token
            },
            body: JSON.stringify({
                data: {
                    _id: this.state.chain._id,
                    action: action,
                    jobDate: this.state.currentJob.dateOfJob
                }
            })
        }).then((response) => response.json())
        .then((resJson) => {
            let updatedJobs = resJson.jobs
            let updatedChain = this.state.chain
            updatedChain.jobs = updatedJobs
            
            var updatedCurrentJob = {}
            updatedChain.jobs.map(j => {
                if (j._id == this.state.currentJob._id) {
                    updatedCurrentJob = j
                }
            })
            console.log("updatedChain: "+JSON.stringify(updatedChain.worker))
            this.setState({chain: updatedChain, currentJob: updatedCurrentJob})
            this.putTogetherDates()
        })
    }

      
      

    render() {
        let chain = this.state.chain
        var user = {}
        let job = chain
        let width = this.state.width - 17.5
        
        console.log("user: "+user)
        var yardSize = 'S'
        var size = this.state.currentJob.size
        if (size == null) [
            size = this.state.yardSize
        ]
        if (size == 0){
            yardSize = 'S'
        } else if (size == 1) {
            yardSize = 'M'
        } else if (size == 2) {
            yardSize = 'L'
        }
        var price = 0
        
        var lower = (<View></View>)
        if (chain.job != null) {
            price = chain.job.jobSpecs.price[size]
            lower = this.lowerViewObj(JSON.parse(JSON.stringify(this.state.currentJob)))
            if (this.state.worker) {
                user = chain.worker
                console.log("worker")
            } else {
                user = chain.employer
            }
        }
        var rating = 4.5
        let markedDates = JSON.parse(JSON.stringify(this.state.markedDates))
        
        
        return(
        <KeyboardAwareScrollView style={{flex: 1, width: 100+'%'}}>
            <View style={{marginRight: 17.5, marginLeft: 17.5, marginTop: 16}}>
                <View row style={{alignItems: "center"}}>
                    <Image source={{uri: user.profileImage, cache: 'reload'}} 
                    style={{height: 80, width: 80, borderRadius: 40, marginRight: 16}}/>
                    <View style={{flex: 3}}>
                        <Text>{user.firstName + " " + user.lastName}</Text>
                        <Text style={{marginTop: 10}}>{user.address}</Text>
                    </View>
                    <View flex right>
                        <Text>{yardSize} ${price}</Text>
                        <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 10}}>
                            <FontAwesomeIcon style={{color: '#fe5f55', marginRight: 3 }} size={25} icon={faStar} />
                            <Text style={{fontSize: 25, color: '#fe5f55'}}>{rating}</Text>
                        </View>
                    </View>
                    
                </View>
                <Calendar
                    style={{alignSelf: 'center', width: 100+"%", marginTop: 16}}
                        onDayPress={(day) => {
                            var currentJob = {}
                            var exists = false
                            var currentDate = this.state.currentDate
                            chain.jobs.map(d => {
                                if (d.dateOfJob == day.dateString) {
                                    currentJob = d
                                    if (currentDate != "") {
                                        delete markedDates[this.state.currentDate]
                                    }
                                    currentDate = ""
                                    exists = true
                                    
                                }
                            })
                            if (!exists) {
                                console.log("not original")
                                if (currentDate != "") {
                                    delete markedDates[this.state.currentDate]
                                }
                                
                                markedDates[day.dateString] = {customStyles: {
                                    container: {
                                        backgroundColor: "#fe5f55"
                                    }
                                }}
                                
                                currentDate = day.dateString
                                    
                                
                            }
                            console.log(day)
                            this.setState({
                                currentJob: currentJob,
                                markedDates: markedDates,
                                currentDate: currentDate
                                
                            })
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
                <View flex style={{paddingTop: 16}}>
                    {lower}
                </View>
            </View>

        </KeyboardAwareScrollView>)
    }
}