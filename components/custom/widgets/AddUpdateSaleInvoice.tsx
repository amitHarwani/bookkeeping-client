import { i18n } from "@/app/_layout";
import CustomButton from "@/components/custom/basic/CustomButton";
import CustomDateTimePicker from "@/components/custom/basic/CustomDateTimePicker";
import ErrorMessage from "@/components/custom/basic/ErrorMessage";
import Input from "@/components/custom/basic/Input";
import RadioButton from "@/components/custom/basic/RadioButton";
import PurchaseInvoiceListItem from "@/components/custom/business/PurchaseInvoiceListItem";
import AddInvoiceItem from "@/components/custom/widgets/AddInvoiceItem";
import InvoicePartySelector from "@/components/custom/widgets/InvoicePartySelector";
import {
    PartyTypeInInvoicePartySelector,
    PurchaseInvoiceForm,
    PurchaseInvoiceItem,
    SaleInvoiceForm,
    SaleInvoiceItem,
} from "@/constants/types";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import { capitalizeText } from "@/utils/common_utils";
import {
    PurchaseInvoiceFormValidation,
    SaleInvoiceFormValidation,
} from "@/utils/schema_validations";
import { getInvoiceTaxDetails, getTaxIDForRegistrationNumberOnInvoice } from "@/utils/tax_helper";
import { useFormik } from "formik";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import DateTimePickerCombined from "../basic/DateTimePickerCombined";
import SaleInvoiceListItem from "../business/SaleInvoiceListItem";

interface AddUpdateSaleInvoiceProps {
    operation: "ADD" | "UPDATE";
    onAddUpdateSale(values: SaleInvoiceForm): void;
    apiErrorMessage?: string | null;

