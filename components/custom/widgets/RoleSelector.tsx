import { i18n } from "@/app/_layout";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { GenericObject, RoleTypeInRolesList } from "@/constants/types";
import UserService from "@/services/user/user_service";
import { GetAllRolesForRolesListResponse } from "@/services/user/user_types";
import { useAppSelector } from "@/store";
import { capitalizeText } from "@/utils/common_utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, ToastAndroid } from "react-native";
import Dropdown from "../basic/Dropdown";

interface RoleSelectorProps {
    value?: RoleTypeInRolesList;
    onChange(role: RoleTypeInRolesList): void;
    errorMessage?: string | null;
    extraContainerStyles?: Object;
    isDisabled?: boolean;
}

const RoleSelector = ({
    value,
    onChange,
    errorMessage,
    extraContainerStyles,
    isDisabled = false,
}: RoleSelectorProps) => {
    /* Selected company */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    /* Company Id from selected company */
    const companyId = useMemo(
        () => selectedCompany?.companyId as number,
        [selectedCompany]
    );

    /* Selected role */
    const [selectedRole, setSelectedRole] = useState<RoleTypeInRolesList>();

    /* Use Infinite query to get roles */
    const {
        data: rolesData,
        error: errorFetchingRoles,
        fetchNextPage: fetctNextPageOfRoles,
        isFetchingNextPage,
        refetch: refetchRoles,
    } = useInfiniteQuery({
        queryKey: [
            ReactQueryKeys.roles,
            companyId,
            {
                select: ["roleId", "roleName"],
            },
        ],
        queryFn: UserService.getAllRoles<GetAllRolesForRolesListResponse>,
        initialPageParam: {
            pageSize: 20,
            companyId: companyId,
            cursor: undefined,
            select: ["roleId", "roleName"],
        },
        getNextPageParam: (lastPage, pages) => {
            if (lastPage.data.nextPageCursor) {
                return {
                    pageSize: 20,
                    companyId: companyId,
                    cursor: lastPage.data.nextPageCursor,
                    select: ["roleId", "roleName"],
                };
            }
            return null;
        },
        enabled: false,
    });

    const allRoles = useMemo(() => {
        let roles =
            rolesData?.pages
                ?.map((rolesPage) => rolesPage?.data?.roles)
                ?.flat() || [];

        /* Changing companyId_ADMIN role name to only ADMIN. */
        for (let role of roles) {
            if (role.roleName == `${companyId}_ADMIN`) {
                role.roleName = "ADMIN";
                break;
            }
        }
        return roles;
    }, [rolesData]);

    /* Fetch Roles on mount */
    useEffect(() => {
        refetchRoles();
    }, []);

    /* Error fetching roles, show a toast message and go back */
    useEffect(() => {
        if (errorFetchingRoles) {
            ToastAndroid.show(
                capitalizeText(
                    `${i18n.t("errorFetchingRoles")}${i18n.t("comma")}${i18n.t(
                        "contactSupport"
                    )}`
                ),
                ToastAndroid.LONG
            );
            router.back();
        }
    }, [errorFetchingRoles]);

    /* On change of role */
    const roleChangeHandler = (role: GenericObject) => {
        setSelectedRole(role as RoleTypeInRolesList);
        onChange(role as RoleTypeInRolesList);
    };

    /* If value is passed set selected role */
    useEffect(() => {
        setSelectedRole(value);
    }, [value]);

    return (
        <Dropdown
            label={i18n.t("role")}
            textKey="roleName"
            data={allRoles}
            value={selectedRole}
            onChange={roleChangeHandler}
            customEqualsFunction={(role1, role2) =>
                role1?.roleId === role2?.roleId
            }
            errorMessage={errorMessage ? errorMessage : null}
            extraContainerStyles={
                extraContainerStyles ? extraContainerStyles : undefined
            }
            isDisabled={isDisabled}
            onFlatListEndReached={fetctNextPageOfRoles}
            isFetchingMoreItems={isFetchingNextPage}
        />
    );
};

export default RoleSelector;

const styles = StyleSheet.create({});
