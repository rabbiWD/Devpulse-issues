import type { Request, Response } from "express";
import { issueService } from "../services/issue.service";
// import { issueService } from "./issue.service";

// const getCurrentUserId = (user: Request["user"] | undefined) => {
//   if (!user?.id) {
//     return null;
//   }

//   const currentUserId = Number(user.id);

//   return Number.isFinite(currentUserId) ? currentUserId : null;
// };

// const isOwnerOrMaintainer = (
//   userRole: string,
//   reporterId: number | undefined,
//   currentUserId: number | null,
// ) => {
//   if (userRole === "maintainer") {
//     return true;
//   }

//   return currentUserId !== null && Number(reporterId) === currentUserId;
// };

export const createIssue = async (req: Request, res: Response) => {
  //   const currentUserId = getCurrentUserId(req.user);

  //   if (!currentUserId) {
  //     return res.status(401).json({
  //       success: false,
  //       message: "Unauthorized",
  //     });
  //   }

  try {
    const issue = await issueService.createIssue(req.body, req.user);

    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllIssues = async (req: Request, res: Response) => {
  try {
    const { sort, type, status } = req.query;
    const issues = await issueService.getIssues({
      sort: sort === "oldest" ? "oldest" : "newest",
      ...(typeof type === "string" && { type }),
      ...(typeof status === "string" && { status }),
    });

    res.status(200).json({
      success: true,
      message: "Issues retrived successfully",
      data: issues,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
};


