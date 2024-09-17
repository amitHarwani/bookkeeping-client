import { i18n } from "@/app/_layout";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { AddUpdateCompanyForm } from "@/constants/types";
import SysAdminService from "@/services/sysadmin/sysadmin_service";
import { Country } from "@/services/sysadmin/sysadmin_types";
import { commonStyles } from "@/utils/common_styles";
import { capitalizeText, getApiErrorMessage } from "@/utils/common_utils";
import { AddUpdateCompanyFormValidation } from "@/utils/schema_validations";
import { useQuery } from "@tanstack/react-query";
import { Formik } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import Dropdown from "../basic/Dropdown";
import ErrorMessage from "../basic/ErrorMessage";
import Input from "../basic/Input";
import LoadingSpinnerOverlay from "../basic/LoadingSpinnerOverlay";
import CustomDateTimePicker from "../basic/CustomDateTimePicker";
import TaxInputItem from "../business/TaxInputItem";
import CustomButton from "../basic/CustomButton";

interface AddUpdateCompanyProps {
    operation?: "ADD" | "UPDATE";
    isEditEnabled?: boolean;
    onSubmit(values: AddUpdateCompanyForm): void;
    formValues?: AddUpdateCompanyForm;
    apiCallInProgress?: boolean;
    errorOnSubmit?: string | null;
}
const AddUpdateCompany = ({
    operation = "ADD",
    isEditEnabled = true,
    onSubmit,
    formValues,
    errorOnSubmit,
    apiCallInProgress = false,
}: AddUpdateCompanyProps) => {
    /* Country Selected */
    const [selectedCountry, setSelectedCountry] = useState<
        Country | undefined
    >();

    /* If operation type is update, and edit is disabled, inputs will be disabled */
    const isInputsDisabled = useMemo(() => {
        if (operation === "UPDATE" && !isEditEnabled) {
            return true;
        }
        return false;
    }, [operation, isEditEnabled]);

    /* phoneCodes list of the selected country  */
    const codesOfSelectedCountry = useMemo(() => {
        if (selectedCountry) {
            return selectedCountry.phoneNumberCodes?.map((code) => ({
                key: code,
            }));
        }
    }, [selectedCountry]);

    const initialFormValues: AddUpdateCompanyForm = useMemo(() => {
        if (formValues) {
            if (formValues.country) {
                setSelectedCountry(formValues.country);
            }
            return formValues;
        }
        return {
            companyName: "",
            address: "",
            country: undefined,
            localDayStartTime: new Date(),
            mobileNumber: "",
            phoneCode: "",
            decimalRoundTo: 2,
            taxDetails: {},
        };
    }, [formValues]);

    /* Fetching all the countries */
    const {
        isFetching: isFetchingCountriesList,
        data: countriesListResponse,
        error: countriesListError,
    } = useQuery({
        queryKey: [ReactQueryKeys.allCountries],
        queryFn: SysAdminService.getAllCountries,
        refetchOnMount: true,
        staleTime: Infinity,
    });

    /* Fetching tax details of the selected country */
    const {
        isFetching: isFetchingTaxDetails,
        data: taxDetailsResponse,
        error: taxDetailsError,
        refetch: refetchTaxDetails,
    } = useQuery({
        queryKey: [
            ReactQueryKeys.taxDetailsOfCountry,
            selectedCountry?.countryId,
        ],
        queryFn: () =>
            SysAdminService.getTaxDetailsOfCountry(
                selectedCountry?.countryId as number
            ),
        enabled: false,
    });

    /* Fetch tax details once selectedCountry changes */
    useEffect(() => {
        if (selectedCountry) {
            refetchTaxDetails();
        }
    }, [selectedCountry]);

    /* All countries from response */
    const allCountries = useMemo(() => {
        if (countriesListResponse) {
            return countriesListResponse?.data.countries;
        }
        return [];
    }, [countriesListResponse]);

    /* Tax Details from response */
    const taxDetails = useMemo(() => {
        if (taxDetailsResponse) {
            return taxDetailsResponse.data.taxDetails;
        }
        return [];
    }, [taxDetailsResponse]);

    /* Loading spinner overlay when making api requests */
    const showLoadingSpinner = useMemo(() => {
        return (
            isFetchingCountriesList || isFetchingTaxDetails || apiCallInProgress
        );
    }, [isFetchingCountriesList, isFetchingTaxDetails, apiCallInProgress]);

    /* API Error Message */
    const apiErrorMessage = useMemo(() => {
        if (countriesListError) {
            return getApiErrorMessage(countriesListError);
        } else if (taxDetailsError) {
            return getApiErrorMessage(taxDetailsError);
        } else if (errorOnSubmit) {
            return errorOnSubmit;
        }
        return null;
    }, [countriesListError, taxDetailsError, errorOnSubmit]);

    return (
        <View style={styles.container}>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}

            {apiErrorMessage && <ErrorMessage message={apiErrorMessage} />}
            <Formik
                initialValues={initialFormValues}
                validationSchema={AddUpdateCompanyFormValidation}
                onSubmit={(values) => {
                    onSubmit(values);
                }}
            >
                {({
                    handleChange,
                    handleBlur,
                    setFieldTouched,
                    setFieldValue,
                    values,
                    handleSubmit,
                    errors,
                    touched,
                }) => (
                    <View style={styles.formContainer}>
                        <Input
                            label={i18n.t("companyName")}
                            placeholder={capitalizeText(
                                i18n.t("enterCompanyName")
                            )}
                            value={values.companyName}
                            onChangeText={handleChange("companyName")}
                            onBlur={handleBlur("companyName")}
                            errorMessage={
                                touched.companyName && errors.companyName
                                    ? errors.companyName
                                    : null
                            }
                            isDisabled={isInputsDisabled}
                        />

                        <Dropdown
                            label={i18n.t("country")}
                            data={allCountries}
                            textKey="countryName"
                            onChange={(selectedCountry) => {
                                setSelectedCountry(selectedCountry as Country);
                                setFieldTouched("country", true);
                                setFieldValue("country", selectedCountry);
                            }}
                            errorMessage={
                                touched.country && errors.country
                                    ? errors.country
                                    : null
                            }
                            value={values.country}
                            isDisabled={isInputsDisabled}
                        />

                        {values.country && (
                            <View style={styles.mobileNumberContainer}>
                                <Dropdown
                                    label={i18n.t("code")}
                                    data={codesOfSelectedCountry}
                                    textKey="key"
                                    onChange={(selectedCode) => {
                                        setFieldTouched("phoneCode", true);
                                        setFieldValue(
                                            "phoneCode",
                                            selectedCode?.key
                                        );
                                    }}
                                    extraContainerStyles={{
                                        flexGrow: 0.4,
                                    }}
                                    errorMessage={
                                        touched.phoneCode && errors.phoneCode
                                            ? errors.phoneCode
                                            : null
                                    }
                                    isDisabled={isInputsDisabled}
                                    customEqualsFunction={(code1, code2) =>
                                        code1?.key == code2?.key
                                    }
                                    value={{ key: values.phoneCode }}
                                />
                                <Input
                                    label={i18n.t("mobileNumber")}
                                    placeholder={capitalizeText(
                                        i18n.t("enterNumber")
                                    )}
                                    value={values.mobileNumber}
                                    onChangeText={handleChange("mobileNumber")}
                                    onBlur={handleBlur("mobileNumber")}
                                    extraContainerStyles={{
                                        flexGrow: 0.6,
                                    }}
                                    errorMessage={
                                        touched.mobileNumber &&
                                        errors.mobileNumber
                                            ? errors.mobileNumber
                                            : null
                                    }
                                    keyboardType="number-pad"
                                    isDisabled={isInputsDisabled}
                                />
                            </View>
                        )}

                        <Input
                            label={i18n.t("address")}
                            placeholder={capitalizeText(i18n.t("enterAddress"))}
                            value={values.address}
                            onChangeText={handleChange("address")}
                            onBlur={handleBlur("address")}
                            errorMessage={
                                touched.address && errors.address
                                    ? errors.address
                                    : null
                            }
                            isDisabled={isInputsDisabled}
                        />

                        <CustomDateTimePicker
                            mode="time"
                            label={i18n.t("localDayStartTime")}
                            onChange={(_, selectedDateTime) => {
                                setFieldTouched("localDayStartTime", true);
                                setFieldValue(
                                    "localDayStartTime",
                                    selectedDateTime
                                );
                            }}
                            value={values.localDayStartTime}
                            isDisabled={isInputsDisabled}
                        />

                        <Input
                            label={i18n.t("decimalRoundTo")}
                            placeholder={capitalizeText(
                                capitalizeText(i18n.t("decimalRoundTo"))
                            )}
                            value={values.decimalRoundTo.toString()}
                            keyboardType="numeric"
                            onChangeText={handleChange("decimalRoundTo")}
                            onBlur={handleBlur("decimalRoundTo")}
                            errorMessage={
                                touched.decimalRoundTo && errors.decimalRoundTo
                                    ? errors.decimalRoundTo
                                    : null
                            }
                            isDisabled={isInputsDisabled}
                        />

                        {touched.taxDetails && errors.taxDetails && (
                            <ErrorMessage
                                message={`${i18n.t("missingTaxDetails")}`}
                            />
                        )}

                        {taxDetails.map((taxDetail) => (
                            <TaxInputItem
                                key={taxDetail.taxId}
                                taxInfo={taxDetail}
                                onRegistered={() => {
                                    if (!values.taxDetails?.[taxDetail.taxId]) {
                                        setFieldValue("taxDetails", {
                                            ...values.taxDetails,
                                            [taxDetail.taxId]: {
                                                taxId: taxDetail.taxId,
                                                registrationNumber: "",
                                            },
                                        });
                                    }
                                }}
                                onDeregistered={() => {
                                    const temp = {
                                        ...values.taxDetails,
                                    };
                                    delete temp[taxDetail.taxId];
                                    setFieldValue("taxDetails", temp);
                                }}
                                onChange={(registrationNumber) => {
                                    setFieldTouched("taxDetails", true);
                                    setFieldValue("taxDetails", {
                                        ...values.taxDetails,
                                        [taxDetail.taxId]: {
                                            taxId: taxDetail.taxId,
                                            registrationNumber:
                                                registrationNumber,
                                        },
                                    });
                                }}
                                value={{
                                    isTaxRegistered: values?.taxDetails?.[
                                        taxDetail?.taxId
                                    ]
                                        ? true
                                        : false,
                                    registrationNumber:
                                        values?.taxDetails?.[taxDetail?.taxId]
                                            ?.registrationNumber || "",
                                }}
                                isDisabled={isInputsDisabled}
                            />
                        ))}

                        {!isInputsDisabled && (
                            <CustomButton
                                text={
                                    operation === "UPDATE"
                                        ? i18n.t("updateCompany")
                                        : i18n.t("addCompany")
                                }
                                onPress={handleSubmit}
                                extraContainerStyles={{ marginTop: 8 }}
                                isDisabled={showLoadingSpinner}
                            />
                        )}
                    </View>
                )}
            </Formik>
        </View>
    );
};

export default AddUpdateCompany;

const styles = StyleSheet.create({
    container: {
        rowGap: 24,
    },
    formContainer: {
        rowGap: 16,
    },
    mobileNumberContainer: {
        flexDirection: "row",
        columnGap: 6,
    },
});
