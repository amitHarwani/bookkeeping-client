import CustomButton from "@/components/custom/basic/CustomButton";
import Dropdown from "@/components/custom/basic/Dropdown";
import ErrorMessage from "@/components/custom/basic/ErrorMessage";
import Input from "@/components/custom/basic/Input";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { AppRoutes } from "@/constants/routes";
import { SecureStoreKeys } from "@/constants/securestorekeys";
import { RegisterForm } from "@/constants/types";
import { ApiError } from "@/services/api_error";
import SysAdminService from "@/services/sysadmin/sysadmin_service";
import { Country } from "@/services/sysadmin/sysadmin_types";
import UserService from "@/services/user/user_service";
import { useAppDispatch } from "@/store";
import { logIn } from "@/store/AuthSlice";
import { commonStyles } from "@/utils/common_styles";
import { capitalizeText } from "@/utils/common_utils";
import { RegisterFormValidation } from "@/utils/schema_validations";
import { setValueInSecureStore } from "@/utils/securestore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Href, Link, router } from "expo-router";
import { Formik } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { i18n } from "../_layout";
import Checkbox from "@/components/custom/basic/Checkbox";

const Register = () => {
    const dispatch = useAppDispatch();

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
            termsAgreed: false,
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
        isFetching: isFetchingCountriesList,
        data: countriesListResponse,
        error: countriesListError,
    } = useQuery({
        queryKey: [ReactQueryKeys.allCountries],
        queryFn: SysAdminService.getAllCountries,
        staleTime: Infinity,
    });

    /* To register a user */
    const registerUserMutation = useMutation({
        mutationFn: (userRegistrationForm: RegisterForm) => {
            return UserService.registerUser(userRegistrationForm);
        },
    });

    /* List of all countries from the API response */
    const allCountries = useMemo(() => {
        if (countriesListResponse) {
            return countriesListResponse?.data.countries;
        }
        return [];
    }, [countriesListResponse]);

    /* Show overlay loading spinner, when making api calls*/
    const showLoadingSpinner = useMemo(() => {
        if (isFetchingCountriesList || registerUserMutation.isPending) {
            return true;
        }
        return false;
    }, [isFetchingCountriesList, registerUserMutation.isPending]);

    /* Extracting error message from countries api call, or registerUser api call */
    const errorMessage = useMemo(() => {
        if (countriesListError) {
            const apiErrorType = countriesListError as ApiError;
            return (
                apiErrorType.errorResponse?.message || apiErrorType.errorMessage
            );
        }
        if (registerUserMutation.error) {
            const apiErrorType = registerUserMutation.error as ApiError;
            return (
                apiErrorType.errorResponse?.message || apiErrorType.errorMessage
            );
        }
        return null;
    }, [countriesListError, registerUserMutation.error]);

    useEffect(() => {
        /* On success of registerUser */
        if (registerUserMutation.data) {
            /* Response data */
            const responseData = registerUserMutation.data;
            if (responseData.success) {
                /* Update redux store */
                dispatch(
                    logIn({
                        user: responseData.data.user,
                        accessToken: responseData.data.accessToken,
                    })
                );

                /* Set Value in secure store */
                setValueInSecureStore(
                    SecureStoreKeys.accessToken,
                    responseData.data.accessToken as string
                );
                setValueInSecureStore(
                    SecureStoreKeys.userDetails,
                    JSON.stringify(responseData.data.user)
                );

                /* Move to /add-company */
                router.replace(`${AppRoutes.viewAllCompanies}` as Href);
            }
        }
    }, [registerUserMutation.isSuccess]);

    return (
        <SafeAreaView>
            <ScrollView>
                {showLoadingSpinner && <LoadingSpinnerOverlay />}
                <View style={styles.container}>
                    <Text style={commonStyles.mainHeading}>
                        {i18n.t("signUp")}
                    </Text>

                    {errorMessage && <ErrorMessage message={errorMessage} />}
                    <Formik
                        initialValues={initialFormValues}
                        validationSchema={RegisterFormValidation}
                        onSubmit={(values) => {
                            registerUserMutation.mutate(values);
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
                                                height:
                                                    (touched.phoneCode &&
                                                        errors.phoneCode) ||
                                                    (touched.mobileNumber &&
                                                        errors.mobileNumber)
                                                        ? 80
                                                        : "auto",
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

                                <Checkbox
                                    onChange={(_, isChecked) => {
                                        setFieldTouched("termsAgreed", true);
                                        setFieldValue("termsAgreed", isChecked);
                                    }}
                                    descriptionComponent={
                                        <View>
                                            <Text
                                                style={
                                                    styles.termsAndConditionsText
                                                }
                                            >
                                                {i18n.t(
                                                    "iHaveReadAndAgreeWithThe"
                                                )}
                                            </Text>
                                            <Text style={commonStyles.linkText}>
                                                {i18n.t("termsAndConditions")}
                                            </Text>
                                        </View>
                                    }
                                    errorMessage={
                                        touched.termsAgreed &&
                                        errors.termsAgreed
                                            ? errors.termsAgreed
                                            : null
                                    }
                                    data={{}}
                                    description=""
                                />

                                <View style={styles.haveAnAccountContainer}>
                                    <Text
                                        style={[
                                            commonStyles.textSmall,
                                            commonStyles.capitalize,
                                        ]}
                                    >
                                        {i18n.t("alreadyHaveAnAccount")}
                                    </Text>
                                    <Link
                                        style={commonStyles.linkText}
                                        replace={true}
                                        href={`${AppRoutes.login}` as Href}
                                    >
                                        {i18n.t("loginHere")}
                                    </Link>
                                </View>

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
        paddingBottom: 12,
        rowGap: 24,
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    formContainer: {
        rowGap: 16,
    },
    mobileNumberContainer: {
        flexDirection: "row",
        columnGap: 6,
    },
    termsAndConditionsText: {
        textTransform: "capitalize",
        fontSize: 12,
        color: "#71727A",
    },
    haveAnAccountContainer: {
        flexDirection: "row",
        columnGap: 2,
    },
});

export default Register;
