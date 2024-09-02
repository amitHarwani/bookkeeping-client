import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { ThirdParty } from "@/services/billing/billing_types";
import { fonts } from "@/constants/fonts";
import { commonStyles } from "@/utils/common_styles";
import { PartyTypeInPartyList } from "@/constants/types";

interface PartyListItemProps {
    party: PartyTypeInPartyList;
    onPress(party: PartyTypeInPartyList): void;
}
const PartyListItem = ({ party, onPress }: PartyListItemProps) => {
    return (
        <Pressable onPress={() => onPress(party)}>
            <Text style={[commonStyles.textMedium]} numberOfLines={2}>
                {party.partyName}
            </Text>
        </Pressable>
    );
};

export default PartyListItem;

const styles = StyleSheet.create({
});
