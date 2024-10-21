export interface Report {
    companyId: number;
    createdAt: string;
    fromDateTime: string;
    toDateTime: string;
    reportId: number;
    reportName: string;
    status: string;
    reportLink: string | null;
    requestedBy: string | null;
}

export class GetAllReportsResponse {
    constructor(
        public reports: Array<Report>,
        public hasNextPage: boolean,
        public nextPageCursor?: {
            createdAt: Date;
            reportId: number;
        }
    ) {}
}

export class GenerateReportResponse {
    constructor(public message: string) {}
}

export class GetReportResponse {
    constructor(public report: Report) {}
}
