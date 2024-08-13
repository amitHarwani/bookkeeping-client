import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";
import React from "react";

const LoadingSpinnerOverlay = () => {
    return (
        <Modal transparent={true}>
            <View style={styles.container}>
                <ActivityIndicator size="large" />
            </View>
        </Modal>
    );
};

export default LoadingSpinnerOverlay;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
});
