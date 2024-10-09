import { i18n } from "@/app/_layout";
import CustomButton from "@/components/custom/basic/CustomButton";
import ErrorMessage from "@/components/custom/basic/ErrorMessage";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import {
    AddUpdateTransferForm,
    TransferItemType
} from "@/constants/types";
import UserService from "@/services/user/user_service";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import { capitalizeText } from "@/utils/common_utils";
import { AddUpdateTransferFormValidation } from "@/utils/schema_validations";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useFormik } from "formik";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    ToastAndroid,
    View,
} from "react-native";
import DateTimePickerCombined from "../basic/DateTimePickerCombined";
import Dropdown from "../basic/Dropdown";
import LoadingSpinnerOverlay from "../basic/LoadingSpinnerOverlay";
import AddTransferItemListItem from "../business/AddTransferItemListItem";
import AddTransferItem from "./AddTransferItem";

interface AddUpdateTransferProps {
    operation: "ADD" | "UPDATE";
    onAddUpdateTransfer(values: AddUpdateTransferForm): void;
    apiErrorMessage?: string | null;
    formValues?: AddUpdateTransferForm;
    isUpdateEnabled?: boolean;
}
const AddUpdateTransfer = ({
    operation,
    onAddUpdateTransfer,
    apiErrorMessage,
    formValues,
    isUpdateEnabled,
}: AddUpdateTransferProps) => {
    /* Selected Company */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    /* Fetching the group of companies of the current company */
    const {
        data: companyGroupData,
        isFetching: fetchingCompanyGroup,
        error: errorFetchingCompanyGroup,
    } = useQuery({
        queryKey: [ReactQueryKeys.getCompanyGroup, selectedCompany?.companyId],
        queryFn: () =>
            UserService.getCompanyGroup(
                selectedCompany?.companyId as number,
                selectedCompany?.isMainBranch
                    ? selectedCompany.companyId
                    : (selectedCompany?.mainBranchId as number)
            ),
    });

    /* All Companies, which are part of the group of selected company */
    const companyGroup = useMemo(() => {
        if (companyGroupData) {
            return companyGroupData.data.companies;
        }
        return [];
    }, [companyGroupData]);

    /* Disable all inputs only if operation is UPDATE and update is not enabled */
    const isInputsDisabled = useMemo(() => {
        if (operation === "UPDATE" && !isUpdateEnabled) {
            return true;
        }
        return false;
    }, [operation, isUpdateEnabled]);

    /* To store a selected transfer item if any */
    const selectedTransferItem = useRef<TransferItemType>();

    /* Whether add transfer item modal is visible */
    const [isAddTransferItemModalVisibile, setIsAddTransferItemModalVisible] =
        useState(false);

    /* To toggle add transfer item modal*/
    const toggleAddTransferItemModal = useCallback(() => {
        setIsAddTransferItemModalVisible((prev) => !prev);
    }, [isAddTransferItemModalVisibile]);

    /* Initial Sale form */
    const initialFormValues: AddUpdateTransferForm = useMemo(() => {
        if (formValues) {
            return formValues;
        }
        return {
            toCompany: undefined,
            items: {},
        };
    }, [formValues]);

    /* Form */
    const formik = useFormik({
        initialValues: initialFormValues,
        onSubmit: (values) => {
            onAddUpdateTransfer(values);
        },
        validationSchema: AddUpdateTransferFormValidation,
    });

    /* On change of transfer item */
    const onTransferItemChanged = (item: TransferItemType) => {
        /* Update items field. value is stores as key value, where key is itemId and value is Transfer item type */
        if (item && item.item) {
            formik.setFieldTouched("items", true);
            const temp = { ...formik.values.items };
            temp[item.item?.itemId] = item;
            formik.setFieldValue("items", temp);
        }
    };

    /* On Transfer Item selected */
    const onTransferItemSelected = (item: TransferItemType) => {
        if (item) {
            /* Setting selectedTransferItem, and toggling the modal */
            selectedTransferItem.current = item;
            toggleAddTransferItemModal();
        }
    };

    /* Remove Transfer Item, removing the item from items */
    const removeInvoiceItemHandler = (item: TransferItemType) => {
        if (item && item.item?.itemId) {
            const temp = { ...formik.values.items };
            delete temp[item.item?.itemId];
            formik.setFieldValue("items", temp);
        }
    };

    /* Loading spinner visibility */
    const showLoadingSpinner = useMemo(() => {
        return fetchingCompanyGroup ? true : false;
    }, [fetchingCompanyGroup]);

    /* Error fetching details: Show toast message and go back */
    useEffect(() => {
        if (errorFetchingCompanyGroup) {
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
    }, [errorFetchingCompanyGroup]);

    return (
        <ScrollView style={styles.mainContainer}>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}
            <View style={styles.container}>
                <View style={styles.formContainer}>
                    {apiErrorMessage && (
                        <ErrorMessage message={apiErrorMessage} />
                    )}

                    {operation == "UPDATE" && formik.values?.createdAt && (
                        <DateTimePickerCombined
                            dateLabel={i18n.t("transferDateTime")}
                            onChange={(selectedDateTime) => {
                                formik.setFieldTouched("createdAt", true);
                                formik.setFieldValue(
                                    "createdAt",
                                    selectedDateTime
                                );
                            }}
                            value={formik.values.createdAt}
                            timeLabel=""
                            isDisabled={true}
                        />
                    )}

                    <Dropdown
                        label={i18n.t("transferTo")}
                        data={companyGroup}
                        textKey="companyName"
                        customEqualsFunction={(company1, company2) =>
                            company1?.companyId == company2?.companyId
                        }
                        onChange={(company) => {
                            formik.setFieldTouched("toCompany");
                            formik.setFieldValue("toCompany", company);
                        }}
                        errorMessage={
                            formik.touched.toCompany && formik.errors.toCompany
                                ? formik.errors.toCompany
                                : null
                        }
                        isDisabled={isInputsDisabled}
                    />

                    <Text
                        style={[
                            commonStyles.textSmallBold,
                            commonStyles.capitalize,
                        ]}
                    >
                        {i18n.t("items")}
                    </Text>

                    {formik.touched.items && formik.errors.items && (
                        <ErrorMessage message={formik.errors.items as string} />
                    )}

                    <FlatList
                        data={Object.values(formik.values.items)}
                        renderItem={({ item }) => (
                            <AddTransferItemListItem
                                item={item}
                                removeItem={removeInvoiceItemHandler}
                                onTransferItemSelected={onTransferItemSelected}
                                isDisabled={isInputsDisabled}
                            />
                        )}
                        keyExtractor={(item) =>
                            item.item?.itemId?.toString() || ""
                        }
                        scrollEnabled={false}
                    />

                    <View style={styles.formContainer}>
                        <CustomButton
                            text={i18n.t("addItem")}
                            onPress={toggleAddTransferItemModal}
                            isSecondaryButton
                            isDisabled={isInputsDisabled}
                        />

                        {!isInputsDisabled && (
                            <CustomButton
                                text={i18n.t("save")}
                                onPress={formik.handleSubmit}
                            />
                        )}
                    </View>

                    {isAddTransferItemModalVisibile && (
                        <AddTransferItem
                            isVisible={isAddTransferItemModalVisibile}
                            toggleVisibility={() => {
                                selectedTransferItem.current = undefined;
                                toggleAddTransferItemModal();
                            }}
                            onTransferItemChange={onTransferItemChanged}
                            value={selectedTransferItem.current}
                        />
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

export default AddUpdateTransfer;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    container: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 12,
    },
    formContainer: {
        rowGap: 16,
    },
    rowContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
});
