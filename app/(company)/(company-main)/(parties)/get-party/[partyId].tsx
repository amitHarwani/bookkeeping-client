import { i18n } from "@/app/_layout";
import EditIcon from "@/assets/images/edit_icon.png";
import CustomButton from "@/components/custom/basic/CustomButton";
import Dropdown from "@/components/custom/basic/Dropdown";
import ErrorMessage from "@/components/custom/basic/ErrorMessage";
import Input from "@/components/custom/basic/Input";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import RadioButton from "@/components/custom/basic/RadioButton";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import TaxInputItem from "@/components/custom/business/TaxInputItem";
import { PLATFORM_FEATURES } from "@/constants/features";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import {
    AddUpdatePartyForm,
    AddUpdatePartyTaxDetails,
} from "@/constants/types";
import BillingService from "@/services/billing/billing_service";
import {
    TaxDetailsOfThirdPartyType,
    ThirdParty,
} from "@/services/billing/billing_types";
import SystemAdminService from "@/services/sysadmin/sysadmin_service";
import { Country } from "@/services/sysadmin/sysadmin_types";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import { capitalizeText, getApiErrorMessage } from "@/utils/common_utils";
import { isFeatureAccessible } from "@/utils/feature_access_helper";
import { AddUpdatePartyValidation } from "@/utils/schema_validations";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useFormik } from "formik";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    ToastAndroid,
    View,
} from "react-native";

