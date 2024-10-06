import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    ToastAndroid,
    View,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    router,
    useLocalSearchParams,
    useNavigation,
    usePathname,
} from "expo-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { useAppSelector } from "@/store";
import UserService from "@/services/user/user_service";
import { i18n } from "@/app/_layout";
import { capitalizeText, getApiErrorMessage } from "@/utils/common_utils";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import AddUpdateRole from "@/components/custom/widgets/AddUpdateRole";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import { isFeatureAccessible } from "@/utils/feature_access_helper";
import { PLATFORM_FEATURES } from "@/constants/features";
import EditIcon from "@/assets/images/edit_icon.png";
import { commonStyles } from "@/utils/common_styles";
import { AddUpdateRoleForm } from "@/constants/types";

const GetRole = () => {
    /* Selected Company */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    /* Company ID */
    const companyId = useMemo(
        () => selectedCompany?.companyId as number,
        [selectedCompany]
    );

    /* Role Id from path param */
    const roleId = Number(useLocalSearchParams().roleId);

    /* Navigator */
    const navigator = useNavigation();

    /* Whether edit is enabled */
    const [isEditEnabled, setIsEditEnabled] = useState(false);

    /* Toggle edit function */
    const toggleEdit = useCallback(() => {
        setIsEditEnabled((prev) => !prev);
    }, [isEditEnabled]);

    /* Fetching Role */
    const {
        isFetching: fetchingRole,
        data: roleData,
        error: errorFetchingRole,
        refetch: fetchRole,
    } = useQuery({
        queryKey: [ReactQueryKeys.getRole, roleId, selectedCompany, companyId],
        queryFn: () => UserService.getRole(roleId, companyId),
    });

    /* Update Role Mutation */
    const updateRoleMutation = useMutation({
        mutationFn: (values: AddUpdateRoleForm) =>
            UserService.updateRole(companyId, roleId, values),
    });

    /* Setting the header */
    useEffect(() => {
        navigator.setOptions({
            headerTitle: () => (
                <CustomNavHeader
                    mainHeading={i18n.t("role")}
                    subHeading={roleData?.data?.role?.roleName || ""}
                />
            ),
            headerRight: () =>
                /* If edit is not enabled and the update feature is accessible, and this is not the main role  */
                !isEditEnabled &&
                roleData?.data.role.roleName != `${companyId}_ADMIN` &&
                isFeatureAccessible(PLATFORM_FEATURES.ADD_UPDATE_ROLE) ? (
                    <Pressable
                        onPress={toggleEdit}
                        style={styles.headerRightContainer}
                    >
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
    }, [navigator, roleData]);

    /* Form Values */
    const formValues: AddUpdateRoleForm | null = useMemo(() => {
        if (roleData?.data?.role) {
            const acl: { [featureId: number]: boolean } = {};

            roleData.data.role.acl.forEach((feature) => {
                acl[feature] = true;
            });

            return {
                roleName: roleData.data.role.roleName,
                acl: acl,
            };
        }
        return null;
    }, [roleData]);

    /* Loading spinner visibility */
    const showLoadingSpinner = useMemo(() => {
        return fetchingRole || updateRoleMutation.isPending ? true : false;
    }, [fetchingRole, updateRoleMutation.isPending]);

    /* On Role Updated show a toast message, fetch role again, and toggle edit */
    useEffect(() => {
        if (updateRoleMutation.isSuccess && updateRoleMutation.data.success) {
            ToastAndroid.show(
                capitalizeText(`${i18n.t("roleUpdatedSuccessfully")}`),
                ToastAndroid.LONG
            );
            fetchRole();
            toggleEdit();
        }
    }, [updateRoleMutation.isSuccess]);

    /* Error Fetching Role: Show Toast Message and go back */
    useEffect(() => {
        if (errorFetchingRole) {
            ToastAndroid.show(
                capitalizeText(
                    `${i18n.t("errorFetchingRole")}${i18n.t("comma")}${i18n.t(
                        "contactSupport"
                    )}`
                ),
                ToastAndroid.LONG
            );
            router.back();
        }
    }, [errorFetchingRole]);

    return (
        <>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}
            {formValues && (
                <AddUpdateRole
                    operation="UPDATE"
                    formValues={formValues}
                    isEditEnabled={isEditEnabled}
                    onRoleAddOrUpdate={(values) =>
                        updateRoleMutation.mutate(values)
                    }
                    apiErrorMessage={
                        updateRoleMutation.error
                            ? getApiErrorMessage(updateRoleMutation.error)
                            : null
                    }
                />
            )}
        </>
    );
};

export default GetRole;

const styles = StyleSheet.create({
    headerRightContainer: {
        marginRight: 12,
    },
});
