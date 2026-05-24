import type { IUser } from "../../types";
declare class AuthService {
    createUser(user: IUser): Promise<import("pg").QueryResult<any>>;
    validUser(email: string, password: string): Promise<any>;
}
declare const _default: AuthService;
export default _default;
//# sourceMappingURL=auth.service.d.ts.map