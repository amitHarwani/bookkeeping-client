import { i18n } from "@/app/_layout";
import {
    ItemTypeInTransferItemSelector,
    TransferItemType
} from "@/constants/types";
import { commonStyles } from "@/utils/common_styles";
import { capitalizeText } from "@/utils/common_utils";
import {
    AddUpdateTransferItemValidation
} from "@/utils/schema_validations";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import CustomButton from "../basic/CustomButton";
import CustomModal from "../basic/CustomModal";
import Input from "../basic/Input";
import TransferItemSelector from "./TransferItemSelector";

interface AddTransferItemProps {
    value?: TransferItemType;
    isVisible: boolean;
    toggleVisibility(): void;
    onTransferItemChange(transferItem: TransferItemType): void;
}
const AddTransferItem = ({
    value,
    isVisible,
    toggleVisibility,
    onTransferItemChange,
}: AddTransferItemProps) => {

    /* Initial form values */
    const [formValues, setFormValues] = useState<{
        item?: ItemTypeInTransferItemSelector;
        unitsTransferred: number;
    }>({
        item: undefined,
        unitsTransferred: 0,
    });

    /* Formik initialization */
    const formik = useFormik({
        initialValues: formValues,
        enableReinitialize: true,
        validationSchema: AddUpdateTransferItemValidation,
        onSubmit: (values) => {
            /* On submit pass values to parent and hide modal */
            onTransferItemChange({
                item: values.item as ItemTypeInTransferItemSelector,
                unitsTransferred: values.unitsTransferred,
            });
            toggleVisibility();
        },
    });

    /* Default form values */
    useEffect(() => {
        if (value) {
            setFormValues(value);
        }
    }, [value]);

    return (
        <>
            <CustomModal
                visible={isVisible}
                onRequestClose={toggleVisibility}
                extraModalStyles={{ justifyContent: "flex-end" }}
                children={
                    <View style={commonStyles.modalEndMenuContainer}>
                        <Text style={commonStyles.modalEndMenuHeading}>
                            {i18n.t("addItem")}
                        </Text>

                        <TransferItemSelector
                            value={formik.values.item}
                            onChange={(item) => {
                                formik.setFieldTouched("item", true);
                                formik.setFieldValue("item", item);
                            }}
                            errorMessage={
                                formik.touched.item && formik.errors.item
                                    ? formik.errors.item
                                    : null
                            }
                        />
                        {formik.values?.item && (
                            <Text>{`${formik.values.item.stock} ${formik.values.item.unitName}`}</Text>
                        )}
                        {formik.values?.item && (
                            <>
                                <View style={styles.rowContainer}>
                                    <Input
                                        value={formik.values.item?.unitName}
                                        placeholder=""
                                        keepLabelSpace
                                        isDisabled
                                        extraContainerStyles={{
                                            flex: 0.4,
                                            maxHeight: 58,
                                        }}
                                    />
                                    <Input
                                        label={i18n.t("units")}
                                        placeholder={capitalizeText(
                                            i18n.t("enterUnits")
                                        )}
                                        value={
                                            formik.values.unitsTransferred?.toString() ||
                                            ""
                                        }
                                        onChangeText={(unit) => {
                                            formik.setFieldTouched(
                                                "unitsTransferred",
                                                true
                                            );
                                            formik.setFieldValue(
                                                "unitsTransferred",
                                                unit
                                            );
                                        }}
                                        errorMessage={
                                            formik.touched.unitsTransferred &&
                                            formik.errors.unitsTransferred
                                                ? formik.errors.unitsTransferred
                                                : null
                                        }
                                        keyboardType="number-pad"
                                        extraContainerStyles={{ flex: 1 }}
                                    />
                                </View>
                            </>
                        )}
                        <View style={commonStyles.modalEndActionsContainer}>
                            <CustomButton
                                text={i18n.t("cancel")}
                                onPress={toggleVisibility}
                                isSecondaryButton
                                extraContainerStyles={{ flex: 1 }}
                            />
                            <CustomButton
                                text={i18n.t("add")}
                                onPress={formik.handleSubmit}
                                extraContainerStyles={{ flex: 1 }}
                            />
                        </View>
                    </View>
                }
            />
        </>
    );
};

export default AddTransferItem;

const styles = StyleSheet.create({
    rowContainer: {
        flexDirection: "row",
        columnGap: 8,
    },
    totalContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
});
