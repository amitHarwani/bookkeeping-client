import { GenericObject } from "@/constants/types";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { VictoryBar, VictoryChart, VictoryTheme } from "victory-native";

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
    return (
        <View>
            <VictoryChart
                theme={VictoryTheme.material}
                domainPadding={50}
                horizontal
            >
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
