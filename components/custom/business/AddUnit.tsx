import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import CustomModal from "../basic/CustomModal";
import { commonStyles } from "@/utils/common_styles";
import { i18n } from "@/app/_layout";
import Input from "../basic/Input";
import CustomButton from "../basic/CustomButton";
import { capitalizeText, getApiErrorMessage } from "@/utils/common_utils";
import { useMutation } from "@tanstack/react-query";
import { useAppSelector } from "@/store";
import InventoryService from "@/services/inventory/inventory_service";
import LoadingSpinnerOverlay from "../basic/LoadingSpinnerOverlay";

interface AddUnitProps {
    visible: boolean;
    toggleAddUnitModal(): void;
    onUnitAdded(): void;
}
const AddUnit = ({
    visible,
    toggleAddUnitModal,
    onUnitAdded,
}: AddUnitProps) => {
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    const [unitName, setUnitName] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    /* Add Unit Mutation */
    const addUnitMutation = useMutation({
        mutationFn: () =>
            InventoryService.addUnit(
                unitName,
                selectedCompany?.companyId as number
            ),
    });

    /* Loading spinner shown on api call */
    const showLoadingSpinner = useMemo(() => {
        return addUnitMutation.isPending ? true : false;
    }, [addUnitMutation.isPending]);

    /* Error messages from api */
    useEffect(() => {
        if (addUnitMutation.error) {
            setErrorMessage(getApiErrorMessage(addUnitMutation.error));
        }
    }, [addUnitMutation.error]);

    /* On unit added, call onUnitAdded handler on the parent, and toggle the modal */
    useEffect(() => {
        if (addUnitMutation.isSuccess && addUnitMutation.data.success) {
            onUnitAdded();
            toggleAddUnitModal();
        }
    }, [addUnitMutation.isSuccess]);

    /* Add unit handler */
    const addUnitHandler = () => {
        /* If unit name is empty, set error message */
        if (!unitName || !unitName.trim().length) {
            setErrorMessage(`${i18n.t("unitNameIsRequired")}`);
            return;
        }
        /* Hide error message & proceeed to api call */
        setErrorMessage("");
        addUnitMutation.mutate();
    };

    return (
        <>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}
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
                            placeholder={capitalizeText(
                                i18n.t("enterUnitName")
                            )}
                            value={unitName}
                            onChangeText={(text) => setUnitName(text)}
                            errorMessage={errorMessage ? errorMessage : null}
                        />
                        <View style={commonStyles.modalEndActionsContainer}>
                            <CustomButton
                                text={i18n.t("cancel")}
                                onPress={toggleAddUnitModal}
                                isSecondaryButton
                                extraContainerStyles={{ flex: 1 }}
                            />
                            <CustomButton
                                text={i18n.t("addUnit")}
                                onPress={addUnitHandler}
                                extraContainerStyles={{ flex: 1 }}
                            />
                        </View>
                    </View>
                }
            />
        </>
    );
};

export default AddUnit;

const styles = StyleSheet.create({
    actionsContainer: {
        flexDirection: "row",
    },
});
