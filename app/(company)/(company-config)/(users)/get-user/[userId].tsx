import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    ToastAndroid,
    View,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/store";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import AddUpdateUser from "@/components/custom/widgets/AddUpdateUser";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import UserService from "@/services/user/user_service";
import { capitalizeText, getApiErrorMessage } from "@/utils/common_utils";
import { i18n } from "@/app/_layout";
import { AddUpdateUserForm } from "@/constants/types";
import SysAdminService from "@/services/sysadmin/sysadmin_service";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import { isFeatureAccessible } from "@/utils/feature_access_helper";
import { PLATFORM_FEATURES } from "@/constants/features";
import { commonStyles } from "@/utils/common_styles";
import EditIcon from "@/assets/images/edit_icon.png";

const GetUser = () => {
    /* Stack Navigator */
    const navigator = useNavigation();

    /* User ID from path params */
    const userId = useLocalSearchParams().userId as string;

    /* Selected Company from Redux */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    /* Company ID */
    const companyId = useMemo(
        () => selectedCompany?.companyId as number,
        [selectedCompany]
    );

    /* Edit status */
    const [isEditEnabled, setIsEditEnabled] = useState(false);

    /* Toggle edit function */
    const toggleEdit = useCallback(() => {
        setIsEditEnabled((prev) => !prev);
    }, [isEditEnabled]);

    /* Use Query to fetch user data */
    const {
        data: userData,
        isFetching: fetchingUserData,
        error: errorFetchingUserData,
        refetch: refetchUserData,
    } = useQuery({
        queryKey: [ReactQueryKeys.getUser, userId, companyId],
        queryFn: () => UserService.getUser(userId, companyId as number),
    });

    /* Setting the header */
    useEffect(() => {
        navigator.setOptions({
            headerTitle: () => (
                <CustomNavHeader
                    mainHeading={i18n.t("user")}
                    subHeading={userData?.data?.user?.fullName || ""}
                />
            ),
            headerRight: () =>
                /* If edit is not enabled and the update feature is accessible  */
                !isEditEnabled &&
                isFeatureAccessible(PLATFORM_FEATURES.ADD_UPDATE_USER) ? (
                    <Pressable onPress={toggleEdit} style={{ marginRight: 12 }}>
                        <Image
                            source={EditIcon}
                            style={commonStyles.editIcon}
                            resizeMode="contain"
                        />
                    </Pressable>
                ) : (
                    <></>
                ),
        });
    }, [navigator, userData]);

    /* Finding the users role id for the current company */
    const usersRoleIdForCurrentCompany = useMemo(() => {
        if (userData) {
            return (
                userData.data.userCompanyMappings.find(
                    (mapping) => mapping.companyId == companyId
                )?.roleId || null
            );
        }
        return null;
    }, [userData]);

    /* Fetching role information */
    const {
        data: usersRole,
        isFetching: fetchingUsersRole,
        error: errorFetchingUsersRole,
        refetch: refetchUsersRole,
    } = useQuery({
        queryKey: [ReactQueryKeys.getRole, usersRoleIdForCurrentCompany],
        queryFn: () =>
            UserService.getRole(
                usersRoleIdForCurrentCompany as number,
                companyId
            ),
        enabled: false,
    });

    /* Fetching country information */
    const {
        data: usersCountry,
        isFetching: fetchingUsersCountry,
        error: errorFetchingUsersCountry,
        refetch: refetchUsersCountry,
    } = useQuery({
        queryKey: [ReactQueryKeys.country, userData?.data.user.countryId],
        queryFn: () =>
            SysAdminService.getCountryById(
                userData?.data.user.countryId as number
            ),
        enabled: false,
    });

    /* After fetching user data fetch the users role and country */
    useEffect(() => {
        if (userData && userData.success) {
            refetchUsersRole();
            refetchUsersCountry();
        }
    }, [userData]);

    const formValues: AddUpdateUserForm | null = useMemo(() => {
        if (userData?.success && usersRole?.success && usersCountry?.success) {
            const userInfo = userData.data.user;
            const roleInfo = usersRole.data.role;
            const countryInfo = usersCountry.data.country;

            /* Phone code of the users phone number from the phone number codes of the country */
            let phoneCode = countryInfo?.phoneNumberCodes?.find((code) => {
                return userInfo.mobileNumber.includes(code);
            });

            /* Getting the phone number, withouth the phone code */
            let mobileNumber = userInfo.mobileNumber.substring(
                phoneCode?.length as number
            );

            /* Add Update User form values */
            const values: AddUpdateUserForm = {
                fullName: userInfo.fullName,
                email: userInfo.email,
                password: "",
                isActive: userInfo.isActive as boolean,
                mobileNumber: mobileNumber,
                phoneCode: phoneCode as string,
                country: countryInfo,
                role: roleInfo,
            };
            return values;
        }
        return null;
    }, [userData, usersRole, usersCountry]);

    /* Update User Details Mutation */
    const updateUserMutation = useMutation({
        mutationFn: (values: AddUpdateUserForm) =>
            UserService.updateUser(values, userId, companyId),
    });

    /* Update User Access Mutation */
    const updateUserAccessMutation = useMutation({
        mutationFn: (values: AddUpdateUserForm) =>
            UserService.updateUserAccess(values, userId, companyId),
    });

    /* On Update */
    const onUpdate = (values: AddUpdateUserForm) => {
        if (
            values.fullName != formValues?.fullName ||
            values.email != formValues.email ||
            values.country?.countryId != formValues.country?.countryId ||
            values.mobileNumber != formValues.mobileNumber ||
            values.phoneCode != formValues.phoneCode
        ) {
            /* Update User Profile Info */
            updateUserMutation.mutate(values);
        }

        if (
            values.isActive != formValues?.isActive ||
            values.role?.roleId != formValues.role?.roleId
        ) {
            /* Update User Access Info */
            updateUserAccessMutation.mutate(values);
        }
    };

    /* Refetch user data once update is complete and toggle edit */
    useEffect(() => {
        if (
            (updateUserMutation.isSuccess ||
                updateUserAccessMutation.isSuccess) &&
            !updateUserMutation.isPending &&
            !updateUserAccessMutation.isPending
        ) {
            ToastAndroid.show(
                capitalizeText(`${i18n.t("userUpdatedSuccessfully")}`),
                ToastAndroid.LONG
            );
            toggleEdit();
            refetchUserData();
        }
    }, [updateUserMutation.isSuccess, updateUserAccessMutation.isSuccess]);
    /* Loading spinner visibility */
    const showLoadingSpinner = useMemo(() => {
        return fetchingUserData ||
            fetchingUsersRole ||
            fetchingUsersCountry ||
            updateUserMutation.isPending ||
            updateUserAccessMutation.isPending
            ? true
            : false;
    }, [
        fetchingUserData,
        fetchingUsersRole,
        fetchingUsersCountry,
        updateUserMutation.isPending,
        updateUserAccessMutation.isPending,
    ]);

    /* Error fetching details: Show toast message and go back */
    useEffect(() => {
        if (
            errorFetchingUserData ||
            errorFetchingUsersRole ||
            errorFetchingUsersCountry
        ) {
            ToastAndroid.show(
                capitalizeText(
                    `${i18n.t("errorFetchingDetails")}${i18n.t(
                        "comma"
                    )}${i18n.t("contactSupport")}`
                ),
                ToastAndroid.LONG
            );

            router.back();
        }
    }, [
        errorFetchingUserData,
        errorFetchingUsersRole,
        errorFetchingUsersCountry,
    ]);

    return (
        <>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}
            {formValues && (
                <AddUpdateUser
                    operation="UPDATE"
                    onUserAddOrUpdate={(values) => onUpdate(values)}
                    formValues={formValues}
                    isEditEnabled={isEditEnabled}
                    apiErrorMessage={
                        updateUserMutation.error
                            ? getApiErrorMessage(updateUserMutation.error)
                            : updateUserAccessMutation.error
                            ? getApiErrorMessage(updateUserAccessMutation.error)
                            : null
                    }
                />
            )}
        </>
    );
};

export default GetUser;

const styles = StyleSheet.create({});
