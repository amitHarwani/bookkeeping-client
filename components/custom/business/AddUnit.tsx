import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import CustomModal from "../basic/CustomModal";
import { commonStyles } from "@/utils/common_styles";
import { i18n } from "@/app/_layout";
import Input from "../basic/Input";
import CustomButton from "../basic/CustomButton";
import { capitalizeText } from "@/utils/common_utils";

interface AddUnitProps {
    visible: boolean;
    toggleAddUnitModal(): void;
}
const AddUnit = ({ visible, toggleAddUnitModal }: AddUnitProps) => {
    const [unitName, setUnitName] = useState("");

    return (
        <CustomModal
            visible={visible}
            onRequestClose={toggleAddUnitModal}
            extraModalStyles={{ justifyContent: "flex-end" }}
            children={
                <View style={commonStyles.modalEndMenuContainer}>
                    <Text style={commonStyles.modalEndMenuHeading}>
                        {i18n.t("addNewUnit")}
                    </Text>

                    <Input
                        label={i18n.t("unitName")}
                        placeholder={capitalizeText(i18n.t("enterUnitName"))}
                        value={unitName}
                        onChangeText={(text) => setUnitName(text)}
                    />

                    <CustomButton text={i18n.t("addUnit")} onPress={() => {}} />
                </View>
            }
        />
    );
};

export default AddUnit;

const styles = StyleSheet.create({});
