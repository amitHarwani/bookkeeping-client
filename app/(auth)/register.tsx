import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import React, { Ref, useEffect, useMemo, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { i18n } from "../_layout";
import { commonStyles } from "@/utils/common_styles";
import { Formik, FormikProps } from "formik";
import { useQuery } from "@tanstack/react-query";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import SysAdminService from "@/services/sysadmin/sysadmin_service";
import Input from "@/components/custom/basic/Input";
import { capitalizeText } from "@/utils/common_utils";
import CustomButton from "@/components/custom/basic/CustomButton";
import Dropdown from "@/components/custom/basic/Dropdown";
import { RegisterForm } from "@/constants/types";
import { RegisterFormValidation } from "@/utils/schema_validations";
import { Country } from "@/services/sysadmin/sysadmin_types";
import * as Yup from "yup";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import ErrorMessage from "@/components/custom/basic/ErrorMessage";
import { ApiError } from "@/services/api_error";

const Register = () => {
    /* Initial form values */
    const initialFormValues: RegisterForm = useMemo(() => {
        return {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
            country: undefined,
            mobileNumber: "",
            phoneCode: "",
        };
    }, []);

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

    /* Fetching all the countries */
    const {
        isFetching,
        data: countriesListResponse,
        error: countriesListError,
    } = useQuery({
        queryKey: [ReactQueryKeys.allCountries],
        queryFn: SysAdminService.getAllCountries,
        refetchOnMount: true,
        retry: false,
    });

    /* List of all countries from the API response */
    const allCountries = useMemo(() => {
        if (countriesListResponse) {
            return countriesListResponse?.data.countries;
        }
        return [];
    }, [countriesListResponse]);

    /* Extracting error message from countries api call */
    const errorMessage = useMemo(() => {
        if (countriesListError) {
            const apiErrorType = countriesListError as ApiError;
            return (
                apiErrorType.errorResponse?.message || apiErrorType.errorMessage
            );
        }
        return null;
    }, [countriesListError]);

    return (
        <SafeAreaView>
            <ScrollView>
                {isFetching && <LoadingSpinnerOverlay />}
                <View style={styles.container}>
                    {errorMessage && <ErrorMessage message={errorMessage} />}
                    <Text style={commonStyles.mainHeading}>
                        {i18n.t("signUp")}
                    </Text>

                    <Formik
                        initialValues={initialFormValues}
                        validationSchema={RegisterFormValidation}
                        onSubmit={(values) => {
                            console.log("Submitted Values", values);
                        }}
                    >
                        {({
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            setFieldValue,
                            setFieldTouched,
                            values,
                            errors,
                            touched,
                        }) => (
                            <View style={styles.formContainer}>
                                <Input
                                    label={i18n.t("fullName")}
                                    placeholder={capitalizeText(
                                        i18n.t("enterFullName")
                                    )}
                                    onChangeText={handleChange("fullName")}
                                    onBlur={handleBlur("fullName")}
                                    value={values.fullName}
                                    errorMessage={
                                        touched.fullName && errors.fullName
                                            ? errors.fullName
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
                                    label={i18n.t("email")}
                                    placeholder={capitalizeText(
                                        i18n.t("enterEmail")
                                    )}
                                    onChangeText={handleChange("email")}
                                    onBlur={handleBlur("email")}
                                    value={values.email}
                                    errorMessage={
                                        touched.email && errors.email
                                            ? errors.email
                                            : null
                                    }
                                />
                                <Input
                                    label={i18n.t("password")}
                                    placeholder={capitalizeText(
                                        i18n.t("enterPassword")
                                    )}
                                    onChangeText={handleChange("password")}
                                    onBlur={handleBlur("password")}
                                    value={values.password}
                                    isPasswordType={true}
                                    errorMessage={
                                        touched.password && errors.password
                                            ? errors.password
                                            : null
                                    }
                                />
                                <Input
                                    label={i18n.t("confirmPassword")}
                                    placeholder={capitalizeText(
                                        i18n.t("enterPassword")
                                    )}
                                    onChangeText={handleChange(
                                        "confirmPassword"
                                    )}
                                    onBlur={handleBlur("confirmPassword")}
                                    value={values.confirmPassword}
                                    isPasswordType={true}
                                    errorMessage={
                                        touched.confirmPassword &&
                                        errors.confirmPassword
                                            ? errors.confirmPassword
                                            : null
                                    }
                                />

                                <CustomButton
                                    text={i18n.t("signUp")}
                                    onPress={handleSubmit}
                                    extraContainerStyles={{ marginTop: 8 }}
                                />
                            </View>
                        )}
                    </Formik>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 32,
        paddingTop: 74,
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

export default Register;
