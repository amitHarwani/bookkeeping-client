import {
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import React, { useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { commonStyles } from "@/utils/common_styles";
import { i18n } from "../_layout";
import { useQuery } from "@tanstack/react-query";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import UserService from "@/services/user/user_service";
import { ApiError } from "@/services/api_error";
import CompanyListItem from "@/components/custom/business/CompanyListItem";
import { useAppDispatch, useAppSelector } from "@/store";
import AddIcon from "@/assets/images/add_icon.png";
import InfoMessage from "@/components/custom/basic/InfoMessage";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import ErrorMessage from "@/components/custom/basic/ErrorMessage";
import { Href, router } from "expo-router";
import { AppRoutes } from "@/constants/routes";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import { CompanyWithTaxDetails } from "@/services/user/user_types";
import { selectCompany } from "@/store/CompanySlice";

const ViewAllCompanies = () => {
    const userDetails = useAppSelector((state) => state.auth.user);
    const dispatch = useAppDispatch();

    /* Getting all the companies accessible by the user */
    const {
        isFetching: fetchingCompaniesList,
        data: companiesListResponse,
        error: companiesListError,
        refetch: refetchCompaniesList,
    } = useQuery({
        queryKey: [ReactQueryKeys.allCompanies],
        queryFn: UserService.getAllCompanies,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    useRefreshOnFocus(refetchCompaniesList);

    /* Companies list from API Response */
    const companiesList = useMemo(() => {
        if (companiesListResponse) {
            return companiesListResponse.data.companies;
        }
        return null;
    }, [companiesListResponse]);

    /* Loading spinners for api calls */
    const showLoadingSpinner = useMemo(() => {
        if (fetchingCompaniesList) {
            return true;
        }
        return false;
    }, [fetchingCompaniesList]);

    /* Error message during api calls */
    const apiErrorMessage = useMemo(() => {
        if (companiesListError) {
            return (
                (companiesListError as ApiError).errorResponse?.message ||
                (companiesListError as ApiError).errorMessage
            );
        }

        return null;
    }, [companiesListError]);

    /* On click of company */
    const companyPressHandler = (company: CompanyWithTaxDetails) => {
        /* Set selected company in redux store and route to dashboard */
        dispatch(selectCompany({ company: company }));
        router.push(`${AppRoutes.dashboard}` as Href);
    };

    return (
        <SafeAreaView style={{ backgroundColor: "#FFFFFF", flex: 1 }}>
            <View style={styles.container}>
                {showLoadingSpinner && <LoadingSpinnerOverlay />}
                <Text style={commonStyles.mainHeading}>
                    {i18n.t("selectCompany")}
                </Text>

                {apiErrorMessage && <ErrorMessage message={apiErrorMessage} />}

                {companiesList && (
                    <View style={styles.companiesListContainer}>
                        <FlatList
                            data={companiesList}
                            renderItem={({ item }) => (
                                <CompanyListItem
                                    companyDetails={item}
                                    companyPressHandler={(_) => {
                                        companyPressHandler(item);
                                    }}
                                    settingsPressHandler={(companyId) => {
                                        dispatch(selectCompany({company: item}))
                                        router.push(
                                            `${AppRoutes.companySettings}/${companyId}` as Href
                                        );
                                    }}
                                />
                            )}
                            ItemSeparatorComponent={() => (
                                <View style={styles.companySeparator} />
                            )}
                            keyExtractor={(item) => item.companyId.toString()}
                        />
                    </View>
                )}

                {Array.isArray(companiesList) &&
                    companiesList?.length === 0 && (
                        <InfoMessage
                            message={i18n.t("addACompanyToGetStarted")}
                            extraContainerStyles={{ alignSelf: "center" }}
                            extraTextStyles={{ fontSize: 16 }}
                        />
                    )}

                {userDetails && userDetails?.isSubUser === false && (
                    <Pressable
                        style={[
                            commonStyles.borderedImageIcon,
                            styles.addIconBtn,
                        ]}
                        onPress={() =>
                            router.push(`${AppRoutes.addCompany}` as Href)
                        }
                    >
                        <Image source={AddIcon} style={styles.addIcon} />
                    </Pressable>
                )}
            </View>
        </SafeAreaView>
    );
};

export default ViewAllCompanies;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 32,
        paddingTop: 74,
        rowGap: 24,
    },
    companiesListContainer: {
        borderRadius: 16,
    },
    companySeparator: {
        height: 10
    },
    addIconBtn: {
        alignSelf: "center",
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    addIcon: {
        width: 24,
        height: 24,
        borderWidth: 1,
    },
});
