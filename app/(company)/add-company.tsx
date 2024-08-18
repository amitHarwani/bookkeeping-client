import { StyleSheet, Text, View, ScrollView } from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { commonStyles } from "@/utils/common_styles";
import { i18n } from "../_layout";
import { AddCompanyForm } from "@/constants/types";
import { Formik } from "formik";
import { AddCompanyFormValidation } from "@/utils/schema_validations";
import CustomButton from "@/components/custom/basic/CustomButton";
import Input from "@/components/custom/basic/Input";
import Dropdown from "@/components/custom/basic/Dropdown";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import SysAdminService from "@/services/sysadmin/sysadmin_service";
import { Country } from "@/services/sysadmin/sysadmin_types";
import { capitalizeText, getApiErrorMessage } from "@/utils/common_utils";
import CustomDateTimePicker from "@/components/custom/basic/CustomDateTimePicker";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import ErrorMessage from "@/components/custom/basic/ErrorMessage";
import TaxInputItem from "@/components/custom/business/TaxInputItem";
import UserService from "@/services/user/user_service";
import SuccessModal from "@/components/custom/business/SuccessModal";
import { router } from "expo-router";

const AddCompany = () => {
    const initialFormValues: AddCompanyForm = useMemo(() => {
        return {
            companyName: "",
            address: "",
            country: undefined,
            localDayStartTime: "",
            mobileNumber: "",
            phoneCode: "",
            decimalRoundTo: 2,
            taxDetails: {},
        };
    }, []);

    /* Country Selected */
    const [selectedCountry, setSelectedCountry] = useState<
        Country | undefined
    >();

    /* Whether success modal is shown */
    const [isSuccessModalShown, setIsSuccessModalShown] = useState(false);

    /* phoneCodes list of the selected country  */
    const codesOfSelectedCountry = useMemo(() => {
        if (selectedCountry) {
            return selectedCountry.phoneNumberCodes?.map((code) => ({
                key: code,
            }));
        }
    }, [selectedCountry]);

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

    /* Mutation to add a country */
    const addCountryMutation = useMutation({
        mutationFn: ({
            companyDetails,
            mainBranchId,
        }: {
            companyDetails: AddCompanyForm;
            mainBranchId?: number;
        }) => UserService.addCompany(companyDetails, mainBranchId),
    });

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
            isFetchingCountriesList ||
            isFetchingTaxDetails ||
            addCountryMutation.isPending
        );
    }, [isFetchingCountriesList, isFetchingTaxDetails]);

    /* API Error Message */
    const apiErrorMessage = useMemo(() => {
        if (countriesListError) {
            return getApiErrorMessage(countriesListError);
        } else if (taxDetailsError) {
            return getApiErrorMessage(taxDetailsError);
        } else if (addCountryMutation.error) {
            return getApiErrorMessage(addCountryMutation.error);
        }
        return null;
    }, [countriesListError, taxDetailsError, addCountryMutation.error]);

    /* Fetch tax details once selectedCountry changes */
    useEffect(() => {
        if (selectedCountry) {
            refetchTaxDetails();
        }
    }, [selectedCountry]);

    useEffect(() => {
        if (addCountryMutation.isSuccess && addCountryMutation.data.success) {
            /* Success */
            setIsSuccessModalShown(true);
        }
    }, [addCountryMutation.isSuccess]);

    /* Go back to previous screen */
    const goBack = useCallback(() => {
        router.back();
    }, [])

    return (
        <SafeAreaView>
            <ScrollView>
                <SuccessModal
                    isSuccessModalShown={isSuccessModalShown}
                    description={i18n.t("companyAddedSuccessfully")}
                    onSuccessModalClose={() => {
                        setIsSuccessModalShown(false);
                    }}
                    primaryActionButtonText={i18n.t("continue")}
                    primaryActionButtonHandler={goBack}
                />
                <View style={styles.container}>
                    {showLoadingSpinner && <LoadingSpinnerOverlay />}
                    <Text style={commonStyles.mainHeading}>
                        {i18n.t("addYourCompany")}
                    </Text>

                    {apiErrorMessage && (
                        <ErrorMessage message={apiErrorMessage} />
                    )}
                    <Formik
                        initialValues={initialFormValues}
                        validationSchema={AddCompanyFormValidation}
                        onSubmit={(values) => {
                            addCountryMutation.mutate({
                                companyDetails: values,
                                mainBranchId: undefined,
                            });
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
                                        touched.companyName &&
                                        errors.companyName
                                            ? errors.companyName
                                            : null
                                    }
                                />

                                <Dropdown
                                    label={i18n.t("country")}
                                    data={allCountries}
                                    textKey="countryName"
                                    onChange={(selectedCountry) => {
                                        setSelectedCountry(
                                            selectedCountry as Country
                                        );
                                        setFieldTouched("country", true);
                                        setFieldValue(
                                            "country",
                                            selectedCountry
                                        );
                                    }}
                                    errorMessage={
                                        touched.country && errors.country
                                            ? errors.country
                                            : null
                                    }
                                    value={values.country}
                                />

                                {values.country && (
                                    <View style={styles.mobileNumberContainer}>
                                        <Dropdown
                                            label={i18n.t("code")}
                                            data={codesOfSelectedCountry}
                                            textKey="key"
                                            onChange={(selectedCode) => {
                                                setFieldTouched(
                                                    "phoneCode",
                                                    true
                                                );
                                                setFieldValue(
                                                    "phoneCode",
                                                    selectedCode?.key
                                                );
                                            }}
                                            extraContainerStyles={{
                                                flexGrow: 0.4,
                                            }}
                                            errorMessage={
                                                touched.phoneCode &&
                                                errors.phoneCode
                                                    ? errors.phoneCode
                                                    : null
                                            }
                                        />
                                        <Input
                                            label={i18n.t("mobileNumber")}
                                            placeholder={capitalizeText(
                                                i18n.t("enterNumber")
                                            )}
                                            value={values.mobileNumber}
                                            onChangeText={handleChange(
                                                "mobileNumber"
                                            )}
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
                                        />
                                    </View>
                                )}

                                <Input
                                    label={i18n.t("address")}
                                    placeholder={capitalizeText(
                                        i18n.t("enterAddress")
                                    )}
                                    value={values.address}
                                    onChangeText={handleChange("address")}
                                    onBlur={handleBlur("address")}
                                    errorMessage={
                                        touched.address && errors.address
                                            ? errors.address
                                            : null
                                    }
                                />

                                <CustomDateTimePicker
                                    mode="time"
                                    label={i18n.t("localDayStartTime")}
                                    onChange={(selectedTime) => {
                                        setFieldTouched(
                                            "localDayStartTime",
                                            true
                                        );
                                        setFieldValue(
                                            "localDayStartTime",
                                            selectedTime
                                        );
                                    }}
                                />

                                <Input
                                    label={i18n.t("decimalRoundTo")}
                                    placeholder={capitalizeText(
                                        capitalizeText(i18n.t("decimalRoundTo"))
                                    )}
                                    value={values.decimalRoundTo.toString()}
                                    keyboardType="numeric"
                                    onChangeText={handleChange(
                                        "decimalRoundTo"
                                    )}
                                    onBlur={handleBlur("decimalRoundTo")}
                                    errorMessage={
                                        touched.decimalRoundTo &&
                                        errors.decimalRoundTo
                                            ? errors.decimalRoundTo
                                            : null
                                    }
                                />

                                {touched.taxDetails && errors.taxDetails && (
                                    <ErrorMessage
                                        message={`${i18n.t(
                                            "missingTaxDetails"
                                        )}`}
                                    />
                                )}

                                {taxDetails.map((taxDetail) => (
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
                                    text={i18n.t("addCompany")}
                                    onPress={handleSubmit}
                                    extraContainerStyles={{ marginTop: 8 }}
                                    isDisabled={showLoadingSpinner}
                                />
                            </View>
                        )}
                    </Formik>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AddCompany;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 32,
        paddingTop: 74,
        rowGap: 24,
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
