import { StyleSheet, Text, ToastAndroid, View } from "react-native";
import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import UserService from "@/services/user/user_service";
import SystemAdminService from "@/services/sysadmin/sysadmin_service";
import { setTaxDetailsOfCountry, setUserACL } from "@/store/CompanySlice";
import { capitalizeText } from "@/utils/common_utils";
import { i18n } from "@/app/_layout";
import { router } from "expo-router";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import { PlatformFeature, TaxDetail } from "@/services/sysadmin/sysadmin_types";
import { setPlatformFeatures } from "@/store/PlatformFeaturesSlice";

const Dashboard = () => {
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );


    return (
        <View>
            <Text>{`Dashboard ${selectedCompany?.companyName}`}</Text>
        </View>
    );
};

export default Dashboard;

const styles = StyleSheet.create({});
