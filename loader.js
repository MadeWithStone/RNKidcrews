import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  Text,
  ActivityIndicator
} from 'react-native';
const Loader = props => {
  const {
    loading,
    text
  } = props;
return (
    <Modal
    transparent={true}
    animationType={'none'}
      visible={loading}>
          <View style={styles.modalBackground}>
            <View style={styles.activityIndicatorWrapper}>
            <ActivityIndicator
                style={styles.acrivityIndicator}
                animating={loading} />
            <Text style={styles.loadingText}>{text}</Text>
            </View>
        </View>
      </Modal>
  )
}
const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-around',
        backgroundColor: '#00000040'
    },
    activityIndicatorWrapper: {
        backgroundColor: '#FFFFFF',
        height: 150,
        width: 150,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around'
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
export default Loader;