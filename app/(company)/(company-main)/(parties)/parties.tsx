import { i18n } from "@/app/_layout";
import CustomButton from "@/components/custom/basic/CustomButton";
import CustomModal from "@/components/custom/basic/CustomModal";
import ErrorMessage from "@/components/custom/basic/ErrorMessage";
import FilterButton from "@/components/custom/basic/FilterButton";
import Input from "@/components/custom/basic/Input";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import RadioButton from "@/components/custom/basic/RadioButton";
import ListEmptyComponent from "@/components/custom/business/ListEmptyComponent";
import PartyListItem from "@/components/custom/business/PartyListItem";
import { PLATFORM_FEATURES } from "@/constants/features";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { AppRoutes } from "@/constants/routes";
import { FilterPartyForm } from "@/constants/types";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import BillingService from "@/services/billing/billing_service";
import { FilterPartiesQuery, GetAllPartiesForPartiesListResponse } from "@/services/billing/billing_types";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import { capitalizeText, getApiErrorMessage } from "@/utils/common_utils";
import { isFeatureAccessible } from "@/utils/feature_access_helper";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Href, router } from "expo-router";
import { Formik } from "formik";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";

const Parties = () => {
    /* Selected company from redux */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    /* party type radio button data for filtering items */
    const partyTypeRadioButtonData = useMemo(
        () => [{ key: "all" }, { key: "active" }, { key: "inactive" }],
        []
    );

    /* Current state of filters */
    const [filtersState, setFiltersState] = useState<FilterPartiesQuery>({});

    /* Search Input state */
    const [searchInput, setSearchInput] = useState("");

    /* Search Query State, fills data from search input once search button is clicked */
    const [searchQuery, setSearchQuery] = useState("");

    /* Visibility of filters modal */
    const [isFiltersModalShown, setIsFiltersModalShown] = useState(false);

    /* Toggle filters modal visibility */
    const toggleFiltersModal = useCallback(() => {
        setIsFiltersModalShown((prev) => !prev);
    }, [isFiltersModalShown]);

    /* Use Infinite query to get parties by filters and search query  */
    const {
        data: partiesData,
        error: errorFetchingPartiesData,
        fetchNextPage: fetctNextPageOfParties,
        hasNextPage,
        isFetchingNextPage,
        isFetching,
        isPending,
        refetch: refetchParties,
    } = useInfiniteQuery({
        queryKey: [
            ReactQueryKeys.parties,
            selectedCompany?.companyId,
            {
                ...filtersState,
                partyNameSearchQuery: searchQuery,
                select: ["partyId", "partyName"],
            },
        ],
        queryFn: BillingService.getAllParties<GetAllPartiesForPartiesListResponse>,
        initialPageParam: {
            pageSize: 20,
            companyId: selectedCompany?.companyId,
            cursor: undefined,
            query: {
                ...filtersState,
                partyNameSearchQuery: searchQuery,
            },
            select: ["partyId", "partyName"],
        },
        getNextPageParam: (lastPage, pages) => {
            if (lastPage.data.nextPageCursor) {
                return {
                    pageSize: 20,
                    companyId: selectedCompany?.companyId,
                    cursor: lastPage.data.nextPageCursor,
                    query: {
                        ...filtersState,
                        partyNameSearchQuery: searchQuery,
                    },
                    select: ["partyId", "partyName"],
                };
            }
            return null;
        },
        enabled: false,
    });

    /* Refetch Parties when the screen comes back to focus */
    useRefreshOnFocus(refetchParties);

    /* Search input change handler */
    const searchInputChangeHandler = (text: string) => {
        setSearchInput(text);
    };

    /* Load more page handler */
    const loadMorePagesHandler = () => {
        /* If next page is there, fetch */
        if (hasNextPage) {
            fetctNextPageOfParties();
        }
    };

    /* Filter form submit handler */
    const filterFormSubmitHandler = (values: FilterPartyForm) => {
        /* New filters state */
        let newFiltersState: FilterPartiesQuery = {};

        /* If all is not selected, then filtering by isActive state */
        if (!values.partyType.all && values.partyType.isActive) {
            newFiltersState.isActive = true;
        } else if (!values.partyType.all && !values.partyType.isActive) {
            newFiltersState.isActive = false;
        }

        /* Setting the filters state */
        setFiltersState(newFiltersState);

        /* Hiding the filters modal */
        toggleFiltersModal();
    };

    /* on click of search button */
    const searchHandler = () => {
        /* Set search query state to searchInput state */
        setSearchQuery(searchInput);
    };

    /* Once search query or filters state changes */
    useEffect(() => {
        /* If fetching is not in progress */
        if (!isFetching) {
            /* fetch parties  */
            refetchParties();
        }
    }, [filtersState, searchQuery]);

    /* Show loading spinner until first page data arrives */
    const showLoadingSpinner = useMemo(() => {
        return isPending && isFetching ? true : false;
    }, [isPending, isFetching]);

    /* Error message from API */
    const apiErrorMessage = useMemo(() => {
        if (errorFetchingPartiesData) {
            return getApiErrorMessage(errorFetchingPartiesData);
        }
    }, [errorFetchingPartiesData]);

    return (
        <View style={styles.container}>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}
            {apiErrorMessage && <ErrorMessage message={apiErrorMessage} />}
            <View style={styles.searchContainer}>
                <Input
                    placeholder={capitalizeText(i18n.t("searchByPartyName"))}
                    isSearchIconVisible={true}
                    extraInputStyles={{ paddingVertical: 10 }}
                    value={searchInput}
                    onChangeText={searchInputChangeHandler}
                    extraContainerStyles={{ flex: 1 }}
                    keepLabelSpace={false}
                />
                <CustomButton
                    text={i18n.t("search")}
                    onPress={searchHandler}
                    extraContainerStyles={{ flex: 0.28, paddingVertical: 10 }}
                    extraTextStyles={{ fontSize: 12 }}
                />
            </View>
            <View style={styles.actionsContainer}>
                <FilterButton onPress={toggleFiltersModal} />
                {isFeatureAccessible(PLATFORM_FEATURES.ADD_UPDATE_PARTY) && (
                    <CustomButton
                        text={i18n.t("addParty")}
                        onPress={() => {
                            router.push(`${AppRoutes.addParty}` as Href);
                        }}
                        isSecondaryButton={true}
                        extraTextStyles={{ fontSize: 12 }}
                        extraContainerStyles={{
                            paddingHorizontal: 8,
                            paddingVertical: 10,
                            marginLeft: "auto",
                        }}
                    />
                )}
            </View>
            <View style={styles.itemListContainer}>
                <FlatList
                    data={partiesData?.pages
                        .map((partyPage) => partyPage.data.parties)
                        .flat()}
                    renderItem={({ item }) => (
                        <PartyListItem
                            party={item}
                            onPress={(party) =>
                                router.push(
                                    `${AppRoutes.getParty}/${party.partyId}` as Href
                                )
                            }
                        />
                    )}
                    keyExtractor={(item) => item.partyId.toString()}
                    ItemSeparatorComponent={() => (
                        <View style={styles.itemSeparator} />
                    )}
                    onEndReached={loadMorePagesHandler}
                    onEndReachedThreshold={0}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={() => (
                        <ListEmptyComponent
                            message={i18n.t("noPartiesFound")}
                        />
                    )}
                />
                {isFetchingNextPage && <ActivityIndicator size="large" />}
            </View>

            <CustomModal
                visible={isFiltersModalShown}
                onRequestClose={toggleFiltersModal}
                extraModalStyles={{ justifyContent: "flex-end" }}
                children={
                    <View>
                        <Formik
                            initialValues={{
                                partyType: {
                                    all:
                                        typeof filtersState?.isActive !=
                                        "boolean"
                                            ? true
                                            : false,
                                    isActive:
                                        typeof filtersState?.isActive ===
                                            "boolean" &&
                                        filtersState?.isActive === true
                                            ? true
                                            : false,
                                },
                            }}
                            onSubmit={filterFormSubmitHandler}
                        >
                            {({ values, setFieldValue, handleSubmit }) => (
                                <View
                                    style={commonStyles.modalEndMenuContainer}
                                >
                                    <Text
                                        style={commonStyles.modalEndMenuHeading}
                                    >
                                        {i18n.t("filter")}
                                    </Text>
                                    <RadioButton
                                        label={i18n.t("selectPartyType")}
                                        textKey="key"
                                        data={partyTypeRadioButtonData}
                                        onChange={(value) => {
                                            if (value.key === "all") {
                                                setFieldValue("partyType", {
                                                    all: true,
                                                    isActive: false,
                                                });
                                            } else if (value.key === "active") {
                                                setFieldValue("partyType", {
                                                    all: false,
                                                    isActive: true,
                                                });
                                            } else {
                                                setFieldValue("partyType", {
                                                    all: false,
                                                    isActive: false,
                                                });
                                            }
                                        }}
                                        value={
                                            values.partyType.all
                                                ? partyTypeRadioButtonData[0]
                                                : values.partyType.isActive
                                                ? partyTypeRadioButtonData[1]
                                                : partyTypeRadioButtonData[2]
                                        }
                                    />

                                    <View
                                        style={
                                            commonStyles.modalEndActionsContainer
                                        }
                                    >
                                        <CustomButton
                                            text={i18n.t("apply")}
                                            onPress={handleSubmit}
                                            extraContainerStyles={{ flex: 1 }}
                                        />
                                    </View>
                                </View>
                            )}
                        </Formik>
                    </View>
                }
            />
        </View>
    );
};

export default Parties;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        paddingTop: 24,
        rowGap: 16,
    },
    searchContainer: {
        flexDirection: "row",
        columnGap: 12,
    },
    actionsContainer: {
        flexDirection: "row",
    },
    itemListContainer: {
        marginTop: 10,
        paddingHorizontal: 8,
        flex: 1,
    },
    itemSeparator: {
        backgroundColor: "#D4D6DD",
        height: 1,
        marginTop: 15,
        marginBottom: 15,
    },
});
