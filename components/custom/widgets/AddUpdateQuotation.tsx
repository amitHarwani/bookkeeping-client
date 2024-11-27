import { i18n } from "@/app/_layout";
import CustomButton from "@/components/custom/basic/CustomButton";
import ErrorMessage from "@/components/custom/basic/ErrorMessage";
import Input from "@/components/custom/basic/Input";
import RadioButton from "@/components/custom/basic/RadioButton";
import AddInvoiceItem from "@/components/custom/widgets/AddInvoiceItem";
import InvoicePartySelector from "@/components/custom/widgets/InvoicePartySelector";
import { QuotationForm, SaleInvoiceItem } from "@/constants/types";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import { capitalizeText } from "@/utils/common_utils";
import { QuotationFormValidation } from "@/utils/schema_validations";
import {
    getInvoiceTaxDetails,
    getTaxIDForRegistrationNumberOnInvoice,
} from "@/utils/tax_helper";
import { useFormik } from "formik";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    FlatList,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import DateTimePickerCombined from "../basic/DateTimePickerCombined";
import SaleInvoiceListItem from "../business/SaleInvoiceListItem";
import ForwardSquareIcon from "@/assets/images/forward_square_icon.png";

interface AddUpdateQuotationProps {
    operation: "ADD" | "UPDATE";
    onAddUpdateQuotation(values: QuotationForm): void;
    apiErrorMessage?: string | null;

