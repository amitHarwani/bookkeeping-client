import { i18n } from "@/app/_layout";
import CustomButton from "@/components/custom/basic/CustomButton";
import CustomModal from "@/components/custom/basic/CustomModal";
import DateTimePickerCombined from "@/components/custom/basic/DateTimePickerCombined";
import ErrorMessage from "@/components/custom/basic/ErrorMessage";
import FilterButton from "@/components/custom/basic/FilterButton";
import Input from "@/components/custom/basic/Input";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import RadioButton from "@/components/custom/basic/RadioButton";
import ListEmptyComponent from "@/components/custom/business/ListEmptyComponent";
import QuotationListItem from "@/components/custom/business/QuotationListItem";
import InvoicePartySelector from "@/components/custom/widgets/InvoicePartySelector";
import { PLATFORM_FEATURES } from "@/constants/features";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { AppRoutes } from "@/constants/routes";
import { FilterQuotationForm } from "@/constants/types";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import BillingService from "@/services/billing/billing_service";
import {
    GetAllQuotationsForQuotationListResponse
} from "@/services/billing/billing_types";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import {
    capitalizeText,
    getApiErrorMessage,
    getDateAfterSubtracting,
} from "@/utils/common_utils";
import { isFeatureAccessible } from "@/utils/feature_access_helper";
import {
    FilterQuotationFormValidation
} from "@/utils/schema_validations";
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

