import { StyleSheet, Text, ToastAndroid, View } from "react-native";
import React, { useEffect, useMemo } from "react";
import { Item } from "@/services/inventory/inventory_types";
import CustomModal from "../basic/CustomModal";
import { commonStyles } from "@/utils/common_styles";
import { i18n } from "@/app/_layout";
import { Formik } from "formik";
import { AdjustItemForm } from "@/constants/types";
import RadioButton from "../basic/RadioButton";
import Input from "../basic/Input";
import { capitalizeText, getApiErrorMessage } from "@/utils/common_utils";
import CustomButton from "../basic/CustomButton";
import { AdjustItemFormValidation } from "@/utils/schema_validations";
import { useMutation } from "@tanstack/react-query";
import InventoryService from "@/services/inventory/inventory_service";
import ErrorMessage from "../basic/ErrorMessage";
import LoadingSpinnerOverlay from "../basic/LoadingSpinnerOverlay";

interface AdjustItemProps {
    item: Item;
    visible: boolean;
    toggleAdjustItemModal(): void;
    onItemAdjusted(updatedItem: Item): void;
}

const AdjustItem = ({
    item,
    visible,
    toggleAdjustItemModal,
    onItemAdjusted,
}: AdjustItemProps) => {

    /* Initial form values */
    const initialFormValues: AdjustItemForm = useMemo(() => {
        return {
            item: item,
            addStock: true,
            stockAdjusted: 0,
            pricePerUnit: null,
            reason: "",
        };
    }, [item]);

    /* Add or subtract radio button data */
    const adjustItemTypeRadioButtonData = useMemo(() => {
        return [{ key: "ADD" }, { key: "SUBTRACT" }];
    }, []);

    /* Adjust Item mutation */
    const adjustItemMutation = useMutation({
        mutationFn: (values: AdjustItemForm) =>
            InventoryService.adjustItem(values),
    });

    /* On item adjusted */
    useEffect(() => {
        if (adjustItemMutation.isSuccess && adjustItemMutation.data.success) {
            /* Show toast message, pass updated item to parent and toggle the modal */
            ToastAndroid.show(
                capitalizeText(i18n.t("itemAdjustedSuccessfully")),
                ToastAndroid.LONG
            );
            onItemAdjusted(adjustItemMutation.data.data.item);
            toggleAdjustItemModal();
        }
    }, [adjustItemMutation.isSuccess]);

    /* AdjustItem in progress */
    const showLoadingSpinner = useMemo(() => {
        return adjustItemMutation.isPending ? true : false;
    }, [adjustItemMutation.isPending]);

    /* API Error */
    const apiErrorMessage = useMemo(() => {
        if (adjustItemMutation.error) {
            return getApiErrorMessage(adjustItemMutation.error);
        }
        return null;
    }, [adjustItemMutation.error]);

    return (
        <>
        {showLoadingSpinner && <LoadingSpinnerOverlay />}
            <CustomModal
                visible={visible}
                onRequestClose={toggleAdjustItemModal}
                extraModalStyles={{ justifyContent: "flex-end" }}
                children={
                    <View style={commonStyles.modalEndMenuContainer}>
                        <Text style={commonStyles.modalEndMenuHeading}>
                            {i18n.t("adjustItem")}
                        </Text>

                        <View style={styles.stockCountContainer}>
                            <Text style={styles.stockCountText}>
                                {i18n.t("currentStock")}
                            </Text>
                            <Text>{`${item.stock} ${item.unitName}`}</Text>
                        </View>
                        <Formik
                            initialValues={initialFormValues}
                            validationSchema={AdjustItemFormValidation}
                            enableReinitialize
                            onSubmit={(values) => {
                                adjustItemMutation.mutate(values)
                            }}
                        >
                            {({
                                handleChange,
                                handleBlur,
                                handleSubmit,
                                touched,
                                errors,
                                setFieldTouched,
                                setFieldValue,
                                values,
                            }) => (
                                <View style={styles.formContainer}>
                                    {apiErrorMessage && (
                                        <ErrorMessage
                                            message={apiErrorMessage}
                                        />
                                    )}
                                    <RadioButton
                                        label={i18n.t("selectAdjustmentType")}
                                        data={adjustItemTypeRadioButtonData}
                                        textKey="key"
                                        onChange={(selectedVal) => {
                                            setFieldTouched("addStock", true);
                                            setFieldValue(
                                                "addStock",
                                                selectedVal.key === "ADD"
                                            );
                                        }}
                                        errorMessage={
                                            touched.addStock && errors.addStock
                                                ? errors.addStock
                                                : null
                                        }
                                        value={
                                            values.addStock
                                                ? adjustItemTypeRadioButtonData[0]
                                                : adjustItemTypeRadioButtonData[1]
                                        }
                                    />

                                    <Input
                                        label={i18n.t("enterUnits")}
                                        placeholder={capitalizeText(
                                            i18n.t("enterUnits")
                                        )}
                                        value={values.stockAdjusted.toString()}
                                        onChangeText={handleChange(
                                            "stockAdjusted"
                                        )}
                                        onBlur={handleBlur("stockAdjusted")}
                                        errorMessage={
                                            touched.stockAdjusted &&
                                            errors.stockAdjusted
                                                ? errors.stockAdjusted
                                                : null
                                        }
                                        keyboardType="number-pad"
                                    />

                                    {values.addStock && (
                                        <Input
                                            label={i18n.t("pricePerUnit")}
                                            placeholder={capitalizeText(
                                                i18n.t("enterPricePerUnit")
                                            )}
                                            value={
                                                values.pricePerUnit?.toString() ||
                                                ""
                                            }
                                            onChangeText={handleChange(
                                                "pricePerUnit"
                                            )}
                                            onBlur={handleBlur("pricePerUnit")}
                                            errorMessage={
                                                touched.pricePerUnit &&
                                                errors.pricePerUnit
                                                    ? errors.pricePerUnit
                                                    : null
                                            }
                                            keyboardType="number-pad"
                                        />
                                    )}

                                    <Input
                                        label={i18n.t("reason")}
                                        placeholder={capitalizeText(
                                            i18n.t("enterReason")
                                        )}
                                        value={values.reason}
                                        onChangeText={handleChange("reason")}
                                        onBlur={handleBlur("reason")}
                                        errorMessage={
                                            touched.reason && errors.reason
                                                ? errors.reason
                                                : null
                                        }
                                    />

                                    <View
                                        style={
                                            commonStyles.modalEndActionsContainer
                                        }
                                    >
                                        <CustomButton
                                            text={i18n.t("cancel")}
                                            onPress={toggleAdjustItemModal}
                                            extraContainerStyles={{ flex: 1 }}
                                            isSecondaryButton
                                        />
                                        <CustomButton
                                            text={i18n.t("adjustItem")}
                                            onPress={handleSubmit}
                                            extraContainerStyles={{ flex: 1 }}
                                        />
                                    </View>
                                </View>
                            )}
                        </Formik>
                    </View>
                }
            />
        </>
    );
};

export default AdjustItem;

const styles = StyleSheet.create({
    formContainer: {
        rowGap: 16,
    },
    stockCountContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    stockCountText: {
        textTransform: "capitalize",
    },
});