    formValues?: QuotationForm;
    isUpdateEnabled?: boolean;
    isConvertToInvoiceEnabled?: boolean;
    onConvertToInvoice?(): void;
}
const AddUpdateQuotation = ({
    operation,
    onAddUpdateQuotation,
    apiErrorMessage,
    formValues,
    isUpdateEnabled,
    isConvertToInvoiceEnabled = false,
    onConvertToInvoice,
}: AddUpdateQuotationProps) => {
    /* Company State from redux */
    const companyState = useAppSelector((state) => state.company);

    const authState = useAppSelector((state) => state.auth);

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

    /* Disable all inputs only if operation is UPDATE and update is not enabled */
    const isInputsDisabled = useMemo(() => {
        if (operation === "UPDATE" && !isUpdateEnabled) {
            return true;
        }
        return false;
    }, [operation, isUpdateEnabled]);

    /* Tax Percent, and tax name on invoice */
    const { invoiceTaxPercent, invoiceTaxName, companyTaxNumber } =
        getInvoiceTaxDetails();

    /* To store a selected invoice item if any */
    const selectedInvoiceItem = useRef<SaleInvoiceItem>();

    /* Whether add invoice item modal is visible */
    const [isAddInvoiceItemModalVisibile, setIsAddInvoiceItemModalVisible] =
        useState(false);

    /* To toggle add invoice item modal*/
    const toggleAddInvoiceItemModal = useCallback(() => {
        setIsAddInvoiceItemModalVisible((prev) => !prev);
    }, [isAddInvoiceItemModalVisibile]);

    /* Initial Quotation form */
    const initialFormValues: QuotationForm = useMemo(() => {
        if (formValues) {
            return formValues;
        }
        return {
            createdAt: new Date(),
            createdBy: authState.user?.userId as string,
            quotationNumber: null,
            party: null,
            autogenerateQuotationNumber: true,
            items: {},
            discount: "0",
            subtotal: "0",
            tax: "0",
            totalAfterDiscount: "0",
            totalAfterTax: "0",
            taxPercent: invoiceTaxPercent,
            taxName: invoiceTaxName,
            companyTaxNumber: companyTaxNumber,
            partyTaxNumber: "",
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
            onAddUpdateQuotation(values);
        },
        validationSchema: QuotationFormValidation,
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
    };

    return (
        <ScrollView style={styles.mainContainer}>
            <View style={styles.container}>
                <View style={styles.formContainer}>
                    {apiErrorMessage && (
                        <ErrorMessage message={apiErrorMessage} />
                    )}
                    {isConvertToInvoiceEnabled &&
                        operation === "UPDATE" &&
                        !isUpdateEnabled && (
                            <Pressable
                                style={styles.convertToInvoiceContainer}
                                onPress={() => {
                                    typeof onConvertToInvoice === "function" &&
                                        onConvertToInvoice();
                                }}
                            >
                                <Image
                                    source={ForwardSquareIcon}
                                    style={styles.convertToInvoiceIcon}
                                />
                                <Text
                                    style={[
                                        commonStyles.textSmallBold,
                                        commonStyles.capitalize,
                                    ]}
                                >
                                    {i18n.t("convertToInvoice")}
                                </Text>
                            </Pressable>
                        )}

                    <InvoicePartySelector
                        value={formik.values.party || undefined}
                        onChange={(party) => {
                            formik.setFieldTouched("party", true);
                            formik.setFieldValue("party", party);

                            /* Tax ID displayed on invoice according to country */
                            const taxIdOnInvoice =
                                getTaxIDForRegistrationNumberOnInvoice(
                                    party.countryId
                                );

                            /* Tax registration number of the particular tax id */
                            const partyTaxNumber = party?.taxDetails?.find(
                                (taxDetail) => taxDetail.taxId == taxIdOnInvoice
                            );

                            /* Setting the party tax number */
                            formik.setFieldValue(
                                "partyTaxNumber",
                                partyTaxNumber?.registrationNumber || ""
                            );
                        }}
                        errorMessage={
                            formik.touched.party && formik.errors.party
                                ? formik.errors.party
                                : null
                        }
                        isDisabled={isInputsDisabled}
                    />

                    <DateTimePickerCombined
                        dateLabel={i18n.t("dateTime")}
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
                            label={i18n.t("autogenerateQuotationNumber")}
                            onChange={(selectedVal) => {
                                formik.setFieldTouched(
                                    "autogenerateQuotationNumber",
                                    true
                                );
                                formik.setFieldValue(
                                    "autogenerateQuotationNumber",
                                    selectedVal.value
                                );
                                formik.setFieldValue("quotationNumber", null);
                            }}
                            value={
                                formik.values.autogenerateQuotationNumber
                                    ? yesNoRadioButtonData[0]
                                    : yesNoRadioButtonData[1]
                            }
                            isDisabled={isInputsDisabled}
                            errorMessage={
                                formik.touched.autogenerateQuotationNumber &&
                                formik.errors.autogenerateQuotationNumber
                                    ? formik.errors.autogenerateQuotationNumber
                                    : null
                            }
                        />
                    )}
                    {!formik.values.autogenerateQuotationNumber && (
                        <Input
                            label={i18n.t("quotationNumber")}
                            placeholder={capitalizeText(
                                i18n.t("enterQuotationNumber")
                            )}
                            value={
                                formik.values.quotationNumber?.toString() || ""
                            }
                            onChangeText={formik.handleChange("quotationNumber")}
                            onBlur={formik.handleBlur("quotationNumber")}
                            errorMessage={
                                formik.touched.quotationNumber &&
                                formik.errors.quotationNumber
                                    ? formik.errors.quotationNumber
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
                                        field as keyof QuotationForm
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

                    {isAddInvoiceItemModalVisibile && (
                        <AddInvoiceItem
                            isVisible={isAddInvoiceItemModalVisibile}
                            toggleVisibility={() => {
                                selectedInvoiceItem.current = undefined;
                                toggleAddInvoiceItemModal();
                            }}
                            onInvoiceItemChange={onInvoiceItemChanged}
                            value={selectedInvoiceItem.current}
                            taxPercent={operation==="UPDATE" ? formValues?.taxPercent : undefined}
                        />
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

export default AddUpdateQuotation;

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
    convertToInvoiceContainer: {
        flexDirection: "row",
        columnGap: 4,
        alignItems: "center",
    },
    convertToInvoiceIcon: {
        width: 24,
        height: 24,
    },
});
