import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { i18n } from "../_layout";
import { commonStyles } from "@/utils/common_styles";
import Input from "@/components/custom/basic/Input";
import { Formik } from "formik";
import { LoginForm } from "@/constants/types";
import { LoginFormValidation } from "@/utils/schema_validations";
import CustomButton from "@/components/custom/basic/CustomButton";
import { capitalizeText } from "@/utils/common_utils";
import { Href, Link, router } from "expo-router";
import { AppRoutes } from "@/constants/routes";
import { fonts } from "@/constants/fonts";
import { useMutation } from "@tanstack/react-query";
import UserService from "@/services/user/user_service";
import { ApiError } from "@/services/api_error";
import { useAppDispatch } from "@/store";
import { logIn } from "@/store/AuthSlice";
import { setValueInSecureStore } from "@/utils/securestore";
import { SecureStoreKeys } from "@/constants/securestorekeys";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import ErrorMessage from "@/components/custom/basic/ErrorMessage";

const Login = () => {
    const dispatch = useAppDispatch();

    const initialFormValues: LoginForm = useMemo(() => {
        return {
            email: "",
            password: "",
        };
    }, []);

    /* Login Mutation */
    const loginMutation = useMutation({
        mutationFn: (loginForm: LoginForm) => {
            return UserService.loginUser(loginForm);
        },
    });

    const showLoadingSpinner = useMemo(() => {
        if (loginMutation.isPending) {
            return true;
        }
        return false;
    }, [loginMutation.isPending]);

    /* To show error message from api calls */
    const errorMessage = useMemo(() => {
        /* Error from login api call */
        if (loginMutation.error) {
            /* Converting to ApiError type */
            const apiErrorType = loginMutation.error as ApiError;
            return (
                apiErrorType.errorResponse?.message || apiErrorType.errorMessage
            );
        }
        return null;
    }, [loginMutation.error]);

    /* On success of login */
    useEffect(() => {
        if (loginMutation.data) {
            const responseData = loginMutation.data;
            if (responseData.success) {
                /* Store details in redux */
                dispatch(
                    logIn({
                        accessToken: responseData.data.accessToken,
                        user: responseData.data.user,
                    })
                );

                /* Store access token and user details in secure store */
                setValueInSecureStore(
                    SecureStoreKeys.accessToken,
                    responseData.data.accessToken
                );
                setValueInSecureStore(
                    SecureStoreKeys.userDetails,
                    JSON.stringify(responseData.data.user)
                );

                /* Move to dashboard */
                router.replace(`${AppRoutes.dashboard}` as Href);
            }
        }
    }, [loginMutation.isSuccess]);

    return (
        <SafeAreaView>
            <View style={styles.container}>
                {showLoadingSpinner && <LoadingSpinnerOverlay />}

                <Text style={[commonStyles.mainHeading]}>
                    {i18n.t("login")}
                </Text>

                {errorMessage && <ErrorMessage message={errorMessage} />}
                <Formik
                    initialValues={initialFormValues}
                    onSubmit={(values) => {loginMutation.mutate(values)}}
                    validationSchema={LoginFormValidation}
                >
                    {({
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        values,
                        errors,
                        touched,
                    }) => (
                        <View style={styles.formContainer}>
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
                                isPasswordType={true}
                                value={values.password}
                                errorMessage={
                                    touched.password && errors.password
                                        ? errors.password
                                        : null
                                }
                            />

                            <View style={styles.registerHelperContainer}>
                                <Text style={styles.registerHelperText}>
                                    {i18n.t("dontHaveAnAccount")}
                                </Text>
                                <Link
                                    style={[
                                        styles.registerHelperText,
                                        styles.registerLink,
                                    ]}
                                    replace={true}
                                    href={{ pathname: AppRoutes.register }}
                                >
                                    {i18n.t("registerHere")}
                                </Link>
                            </View>

                            <CustomButton
                                onPress={handleSubmit}
                                text={i18n.t("login")}
                                extraContainerStyles={{ marginTop: 8 }}
                            />
                        </View>
                    )}
                </Formik>
            </View>
        </SafeAreaView>
    );
};

export default Login;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 32,
        height: "100%",
        justifyContent: "center",
        rowGap: 24,
    },
    formContainer: {
        rowGap: 16,
    },
    registerHelperContainer: {
        flexDirection: "row",
        columnGap: 2,
    },
    registerHelperText: {
        textTransform: "capitalize",
        fontFamily: fonts.Inter_Regular,
        fontSize: 12,
    },
    registerLink: {
        color: "blue",
        textDecorationLine: "underline",
    },
});
