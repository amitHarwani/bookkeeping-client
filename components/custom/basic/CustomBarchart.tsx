import { GenericObject } from "@/constants/types";
import React, { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
    VictoryAxis,
    VictoryBar,
    VictoryChart,
    VictoryContainer,
    VictoryLabel,
    VictoryTheme,
} from "victory-native";

interface CustomBarchartProps {
    data: Array<GenericObject>;
    xAxisKey: string;
    yAxisKey: string;
    styles?: {
        barFillColor?: string;
    };
}

const CustomBarchart = ({
    data,
    xAxisKey,
    yAxisKey,
    styles,
}: CustomBarchartProps) => {
    const formatTickLabels = useCallback(() => {
        const labels = data.map((item) => {
            let label = item[xAxisKey] as string;

            if (label.length > 6) {
                label = label.substring(0, 5) + "...";
            }
            return label;
        });
        return labels.reverse();
    }, [data]);
    return (
        <View>
            <VictoryChart
                theme={VictoryTheme.material}
                domainPadding={50}
                horizontal
            >
                <VictoryAxis
                    style={{
                        grid: { stroke: "grey" },
                    }}
                    dependentAxis
                />
                <VictoryAxis
                    tickFormat={formatTickLabels()}
                    tickValues={data.map((_, index) => index)}
                />
                <VictoryBar
                    style={{
                        data: {
                            fill: styles?.barFillColor || "#006FFD",
                            borderRadius: 20,
                        },
                    }}
                    animate={{
                        duration: 1000,
                    }}
                    cornerRadius={6}
                    data={data}
                    x={xAxisKey}
                    y={yAxisKey}
                />
            </VictoryChart>
        </View>
    );
};

export default CustomBarchart;

const styles = StyleSheet.create({});
