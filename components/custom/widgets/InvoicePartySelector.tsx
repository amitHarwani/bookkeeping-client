import { i18n } from "@/app/_layout";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { GenericObject } from "@/constants/types";
import BillingService from "@/services/billing/billing_service";
import { ThirdParty } from "@/services/billing/billing_types";
import { useAppSelector } from "@/store";
import { capitalizeText, debounce } from "@/utils/common_utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, ToastAndroid, View } from "react-native";
import Dropdown from "../basic/Dropdown";

interface InvoicePartySelectorProps {
    value?: ThirdParty;
    onChange(party: ThirdParty): void;
    errorMessage?: string | null;
    extraContainerStyles?: Object;
}

const InvoicePartySelector = ({
    value,
    onChange,
    errorMessage,
    extraContainerStyles,
}: InvoicePartySelectorProps) => {
    /* Selected company */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    /* Selected party */
    const [selectedParty, setSelectedParty] = useState<ThirdParty>();

    /* Party name searched by the user */
    const [partyNameSearched, setPartyNameSearched] = useState("");

    const {
        data: partiesData,
        error: errorFetchingParties,
        fetchNextPage: fetchNextPageOfParties,
        refetch: refetchParties,
    } = useInfiniteQuery({
        queryKey: [
            ReactQueryKeys.parties,
            selectedCompany?.companyId,
            {
                isActive: true,
                partyNameSearchQuery: partyNameSearched,
                select: ["partyId", "partyName"],
            },
        ],
        queryFn: BillingService.getAllParties,
        initialPageParam: {
            pageSize: 20,
            companyId: selectedCompany?.companyId,
            cursor: undefined,
            query: {
                isActive: true,
                partyNameSearchQuery: partyNameSearched,
            },
            select: ["partyId", "partyName"],
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.data.nextPageCursor) {
                return {
                    companyId: selectedCompany?.companyId,
                    pageSize: 20,
                    query: {
                        isActive: true,
                        partyNameSearchQuery: partyNameSearched,
                    },
                    cursor: lastPage.data.nextPageCursor,
                    select: ["partyId", "partyName"],
                };
            }
            return null;
        },
        enabled: false,
    });

    /* Fetch Parties on mount */
    useEffect(() => {
        refetchParties();
    }, []);

    /* Error fetching parties, show a toast message and go back */
    useEffect(() => {
        if (errorFetchingParties) {
            ToastAndroid.show(
                capitalizeText(
                    `${i18n.t("errorFetchingParties")}${i18n.t(
                        "comma"
                    )}${i18n.t("contactSupport")}`
                ),
                ToastAndroid.LONG
            );
            router.back();
        }
    }, [errorFetchingParties]);

    /* On change of party */
    const partyChangeHandler = (newParty: GenericObject) => {
        setSelectedParty(newParty as ThirdParty);
        onChange(newParty as ThirdParty);
    };

    /* On change of search input */
    const onSearchChangeHandler = (text: string) => {
        /* Set party name searched state, and refetchParties */
        setPartyNameSearched(text);
        debounce(refetchParties, 1000)();
    };

    /* If value is passed set selected party */
    useEffect(() => {
        setSelectedParty(value);
    }, [value]);

    return (
        <Dropdown
            label={i18n.t("party")}
            textKey="partyName"
            isDynamicSearchable={true}
            data={
                partiesData?.pages
                    ?.map((partiesPage) => partiesPage.data.parties)
                    .flat() || []
            }
            value={selectedParty}
            onChange={partyChangeHandler}
            onSearchChangeHandler={onSearchChangeHandler}
            customEqualsFunction={(party1, party2) =>
                party1.partyId === party2.partyId
            }
            searchPlaceholder={capitalizeText(i18n.t("searchByPartyName"))}
            isSearchable={true}
            errorMessage={errorMessage ? errorMessage : null}
            extraContainerStyles={
                extraContainerStyles ? extraContainerStyles : undefined
            }
        />
    );
};

export default InvoicePartySelector;

const styles = StyleSheet.create({});
