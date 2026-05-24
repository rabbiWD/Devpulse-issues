import type { Request, Response } from "express";
export declare const createIssue: (req: Request, res: Response) => Promise<void>;
export declare const getAllIssues: (req: Request, res: Response) => Promise<void>;
export declare const getSingleIssue: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateIssue: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteIssue: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=issue.controller.d.ts.map