import { i18n } from "@/app/_layout";
import { PurchaseInvoiceItem } from "@/constants/types";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import { capitalizeText } from "@/utils/common_utils";
import { AddUpdateInvoiceItemValidation } from "@/utils/schema_validations";
import { getInvoiceTaxDetails } from "@/utils/tax_helper";
import { useFormik } from "formik";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import CustomButton from "../basic/CustomButton";
import CustomModal from "../basic/CustomModal";
import Input from "../basic/Input";
import InvoiceItemSelector from "./InvoiceItemSelector";

interface AddInvoiceItemProps {
    value?: PurchaseInvoiceItem;
    isVisible: boolean;
    toggleVisibility(): void;
    onInvoiceItemChange(invoiceItem: PurchaseInvoiceItem): void;
    taxPercent?: number;
}
const AddInvoiceItem = ({
    value,
    isVisible,
    toggleVisibility,
    onInvoiceItemChange,
    taxPercent
}: AddInvoiceItemProps) => {
    /* Company State from redux */
    const companyState = useAppSelector((state) => state.company);

    /* Decimal points to round to when showing the value */
    const decimalPoints = useMemo(() => {
        return companyState.selectedCompany?.decimalRoundTo;
    }, [companyState]);

    /* Tax Name and percent to be applied on invoices */
    const { invoiceTaxPercent, invoiceTaxName } = getInvoiceTaxDetails();

    /* Initial form values */
    const [formValues, setFormValues] = useState<PurchaseInvoiceItem>({
        item: undefined,
        units: 0,
        pricePerUnit: 0,
        subtotal: "",
        tax: "",
        totalAfterTax: "",
        taxPercent: taxPercent || invoiceTaxPercent
    });

    /* Formik initialization */
    const formik = useFormik({
        initialValues: formValues,
        enableReinitialize: true,
        validationSchema: AddUpdateInvoiceItemValidation,
        onSubmit: (values) => {
            /* On submit pass values to parent and hide modal */
            toggleVisibility();
            onInvoiceItemChange(values);
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

    /* On change of price per unit, units, or include tax radio button */
    useEffect(() => {
        /* Calculate totals and set their values */
        const totals = calculateTotals(
            Number(formik.values.units),
            Number(formik.values.pricePerUnit)
        );
        if (totals) {
            formik.setFieldValue("subtotal", totals.subtotal);
            formik.setFieldValue("tax", totals.tax);
            formik.setFieldValue("totalAfterTax", totals.total);
        }
    }, [formik.values.pricePerUnit, formik.values.units]);

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

                        <InvoiceItemSelector
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
                                            formik.values.units?.toString() ||
                                            ""
                                        }
                                        onChangeText={(unit) => {
                                            formik.setFieldTouched(
                                                "unit",
                                                true
                                            );
                                            formik.setFieldValue("units", unit);
                                        }}
                                        errorMessage={
                                            formik.touched.units &&
                                            formik.errors.units
                                                ? formik.errors.units
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
                                        value={
                                            formik.values.pricePerUnit?.toString() ||
                                            ""
                                        }
                                        onChangeText={(price) => {
                                            formik.setFieldTouched(
                                                "pricePerUnit",
                                                true
                                            );
                                            formik.setFieldValue(
                                                "pricePerUnit",
                                                price
                                            );
                                        }}
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
                                        <Text style={[commonStyles.textSmallBold, commonStyles.capitalize]}>
                                            {i18n.t("subtotal")}
                                        </Text>
                                        <Text style={[commonStyles.textMediumXLBold, commonStyles.textGray]}>
                                            {companyState.country?.currency}{" "}
                                            {formik.values.subtotal}
                                        </Text>
                                    </View>
                                    <View style={styles.totalContainer}>
                                        <Text style={[commonStyles.textSmallBold, commonStyles.capitalize]}>
                                            {i18n.t("tax")}{" "}
                                            {`(${formik.values.taxPercent}%)`}
                                        </Text>
                                        <Text style={[commonStyles.textMediumXLBold, commonStyles.textGray]}>
                                            {companyState.country?.currency}{" "}
                                            {formik.values.tax}
                                        </Text>
                                    </View>
                                    <View style={styles.totalContainer}>
                                        <Text style={[commonStyles.textSmallBold, commonStyles.capitalize]}>
                                            {i18n.t("total")}
                                        </Text>
                                        <Text style={[commonStyles.textMediumXLBold, commonStyles.textGray]}>
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

export default AddInvoiceItem;

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
