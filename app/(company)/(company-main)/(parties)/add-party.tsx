import { i18n } from "@/app/_layout";
import Dropdown from "@/components/custom/basic/Dropdown";
import Input from "@/components/custom/basic/Input";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { AddUpdatePartyForm } from "@/constants/types";
import { useAppSelector } from "@/store";
import { capitalizeText, getApiErrorMessage } from "@/utils/common_utils";
import { AddUpdatePartyValidation } from "@/utils/schema_validations";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Formik } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, ToastAndroid, View } from "react-native";
import SystemAdminService from "@/services/sysadmin/sysadmin_service";
import { router } from "expo-router";
import { Country } from "@/services/sysadmin/sysadmin_types";
import UserService from "@/services/user/user_service";
import RadioButton from "@/components/custom/basic/RadioButton";
import TaxInputItem from "@/components/custom/business/TaxInputItem";
import CustomButton from "@/components/custom/basic/CustomButton";
import ErrorMessage from "@/components/custom/basic/ErrorMessage";
import BillingService from "@/services/billing/billing_service";

const AddParty = () => {
    /* Company State & Selected company from redux */
    const companyState = useAppSelector((state) => state.company);
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    /* Selected country state */
    const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(
        companyState.country
    );

    /* phoneCodes list of the selected country  */
    const codesOfSelectedCountry = useMemo(() => {
        if (selectedCountry) {
            return selectedCountry.phoneNumberCodes?.map((code) => ({
                key: code,
            }));
        }
    }, [selectedCountry]);

    /* Data for Is Active radio button */
    const isActiveRadioButtonData = useMemo(() => {
        return [{ key: "yes" }, { key: "no" }];
    }, []);

    /* Initial form values */
    const initialFormValues: AddUpdatePartyForm = useMemo(() => {
        return {
            country: companyState.country,
            defaultPurchaseCreditAllowanceInDays: 30,
            defaultSaleCreditAllowanceInDays: 30,
            isActive: true,
            partyName: "",
            phoneCode: "",
            phoneNumber: "",
            taxDetails: [],
        };
    }, [companyState]);

    /* Fetching all the countries */
    const {
        isFetching: fetchingCountries,
        data: countriesData,
        error: errorFetchingCountries,
    } = useQuery({
        queryKey: [ReactQueryKeys.allCountries],
        queryFn: SystemAdminService.getAllCountries,
    });

    /* To fetch tax details of the selected country */
    const {
        isFetching: fetchingTaxDetailsOfCountry,
        data: taxDetailsOfCountryResponse,
        error: errorFetchingTaxDetailsOfCountry,
        refetch: fetchTaxDetailsOfCountry,
    } = useQuery({
        queryKey: [
            ReactQueryKeys.taxDetailsOfCountry,
            selectedCountry?.countryId,
        ],
        queryFn: () =>
            SystemAdminService.getTaxDetailsOfCountry(
                selectedCountry?.countryId as number
            ),
        enabled: false,
    });

    /* Tax details of country as an array after the response is received */
    const taxDetailsOfCountry = useMemo(() => {
        if (
            taxDetailsOfCountryResponse &&
            taxDetailsOfCountryResponse.success
        ) {
            return taxDetailsOfCountryResponse.data.taxDetails;
        }
        return [];
    }, [taxDetailsOfCountryResponse]);

    /* On change of selected country get the countries tax details */
    useEffect(() => {
        if (selectedCountry) {
            fetchTaxDetailsOfCountry();
        }
    }, [selectedCountry]);

    /* Add Party Mutation */
    const addPartyMutation = useMutation({
        mutationFn: (values: AddUpdatePartyForm) =>
            BillingService.addParty(
                selectedCompany?.companyId as number,
                values
            ),
    });

    /* Once party is added successfully show toast message and go back */
    useEffect(() => {
        if (addPartyMutation.isSuccess && addPartyMutation.data.success) {
            ToastAndroid.show(
                capitalizeText(`${i18n.t("partyAddedSuccessfully")}`),
                ToastAndroid.LONG
            );
            router.back();
        }
    }, [addPartyMutation.isSuccess]);

    /* Loading spinner visibility */
    const showLoadingSpinner = useMemo(() => {
        return fetchingCountries ||
            fetchingTaxDetailsOfCountry ||
            addPartyMutation.isPending
            ? true
            : false;
    }, [
        fetchingCountries,
        fetchingTaxDetailsOfCountry,
        addPartyMutation.isPending,
    ]);

    useEffect(() => {
        /* Error fetching countries or tax details of country, show toast message and go back */
        let message;
        if (errorFetchingCountries) {
            message = capitalizeText(
                `${i18n.t("errorFetchingCountries")}${i18n.t("comma")}${i18n.t(
                    "contactSupport"
                )}`
            );
        }
        if (errorFetchingTaxDetailsOfCountry) {
            message = capitalizeText(
                `${i18n.t("errorFetchingTaxDetails")}${i18n.t("comma")}${i18n.t(
                    "contactSupport"
                )}`
            );
        }
        if (message) {
            ToastAndroid.show(message, ToastAndroid.LONG);

            router.back();
        }
    }, [errorFetchingCountries, errorFetchingTaxDetailsOfCountry]);

    /* Api error message when adding a party */
    const apiErrorMessage = useMemo(() => {
        if (addPartyMutation.error) {
            return getApiErrorMessage(addPartyMutation.error);
        }
        return null;
    }, [addPartyMutation.error]);

    return (
        <ScrollView style={styles.mainContainer}>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}
            <View style={styles.container}>
                <Formik
                    initialValues={initialFormValues}
                    validationSchema={AddUpdatePartyValidation}
                    onSubmit={(values) => addPartyMutation.mutate(values)}
                >
                    {({
                        handleChange,
                        handleBlur,
                        values,
                        touched,
                        handleSubmit,
                        setFieldTouched,
                        setFieldValue,
                        errors,
                    }) => (
                        <View style={styles.formContainer}>
                            {apiErrorMessage && (
                                <ErrorMessage message={apiErrorMessage} />
                            )}
                            <Input
                                label={i18n.t("partyName")}
                                placeholder={capitalizeText(
                                    i18n.t("enterPartyName")
                                )}
                                onChangeText={handleChange("partyName")}
                                onBlur={handleBlur("partyName")}
                                value={values.partyName}
                                errorMessage={
                                    touched.partyName && errors.partyName
                                        ? errors.partyName
                                        : null
                                }
                            />
                            <Dropdown
                                data={countriesData?.data.countries}
                                label={i18n.t("country")}
                                textKey="countryName"
                                isDisabled={true}
                                value={values.country}
                                customEqualsFunction={(
                                    country1: Country,
                                    country2: Country
                                ) => country1.countryId === country2.countryId}
                                onChange={(countrySelected) => {
                                    setFieldTouched("country", true);
                                    setSelectedCountry(
                                        countrySelected as Country
                                    );
                                    setFieldValue("country", countrySelected);
                                }}
                            />
                            <Input
                                label={i18n.t(
                                    "defaultSaleCreditAllowanceInDays"
                                )}
                                placeholder={capitalizeText(
                                    i18n.t("enterSaleCreditAllowance")
                                )}
                                onChangeText={handleChange(
                                    "defaultSaleCreditAllowanceInDays"
                                )}
                                onBlur={handleBlur(
                                    "defaultSaleCreditAllowanceInDays"
                                )}
                                value={values.defaultSaleCreditAllowanceInDays.toString()}
                                errorMessage={
                                    touched.defaultSaleCreditAllowanceInDays &&
                                    errors.defaultSaleCreditAllowanceInDays
                                        ? errors.defaultSaleCreditAllowanceInDays
                                        : null
                                }
                            />
                            <Input
                                label={i18n.t(
                                    "defaultPurchaseCreditAllowanceInDays"
                                )}
                                placeholder={capitalizeText(
                                    i18n.t("enterPurchaseCreditAllowance")
                                )}
                                onChangeText={handleChange(
                                    "defaultPurchaseCreditAllowanceInDays"
                                )}
                                onBlur={handleBlur(
                                    "defaultPurchaseCreditAllowanceInDays"
                                )}
                                value={values.defaultPurchaseCreditAllowanceInDays.toString()}
                                errorMessage={
                                    touched.defaultPurchaseCreditAllowanceInDays &&
                                    errors.defaultPurchaseCreditAllowanceInDays
                                        ? errors.defaultPurchaseCreditAllowanceInDays
                                        : null
                                }
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
                                            maxHeight: 80,
                                        }}
                                        errorMessage={
                                            touched.phoneCode &&
                                            errors.phoneCode
                                                ? errors.phoneCode
                                                : null
                                        }
                                        value={{ key: values.phoneCode }}
                                        customEqualsFunction={(
                                            obj1: { key: string },
                                            obj2: { key: string }
                                        ) => obj1.key === obj2.key}
                                    />
                                    <Input
                                        label={i18n.t("phoneNumber")}
                                        placeholder={capitalizeText(
                                            i18n.t("enterNumber")
                                        )}
                                        value={values.phoneNumber}
                                        onChangeText={handleChange(
                                            "phoneNumber"
                                        )}
                                        onBlur={handleBlur("phoneNumber")}
                                        extraContainerStyles={{
                                            flexGrow: 0.6,
                                        }}
                                        errorMessage={
                                            touched.phoneNumber &&
                                            errors.phoneNumber
                                                ? errors.phoneNumber
                                                : null
                                        }
                                        keyboardType="number-pad"
                                    />
                                </View>
                            )}
                            <RadioButton
                                data={isActiveRadioButtonData}
                                label={i18n.t("isActive")}
                                textKey="key"
                                onChange={(selectedValue) => {
                                    setFieldTouched("isActive", true);
                                    setFieldValue(
                                        "isActive",
                                        selectedValue.key === "yes"
                                    );
                                }}
                                errorMessage={
                                    touched.isActive && errors.isActive
                                        ? errors.isActive
                                        : null
                                }
                                value={
                                    values.isActive
                                        ? isActiveRadioButtonData[0]
                                        : isActiveRadioButtonData[1]
                                }
                            />
                            {touched.taxDetails && errors.taxDetails && (
                                <ErrorMessage
                                    message={`${i18n.t("missingTaxDetails")}`}
                                />
                            )}
                            {taxDetailsOfCountry.map((taxDetail) => (
                                <TaxInputItem
                                    key={taxDetail.taxId}
                                    taxInfo={taxDetail}
                                    onRegistered={() => {
                                        setFieldValue("taxDetails", {
                                            ...values.taxDetails,
                                            [taxDetail.taxId]: {
                                                taxId: taxDetail.taxId,
                                                registrationNumber: "",
                                            },
                                        });
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
                                />
                            ))}
                            <CustomButton
                                text={i18n.t("addParty")}
                                onPress={handleSubmit}
                                extraContainerStyles={{ marginTop: 8 }}
                            />
                        </View>
                    )}
                </Formik>
            </View>
        </ScrollView>
    );
};

export default AddParty;

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
    mobileNumberContainer: {
        flexDirection: "row",
        columnGap: 6,
    },
});
