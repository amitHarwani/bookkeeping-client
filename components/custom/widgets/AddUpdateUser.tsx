import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useMemo, useState } from "react";
import { AddUpdateUserForm } from "@/constants/types";
import { useQuery } from "@tanstack/react-query";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import SysAdminService from "@/services/sysadmin/sysadmin_service";
import { Country } from "@/services/sysadmin/sysadmin_types";
import LoadingSpinnerOverlay from "../basic/LoadingSpinnerOverlay";
import ErrorMessage from "../basic/ErrorMessage";
import CustomButton from "../basic/CustomButton";
import { i18n } from "@/app/_layout";
import { useFormik } from "formik";
import { AddUpdateUserValidation } from "@/utils/schema_validations";
import Input from "../basic/Input";
import { capitalizeText } from "@/utils/common_utils";
import Dropdown from "../basic/Dropdown";
import RadioButton from "../basic/RadioButton";
import RoleSelector from "./RoleSelector";

interface AddUpdateUserProps {
    operation: "ADD" | "UPDATE";
    isEditEnabled?: boolean;
    formValues?: AddUpdateUserForm;
    apiErrorMessage?: string | null;
    onUserAddOrUpdate(values: AddUpdateUserForm): void;
}
const AddUpdateUser = ({
    operation,
    isEditEnabled = false,
    formValues,
    apiErrorMessage,
    onUserAddOrUpdate,
}: AddUpdateUserProps) => {
    /* Yes No Radio button data */
    const yesNoRadioButtonData = useMemo(() => {
        return [
            { key: "yes", value: true },
            { key: "no", value: false },
        ];
    }, []);

    /* If operation type is update and edit is not enabled: Disable inputs */
    const isInputsDisabled = useMemo(() => {
        if (operation === "UPDATE" && !isEditEnabled) {
            return true;
        }
        return false;
    }, [isEditEnabled, operation]);

    /* Fetching all the countries */
    const {
        isFetching: isFetchingCountriesList,
        data: countriesListResponse,
        error: countriesListError,
    } = useQuery({
        queryKey: [ReactQueryKeys.allCountries],
        queryFn: SysAdminService.getAllCountries,
        staleTime: Infinity,
    });

    /* List of all countries from the API response */
    const allCountries = useMemo(() => {
        if (countriesListResponse) {
            return countriesListResponse?.data.countries;
        }
        return [];
    }, [countriesListResponse]);

    /* Country Selected */
    const [selectedCountry, setSelectedCountry] = useState<
        Country | undefined
    >();

    /* phoneCodes list of the selected country  */
    const codesOfSelectedCountry = useMemo(() => {
        if (selectedCountry) {
            return selectedCountry.phoneNumberCodes?.map((code) => ({
                key: code,
            }));
        }
    }, [selectedCountry]);

    /* If form values are passed set those,
    else use default values */
    const initialFormValues: AddUpdateUserForm = useMemo(() => {
        if (formValues) {
            if (formValues?.country) {
                setSelectedCountry(formValues.country);
            }
            return formValues;
        }
        return {
            fullName: "",
            email: "",
            password: "",
            phoneCode: "",
            isActive: true,
            mobileNumber: "",
            country: undefined,
            role: undefined,
        };
    }, [formValues]);

    /* Formik */
    const formik = useFormik({
        initialValues: initialFormValues,
        onSubmit: (values) => onUserAddOrUpdate(values),
        validationSchema: AddUpdateUserValidation,
    });

    const showLoadingSpinner = useMemo(() => {
        return isFetchingCountriesList ? true : false;
    }, [isFetchingCountriesList]);

    return (
        <ScrollView style={styles.mainContainer}>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}
            <View style={styles.container}>
                <View style={styles.formContainer}>
                    {apiErrorMessage && (
                        <ErrorMessage message={apiErrorMessage} />
                    )}

                    <Input
                        label={i18n.t("fullName")}
                        placeholder={capitalizeText(i18n.t("enterFullName"))}
                        value={formik.values.fullName}
                        onChangeText={formik.handleChange("fullName")}
                        onBlur={formik.handleBlur("fullName")}
                        errorMessage={
                            formik.touched.fullName && formik.errors.fullName
                                ? formik.errors.fullName
                                : null
                        }
                        isDisabled={isInputsDisabled}
                    />

                    <Input
                        label={i18n.t("email")}
                        placeholder={capitalizeText(i18n.t("enterEmail"))}
                        value={formik.values.email}
                        onChangeText={formik.handleChange("email")}
                        onBlur={formik.handleBlur("email")}
                        errorMessage={
                            formik.touched.email && formik.errors.email
                                ? formik.errors.email
                                : null
                        }
                        isDisabled={isInputsDisabled}
                    />

                    <Input
                        label={i18n.t("password")}
                        placeholder={capitalizeText(i18n.t("enterPassword"))}
                        value={formik.values.password}
                        onChangeText={formik.handleChange("password")}
                        onBlur={formik.handleBlur("password")}
                        errorMessage={
                            formik.touched.password && formik.errors.password
                                ? formik.errors.password
                                : null
                        }
                        isDisabled={isInputsDisabled}
                        isPasswordType
                    />

                    <Dropdown
                        label={i18n.t("country")}
                        data={allCountries}
                        textKey="countryName"
                        onChange={(selectedCountry) => {
                            setSelectedCountry(selectedCountry as Country);
                            formik.setFieldTouched("country", true);
                            formik.setFieldValue("country", selectedCountry);
                        }}
                        errorMessage={
                            formik.touched.country && formik.errors.country
                                ? formik.errors.country
                                : null
                        }
                        value={formik.values.country}
                        isDisabled={isInputsDisabled}
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
                                        (formik.touched.mobileNumber &&
                                            formik.errors.mobileNumber)
                                            ? 80
                                            : "auto",
                                }}
                                errorMessage={
                                    formik.touched.phoneCode &&
                                    formik.errors.phoneCode
                                        ? formik.errors.phoneCode
                                        : null
                                }
                                isDisabled={isInputsDisabled}
                            />
                            <Input
                                label={i18n.t("mobileNumber")}
                                placeholder={capitalizeText(
                                    i18n.t("enterNumber")
                                )}
                                value={formik.values.mobileNumber}
                                onChangeText={formik.handleChange(
                                    "mobileNumber"
                                )}
                                onBlur={formik.handleBlur("mobileNumber")}
                                extraContainerStyles={{
                                    flexGrow: 0.6,
                                }}
                                errorMessage={
                                    formik.touched.mobileNumber &&
                                    formik.errors.mobileNumber
                                        ? formik.errors.mobileNumber
                                        : null
                                }
                                keyboardType="number-pad"
                                isDisabled={isInputsDisabled}
                            />
                        </View>
                    )}

                    <RoleSelector
                        value={formik.values.role}
                        onChange={(role) => {
                            formik.setFieldTouched("role", true);
                            formik.setFieldValue("role", role);
                        }}
                        errorMessage={
                            formik.touched.role && formik.errors.role
                                ? formik.errors.role
                                : null
                        }
                        isDisabled={isInputsDisabled}
                    />

                    <RadioButton
                        textKey="key"
                        label={i18n.t("isActive")}
                        data={yesNoRadioButtonData}
                        onChange={(selectedVal) => {
                            formik.setFieldTouched("isActive", true);
                            if (selectedVal.value) {
                                formik.setFieldValue("isActive", true);
                            } else {
                                formik.setFieldValue("isActive", false);
                            }
                        }}
                        value={
                            formik.values.isActive
                                ? yesNoRadioButtonData[0]
                                : yesNoRadioButtonData[1]
                        }
                        errorMessage={
                            formik.errors.isActive && formik.touched.isActive
                                ? formik.errors.isActive
                                : null
                        }
                        isDisabled={isInputsDisabled}
                    />

                    {!isInputsDisabled && (
                        <CustomButton
                            text={
                                operation === "ADD"
                                    ? i18n.t("addUser")
                                    : i18n.t("updateUser")
                            }
                            onPress={() => formik.handleSubmit()}
                        />
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

export default AddUpdateUser;

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
