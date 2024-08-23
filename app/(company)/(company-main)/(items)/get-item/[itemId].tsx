import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    ToastAndroid,
    View,
} from "react-native";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import InventoryService from "@/services/inventory/inventory_service";
import { useAppSelector } from "@/store";
import { i18n } from "@/app/_layout";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import { capitalizeText, getApiErrorMessage } from "@/utils/common_utils";
import { UpdateItemForm } from "@/constants/types";
import { Formik, useFormik } from "formik";
import EditIcon from "@/assets/images/edit_icon.png";
import { commonStyles } from "@/utils/common_styles";
import { isFeatureAccessible } from "@/utils/feature_access_helper";
import { PLATFORM_FEATURES } from "@/constants/features";
import Input from "@/components/custom/basic/Input";
import Dropdown from "@/components/custom/basic/Dropdown";
import AddUnit from "@/components/custom/business/AddUnit";
import RadioButton from "@/components/custom/basic/RadioButton";
import CustomButton from "@/components/custom/basic/CustomButton";
import ErrorMessage from "@/components/custom/basic/ErrorMessage";
import { UpdateItemFormValidation } from "@/utils/schema_validations";

const GetItem = () => {
    /* URL Params */
    const params = useLocalSearchParams();

    /* Company state */
    const companyState = useAppSelector((state) => state.company);

    /* Selected company from redux */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    /* Item ID from params */
    const itemId = useMemo(() => {
        return Number(params.itemId);
    }, [params]);

    /* Navigation */
    const navigation = useNavigation();

    /* Whether editing is enabled */
    const [isEditEnabled, setIsEditEnabled] = useState(false);

    /* Visibility of add unit modal */
    const [isAddUnitModalShown, setIsAddUnitModalShown] = useState(false);

    /* Toggle edit */
    const toggleEdit = useCallback(() => {
        setIsEditEnabled((prev) => !prev);
    }, [isEditEnabled]);

    /* Toggle add unit modal */
    const toggleAddUnitModal = useCallback(() => {
        setIsAddUnitModalShown((prev) => !prev);
    }, [isAddUnitModalShown]);

    /* Fetching Item data */
    const {
        isFetching: fetchingItem,
        data: itemData,
        error: errorFetchingItem,
    } = useQuery({
        queryKey: [ReactQueryKeys.getItem, Number(params.itemId)],
        queryFn: () =>
            InventoryService.getItem(
                Number(params.itemId),
                selectedCompany?.companyId as number
            ),
    });

    /* Fetching Units */
    const {
        isFetching: fetchingUnits,
        data: unitsData,
        error: errorFetchingUnits,
        refetch: refetchUnits,
    } = useQuery({
        queryKey: [ReactQueryKeys.units, selectedCompany?.companyId],
        queryFn: () =>
            InventoryService.getAllUnits(selectedCompany?.companyId as number),
    });

    /* Update item mutation */
    const updateItemMutation = useMutation({
        mutationFn: (values: UpdateItemForm) =>
            InventoryService.updateItem(
                itemData?.data.item.itemId as number,
                selectedCompany?.companyId as number,
                values
            ),
    });

    /* Setting the header for the page */
    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <CustomNavHeader
                    mainHeading={
                        itemData ? itemData.data.item.itemName : i18n.t("item")
                    }
                    subHeading={selectedCompany?.companyName || ""}
                />
            ),
            headerRight: () =>
                /* If edit is not enabled and the update feature is accessible */
                !isEditEnabled &&
                isFeatureAccessible(PLATFORM_FEATURES.ADD_UPTATE_ITEM) ? (
                    <Pressable onPress={toggleEdit}>
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
    }, [navigation, itemData, isEditEnabled]);

    /* Initial form values state */
    const [initialFormValues, setInitialFormValues] = useState<UpdateItemForm>({
        itemName: "",
        isActive: true,
        defaultPurchasePrice: null,
        defaultSellingPrice: null,
        minStockToMaintain: null,
        stock: 0,
        unit: null,
    });

    /* Initial form values for updating */
    useEffect(() => {
        if (itemData && unitsData && itemData.success && unitsData.success) {
            const item = itemData.data.item;
            /* Getting the unit from unitData */
            let unitFound = unitsData.data.units.find(
                (unit) => unit.unitId == item.unitId
            );
            setInitialFormValues({
                itemName: item.itemName,
                defaultSellingPrice: item.defaultSellingPrice
                    ? Number(item.defaultSellingPrice)
                    : null,
                defaultPurchasePrice: item.defaultPurchasePrice
                    ? Number(item.defaultPurchasePrice)
                    : null,
                minStockToMaintain: item.minStockToMaintain
                    ? Number(item.minStockToMaintain)
                    : null,
                stock: item.stock ? Number(item.stock) : null,
                isActive: item.isActive,
                unit: unitFound ? unitFound : null,
            });
        }
    }, [itemData, unitsData]);

    /* Formik */
    const formik = useFormik({
        initialValues: initialFormValues,
        onSubmit: (values) => {
            updateItemMutation.mutate(values);
        },
        validationSchema: UpdateItemFormValidation,
        enableReinitialize: true,
    });

    /* Data for isActive field */
    const isActiveRadioButtonData = useMemo(() => {
        return [
            { textKey: "yes", value: true },
            { textKey: "no", value: false },
        ];
    }, []);

    /* On update success */
    useEffect(() => {
        if (
            updateItemMutation.isSuccess &&
            updateItemMutation.data.success &&
            unitsData
        ) {
            /* Updated item */
            const updatedItem = updateItemMutation.data.data.item;

            /* Getting the unit from unitData */
            let unitFound = unitsData.data.units.find(
                (unit) => unit.unitId == updatedItem.unitId
            );

            /* Resetting the initial values state to reset the form */
            setInitialFormValues({
                itemName: updatedItem.itemName,
                defaultSellingPrice: updatedItem.defaultSellingPrice
                    ? Number(updatedItem.defaultSellingPrice)
                    : null,
                defaultPurchasePrice: updatedItem.defaultPurchasePrice
                    ? Number(updatedItem.defaultPurchasePrice)
                    : null,
                minStockToMaintain: updatedItem.minStockToMaintain
                    ? Number(updatedItem.minStockToMaintain)
                    : null,
                stock: updatedItem.stock ? Number(updatedItem.stock) : null,
                isActive: updatedItem.isActive,
                unit: unitFound ? unitFound : null,
            });

            /* Resetting the form to initial values */
            formik.resetForm();
            
            /* Toggle edit */
            toggleEdit();
        }
    }, [updateItemMutation.isSuccess]);

    /* Show loading spinner when fetching item or units */
    const showLoadingSpinner = useMemo(() => {
        return updateItemMutation.isPending || fetchingItem || fetchingUnits
            ? true
            : false;
    }, [fetchingItem, fetchingUnits, updateItemMutation.isPending]);

    /* Error fetching item or units, show a toast message and go back */
    useEffect(() => {
        let message = "";
        if (errorFetchingItem) {
            message = capitalizeText(
                `${i18n.t("errorFetchingItem")}${i18n.t("comma")}${i18n.t(
                    "contactSupport"
                )}`
            );
        } else if (errorFetchingUnits) {
            message = capitalizeText(
                `${i18n.t("errorFetchingUnits")}${i18n.t("comma")}${i18n.t(
                    "contactSupport"
                )}`
            );
        }
        if (message) {
            ToastAndroid.show(message, ToastAndroid.LONG);
            router.back();
        }
    }, [errorFetchingItem, errorFetchingUnits]);

    /* Update item error */
    const apiErrorMessage = useMemo(() => {
        if (updateItemMutation.error) {
            return getApiErrorMessage(updateItemMutation.error);
        }
        return null;
    }, [updateItemMutation.error]);

    return (
        <ScrollView style={styles.mainContainer}>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}

            <View style={styles.container}>
                <View style={styles.formContainer}>
                    {apiErrorMessage && (
                        <ErrorMessage message={apiErrorMessage} />
                    )}
                    <Input
                        label={i18n.t("itemName")}
                        placeholder={capitalizeText(i18n.t("enterItemName"))}
                        onChangeText={formik.handleChange("itemName")}
                        onBlur={formik.handleBlur("itemName")}
                        value={formik.values.itemName}
                        errorMessage={
                            formik.touched.itemName && formik.errors.itemName
                                ? formik.errors.itemName
                                : null
                        }
                        isDisabled={!isEditEnabled}
                    />

                    <View style={styles.priceContainer}>
                        <Input
                            label={i18n.t("defaultSellingPrice")}
                            value={companyState.country?.currency || ""}
                            isDisabled={true}
                            placeholder=""
                            extraContainerStyles={{
                                flexGrow: 0.1,
                                height: 58,
                            }}
                        />
                        <Input
                            value={
                                formik.values.defaultSellingPrice?.toString() ||
                                ""
                            }
                            onChangeText={formik.handleChange(
                                "defaultSellingPrice"
                            )}
                            onBlur={formik.handleBlur("defaultSellingPrice")}
                            placeholder={capitalizeText(i18n.t("price"))}
                            errorMessage={
                                formik.touched.defaultSellingPrice &&
                                formik.errors.defaultSellingPrice
                                    ? formik.errors.defaultSellingPrice
                                    : null
                            }
                            keyboardType="number-pad"
                            extraContainerStyles={{ flexGrow: 1 }}
                            isDisabled={!isEditEnabled}
                        />
                    </View>
                    <View style={styles.priceContainer}>
                        <Input
                            label={i18n.t("defaultPurchasePrice")}
                            value={companyState.country?.currency || ""}
                            isDisabled={true}
                            placeholder=""
                            extraContainerStyles={{ height: 58 }}
                        />
                        <Input
                            value={
                                formik.values.defaultPurchasePrice?.toString() ||
                                ""
                            }
                            onChangeText={formik.handleChange(
                                "defaultPurchasePrice"
                            )}
                            onBlur={formik.handleBlur("defaultPurchasePrice")}
                            placeholder={capitalizeText(i18n.t("price"))}
                            errorMessage={
                                formik.touched.defaultPurchasePrice &&
                                formik.errors.defaultPurchasePrice
                                    ? formik.errors.defaultPurchasePrice
                                    : null
                            }
                            keyboardType="number-pad"
                            extraContainerStyles={{ flexGrow: 1 }}
                            isDisabled={!isEditEnabled}
                        />
                    </View>

                    <Dropdown
                        label={i18n.t("unit")}
                        textKey="unitName"
                        data={unitsData?.data.units}
                        onChange={(selectedUnit) => {
                            formik.setFieldTouched("unit", true);
                            formik.setFieldValue("unit", selectedUnit);
                        }}
                        value={
                            formik.values.unit ? formik.values.unit : undefined
                        }
                        customActionButtonText={i18n.t("addNewUnit")}
                        customActionButtonHandler={toggleAddUnitModal}
                        extraOptionTextSyles={{
                            textTransform: "none",
                        }}
                        errorMessage={
                            formik.touched.unit && formik.errors.unit
                                ? formik.errors.unit
                                : null
                        }
                        isDisabled={!isEditEnabled}
                    />

                    {isAddUnitModalShown && (
                        <AddUnit
                            visible={isAddUnitModalShown}
                            toggleAddUnitModal={toggleAddUnitModal}
                            onUnitAdded={() => refetchUnits()}
                        />
                    )}
                    <Input
                        label={i18n.t("stock")}
                        value={formik.values.stock?.toString() || ""}
                        onChangeText={formik.handleChange("stock")}
                        onBlur={formik.handleBlur("stock")}
                        placeholder={capitalizeText(i18n.t("enterStock"))}
                        errorMessage={
                            formik.touched.stock && formik.errors.stock
                                ? formik.errors.stock
                                : null
                        }
                        keyboardType="number-pad"
                        extraContainerStyles={{ flexGrow: 1 }}
                        isDisabled={!isEditEnabled}
                    />

                    <Input
                        label={i18n.t("minStockToMaintain")}
                        value={
                            formik.values.minStockToMaintain?.toString() || ""
                        }
                        onChangeText={formik.handleChange("minStockToMaintain")}
                        onBlur={formik.handleBlur("minStockToMaintain")}
                        placeholder={capitalizeText(i18n.t("enterMinStock"))}
                        errorMessage={
                            formik.touched.minStockToMaintain &&
                            formik.errors.minStockToMaintain
                                ? formik.errors.minStockToMaintain
                                : null
                        }
                        keyboardType="number-pad"
                        extraContainerStyles={{ flexGrow: 1 }}
                        isDisabled={!isEditEnabled}
                    />

                    <RadioButton
                        label={i18n.t("isActive")}
                        data={isActiveRadioButtonData}
                        textKey="textKey"
                        onChange={(item) => {
                            formik.setFieldTouched("isActive", true);
                            formik.setFieldValue("isActive", item.value);
                        }}
                        errorMessage={
                            formik.touched.isActive && formik.errors.isActive
                                ? formik.errors.isActive
                                : null
                        }
                        value={
                            formik.values.isActive
                                ? isActiveRadioButtonData[0]
                                : isActiveRadioButtonData[1]
                        }
                        isDisabled={!isEditEnabled}
                    />
                    {isEditEnabled && (
                        <View style={commonStyles.modalEndActionsContainer}>
                            <CustomButton
                                text={i18n.t("cancel")}
                                onPress={() => {
                                    formik.resetForm();
                                    toggleEdit();
                                }}
                                extraContainerStyles={{ flex: 1 }}
                                isSecondaryButton
                            />
                            <CustomButton
                                text={i18n.t("updateItem")}
                                onPress={formik.handleSubmit}
                                isDisabled={
                                    JSON.stringify(formik.values) ==
                                    JSON.stringify(initialFormValues)
                                }
                                extraContainerStyles={{
                                    flex: 1,
                                }}
                            />
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

export default GetItem;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    container: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    formContainer: {
        rowGap: 16,
    },
    priceContainer: {
        flexDirection: "row",
        columnGap: 6,
    },
});
