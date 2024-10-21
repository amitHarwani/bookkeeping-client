import axios from "axios";
import { ApiResponse } from "../api_response";
import { asyncHandler } from "../async_handler";
import {
    GenerateReportResponse,
    GetAllReportsResponse,
    GetReportResponse,
} from "./report_types";

export const REPORT_END_POINTS: { [reportType: string]: string } = {
    DAY_END_SUMMARY_REPORT: "report/get-day-end-summary",
};

export enum REPORT_STATUS_TYPES {
    inProgress = "IN_PROGRESS",
    error = "ERROR",
    completed = "COMPLETED",
}

class ReportService {
    hostPath = process.env.EXPO_PUBLIC_REPORT_SERVICE;
    getAllReportsPath = "report/get-all-reports";
    getReportPath = "report/get-report";

    getAllReports = async ({
        pageParam,
    }: {
        pageParam: {
            pageSize: number;
            companyId: number;
            cursor?: {
                createdAt: string;
                reportId: number;
            };
        };
    }) => {
        return await asyncHandler<GetAllReportsResponse>(() => {
            return axios.post<ApiResponse<GetAllReportsResponse>>(
                `${this.hostPath}/${this.getAllReportsPath}`,
                {
                    companyId: pageParam.companyId,
                    pageSize: pageParam.pageSize,
                    cursor: pageParam?.cursor,
                }
            );
        });
    };

    getReport = async (companyId: number, reportId: number) => {
        return await asyncHandler<GetReportResponse>(() => {
            return axios.get<ApiResponse<GetReportResponse>>(
                `${this.hostPath}/${this.getReportPath}`,
                {
                    params: {
                        companyId,
                        reportId,
                    },
                }
            );
        });
    };
    generateReport = async (
        reportEndPoint: string,
        companyId: number,
        fromDateTime: string,
        dayStartTime: string,
        timezone: string,
        decimalRoundTo: number,
        toDateTime?: string
    ) => {
        return await asyncHandler<GenerateReportResponse>(() => {
            return axios.post<ApiResponse<GenerateReportResponse>>(
                `${this.hostPath}/${reportEndPoint}`,
                {
                    companyId,
                    fromDateTime,
                    dayStartTime,
                    timezone,
                    decimalRoundTo,
                    toDateTime: toDateTime ? toDateTime : null,
                }
            );
        });
    };
}

export default new ReportService();