const Quotations = () => {
    /* Selected company from redux */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    const companyState = useAppSelector((state) => state.company);

    /* Yes no radio button data */
    const yesNoRadioButtonData = useMemo(
        () => [
            { key: "yes", value: true },
            { key: "no", value: false },
        ],
        []
    );

    /* Current state of filters */
    const [filtersState, setFiltersState] = useState<FilterQuotationForm>({
        filterByDate: false,
    });

    /* Search Input state: To search by quotation number */
    const [searchInput, setSearchInput] = useState<number>();

    /* Search Input error */
    const [searchInputError, setSearchInputError] = useState<string>();

    /* Search Query State, fills data from search input once search button is clicked */
    const [searchQuery, setSearchQuery] = useState<number>();

    /* Visibility of filters modal */
    const [isFiltersModalShown, setIsFiltersModalShown] = useState(false);

    /* Toggle filters modal visibility */
    const toggleFiltersModal = useCallback(() => {
        setIsFiltersModalShown((prev) => !prev);
    }, [isFiltersModalShown]);

    /* Use Infinite query to get quotations by filters and search query  */
    const {
        data: quotationsData,
        error: errorFetchingQuotations,
        fetchNextPage: fetctNextPageOfQuotations,
        hasNextPage,
        isFetchingNextPage,
        isFetching,
        isPending,
        refetch: refetchQuotations,
    } = useInfiniteQuery({
        queryKey: [
            ReactQueryKeys.quotations,
            selectedCompany?.companyId,
            {
                ...filtersState,
                quotationNumberSearchQuery: searchQuery,
                select: [
                    "quotationId",
                    "partyName",
                    "quotationNumber",
                    "saleId",
                    "totalAfterTax",
                    "createdAt",
                    "updatedAt",
                ],
            },
        ],
        queryFn:
            BillingService.getAllQuotations<GetAllQuotationsForQuotationListResponse>,
        initialPageParam: {
            pageSize: 20,
            companyId: selectedCompany?.companyId,
            cursor: undefined,
            query: filtersState,
            countryDetails: companyState.country,
            quotationNumberSearchQuery: Number(searchQuery),
            select: [
                "quotationId",
                "partyName",
                "quotationNumber",
                "saleId",
                "totalAfterTax",
                "createdAt",
                "updatedAt",
            ],
        },
        getNextPageParam: (lastPage, pages) => {
            if (lastPage.data.nextPageCursor) {
                return {
                    pageSize: 20,
                    companyId: selectedCompany?.companyId,
                    cursor: lastPage.data.nextPageCursor,
                    query: filtersState,
                    countryDetails: companyState.country,
                    quotationNumberSearchQuery: Number(searchQuery),
                    select: [
                        "quotationId",
                        "partyName",
                        "quotationNumber",
                        "saleId",
                        "totalAfterTax",
                        "createdAt",
                        "updatedAt",
                    ],
                };
            }
            return null;
        },
        enabled: false,
    });

    /* Refetch Quotations when the screen comes back to focus */
    useRefreshOnFocus(refetchQuotations);

    /* Search input change handler */
    const searchInputChangeHandler = (text: string) => {
        setSearchInput(Number(text));
    };

    /* Load more page handler */
    const loadMorePagesHandler = () => {
        /* If next page is there, fetch */
        if (hasNextPage) {
            fetctNextPageOfQuotations();
        }
    };

    /* Filter form submit handler */
    const filterFormSubmitHandler = (values: FilterQuotationForm) => {
        /* Setting the filters state */
        setFiltersState({
            party: values?.party,
            filterByDate: values?.filterByDate,
            fromTransactionDateTime: values?.fromTransactionDateTime,
            toTransactionDateTime: values?.toTransactionDateTime,
        });

        /* Hiding the filters modal */
        toggleFiltersModal();
    };

    /* on click of search button */
    const searchHandler = () => {
        /* Removing the error */
        setSearchInputError("");

        /* Empty search */
        if (searchInput === undefined) {
            setSearchQuery(searchInput);
            return;
        }
        /* If searchInput is not a number */
        if (isNaN(searchInput)) {
            setSearchInputError(i18n.t("quotationNumberShouldBeNumeric"));
            return;
        }

        /* Set search query state to searchInput state */
        setSearchQuery(searchInput);
    };

    /* Once search query or filters state changes */
    useEffect(() => {
        /* If fetching is not in progress */
        if (!isFetching) {
            /* fetch quotations  */
            refetchQuotations();
        }
    }, [filtersState, searchQuery]);

    /* Show loading spinner until first page data arrives */
    const showLoadingSpinner = useMemo(() => {
        return isPending && isFetching ? true : false;
    }, [isPending, isFetching]);

    /* Error message from API */
    const apiErrorMessage = useMemo(() => {
        if (errorFetchingQuotations) {
            return getApiErrorMessage(errorFetchingQuotations);
        }
    }, [errorFetchingQuotations]);

    return (
        <View style={styles.container}>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}
            {apiErrorMessage && <ErrorMessage message={apiErrorMessage} />}
            <View style={styles.searchContainer}>
                <Input
                    placeholder={capitalizeText(
                        i18n.t("searchByQuotationNumber")
                    )}
                    isSearchIconVisible={true}
                    extraInputStyles={{ paddingVertical: 10 }}
                    value={searchInput?.toString() || ""}
                    keyboardType="number-pad"
                    onChangeText={searchInputChangeHandler}
                    extraContainerStyles={{ flex: 1 }}
                    keepLabelSpace={false}
                    errorMessage={searchInputError ? searchInputError : null}
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
                {isFeatureAccessible(
                    PLATFORM_FEATURES.ADD_UPDATE_QUOTATION
                ) && (
                    <CustomButton
                        text={i18n.t("addQuotation")}
                        onPress={() => {
                            router.push(`${AppRoutes.addQuotation}` as Href);
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
                    data={quotationsData?.pages
                        .map((quotationPage) => quotationPage.data.quotations)
                        .flat()}
                    renderItem={({ item }) => (
                        <QuotationListItem
                            quotation={item}
                            onPress={(quotation) =>
                                router.push(
                                    `${AppRoutes.getQuotation}/${quotation.quotationId}` as Href
                                )
                            }
                        />
                    )}
                    keyExtractor={(item) => item.quotationId.toString()}
                    ItemSeparatorComponent={() => (
                        <View style={styles.itemSeparator} />
                    )}
                    onEndReached={loadMorePagesHandler}
                    onEndReachedThreshold={0}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={() => (
                        <ListEmptyComponent
                            message={i18n.t("noQuotationsFound")}
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
                                filterByDate: filtersState?.filterByDate,
                                fromTransactionDateTime:
                                    filtersState?.fromTransactionDateTime,
                                party: filtersState?.party,
                                toTransactionDateTime:
                                    filtersState?.toTransactionDateTime,
                            }}
                            onSubmit={filterFormSubmitHandler}
                            validationSchema={FilterQuotationFormValidation}
                        >
                            {({
                                values,
                                setFieldValue,
                                setFieldTouched,
                                handleSubmit,
                                touched,
                                errors,
                                resetForm,
                            }) => (
                                <View
                                    style={commonStyles.modalEndMenuContainer}
                                >
                                    <Text
                                        style={commonStyles.modalEndMenuHeading}
                                    >
                                        {i18n.t("filter")}
                                    </Text>

                                    <View style={styles.partySelectorContainer}>
                                        <InvoicePartySelector
                                            value={values.party}
                                            onChange={(selectedParty) => {
                                                setFieldTouched("party", true);
                                                setFieldValue(
                                                    "party",
                                                    selectedParty
                                                );
                                            }}
                                            extraContainerStyles={{ flex: 1 }}
                                        />
                                        <CustomButton
                                            onPress={() => {
                                                setFieldValue(
                                                    "party",
                                                    undefined
                                                );
                                            }}
                                            text={i18n.t("reset")}
                                            isSecondaryButton
                                            extraContainerStyles={{
                                                flex: 0.3,
                                                paddingHorizontal: 12,
                                                paddingVertical: 10,
                                                height: 54,
                                            }}
                                            extraTextStyles={{ fontSize: 12 }}
                                        />
                                    </View>

                                    <RadioButton
                                        data={yesNoRadioButtonData}
                                        textKey="key"
                                        label={`${i18n.t(
                                            "filterByDate"
                                        )} ${i18n.t("qm")}`}
                                        onChange={(answer) => {
                                            setFieldValue(
                                                "filterByDate",
                                                answer.value
                                            );
                                            if (answer.value) {
                                                setFieldValue(
                                                    "fromTransactionDateTime",
                                                    getDateAfterSubtracting(30)
                                                );
                                                setFieldValue(
                                                    "toTransactionDateTime",
                                                    new Date()
                                                );
                                            }
                                        }}
                                        value={
                                            values.filterByDate
                                                ? yesNoRadioButtonData[0]
                                                : yesNoRadioButtonData[1]
                                        }
                                    />

                                    {values.filterByDate && (
                                        <DateTimePickerCombined
                                            dateLabel={i18n.t("fromDate")}
                                            timeLabel={i18n.t("fromTime")}
                                            onChange={(dateTime) => {
                                                setFieldTouched(
                                                    "fromTransactionDateTime"
                                                );
                                                setFieldValue(
                                                    "fromTransactionDateTime",
                                                    dateTime
                                                );
                                            }}
                                            value={
                                                values.fromTransactionDateTime
                                            }
                                            errorMessage={
                                                touched.fromTransactionDateTime &&
                                                errors.fromTransactionDateTime
                                                    ? errors.fromTransactionDateTime
                                                    : null
                                            }
                                        />
                                    )}

                                    {values.filterByDate &&
                                        values.fromTransactionDateTime && (
                                            <DateTimePickerCombined
                                                dateLabel={i18n.t("toDate")}
                                                timeLabel={i18n.t("toTime")}
                                                onChange={(dateTime) => {
                                                    setFieldTouched(
                                                        "toTransactionDateTime"
                                                    );
                                                    setFieldValue(
                                                        "toTransactionDateTime",
                                                        dateTime
                                                    );
                                                }}
                                                value={
                                                    values.toTransactionDateTime
                                                }
                                                errorMessage={
                                                    touched.toTransactionDateTime &&
                                                    errors.toTransactionDateTime
                                                        ? errors.toTransactionDateTime
                                                        : null
                                                }
                                            />
                                        )}

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

export default Quotations;

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
    partySelectorContainer: {
        flexDirection: "row",
        columnGap: 4,
        alignItems: "flex-end",
    },
});
