import { i18n } from "@/app/_layout";
import CustomButton from "@/components/custom/basic/CustomButton";
import ErrorMessage from "@/components/custom/basic/ErrorMessage";
import Input from "@/components/custom/basic/Input";
import RadioButton from "@/components/custom/basic/RadioButton";
import {
    PurchaseReturnForm,
    ReturnItemType
} from "@/constants/types";
import {
    Purchase,
    PurchaseItem
} from "@/services/billing/billing_types";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import { capitalizeText } from "@/utils/common_utils";
import {
    PurchaseReturnFormValidation
} from "@/utils/schema_validations";
import { useFormik } from "formik";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import DateTimePickerCombined from "../basic/DateTimePickerCombined";
import PurchaseReturnItemListItem from "../business/PurchaseReturnItemListItem";
import AddReturnItem from "./AddReturnItem";

interface AddUpdatePurchaseReturnProps {
    operation: "ADD" | "GET";
    purchase?: Purchase;
    purchaseItems?: { [itemId: number]: PurchaseItem };
    onAddUpdatePurchaseReturn(values: PurchaseReturnForm): void;
    apiErrorMessage?: string | null;

    formValues?: PurchaseReturnForm;
}
const AddUpdatePurchaseReturn = ({
    operation,
    purchase,
    purchaseItems,
    onAddUpdatePurchaseReturn,
    apiErrorMessage,
    formValues,
}: AddUpdatePurchaseReturnProps) => {
    /* Company State from redux */
    const companyState = useAppSelector((state) => state.company);

    /* Decimal points to round to when showing the value */
    const decimalPoints = useMemo(() => {
        return companyState.selectedCompany?.decimalRoundTo || 2;
    }, [companyState]);

    /* Yes or No: Radio Button Data */
    const yesNoRadioButtonData = useMemo(
        () => [
            { key: "yes", value: true },
            { key: "no", value: false },
        ],
        []
    );

    /* Disable all inputs if operation is get */
    const isInputsDisabled = useMemo(() => {
        if (operation === "GET") {
            return true;
        }
        return false;
    }, [operation]);

    /* To store a selected item if any */
    const selectedItem = useRef<ReturnItemType>();

    /* Whether add return item modal is visible */
    const [isAddReturnItemModalVisibile, setIsAddReturnItemModalVisible] =
        useState(false);

    /* To toggle add return item modal*/
    const toggleAddReturnItemModal = useCallback(() => {
        setIsAddReturnItemModalVisible((prev) => !prev);
    }, [isAddReturnItemModalVisibile]);

    /* Initial Purchase Return form */
    const initialFormValues: PurchaseReturnForm = useMemo(() => {
        if (formValues) {
            return formValues;
        }

        const values: PurchaseReturnForm = {
            createdAt: new Date(),
            autogeneratePurchaseReturnNumber: true,
            purchaseReturnNumber: null,
            items: {},
            subtotal: "0",
            tax: "0",
            totalAfterTax: "0",
            taxName: purchase?.taxName as string,
            taxPercent: Number(purchase?.taxPercent),
        };
        return values;
    }, [formValues]);

    /* Aggregated field displayed at the end */
    const totalFields = useMemo(() => ["subtotal", "tax", "totalAfterTax"], []);

    /* Form */
    const formik = useFormik({
        initialValues: initialFormValues,
        onSubmit: (values) => {
            onAddUpdatePurchaseReturn(values);
        },
        validationSchema: PurchaseReturnFormValidation,
    });

    /* On change of purchase return item */
    const onReturnItemChanged = (item: ReturnItemType) => {
        /* Update items field. value is stores as key value, where key is itemId and value is return item type */
        if (item && item.item) {
            formik.setFieldTouched("items", true);
            const temp = { ...formik.values.items };
            temp[item.item?.itemId] = item;
            calculateAggregateValues(temp);
            formik.setFieldValue("items", temp);
        }
    };

    /* On Return Item selected */
    const onReturnItemSelected = (item: ReturnItemType) => {
        if (item) {
            /* Setting selected item, and toggling the modal */
            selectedItem.current = item;
            toggleAddReturnItemModal();
        }
    };

    /* Remove return Item, removing the item from items */
    const removeReturnItemHandler = (item: ReturnItemType) => {
        if (item && item.item?.itemId) {
            const temp = { ...formik.values.items };
            delete temp[item.item?.itemId];
            formik.setFieldValue("items", temp);
            calculateAggregateValues(temp);
        }
    };

    /* On Change of items or discount value */
    const calculateAggregateValues = (items: {
        [x: number]: ReturnItemType;
    }) => {
        /* Aggregate values to calculate */
        let subtotal = 0;
        let tax = 0;
        let totalAfterTax = 0;

        /* Aggregating subtotal from all items */
        Object.values(items).forEach((item) => {
            subtotal += Number(item.subtotal);
        });

        /* Applyting Tax */
        tax = subtotal * (formik.values.taxPercent / 100);

        /* Total after tax */
        totalAfterTax = subtotal + tax;

        /* Setting the values in the form */
        formik.values.subtotal = subtotal.toFixed(decimalPoints);
        formik.values.tax = tax.toFixed(decimalPoints);
        formik.values.totalAfterTax = totalAfterTax.toFixed(decimalPoints);
    };

    return (
        <ScrollView style={styles.mainContainer}>
            <View style={styles.container}>
                <View style={styles.formContainer}>
                    {apiErrorMessage && (
                        <ErrorMessage message={apiErrorMessage} />
                    )}

                    <DateTimePickerCombined
                        dateLabel={i18n.t("transactionDateTime")}
                        onChange={(selectedDateTime) => {
                            formik.setFieldTouched("createdAt", true);
                            formik.setFieldValue("createdAt", selectedDateTime);
                        }}
                        value={formik.values.createdAt}
                        timeLabel=""
                        isDisabled={isInputsDisabled}
                    />

                    {operation === "ADD" && (
                        <RadioButton
                            textKey="key"
                            data={yesNoRadioButtonData}
                            label={i18n.t("autogeneratePurchaseReturnNumber")}
                            onChange={(selectedVal) => {
                                formik.setFieldTouched(
                                    "autogeneratePurchaseReturnNumber",
                                    true
                                );
                                formik.setFieldValue(
                                    "autogeneratePurchaseReturnNumber",
                                    selectedVal.value
                                );
                                formik.setFieldValue(
                                    "purchaseReturnNumber",
                                    null
                                );
                            }}
                            value={
                                formik.values.autogeneratePurchaseReturnNumber
                                    ? yesNoRadioButtonData[0]
                                    : yesNoRadioButtonData[1]
                            }
                            isDisabled={isInputsDisabled}
                            errorMessage={
                                formik.touched
                                    .autogeneratePurchaseReturnNumber &&
                                formik.errors.autogeneratePurchaseReturnNumber
                                    ? formik.errors
                                          .autogeneratePurchaseReturnNumber
                                    : null
                            }
                        />
                    )}
                    {!formik.values.autogeneratePurchaseReturnNumber && (
                        <Input
                            label={i18n.t("purchaseReturnNumber")}
                            placeholder={capitalizeText(
                                i18n.t("enterPurchaseReturnNumber")
                            )}
                            value={
                                formik.values.purchaseReturnNumber?.toString() ||
                                ""
                            }
                            onChangeText={formik.handleChange(
                                "purchaseReturnNumber"
                            )}
                            onBlur={formik.handleBlur("purchaseReturnNumber")}
                            errorMessage={
                                formik.touched.purchaseReturnNumber &&
                                formik.errors.purchaseReturnNumber
                                    ? formik.errors.purchaseReturnNumber
                                    : null
                            }
                            keyboardType="number-pad"
                            isDisabled={isInputsDisabled}
                        />
                    )}

                    <Text
                        style={[
                            commonStyles.textSmallBold,
                            commonStyles.capitalize,
                        ]}
                    >
                        {i18n.t("items")}
                    </Text>

                    {formik.touched.items && formik.errors.items && (
                        <ErrorMessage message={formik.errors.items as string} />
                    )}

                    <FlatList
                        data={Object.values(formik.values.items)}
                        renderItem={({ item }) => (
                            <PurchaseReturnItemListItem
                                item={item}
                                removeItem={removeReturnItemHandler}
                                onReturnItemSelected={onReturnItemSelected}
                                isDisabled={isInputsDisabled}
                            />
                        )}
                        keyExtractor={(item) =>
                            item.item?.itemId?.toString() || ""
                        }
                        scrollEnabled={false}
                    />

                    <View style={styles.formContainer}>
                        {operation === "ADD" && (
                            <CustomButton
                                text={i18n.t("addItem")}
                                onPress={toggleAddReturnItemModal}
                                isSecondaryButton
                                isDisabled={isInputsDisabled}
                            />
                        )}

                        {totalFields.map((field) => (
                            <View style={styles.rowContainer} key={field}>
                                <Text
                                    style={[
                                        commonStyles.textSmallBold,
                                        field !== "tax" &&
                                            commonStyles.capitalize,
                                    ]}
                                >
                                    {field === "tax"
                                        ? `${formik.values.taxName.toUpperCase()} (${
                                              formik.values.taxPercent
                                          }%)`
                                        : i18n.t(field)}
                                </Text>
                                <Text
                                    style={[
                                        commonStyles.textMediumXLBold,
                                        commonStyles.textGray,
                                    ]}
                                >
                                    {formik.values?.[
                                        field as keyof PurchaseReturnForm
                                    ]?.toString()}
                                </Text>
                            </View>
                        ))}

                        {!isInputsDisabled && (
                            <CustomButton
                                text={i18n.t("save")}
                                onPress={formik.handleSubmit}
                            />
                        )}
                    </View>

                    {isAddReturnItemModalVisibile && (
                        <AddReturnItem
                            type="PURCHASERETURN"
                            taxPercent={Number(purchase?.taxPercent)}
                            itemsData={
                                purchaseItems as {
                                    [itemId: number]: PurchaseItem;
                                }
                            }
                            isVisible={isAddReturnItemModalVisibile}
                            toggleVisibility={() => {
                                selectedItem.current = undefined;
                                toggleAddReturnItemModal();
                            }}
                            onReturnItemChange={onReturnItemChanged}
                            value={selectedItem.current}
                        />
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

export default AddUpdatePurchaseReturn;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    container: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 12,
    },
    formContainer: {
        rowGap: 16,
    },
    rowContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
});
