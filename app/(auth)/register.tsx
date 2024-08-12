import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { i18n } from "../_layout";
import { commonStyles } from "@/utils/common_styles";
import { Formik } from "formik";
import { useQuery } from "@tanstack/react-query";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import SysAdminService from "@/services/sysadmin/sysadmin_service";

const Register = () => {
    const {isPending, isError, data, error, isFetching } = useQuery({
        queryKey: [ReactQueryKeys.allCountries],
        queryFn: SysAdminService.getAllCountries,
        refetchOnMount: true
    });

    return (
        <SafeAreaView>
            <View style={styles.container}>
                <Text style={commonStyles.mainHeading}>{i18n.t("signUp")}</Text>

                <Formik>{({}) => <View></View>}</Formik>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 32,
        paddingTop: 74,
        rowGap: 24,
    },
});

export default Register;
