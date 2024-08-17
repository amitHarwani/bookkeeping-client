import { StyleSheet, Text, View } from "react-native";
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { useLocalSearchParams } from "expo-router";
import UserService from "@/services/user/user_service";
import { ApiError } from "@/services/api_error";
import { SafeAreaView } from "react-native-safe-area-context";

const CompanySettings = () => {
    const companyId = useLocalSearchParams().companyId;

    const {
        isFetching: fetchingCompany,
        data: companyDataResponse,
        error: getCompanyError,
    } = useQuery({
        queryKey: [ReactQueryKeys.company, companyId],
        queryFn: async () => await UserService.getCompany(Number(companyId)),
    });

    const companyData = useMemo(() => {
        if (companyDataResponse) {
            return companyDataResponse.data.company;
        }
        return null;
    }, [companyDataResponse]);

    const showLoadingSpinner = useMemo(() => {
        if (fetchingCompany) {
            return true;
        }
        return false;
    }, [fetchingCompany]);

    const apiErrorMessage = useMemo(() => {
        if (getCompanyError) {
            return (
                (getCompanyError as ApiError).errorResponse?.message ||
                (getCompanyError as ApiError).errorMessage
            );
        }
        return null;
    }, [getCompanyError]);


    return (
        <SafeAreaView>
            <Text>Company Settings</Text>
        </SafeAreaView>
    );
};

export default CompanySettings;

const styles = StyleSheet.create({});