const GetParty = () => {
    /* URL Params */
    const params = useLocalSearchParams();

    /* Selected company from redux */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    /* Party ID from params */
    const partyId = useMemo(() => {
        return Number(params.partyId);
    }, [params]);

    /* Navigation */
    const navigation = useNavigation();

    /* Whether editing is enabled */
    const [isEditEnabled, setIsEditEnabled] = useState(false);

    /* Country where the party is located */
    const [partiesCountry, setPartiesCountry] = useState<Country | undefined>();

    /* phoneCodes list of the selected country  */
    const codesOfSelectedCountry = useMemo(() => {
        if (partiesCountry) {
            return partiesCountry.phoneNumberCodes?.map((code) => ({
                key: code,
            }));
        }
    }, [partiesCountry]);

    /* Toggle edit */
    const toggleEdit = useCallback(() => {
        setIsEditEnabled((prev) => !prev);
    }, [isEditEnabled]);

    /* Fetching Party data */
    const {
        isFetching: fetchingParty,
        data: partyData,
        error: errorFetchingParty,
    } = useQuery({
        queryKey: [ReactQueryKeys.getParty, partyId],
        queryFn: () =>
            BillingService.getParty(
                partyId,
                selectedCompany?.companyId as number
            ),
    });

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
            partiesCountry?.countryId,
        ],
        queryFn: () =>
            SystemAdminService.getTaxDetailsOfCountry(
                partiesCountry?.countryId as number
            ),
        enabled: false,
    });

    const taxDetailsOfCountry = useMemo(() => {
        if (taxDetailsOfCountryResponse?.success) {
            return taxDetailsOfCountryResponse.data.taxDetails;
        }
        return [];
    }, [taxDetailsOfCountryResponse]);

    /* Setting the header for the page */
    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <CustomNavHeader
                    mainHeading={
                        partyData
                            ? partyData.data.party.partyName
                            : i18n.t("party")
                    }
                    subHeading={selectedCompany?.companyName || ""}
                />
            ),
            headerRight: () =>
                /* If edit is not enabled and the update feature is accessible */
                !isEditEnabled &&
                isFeatureAccessible(PLATFORM_FEATURES.ADD_UPDATE_PARTY) ? (
                    <Pressable onPress={toggleEdit}>
                        <Image
                            source={EditIcon}
                            style={commonStyles.editIcon}
                            resizeMode="contain"
                        />
                    </Pressable>
                ) : (
                    <></>
                ),
        });
    }, [navigation, partyData, isEditEnabled]);

    /* Update party mutation */
    const updatePartyMutation = useMutation({
        mutationFn: (values: AddUpdatePartyForm) =>
            BillingService.updateParty(
                partyId,
                selectedCompany?.companyId as number,
                values
            ),
    });

    /* Initial form values state */
    const [initialFormValues, setInitialFormValues] =
        useState<AddUpdatePartyForm>({
            partyName: "",
            defaultSaleCreditAllowanceInDays: 30,
            defaultPurchaseCreditAllowanceInDays: 30,
            isActive: true,
            phoneCode: "",
            phoneNumber: "",
            country: undefined,
            taxDetails: {},
        });

    const setInitialFormValuesHelper = useCallback(
        (party: ThirdParty, countries: Country[]) => {
            /* Getting the matching party country from countries data */
            let countryFound = countries.find(
                (country) => country.countryId == party.countryId
            );
            setPartiesCountry(countryFound);

            /* Phone code of the parties phone number from the phone number codes of the country */
            let phoneCode = countryFound?.phoneNumberCodes?.find((code) => {
                return party.phoneNumber.includes(code);
            });

            /* Getting the phone number, withouth the phone code */
            let phoneNumber = party.phoneNumber.substring(
                phoneCode?.length as number
            );

            let taxDetailsObj: AddUpdatePartyTaxDetails = {};
            party?.taxDetails?.forEach((item) => {
                const taxDetail = item as TaxDetailsOfThirdPartyType;
                taxDetailsObj[taxDetail.taxId] = {
                    taxId: taxDetail.taxId,
                    registrationNumber: taxDetail.registrationNumber,
                };
            });

            setInitialFormValues({
                partyName: party.partyName,
                defaultSaleCreditAllowanceInDays:
                    party.defaultSaleCreditAllowanceInDays,
                defaultPurchaseCreditAllowanceInDays:
                    party.defaultPurchaseCreditAllowanceInDays,
                isActive: party.isActive,
                phoneCode: phoneCode as string,
                phoneNumber: phoneNumber,
                country: countryFound,
                taxDetails: taxDetailsObj,
            });
        },
        []
    );

    /* Initial form values for updating */
    useEffect(() => {
        if (
            partyData &&
            countriesData &&
            partyData.success &&
            countriesData.success
        ) {
            setInitialFormValuesHelper(
                partyData.data.party,
                countriesData.data.countries
            );
        }
    }, [partyData, countriesData]);

    useEffect(() => {
        if (partiesCountry) {
            fetchTaxDetailsOfCountry();
        }
    }, [partiesCountry]);

    /* Formik */
    const formik = useFormik({
        initialValues: initialFormValues,
        onSubmit: (values) => {
            updatePartyMutation.mutate(values);
        },
        validationSchema: AddUpdatePartyValidation,
        enableReinitialize: true,
    });

    /* Data for isActive field */
    const isActiveRadioButtonData = useMemo(() => {
        return [{ key: "yes" }, { key: "no" }];
    }, []);

    /* On update success */
    useEffect(() => {
        if (
            updatePartyMutation.isSuccess &&
            updatePartyMutation.data.success &&
            countriesData
        ) {

            ToastAndroid.show(capitalizeText(i18n.t("partyUpdatedSuccessfully")), ToastAndroid.LONG);

            /* Resetting initial form values */
            setInitialFormValuesHelper(
                updatePartyMutation.data.data.party,
                countriesData.data.countries
            );

            /* Resetting the form to initial values */
            formik.resetForm();

            /* Toggle edit */
            toggleEdit();
        }
    }, [updatePartyMutation.isSuccess]);

    /* loading spinner visibility */
    const showLoadingSpinner = useMemo(() => {
        return fetchingParty ||
            updatePartyMutation.isPending ||
            fetchingCountries ||
            fetchingTaxDetailsOfCountry
            ? true
            : false;
    }, [
        fetchingParty,
        fetchingCountries,
        fetchingTaxDetailsOfCountry,
        updatePartyMutation.isPending,
    ]);

    /* Error fetching countries or taxdetails or party, show a toast message and go back */
    useEffect(() => {
        let message = "";
        if (errorFetchingParty) {
            message = capitalizeText(
                `${i18n.t("errorFetchingParty")}${i18n.t("comma")}${i18n.t(
                    "contactSupport"
                )}`
            );
        }
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
    }, [
        errorFetchingParty,
        errorFetchingCountries,
        errorFetchingTaxDetailsOfCountry,
    ]);

    /* Update party error */
    const apiErrorMessage = useMemo(() => {
        if (updatePartyMutation.error) {
            return getApiErrorMessage(updatePartyMutation.error);
        }
        return null;
    }, [updatePartyMutation.error]);

    return (
        <ScrollView style={styles.mainContainer}>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}

            <View style={styles.container}>
                <View style={styles.formContainer}>
                    {apiErrorMessage && (
                        <ErrorMessage message={apiErrorMessage} />
                    )}
                    <Input
                        label={i18n.t("partyName")}
                        placeholder={capitalizeText(i18n.t("enterPartyName"))}
                        onChangeText={formik.handleChange("partyName")}
                        onBlur={formik.handleBlur("partyName")}
                        value={formik.values.partyName}
                        errorMessage={
                            formik.touched.partyName && formik.errors.partyName
                                ? formik.errors.partyName
                                : null
                        }
                        isDisabled={!isEditEnabled}
                    />
                    <Dropdown
                        data={countriesData?.data.countries}
                        label={i18n.t("country")}
                        textKey="countryName"
                        isDisabled={true}
                        value={formik.values.country}
                        customEqualsFunction={(
                            country1: Country,
                            country2: Country
                        ) => country1.countryId === country2.countryId}
                        onChange={(countrySelected) => {
                            formik.setFieldTouched("country", true);
                            setPartiesCountry(countrySelected as Country);
                            formik.setFieldValue("country", countrySelected);
                        }}
                    />
                    <Input
                        label={i18n.t("defaultSaleCreditAllowanceInDays")}
                        placeholder={capitalizeText(
                            i18n.t("enterSaleCreditAllowance")
                        )}
                        onChangeText={formik.handleChange(
                            "defaultSaleCreditAllowanceInDays"
                        )}
                        onBlur={formik.handleBlur(
                            "defaultSaleCreditAllowanceInDays"
                        )}
                        value={formik.values.defaultSaleCreditAllowanceInDays.toString()}
                        errorMessage={
                            formik.touched.defaultSaleCreditAllowanceInDays &&
                            formik.errors.defaultSaleCreditAllowanceInDays
                                ? formik.errors.defaultSaleCreditAllowanceInDays
                                : null
                        }
                        isDisabled={!isEditEnabled}
                        keyboardType="number-pad"
                    />
                    <Input
                        label={i18n.t("defaultPurchaseCreditAllowanceInDays")}
                        placeholder={capitalizeText(
                            i18n.t("enterPurchaseCreditAllowance")
                        )}
                        onChangeText={formik.handleChange(
                            "defaultPurchaseCreditAllowanceInDays"
                        )}
                        onBlur={formik.handleBlur(
                            "defaultPurchaseCreditAllowanceInDays"
                        )}
                        value={formik.values.defaultPurchaseCreditAllowanceInDays.toString()}
                        errorMessage={
                            formik.touched
                                .defaultPurchaseCreditAllowanceInDays &&
                            formik.errors.defaultPurchaseCreditAllowanceInDays
                                ? formik.errors
                                      .defaultPurchaseCreditAllowanceInDays
                                : null
                        }
                        isDisabled={!isEditEnabled}
                        keyboardType="number-pad"

                    />
                    {formik.values.country && (
                        <View style={styles.mobileNumberContainer}>
                            <Dropdown
                                label={i18n.t("code")}
                                data={codesOfSelectedCountry}
                                textKey="key"
                                onChange={(selectedCode) => {
                                    formik.setFieldTouched("phoneCode", true);
                                    formik.setFieldValue(
                                        "phoneCode",
                                        selectedCode?.key
                                    );
                                }}
                                extraContainerStyles={{
                                    flexGrow: 0.4,
                                    height:
                                        (formik.touched.phoneCode &&
                                            formik.errors.phoneCode) ||
                                        (formik.touched.phoneNumber &&
                                            formik.errors.phoneNumber)
                                            ? 80
                                            : "auto",
                                }}
                                errorMessage={
                                    formik.touched.phoneCode &&
                                    formik.errors.phoneCode
                                        ? formik.errors.phoneCode
                                        : null
                                }
                                value={{ key: formik.values.phoneCode }}
                                customEqualsFunction={(
                                    obj1: { key: string },
                                    obj2: { key: string }
                                ) => obj1.key === obj2.key}
                                isDisabled={!isEditEnabled}
                            />
                            <Input
                                label={i18n.t("phoneNumber")}
                                placeholder={capitalizeText(
                                    i18n.t("enterNumber")
                                )}
                                value={formik.values.phoneNumber}
                                onChangeText={formik.handleChange(
                                    "phoneNumber"
                                )}
                                onBlur={formik.handleBlur("phoneNumber")}
                                extraContainerStyles={{
                                    flexGrow: 0.6,
                                }}
                                errorMessage={
                                    formik.touched.phoneNumber &&
                                    formik.errors.phoneNumber
                                        ? formik.errors.phoneNumber
                                        : null
                                }
                                keyboardType="number-pad"
                                isDisabled={!isEditEnabled}
                            />
                        </View>
                    )}
                    <RadioButton
                        data={isActiveRadioButtonData}
                        label={i18n.t("isActive")}
                        textKey="key"
                        onChange={(selectedValue) => {
                            formik.setFieldTouched("isActive", true);
                            formik.setFieldValue(
                                "isActive",
                                selectedValue.key === "yes"
                            );
                        }}
                        errorMessage={
                            formik.touched.isActive && formik.errors.isActive
                                ? formik.errors.isActive
                                : null
                        }
                        value={
                            formik.values.isActive
                                ? isActiveRadioButtonData[0]
                                : isActiveRadioButtonData[1]
                        }
                        isDisabled={!isEditEnabled}
                    />
                    {formik.touched.taxDetails && formik.errors.taxDetails && (
                        <ErrorMessage
                            message={`${i18n.t("missingTaxDetails")}`}
                        />
                    )}
                    {taxDetailsOfCountry.map((taxDetail) => (
                        <TaxInputItem
                            key={taxDetail.taxId}
                            taxInfo={taxDetail}
                            onRegistered={() => {
                                formik.setFieldValue("taxDetails", {
                                    ...formik.values.taxDetails,
                                    [taxDetail.taxId]: {
                                        taxId: taxDetail.taxId,
                                        registrationNumber:
                                            formik?.values?.taxDetails?.[
                                                taxDetail.taxId
                                            ]?.registrationNumber || "",
                                    },
                                });
                            }}
                            onDeregistered={() => {
                                const temp = {
                                    ...formik.values.taxDetails,
                                };
                                delete temp[taxDetail.taxId];
                                formik.setFieldValue("taxDetails", temp);
                            }}
                            onChange={(registrationNumber) => {
                                formik.setFieldTouched("taxDetails", true);
                                formik.setFieldValue("taxDetails", {
                                    ...formik.values.taxDetails,
                                    [taxDetail.taxId]: {
                                        taxId: taxDetail.taxId,
                                        registrationNumber: registrationNumber,
                                    },
                                });
                            }}
                            value={
                                formik?.values?.taxDetails?.[taxDetail.taxId]
                                    ? {
                                          isTaxRegistered: true,
                                          registrationNumber:
                                              formik?.values?.taxDetails?.[
                                                  taxDetail.taxId
                                              ]?.registrationNumber || "",
                                      }
                                    : {
                                          isTaxRegistered: false,
                                          registrationNumber: "",
                                      }
                            }
                            isDisabled={!isEditEnabled}
                        />
                    ))}
                    {isEditEnabled && (
                        <View style={commonStyles.modalEndActionsContainer}>
                            <CustomButton
                                text={i18n.t("cancel")}
                                onPress={() => {
                                    formik.resetForm();
                                    toggleEdit();
                                }}
                                isSecondaryButton
                                extraContainerStyles={{ flex: 1 }}
                            />
                            <CustomButton
                                text={i18n.t("updateParty")}
                                onPress={formik.handleSubmit}
                                extraContainerStyles={{ flex: 1 }}
                            />
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

export default GetParty;

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
