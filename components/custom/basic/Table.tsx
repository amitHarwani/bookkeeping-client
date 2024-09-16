import {
    Dimensions,
    FlatList,
    LayoutChangeEvent,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { GenericObject, TableColDefType } from "@/constants/types";
import { commonStyles } from "@/utils/common_styles";

interface TableProps {
    data: Array<GenericObject>;
    colDef: Array<TableColDefType>;
    idKey: string;
    isAtEndOfScreen?: boolean;
}
const Table = ({
    data,
    colDef,
    idKey,
    isAtEndOfScreen = false,
}: TableProps) => {
    /* Table Data */
    const [tableData, setTableData] = useState<Array<GenericObject>>([]);

    /* Width of each row */
    const [widths, setWidths] = useState<Array<number>>([]);

    /* Setting table data on change of data prop */
    useEffect(() => {
        setTableData(data);
    }, [data]);

    /* Window width */
    const { width } = Dimensions.get("window");

    /* Setting the row widths for each column */
    const getRowWidth = (event: LayoutChangeEvent, index: number) => {
        event.persist();
        setWidths((prev) => {
            prev[index] = Math.max(
                widths?.[index] || 0,
                event?.nativeEvent?.layout?.width
            );
            return [...prev];
        });
    };

    return (
        <ScrollView horizontal>
            <FlatList
                data={tableData}
                keyExtractor={(item) => item?.[idKey]}
                ListHeaderComponent={
                    <View
                        style={{
                            flexDirection: "row",
                        }}
                    >
                        {colDef.map((headerCell, index) => (
                            <View
                                key={`header: ${headerCell.text}`}
                                style={{
                                    flex: 1,
                                    width: widths?.[index] || 100,
                                    paddingHorizontal: 12,
                                    paddingVertical: 16,
                                    backgroundColor: "#F8F9FE",
                                    borderTopLeftRadius: index == 0 ? 12 : 0,
                                    borderBottomLeftRadius: index == 0 ? 12 : 0,
                                    borderTopRightRadius:
                                        index == colDef.length - 1 ? 12 : 0,
                                    borderBottomRightRadius:
                                        index == colDef.length - 1 ? 12 : 0,
                                }}
                            >
                                <Text
                                    style={[
                                        commonStyles.textSmallBold,
                                        commonStyles.capitalize,
                                    ]}
                                >
                                    {headerCell.text}
                                </Text>
                            </View>
                        ))}
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={{ flexDirection: "row" }}>
                        {colDef.map((col, index) => (
                            <View
                                key={`row: ${col.text}, ${item[idKey]}`}
                                style={{
                                    flex: 1,
                                    width: widths?.[index] || 100,
                                    paddingHorizontal: 6,
                                    paddingVertical: 8,
                                }}
                                onLayout={(event) => getRowWidth(event, index)}
                            >
                                <Text {...col?.extraCellProps}>
                                    {item[col.id].toString()}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
                contentContainerStyle={{
                    minWidth: width - 32,
                    paddingBottom: isAtEndOfScreen ? 30 : 0,
                }}
            />
        </ScrollView>
    );
};

export default Table;

const styles = StyleSheet.create({});
