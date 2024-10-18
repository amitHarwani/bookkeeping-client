import { i18n } from "@/app/_layout";
import { commonStyles } from "@/utils/common_styles";
import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import CustomButton from "../basic/CustomButton";
import CustomModal from "../basic/CustomModal";
import LoadingSpinnerOverlay from "../basic/LoadingSpinnerOverlay";
import * as FileSystem from "expo-file-system";

interface PrintPaperProps {
    html: string;
    togglePrintModal(): void;
    isShareMode?: boolean;
    fileName?: string
}
const PrintPaper = ({ html, togglePrintModal, isShareMode, fileName = "" }: PrintPaperProps) => {
    const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);

    const [selectedPrinter, setSelectedPrinter] = useState<
        Print.Printer | undefined
    >();

    const print = async () => {
        setShowLoadingSpinner(true);
        // On iOS/android prints the given html. On web prints the HTML from the current page.
        await Print.printAsync({
            html,
            printerUrl: selectedPrinter?.url, // iOS only
        });
        setShowLoadingSpinner(false);
        togglePrintModal();
    };

    const printToFile = async () => {
        setShowLoadingSpinner(true);
        // On iOS/android prints the given html. On web prints the HTML from the current page.
        const { uri } = await Print.printToFileAsync({ html });

        let updatedUri = uri;
        /* if file name is provided, Update file name and move the file to the new location */
        if(fileName){
            const index = uri.indexOf("Print/");
            updatedUri = `${uri.substring(0, index)}/${fileName}`;
            await FileSystem.moveAsync({
                from: uri,
                to: updatedUri
            })
        }
        await shareAsync(updatedUri, { UTI: ".pdf", mimeType: "application/pdf" });
        setShowLoadingSpinner(false);
        togglePrintModal();
    };

    const selectPrinter = async () => {
        const printer = await Print.selectPrinterAsync(); // iOS only
        setSelectedPrinter(printer);
    };

    useEffect(() => {
        if (!html) {
            togglePrintModal();
        }

        if (Platform.OS == "android" && !isShareMode) {
            print();
        }
        if(isShareMode){
            printToFile();
        }
    }, [html]);

    return (
        <>
            <CustomModal
                visible={true}
                onRequestClose={togglePrintModal}
                extraModalStyles={{ justifyContent: "flex-end" }}
                children={
                    <>
                        {showLoadingSpinner && <LoadingSpinnerOverlay />}
                        {Platform.OS == "ios" && !isShareMode && (
                            <View style={commonStyles.modalEndMenuContainer}>
                                <Text style={commonStyles.modalEndMenuHeading}>
                                    {i18n.t("selectPrinter")}
                                </Text>
                                {selectedPrinter && (
                                    <Text>
                                        {`${i18n.t("selectedPrinter")} ${
                                            selectedPrinter.name
                                        }`}
                                    </Text>
                                )}
                                <View
                                    style={
                                        commonStyles.modalEndActionsContainer
                                    }
                                >
                                    <CustomButton
                                        text={i18n.t("cancel")}
                                        onPress={togglePrintModal}
                                        extraContainerStyles={{ flex: 1 }}
                                        isSecondaryButton
                                    />
                                    <CustomButton
                                        text={
                                            selectedPrinter
                                                ? i18n.t("print")
                                                : i18n.t("select")
                                        }
                                        onPress={
                                            selectedPrinter
                                                ? print
                                                : selectPrinter
                                        }
                                        extraContainerStyles={{ flex: 1 }}
                                    />
                                </View>
                            </View>
                        )}
                    </>
                }
            />
        </>
    );
};

export default PrintPaper;

const styles = StyleSheet.create({});
