import type { IIssueFilters, IJwtPayload } from "../../types";
export declare const issueService: {
    createIssue(payload: {
        title: string;
        description: string;
        type: string;
    }, user: IJwtPayload): Promise<any>;
    getIssues(filters?: IIssueFilters): Promise<{
        id: any;
        title: any;
        description: any;
        type: any;
        status: any;
        created_at: any;
        updated_at: any;
        reporter: {
            id: any;
            name: any;
            role: any;
        } | null;
    }[]>;
    getIssueById(id: number): Promise<{
        id: any;
        title: any;
        description: any;
        type: any;
        status: any;
        created_at: any;
        updated_at: any;
        reporter: {
            id: any;
            name: any;
            role: any;
        } | null;
    } | null>;
    updateIssue(id: number, payload: {
        title?: string;
        description?: string;
        type?: string;
        status?: string;
    }, user: IJwtPayload): Promise<any>;
    deleteIssue(id: number, user: IJwtPayload): Promise<boolean>;
};
//# sourceMappingURL=issue.service.d.ts.map