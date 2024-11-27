import { ReactQueryKeys } from "@/constants/reactquerykeys";
import UserService from "@/services/user/user_service";
import SystemAdminService from "@/services/sysadmin/sysadmin_service";
import { useAppDispatch, useAppSelector } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import {
    setCountryDetails,
    setTaxDetailsOfCountry,
    setUserACL,
} from "@/store/CompanySlice";
import { PlatformFeature, TaxDetail } from "@/services/sysadmin/sysadmin_types";
import { setPlatformFeatures } from "@/store/PlatformFeaturesSlice";
import { capitalizeText } from "@/utils/common_utils";
import { i18n } from "@/app/_layout";

export const useSetReduxStateForCompany = () => {
    const dispatch = useAppDispatch();

    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    /* useQuery for fetching userACL for the company */
    const {
        isFetching: fetchingACL,
        data: userACL,
        error: errorFetchingACL,
        refetch: fetchUserACL,
    } = useQuery({
        queryKey: [
            ReactQueryKeys.userACLForCompany,
            selectedCompany?.companyId,
        ],
        queryFn: () =>
            UserService.getAccessibleFeaturesOfCompany(
                selectedCompany?.companyId as number
            ),
        enabled: false,
    });

    /* useQuery for fetching taxdetails of the country where the company is located */
    const {
        isFetching: fetchingTaxDetailsOfCountry,
        data: taxDetailsOfCountry,
        error: errorFetchingTaxDetailsOfCountry,
        refetch: fetchTaxDetailsOfCountry,
    } = useQuery({
        queryKey: [
            ReactQueryKeys.taxDetailsOfCountry,
            ReactQueryKeys.dashboardAPICall,
            selectedCompany?.countryId,
        ],
        queryFn: () =>
            SystemAdminService.getTaxDetailsOfCountry(
                selectedCompany?.countryId as number
            ),
        enabled: false,
    });

    /* Fetching platform features */
    const {
        isFetching: fetchingEnabledFeatures,
        data: enabledFeaturesData,
        error: errorFetchingEnabledFeatures,
    } = useQuery({
        queryKey: [ReactQueryKeys.enabledPlatformFeatures],
        queryFn: () => SystemAdminService.getAllEnabledFeatures(),
    });

    /* Fetching country details of the selected company */
    const {
        isFetching: fetchingCountryDetails,
        data: countryDetails,
        error: errorFetchingCountryDetails,
        refetch: fetchCountryDetails,
    } = useQuery({
        queryKey: [ReactQueryKeys.country, selectedCompany?.countryId],
        queryFn: () =>
            SystemAdminService.getCountryById(
                selectedCompany?.countryId as number
            ),
        enabled: false,
    });

    /* Fetch userACL & tax, country details of country if selected company is their in redux store */
    useEffect(() => {
        if (selectedCompany && selectedCompany.companyId && !fetchingACL) {
            fetchUserACL();
        }
        if (
            selectedCompany &&
            selectedCompany.countryId &&
            !fetchingTaxDetailsOfCountry
        ) {
            fetchTaxDetailsOfCountry();
        }
        if (
            selectedCompany &&
            selectedCompany.countryId &&
            !fetchingCountryDetails
        ) {
            fetchCountryDetails();
        }
    }, [selectedCompany]);

    /* Set User ACL In redux store after fetch */
    useEffect(() => {
        if (userACL && userACL.success) {
            /* Forming key value obj, where key is featureId and value is true, for fast retrieval */
            const userACLObj: { [featureId: number]: boolean } = {};
            userACL.data.acl.forEach((feature) => {
                userACLObj[feature] = true;
            });
            dispatch(setUserACL({ acl: userACLObj }));
        }
    }, [userACL]);

    /* Setting tax details of country in redux store */
    useEffect(() => {
        if (taxDetailsOfCountry && taxDetailsOfCountry.success) {
            const taxDetails = taxDetailsOfCountry.data.taxDetails;

            /* Forming key value pairs: where key is taxId and value is TaxDetail object, for fast retrieval */
            const taxDetailsObj: { [taxId: string]: TaxDetail } = {};
            taxDetails.forEach((tax) => {
                taxDetailsObj[tax.taxId] = tax;
            });

            dispatch(
                setTaxDetailsOfCountry({ taxDetailsOfCountry: taxDetailsObj })
            );
        }
    }, [taxDetailsOfCountry]);

    /* Setting enabled featues in redux store */
    useEffect(() => {
        if (enabledFeaturesData && enabledFeaturesData.success) {
            const enabledFeaturesObj: { [featureId: number]: PlatformFeature } =
                {};

            /* Forming key value pairs: where key is fetureId and value is PlatformFeature object, for fast retrieval */
            enabledFeaturesData.data.features.forEach((feature) => {
                enabledFeaturesObj[feature.featureId] = feature;
            });

            dispatch(
                setPlatformFeatures({ platformFeatures: enabledFeaturesObj })
            );
        }
    }, [enabledFeaturesData]);

    /* Setting country details in redux */
    useEffect(() => {
        if (countryDetails && countryDetails.success) {
            dispatch(
                setCountryDetails({ country: countryDetails.data.country })
            );
        }
    }, [countryDetails]);

    /* Loading spinner when fetching ACL */
    const showLoadingSpinner = useMemo(() => {
        return fetchingACL ||
            fetchingTaxDetailsOfCountry ||
            fetchingEnabledFeatures ||
            fetchingCountryDetails
            ? true
            : false;
    }, [
        fetchingACL,
        fetchingTaxDetailsOfCountry,
        fetchingEnabledFeatures,
        fetchingCountryDetails,
    ]);

    const errorMessage = useMemo(() => {
        let message = "";
        if (errorFetchingACL) {
            message = capitalizeText(
                `${i18n.t("errorFetchingACL")}${i18n.t("comma")}${i18n.t(
                    "contactSupport"
                )}`
            );
        }
        if (errorFetchingTaxDetailsOfCountry) {
            message = capitalizeText(
                `${i18n.t("errorFetchingTaxDetails")}${i18n.t("comma")}${i18n.t(
                    "contactSupport"
                )}`
            );
        }
        if (errorFetchingEnabledFeatures || errorFetchingCountryDetails) {
            message = capitalizeText(
                `${i18n.t("error")}${i18n.t("comma")}${i18n.t(
                    "contactSupport"
                )}`
            );
        }
        return message;
    }, [
        errorFetchingACL,
        errorFetchingTaxDetailsOfCountry,
        errorFetchingEnabledFeatures,
        errorFetchingCountryDetails,
    ]);

    return {showLoadingSpinner, errorMessage}
};
