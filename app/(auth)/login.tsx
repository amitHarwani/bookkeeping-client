import { StyleSheet, Text, View } from "react-native";
import React, { useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { i18n } from "../_layout";
import { commonStyles } from "@/utils/common_styles";
import Input from "@/components/custom/basic/Input";
import { Formik } from "formik";
import { LoginForm } from "@/constants/types";
import { LoginFormValidation } from "@/utils/schema_validations";
import CustomButton from "@/components/custom/basic/CustomButton";
import { capitalizeText } from "@/utils/common_utils";
import { Link } from "expo-router";
import { AppRoutes } from "@/constants/routes";
import { fonts } from "@/constants/fonts";

const Login = () => {
    const initialFormValues: LoginForm = useMemo(() => {
        return {
            email: "",
            password: "",
        };
    }, []);

    return (
        <SafeAreaView>
            <View style={styles.container}>
                <Text style={[commonStyles.mainHeading]}>
                    {i18n.t("login")}
                </Text>
                <Formik
                    initialValues={initialFormValues}
                    onSubmit={() => {}}
                    validationSchema={LoginFormValidation}
                >
                    {({ handleChange, handleBlur, handleSubmit, values }) => (
                        <View style={styles.formContainer}>
                            <Input
                                label={i18n.t("email")}
                                placeholder={capitalizeText(
                                    i18n.t("enterEmail")
                                )}
                                onChangeText={handleChange("email")}
                                onBlur={handleBlur("email")}
                                value={values.email}
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
                            />

                            <View style={styles.registerHelperContainer}>
                                <Text style={styles.registerHelperText}>
                                    {i18n.t("dontHaveAnAccount")}
                                </Text>
                                <Link
                                    style={[styles.registerHelperText, styles.registerLink]}
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
        fontSize: 12
    },
    registerLink: {
        color: "blue",
        textDecorationLine: "underline"
    }
});
