import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { ThirdParty } from "@/services/billing/billing_types";
import { fonts } from "@/constants/fonts";

interface PartyListItemProps {
    party: ThirdParty;
    onPress(party: ThirdParty): void;
}
const PartyListItem = ({ party, onPress }: PartyListItemProps) => {
    return (
        <Pressable onPress={() => onPress(party)}>
            <Text style={styles.partyName} numberOfLines={2}>
                {party.partyName}
            </Text>
        </Pressable>
    );
};

export default PartyListItem;

const styles = StyleSheet.create({
    partyName: {
        fontFamily: fonts.Inter_Regular,
        fontSize: 14,
    },
});
