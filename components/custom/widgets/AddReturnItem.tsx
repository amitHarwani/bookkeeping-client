import { i18n } from "@/app/_layout";
import { ReturnItemSelectorType, ReturnItemType } from "@/constants/types";
import { PurchaseItem, SaleItem } from "@/services/billing/billing_types";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import { capitalizeText } from "@/utils/common_utils";
import {
    AddUpdateReturnItemValidation
} from "@/utils/schema_validations";
import { useFormik } from "formik";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import CustomButton from "../basic/CustomButton";
import CustomModal from "../basic/CustomModal";
import Input from "../basic/Input";
import ReturnsItemSelector from "./ReturnsItemSelector";

interface AddReturnItemProps {
    type: "SALERETURN" | "PURCHASERETURN";
    saleTaxPercent: number,
    itemsData: { [itemId: number]: SaleItem | PurchaseItem };
    value?: ReturnItemType;
    isVisible: boolean;
    toggleVisibility(): void;
    onReturnItemChange(item: ReturnItemType): void;
}
const AddReturnItem = ({
    type,
    saleTaxPercent,
    itemsData,
    value,
    isVisible,
    toggleVisibility,
    onReturnItemChange,
}: AddReturnItemProps) => {
    /* Company State from redux */
    const companyState = useAppSelector((state) => state.company);

    /* Decimal points to round to when showing the value */
    const decimalPoints = useMemo(() => {
        return companyState.selectedCompany?.decimalRoundTo;
    }, [companyState]);

    /* Initial form values */
    const [formValues, setFormValues] = useState<ReturnItemType>({
        item: undefined,
        unitsSoldOrPurchased: 0,
        unitsReturned: 0,
        pricePerUnit: 0,
        subtotal: "",
        tax: "",
        totalAfterTax: "",
        taxPercent: saleTaxPercent,
    });

    /* Formik initialization */
    const formik = useFormik({
        initialValues: formValues,
        enableReinitialize: true,
        validationSchema: AddUpdateReturnItemValidation,
        onSubmit: (values) => {
            /* On submit pass values to parent and hide modal */
            toggleVisibility();
            onReturnItemChange(values);
        },
    });

    /* Calculate subtotal, total and tax amount */
    const calculateTotals = useCallback(
        (units: number, pricePerUnit: number) => {
            /* If unit and price per unit are not numbers */
            if (isNaN(units) || isNaN(pricePerUnit)) {
                return;
            }

            /* Subtotal is units * price per unit */
            const subtotal = units * pricePerUnit;

            /* Tax amount */
            const tax = subtotal * (formik.values.taxPercent / 100);

            /* Total */
            const total = subtotal + tax;

            return {
                subtotal: subtotal.toFixed(decimalPoints),
                tax: tax.toFixed(decimalPoints),
                total: total.toFixed(decimalPoints),
            };
        },
        []
    );

    /* On change of price per unit, units returned */
    useEffect(() => {
        /* Calculate totals and set their values */
        const totals = calculateTotals(
            Number(formik.values.unitsReturned),
            Number(formik.values.pricePerUnit)
        );
        if (totals) {
            formik.setFieldValue("subtotal", totals.subtotal);
            formik.setFieldValue("tax", totals.tax);
            formik.setFieldValue("totalAfterTax", totals.total);
        }
    }, [formik.values.pricePerUnit, formik.values.unitsReturned]);

    const onReturnItemChangeHandler = (item: ReturnItemSelectorType) => {

        const saleItem = itemsData[item.itemId] as SaleItem;

        formik.setFieldTouched("item", true);
        formik.setFieldValue("item", {
            itemName: item.itemName,
            itemId: item.itemId,
            unitId: item.unitId,
            unitName: item.unitName
        });
        formik.setFieldValue("unitsSoldOrPurchased", Number(saleItem.unitsSold));
        formik.setFieldValue("pricePerUnit", Number(saleItem.pricePerUnit));        
    }

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
                            {i18n.t("addReturnItem")}
                        </Text>

                        <ReturnsItemSelector
                            itemsData={Object.values(itemsData)}
                            onChange={onReturnItemChangeHandler}
                            errorMessage={
                                formik.touched.item && formik.errors.item
                                    ? formik.errors.item
                                    : null
                            }
                            value={formik.values.item}
                        />

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
                                        label={
                                            type === "SALERETURN"
                                                ? i18n.t("unitsSold")
                                                : i18n.t("unitsPurchased")
                                        }
                                        placeholder={capitalizeText(
                                            i18n.t("enterUnits")
                                        )}
                                        value={
                                            formik.values.unitsSoldOrPurchased?.toString() ||
                                            ""
                                        }
                                        isDisabled
                                        onChangeText={(_) => {}}
                                        errorMessage={
                                            formik.touched
                                                .unitsSoldOrPurchased &&
                                            formik.errors.unitsSoldOrPurchased
                                                ? formik.errors
                                                      .unitsSoldOrPurchased
                                                : null
                                        }
                                        keyboardType="number-pad"
                                        extraContainerStyles={{ flex: 1 }}
                                    />
                                </View>
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
                                        label={i18n.t("unitsReturned")}
                                        placeholder={capitalizeText(
                                            i18n.t("enterUnits")
                                        )}
                                        value={
                                            formik.values.unitsReturned?.toString() ||
                                            ""
                                        }
                                        onChangeText={formik.handleChange(
                                            "unitsReturned"
                                        )}
                                        errorMessage={
                                            formik.touched.unitsReturned &&
                                            formik.errors.unitsReturned
                                                ? formik.errors.unitsReturned
                                                : null
                                        }
                                        keyboardType="number-pad"
                                        extraContainerStyles={{ flex: 1 }}
                                    />
                                </View>
                                <View style={styles.rowContainer}>
                                    <Input
                                        value={
                                            companyState.country?.currency || ""
                                        }
                                        placeholder=""
                                        keepLabelSpace
                                        isDisabled
                                        extraContainerStyles={{
                                            flex: 0.4,
                                            maxHeight: 58,
                                        }}
                                    />
                                    <Input
                                        label={i18n.t("price")}
                                        placeholder={capitalizeText(
                                            "enterPrice"
                                        )}
                                        isDisabled
                                        value={
                                            formik.values.pricePerUnit?.toString() ||
                                            ""
                                        }
                                        onChangeText={(_) => {}}
                                        errorMessage={
                                            formik.touched.pricePerUnit &&
                                            formik.errors.pricePerUnit
                                                ? formik.errors.pricePerUnit
                                                : null
                                        }
                                        keyboardType="number-pad"
                                        extraContainerStyles={{ flex: 1 }}
                                    />
                                </View>

                                <View>
                                    <View style={styles.totalContainer}>
                                        <Text
                                            style={[
                                                commonStyles.textSmallBold,
                                                commonStyles.capitalize,
                                            ]}
                                        >
                                            {i18n.t("subtotal")}
                                        </Text>
                                        <Text
                                            style={[
                                                commonStyles.textMediumXLBold,
                                                commonStyles.textGray,
                                            ]}
                                        >
                                            {companyState.country?.currency}{" "}
                                            {formik.values.subtotal}
                                        </Text>
                                    </View>
                                    <View style={styles.totalContainer}>
                                        <Text
                                            style={[
                                                commonStyles.textSmallBold,
                                                commonStyles.capitalize,
                                            ]}
                                        >
                                            {i18n.t("tax")}{" "}
                                            {`(${saleTaxPercent}%)`}
                                        </Text>
                                        <Text
                                            style={[
                                                commonStyles.textMediumXLBold,
                                                commonStyles.textGray,
                                            ]}
                                        >
                                            {companyState.country?.currency}{" "}
                                            {formik.values.tax}
                                        </Text>
                                    </View>
                                    <View style={styles.totalContainer}>
                                        <Text
                                            style={[
                                                commonStyles.textSmallBold,
                                                commonStyles.capitalize,
                                            ]}
                                        >
                                            {i18n.t("total")}
                                        </Text>
                                        <Text
                                            style={[
                                                commonStyles.textMediumXLBold,
                                                commonStyles.textGray,
                                            ]}
                                        >
                                            {companyState.country?.currency}{" "}
                                            {formik.values.totalAfterTax}
                                        </Text>
                                    </View>
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

export default AddReturnItem;

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
