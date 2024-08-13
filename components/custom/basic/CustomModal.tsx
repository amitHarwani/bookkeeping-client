import { Modal, StyleSheet, Text, View } from "react-native";
import React from "react";

interface CustomModalProps {
    visible: boolean,
    onRequestClose(): void;
    children: React.ReactElement,
    extraModalStyles?: Object
}
const CustomModal = ({visible, onRequestClose,extraModalStyles, children}: CustomModalProps) => {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onRequestClose}
        >
            <View style={[styles.container, extraModalStyles]}>
                {children}
            </View>
        </Modal>
    );
};

export default CustomModal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)"
    }
});
