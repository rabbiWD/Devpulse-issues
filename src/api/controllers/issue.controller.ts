import type { Request, Response } from "express";
import { issueService } from "../services/issue.service";

export const createIssue = async (req: Request, res: Response) => {
  try {

      if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

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

export const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const issue = await issueService.getIssueById(Number(req.params.id));

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Issue retrived successfully",
      data: issue,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateIssue = async (req: Request, res: Response) => {
  try {
      if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const issue = await issueService.updateIssue(
      Number(req.params.id),
      req.body,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: issue,
    });
  } catch (error: any) {
    if (error.message === "Issue not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message === "Forbidden" ||
      error.message === "You can only update open issues"
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const deleteIssue = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await issueService.deleteIssue(Number(req.params.id), req.user);

    return res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error: any) {
    if (error.message === "Forbidden") {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Issue not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
