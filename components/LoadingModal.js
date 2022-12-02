import { View, Modal, StyleSheet, Text, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';


export default function LoadingModal(props) {
    return (
        <Modal animationType="fade"
            onShow={props.onModalShow}
            transparent={true}
            visible={props.modalVisible}
            statusBarTranslucent={false}>
                
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    {
                      props.task ?
                      <Text style={styles.modalText}>{props.task}</Text>
                      :
                      <Text style={styles.modalText}>Loading.. {props.title}</Text>
                    }

                    { 
                        props.estado === 'APROBADA' ?
                        <Ionicons name="md-checkmark-circle" size={60} color="green" />
                        :
                        props.estado === 'RECHAZADA' ?
                        <Ionicons name="md-close-circle" size={60} color="red" />
                        :
                        props.estado === 'VENCIDA' ?
                        <Ionicons name="md-alert-circle" size={60} color="orange" />
                        :
                        <ActivityIndicator size="large" color="#0000ff">
                        </ActivityIndicator>
                    }
                    <Text style={{fontWeight:"100"}}>{props.countDown}</Text>

                </View>
            </View>
        </Modal>
    )
  }
  
  
  const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#0008'
  
    },
    modalView: {
        margin: 20,
        width: 300,
        height: 250,
        backgroundColor: "white",
        borderRadius: 50,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
  
    },
  
    modalText: {
        marginVertical: 15,
        textAlign: "center",
        fontSize: 17,
        marginLeft: 15,
        fontWeight:'bold'
    }
  });