    formValues?: SaleInvoiceForm;
    isUpdateEnabled?: boolean;
}
const AddUpdateSaleInvoice = ({
    operation,
    onAddUpdateSale,
    apiErrorMessage,
    formValues,
    isUpdateEnabled,
}: AddUpdateSaleInvoiceProps) => {
    /* Company State from redux */
    const companyState = useAppSelector((state) => state.company);

    const authState = useAppSelector((state) => state.auth);

    /* Decimal points to round to when showing the value */
    const decimalPoints = useMemo(() => {
        return companyState.selectedCompany?.decimalRoundTo || 2;
    }, [companyState]);

    /* Selected Company */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    /* Invoice Type Data: Cash or credit */
    const invoiceTypeRadioButtonData = useMemo(
        () => [{ key: "cash" }, { key: "credit" }],
        []
    );

    /* Yes or No: Radio Button Data */
    const yesNoRadioButtonData = useMemo(
        () => [
            { key: "yes", value: true },
            { key: "no", value: false },
        ],
        []
    );

    /* Disable all inputs only if operation is UPDATE and update is not enabled */
    const isInputsDisabled = useMemo(() => {
        if (operation === "UPDATE" && !isUpdateEnabled) {
            return true;
        }
        return false;
    }, [operation, isUpdateEnabled]);

    /* Tax Percent, and tax name on invoice */
    const { invoiceTaxPercent, invoiceTaxName, companyTaxNumber } = getInvoiceTaxDetails();

    /* To store a selected invoice item if any */
    const selectedInvoiceItem = useRef<SaleInvoiceItem>();

    /* Whether add invoice item modal is visible */
    const [isAddInvoiceItemModalVisibile, setIsAddInvoiceItemModalVisible] =
        useState(false);

    /* To toggle add invoice item modal*/
    const toggleAddInvoiceItemModal = useCallback(() => {
        setIsAddInvoiceItemModalVisible((prev) => !prev);
    }, [isAddInvoiceItemModalVisibile]);

    /* Initial Sale form */
    const initialFormValues: SaleInvoiceForm = useMemo(() => {
        if (formValues) {
            return formValues;
        }
        return {
            createdAt: new Date(),
            isNoPartyBill: true,
            doneBy: authState.user?.userId as string,
            quotationNumber: null,
            party: null,
            companyTaxNumber: companyTaxNumber,
            partyTaxNumber: "",
            autogenerateInvoice: true,
            invoiceNumber: null,
            items: {},
            discount: "0",
            subtotal: "0",
            tax: "0",
            totalAfterDiscount: "0",
            totalAfterTax: "0",
            isCredit: false,
            paymentDueDate: null,
            paymentCompletionDate: null,
            amountDue: 0,
            amountPaid: 0,
            isFullyPaid: false,
            receiptNumber: null,
            taxPercent: invoiceTaxPercent,
            taxName: invoiceTaxName,
        };
    }, [formValues]);

    /* Aggregated field displayed at the end */
    const totalFields = useMemo(
        () => [
            "subtotal",
            "discount",
            "totalAfterDiscount",
            "tax",
            "totalAfterTax",
        ],
        []
    );

    /* Form */
    const formik = useFormik({
        initialValues: initialFormValues,
        onSubmit: (values) => {
            onAddUpdateSale(values);
        },
        validationSchema: SaleInvoiceFormValidation,
    });

    /* On change of invoice item */
    const onInvoiceItemChanged = (item: SaleInvoiceItem) => {
        /* Update items field. value is stores as key value, where key is itemId and value is invoice item */
        if (item && item.item) {
            formik.setFieldTouched("items", true);
            const temp = { ...formik.values.items };
            temp[item.item?.itemId] = item;
            calculateAggregateValues(temp, formik.values.discount);
            formik.setFieldValue("items", temp);
        }
    };

    /* On Invoice Item selected */
    const onInvoiceItemSelected = (item: SaleInvoiceItem) => {
        if (item) {
            /* Setting selectedInvoiceItem, and toggling the modal */
            selectedInvoiceItem.current = item;
            toggleAddInvoiceItemModal();
        }
    };

    /* Remove Invoice Item, removing the item from items */
    const removeInvoiceItemHandler = (item: SaleInvoiceItem) => {
        if (item && item.item?.itemId) {
            const temp = { ...formik.values.items };
            delete temp[item.item?.itemId];
            formik.setFieldValue("items", temp);
            calculateAggregateValues(temp, formik.values.discount);
        }
    };

    /* On Change of items or discount value */
    const calculateAggregateValues = (
        items: { [x: number]: SaleInvoiceItem },
        discountVal: string
    ) => {
        /* Aggregate values to calculate */
        let subtotal = 0;
        let discount = 0;
        let totalAfterDiscount = 0;
        let tax = 0;
        let totalAfterTax = 0;

        /* Adding Discount */
        if (discountVal && !isNaN(Number(discountVal))) {
            discount = Number(discountVal);
        }

        /* Aggregating subtotal from all items */
        Object.values(items).forEach((item) => {
            subtotal += Number(item.subtotal);
        });

        /* Subtracting discount from subtotal */
        totalAfterDiscount = subtotal - discount;

        /* Applyting Tax */
        tax = totalAfterDiscount * (formik.values.taxPercent / 100);

        /* Total after tax */
        totalAfterTax = totalAfterDiscount + tax;

        /* Setting the values in the form */
        formik.values.subtotal = subtotal.toFixed(decimalPoints);
        formik.values.totalAfterDiscount =
            totalAfterDiscount.toFixed(decimalPoints);

        formik.values.tax = tax.toFixed(decimalPoints);
        formik.values.totalAfterTax = totalAfterTax.toFixed(decimalPoints);

        calculateDefaultAmountPaid(
            formik.values.isCredit,
            totalAfterTax.toFixed(decimalPoints)
        );
    };

    /* On change of invoice type, or total after tax */
    const calculateDefaultAmountPaid = (
        isCredit: boolean,
        totalAfterTax: string
    ) => {
        /* Cash Purchase */
        if (isCredit === false) {
            /* Set amount paid to total amount due*/
            formik.values.amountPaid = Number(totalAfterTax);
            calculateAmountDue(totalAfterTax, totalAfterTax);
        } else {
            /* Credit purchase, set amount paid to 0 initially */
            formik.values.amountPaid = 0;
            calculateAmountDue("0", totalAfterTax);
        }
    };

    /* On change of invoice type or party details or amount due */
    const calculateDefaultPaymentDueDate = (
        isCredit: boolean,
        amountDue: number,
        party: PartyTypeInInvoicePartySelector | null
    ) => {
        /* Cash transaction, or payment is complete */
        if (isCredit === false || amountDue === 0) {
            /* Payment due date is null */
            formik.values.paymentDueDate = null;
        } else {
            /* Cash transaction, if party is present and payment due date is null */
            if (party && formik.values.paymentDueDate == null) {
                /* Calculating default due date, as todays date + default credit allowance in days for the party */
                const dueDate = new Date();
                dueDate.setDate(
                    dueDate.getDate() + party?.defaultSaleCreditAllowanceInDays
                );
                formik.values.paymentDueDate = dueDate;
            }
        }
    };

    /* On change of amount paid, or totalAfterTax: Calculating amount due */
    const calculateAmountDue = (amountPaid: string, totalAfterTax: string) => {
        if (!isNaN(Number(amountPaid))) {
            const amountDue = Number(totalAfterTax) - Number(amountPaid);
            formik.values.amountDue = amountDue;
            calculateDefaultPaymentDueDate(
                formik.values.isCredit,
                amountDue,
                formik.values.party
            );
        }
    };

    return (
        <ScrollView style={styles.mainContainer}>
            <View style={styles.container}>
                <View style={styles.formContainer}>
                    {apiErrorMessage && (
                        <ErrorMessage message={apiErrorMessage} />
                    )}
                    <RadioButton
                        textKey="key"
                        data={invoiceTypeRadioButtonData}
                        label={i18n.t("invoiceType")}
                        onChange={(selectedType) => {
                            formik.setFieldTouched("isCredit", true);

                            calculateDefaultAmountPaid(
                                selectedType.key === "credit",
                                formik.values.totalAfterTax
                            );
                            calculateDefaultPaymentDueDate(
                                selectedType.key === "credit",
                                formik.values.amountDue,
                                formik.values.party
                            );
                            if (selectedType.key === "credit") {
                                formik.setFieldValue("isCredit", true);
                            } else {
                                formik.setFieldValue("isCredit", false);
                            }
                        }}
                        value={
                            formik.values.isCredit
                                ? invoiceTypeRadioButtonData[1]
                                : invoiceTypeRadioButtonData[0]
                        }
                        errorMessage={
                            formik.touched.isCredit && formik.errors.isCredit
                                ? formik.errors.isCredit
                                : null
                        }
                        isDisabled={isInputsDisabled}
                    />

                    <RadioButton
                        textKey="key"
                        data={yesNoRadioButtonData}
                        label={i18n.t("isNoPartyBill")}
                        onChange={(selectedVal) => {
                            formik.setFieldTouched("isNoPartyBill", true);
                            formik.setFieldValue(
                                "isNoPartyBill",
                                selectedVal.value
                            );
                            formik.setFieldValue("party", null);
                            formik.setFieldValue("partyTaxNumber", "");
                        }}
                        value={
                            formik.values.isNoPartyBill
                                ? yesNoRadioButtonData[0]
                                : yesNoRadioButtonData[1]
                        }
                        isDisabled={isInputsDisabled}
                        errorMessage={
                            formik.touched.isNoPartyBill &&
                            formik.errors.isNoPartyBill
                                ? formik.errors.isNoPartyBill
                                : null
                        }
                    />
                    {!formik.values.isNoPartyBill && (
                        <InvoicePartySelector
                            value={formik.values.party || undefined}
                            onChange={(party) => {
                                formik.setFieldTouched("party", true);
                                calculateDefaultPaymentDueDate(
                                    formik.values.isCredit,
                                    formik.values.amountDue,
                                    party
                                );
                                formik.setFieldValue("party", party);

                                /* Tax ID displayed on invoice according to country */
                                const taxIdOnInvoice = getTaxIDForRegistrationNumberOnInvoice(party.countryId);

                                /* Tax registration number of the particular tax id */
                                const partyTaxNumber = party?.taxDetails?.find((taxDetail) => taxDetail.taxId == taxIdOnInvoice);
                                
                                /* Setting the party tax number */
                                formik.setFieldValue("partyTaxNumber", partyTaxNumber?.registrationNumber || "");
                            }}
                            errorMessage={
                                formik.touched.party && formik.errors.party
                                    ? formik.errors.party
                                    : null
                            }
                            isDisabled={isInputsDisabled}
                        />
                    )}

                    <DateTimePickerCombined
                        dateLabel={i18n.t("transactionDateTime")}
                        onChange={(selectedDateTime) => {
                            formik.setFieldTouched("createdAt", true);
                            formik.setFieldValue("createdAt", selectedDateTime);
                        }}
                        value={formik.values.createdAt}
                        timeLabel=""
                        isDisabled={operation === "UPDATE"}
                    />

                    {operation === "ADD" && (
                        <RadioButton
                            textKey="key"
                            data={yesNoRadioButtonData}
                            label={i18n.t("autogenerateInvoiceNumber")}
                            onChange={(selectedVal) => {
                                formik.setFieldTouched(
                                    "autogenerateInvoice",
                                    true
                                );
                                formik.setFieldValue(
                                    "autogenerateInvoice",
                                    selectedVal.value
                                );
                                formik.setFieldValue("invoiceNumber", null);
                            }}
                            value={
                                formik.values.autogenerateInvoice
                                    ? yesNoRadioButtonData[0]
                                    : yesNoRadioButtonData[1]
                            }
                            isDisabled={isInputsDisabled}
                            errorMessage={
                                formik.touched.autogenerateInvoice &&
                                formik.errors.autogenerateInvoice
                                    ? formik.errors.autogenerateInvoice
                                    : null
                            }
                        />
                    )}
                    {!formik.values.autogenerateInvoice && (
                        <Input
                            label={i18n.t("invoiceNumber")}
                            placeholder={capitalizeText(
                                i18n.t("enterInvoiceNumber")
                            )}
                            value={
                                formik.values.invoiceNumber?.toString() || ""
                            }
                            onChangeText={formik.handleChange("invoiceNumber")}
                            onBlur={formik.handleBlur("invoiceNumber")}
                            errorMessage={
                                formik.touched.invoiceNumber &&
                                formik.errors.invoiceNumber
                                    ? formik.errors.invoiceNumber
                                    : null
                            }
                            keyboardType="number-pad"
                            isDisabled={operation === "UPDATE"}
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
                            <SaleInvoiceListItem
                                item={item}
                                removeItem={removeInvoiceItemHandler}
                                onInvoiceItemSelected={onInvoiceItemSelected}
                                isDisabled={isInputsDisabled}
                            />
                        )}
                        keyExtractor={(item) =>
                            item.item?.itemId?.toString() || ""
                        }
                        scrollEnabled={false}
                    />

                    <View style={styles.formContainer}>
                        <CustomButton
                            text={i18n.t("addItem")}
                            onPress={toggleAddInvoiceItemModal}
                            isSecondaryButton
                            isDisabled={isInputsDisabled}
                        />

                        <Input
                            label={i18n.t("discount")}
                            placeholder={capitalizeText(
                                i18n.t("enterDiscountAmount")
                            )}
                            value={formik.values.discount.toString() || ""}
                            onChangeText={(val) => {
                                calculateAggregateValues(
                                    formik.values.items,
                                    val
                                );
                                formik.setFieldValue("discount", val);
                            }}
                            onBlur={formik.handleBlur("discount")}
                            errorMessage={
                                formik.touched.discount &&
                                formik.errors.discount
                                    ? formik.errors.discount
                                    : null
                            }
                            keyboardType="number-pad"
                            isDisabled={isInputsDisabled}
                        />

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
                                        field as keyof SaleInvoiceForm
                                    ]?.toString()}
                                </Text>
                            </View>
                        ))}

                        <Input
                            label={i18n.t("amountPaid")}
                            placeholder={capitalizeText(
                                i18n.t("enterAmountPaid")
                            )}
                            value={formik.values.amountPaid.toString()}
                            onChangeText={(val) => {
                                calculateAmountDue(
                                    val,
                                    formik.values.totalAfterTax
                                );
                                formik.setFieldValue("amountPaid", val);
                            }}
                            onBlur={formik.handleBlur("amountPaid")}
                            isDisabled={
                                formik.values.isCredit === false ||
                                isInputsDisabled
                            }
                            errorMessage={
                                formik.touched.amountPaid &&
                                formik.errors.amountPaid
                                    ? formik.errors.amountPaid
                                    : null
                            }
                            keyboardType="number-pad"
                        />

                        <Input
                            label={i18n.t("amountDue")}
                            placeholder={capitalizeText(
                                i18n.t("enterAmountDue")
                            )}
                            value={formik.values.amountDue.toFixed(
                                decimalPoints
                            )}
                            onChangeText={formik.handleChange("amountDue")}
                            onBlur={formik.handleBlur("amountDue")}
                            isDisabled={true}
                            errorMessage={
                                formik.touched.amountDue &&
                                formik.errors.amountDue
                                    ? formik.errors.amountDue
                                    : null
                            }
                            keyboardType="number-pad"
                        />

                        {formik.values.isCredit &&
                            Number(formik.values.amountDue) !== 0 && (
                                <CustomDateTimePicker
                                    label={i18n.t("paymentDueDate")}
                                    mode="date"
                                    value={
                                        formik.values.paymentDueDate ||
                                        undefined
                                    }
                                    onChange={(dateInString, date) => {
                                        formik.setFieldTouched(
                                            "paymentDueDate",
                                            true
                                        );
                                        formik.setFieldValue(
                                            "paymentDueDate",
                                            date
                                        );
                                    }}
                                    isDisabled={isInputsDisabled}
                                />
                            )}

                        {!isInputsDisabled && (
                            <CustomButton
                                text={i18n.t("save")}
                                onPress={formik.handleSubmit}
                            />
                        )}
                    </View>

                    {isAddInvoiceItemModalVisibile && (
                        <AddInvoiceItem
                            isVisible={isAddInvoiceItemModalVisibile}
                            toggleVisibility={() => {
                                selectedInvoiceItem.current = undefined;
                                toggleAddInvoiceItemModal();
                            }}
                            onInvoiceItemChange={onInvoiceItemChanged}
                            value={selectedInvoiceItem.current}
                        />
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

export default AddUpdateSaleInvoice;

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
