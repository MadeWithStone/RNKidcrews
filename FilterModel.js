import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  Text,
  Picker,
  ActivityIndicator,
  Button,
  TextInput
} from 'react-native';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
import { ScrollView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage'

export default class Filter extends Component {

    state = {
            filtering: this.props.filtering,
            loading: this.props.loading,
            text: this.props.text,
            job: "BS",
            marked: {},
            hours: 1,
            jobSort: null,
            area: null
    }

    componentDidMount() {
        this.changeSort()
    }

    changeSort() {
        if (this.state.job == "M") {
            
                return (
                    <View style={{flex: 1, flexDirection: 'row', alignItems: "center"}}>
                        <Text style={{flex: 0.2}}>Hours: </Text> 
                        <Picker 
                            selectedValue={this.state.hours}
                            style={{flex: 0.7}}
                            onValueChange={(itemValue, itemIndex) => {
                                this.setState({hours: itemValue})
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
                            onChangeText={(area) => (this.setState({area}))}

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
        try {
            await AsyncStorage.setItem(key, JSON.stringify(data))
        } catch (error) {
            console.log("save error: " + error)
        }
    }


render() {
    let date = new Date()
    let markedDates = JSON.parse(JSON.stringify(this.state.marked))
    
    let sort = <this.changeSort />
    return (
        <Modal
        transparent={true}
        animationType={'none'}
          visible={this.state.filtering}>
            
              <View style={styles.modalBackground}>
              
                <View style={styles.activityIndicatorWrapper}>
                <ScrollView showsVerticalScrollIndicator={false}>
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
                <Button buttonStyle={{color: "#fe5f55"}} title="Save" onPress={() => {
                    this.save("filters")
                    this.setState({filtering: false})
                }}/>
                <Button title="Cancel" onPress={() => this.setState({filtering: false})}/>
                </ScrollView>
                </View>
                
                
            </View>
            
          </Modal>
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
    }
    
});