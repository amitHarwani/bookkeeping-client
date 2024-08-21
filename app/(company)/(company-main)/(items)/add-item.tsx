import { i18n } from "@/app/_layout";
import Input from "@/components/custom/basic/Input";
import RadioButton from "@/components/custom/basic/RadioButton";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { AddItemForm } from "@/constants/types";
import { useAppSelector } from "@/store";
import { capitalizeText, getApiErrorMessage } from "@/utils/common_utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Formik } from "formik";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, ToastAndroid, View } from "react-native";
import InventoryService from "@/services/inventory/inventory_service";
import Dropdown from "@/components/custom/basic/Dropdown";
import AddUnit from "@/components/custom/business/AddUnit";
import { router } from "expo-router";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import { AddItemFormValidation } from "@/utils/schema_validations";
import ErrorMessage from "@/components/custom/basic/ErrorMessage";
import CustomButton from "@/components/custom/basic/CustomButton";

const AddItem = () => {
    /* Company State & Selected company from redux */
    const companyState = useAppSelector((state) => state.company);
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    /* Add unit modal's visibility */
    const [isAddUnitModalShown, setIsAddUnitModalShown] = useState(false);

    /* Toggle add unit modal function */
    const toggleAddUnitModal = useCallback(() => {
        setIsAddUnitModalShown((prev) => !prev);
    }, [isAddUnitModalShown]);

    /* Initial values */
    const initialFormValues: AddItemForm = useMemo(() => {
        return {
            itemName: "",
            isActive: true,
            defaultPurchasePrice: null,
            defaultSellingPrice: null,
            minStockToMaintain: null,
            stock: null,
            unit: null,
        };
    }, []);

    /* Data for isActive field */
    const isActiveRadioButtonData = useMemo(() => {
        return [
            { textKey: "yes", value: true },
            { textKey: "no", value: false },
        ];
    }, []);

    /* To fetch all the units of the company */
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

    /* Add Item Mutation */
    const addItemMutation = useMutation({
        mutationFn: (itemForm: AddItemForm) =>
            InventoryService.addItem(
                itemForm,
                selectedCompany?.companyId as number
            ),
    });

    /* Loading spinner visibility */
    const showLoadingSpinner = useMemo(() => {
        return fetchingUnits || addItemMutation.isPending ? true : false;
    }, [fetchingUnits, addItemMutation.isPending]);

    /* Error fetching units: Show a toast message, and go back */
    useEffect(() => {
        if (errorFetchingUnits) {
            ToastAndroid.show(
                capitalizeText(
                    `${i18n.t("errorFetchingUnits")}${i18n.t("comma")}${i18n.t(
                        "contactSupport"
                    )}`
                ),
                ToastAndroid.LONG
            );
            router.back();
        }
    }, [errorFetchingUnits]);

    /* Api Error Message */
    const apiErrorMessage = useMemo(() => {
        if (addItemMutation.error) {
            return getApiErrorMessage(addItemMutation.error);
        }
        return null;
    }, [addItemMutation.error]);

    /* On Add Item Success: Show a toast message and go back */
    useEffect(() => {
        if(addItemMutation.isSuccess && addItemMutation.data.success){
            ToastAndroid.show(`${i18n.t("itemAddedSuccessfully")}`, ToastAndroid.LONG);
            router.back();
        }
    }, [addItemMutation.isSuccess])

    return (
        <ScrollView style={styles.mainContainer}>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}
            <View style={styles.container}>
                <Formik
                    initialValues={initialFormValues}
                    validationSchema={AddItemFormValidation}
                    onSubmit={(values) => addItemMutation.mutate(values)}
                >
                    {({
                        handleChange,
                        handleBlur,
                        values,
                        touched,
                        handleSubmit,
                        setFieldTouched,
                        setFieldValue,
                        errors,
                    }) => (
                        <View style={styles.formContainer}>
                            {apiErrorMessage && (
                                <ErrorMessage message={apiErrorMessage} />
                            )}
                            <Input
                                label={i18n.t("itemName")}
                                placeholder={capitalizeText(
                                    i18n.t("enterItemName")
                                )}
                                onChangeText={handleChange("itemName")}
                                onBlur={handleBlur("itemName")}
                                value={values.itemName}
                                errorMessage={
                                    touched.itemName && errors.itemName
                                        ? errors.itemName
                                        : null
                                }
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
                                        values.defaultSellingPrice?.toString() ||
                                        ""
                                    }
                                    onChangeText={handleChange(
                                        "defaultSellingPrice"
                                    )}
                                    onBlur={handleBlur("defaultSellingPrice")}
                                    placeholder={capitalizeText(
                                        i18n.t("price")
                                    )}
                                    errorMessage={
                                        touched.defaultSellingPrice &&
                                        errors.defaultSellingPrice
                                            ? errors.defaultSellingPrice
                                            : null
                                    }
                                    keyboardType="number-pad"
                                    extraContainerStyles={{ flexGrow: 1 }}
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
                                        values.defaultPurchasePrice?.toString() ||
                                        ""
                                    }
                                    onChangeText={handleChange(
                                        "defaultPurchasePrice"
                                    )}
                                    onBlur={handleBlur("defaultPurchasePrice")}
                                    placeholder={capitalizeText(
                                        i18n.t("price")
                                    )}
                                    errorMessage={
                                        touched.defaultPurchasePrice &&
                                        errors.defaultPurchasePrice
                                            ? errors.defaultPurchasePrice
                                            : null
                                    }
                                    keyboardType="number-pad"
                                    extraContainerStyles={{ flexGrow: 1 }}
                                />
                            </View>

                            <Dropdown
                                label={i18n.t("unit")}
                                textKey="unitName"
                                data={unitsData?.data.units}
                                onChange={(selectedUnit) => {
                                    setFieldTouched("unit", true);
                                    setFieldValue("unit", selectedUnit);
                                }}
                                value={values.unit ? values.unit : undefined}
                                customActionButtonText={i18n.t("addNewUnit")}
                                customActionButtonHandler={toggleAddUnitModal}
                                extraOptionTextSyles={{ textTransform: "none" }}
                                errorMessage={
                                    touched.unit && errors.unit
                                        ? errors.unit
                                        : null
                                }
                            />

                            {isAddUnitModalShown && (
                                <AddUnit
                                    visible={isAddUnitModalShown}
                                    toggleAddUnitModal={toggleAddUnitModal}
                                    onUnitAdded={() => refetchUnits()}
                                />
                            )}
                            <Input
                                label={i18n.t("startingStock")}
                                value={values.stock?.toString() || ""}
                                onChangeText={handleChange("stock")}
                                onBlur={handleBlur("stock")}
                                placeholder={capitalizeText(
                                    i18n.t("enterStartingStock")
                                )}
                                errorMessage={
                                    touched.stock && errors.stock
                                        ? errors.stock
                                        : null
                                }
                                keyboardType="number-pad"
                                extraContainerStyles={{ flexGrow: 1 }}
                            />

                            <Input
                                label={i18n.t("minStockToMaintain")}
                                value={
                                    values.minStockToMaintain?.toString() || ""
                                }
                                onChangeText={handleChange(
                                    "minStockToMaintain"
                                )}
                                onBlur={handleBlur("minStockToMaintain")}
                                placeholder={capitalizeText(
                                    i18n.t("enterMinStock")
                                )}
                                errorMessage={
                                    touched.minStockToMaintain &&
                                    errors.minStockToMaintain
                                        ? errors.minStockToMaintain
                                        : null
                                }
                                keyboardType="number-pad"
                                extraContainerStyles={{ flexGrow: 1 }}
                            />

                            <RadioButton
                                label={i18n.t("isActive")}
                                data={isActiveRadioButtonData}
                                textKey="textKey"
                                onChange={(item) => {
                                    setFieldTouched("isActive", true);
                                    setFieldValue("isActive", item.value);
                                }}
                                errorMessage={
                                    touched.isActive && errors.isActive
                                        ? errors.isActive
                                        : null
                                }
                                value={
                                    values.isActive
                                        ? isActiveRadioButtonData[0]
                                        : isActiveRadioButtonData[1]
                                }
                            />

                            <CustomButton
                                text={i18n.t("addItem")}
                                onPress={handleSubmit}
                                isDisabled={showLoadingSpinner}
                                extraContainerStyles={{ marginTop: 8 }}
                            />
                        </View>
                    )}
                </Formik>
            </View>
        </ScrollView>
    );
};

export default AddItem;

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
