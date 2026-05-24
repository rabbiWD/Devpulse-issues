export declare const USER_ROLE: {
    readonly maintainer: "maintainer";
    readonly contributor: "contributor";
};
export type ROLES = "maintainer" | "contributor";
export interface IUser {
    id?: string | number;
    name: string;
    email: string;
    password: string;
    role?: string;
}
export interface IJwtPayload {
    id: string | number;
    name: string;
    role: string;
}
export interface IIssueFilters {
    sort?: "newest" | "oldest";
    type?: string;
    status?: string;
}
//# sourceMappingURL=index.d.ts.map