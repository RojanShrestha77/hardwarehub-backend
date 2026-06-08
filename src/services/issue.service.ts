import { issueRepository } from "../repositories/issue.repository";
import { HttpError } from "../errors/HttpError";
import { NotificationService } from "./notification.service";
import { products } from "../models/product.model";
import { eq } from "drizzle-orm";
import { db } from "../database";

const notificationSvc = new NotificationService();

export const issueService = {

  async reportIssue(userId: string, data: {
    productId: string; orderId?: string; title: string; description: string;
  }) {
    const issue = await issueRepository.createIssue({ ...data, userId });
    if (!issue) throw new HttpError(500, "Failed to create issue");

    const [product] = await db.select().from(products).where(eq(products.id, data.productId));
    if (product) {
      await notificationSvc.createNotification(
        product.sellerId,
        "New product issue reported",
        `A buyer reported an issue: "${issue.title}"`,
        "issue",
        issue.id,
      );
    }

    return issue;
  },

  async getProductIssues(productId: string) {
    return issueRepository.getIssuesByProductId(productId);
  },

  async getIssueWithSolutions(issueId: string) {
    const issue = await issueRepository.getIssueById(issueId);
    if (!issue) throw new HttpError(404, "Issue not found");
    const solutions = await issueRepository.getSolutionsByIssueId(issueId);
    return { ...issue, solutions };
  },

  async postSolution(issueId: string, userId: string, content: string) {
    const issue = await issueRepository.getIssueById(issueId);
    if (!issue) throw new HttpError(404, "Issue not found");
    if (issue.status === "closed") throw new HttpError(400, "This issue is already closed");

    const solution = await issueRepository.createSolution({ issueId, userId, content });
    if (!solution) throw new HttpError(500, "Failed to post solution");

    if (issue.userId !== userId) {
      await notificationSvc.createNotification(
        issue.userId,
        "Someone replied to your issue",
        `A new solution was posted for: "${issue.title}"`,
        "solution",
        issueId,
      );
    }

    return solution;
  },

  async toggleVote(solutionId: string, userId: string) {
    const solution = await issueRepository.getSolutionById(solutionId);
    if (!solution) throw new HttpError(404, "Solution not found");

    const existing = await issueRepository.getVote(solutionId, userId);
    if (existing) {
      return { solution: await issueRepository.removeVote(solutionId, userId), voted: false };
    }
    return { solution: await issueRepository.addVote(solutionId, userId), voted: true };
  },

  async pinSolution(solutionId: string, requesterId: string, requesterRole: string) {
    const solution = await issueRepository.getSolutionById(solutionId);
    if (!solution) throw new HttpError(404, "Solution not found");

    const issue = await issueRepository.getIssueById(solution.issueId);
    if (!issue) throw new HttpError(404, "Issue not found");

    const [product] = await db.select().from(products).where(eq(products.id, issue.productId));
    const isSeller = product?.sellerId === requesterId;
    const isAdmin  = requesterRole === "admin";
    if (!isSeller && !isAdmin) throw new HttpError(403, "Only the seller or admin can pin solutions");

    return issueRepository.pinSolution(solutionId, !solution.isPinned);
  },

  async acceptSolution(solutionId: string, userId: string) {
    const solution = await issueRepository.getSolutionById(solutionId);
    if (!solution) throw new HttpError(404, "Solution not found");

    const issue = await issueRepository.getIssueById(solution.issueId);
    if (!issue) throw new HttpError(404, "Issue not found");

    if (issue.userId !== userId) throw new HttpError(403, "Only the issue author can accept a solution");

    const updated = await issueRepository.acceptSolution(solutionId);
    await issueRepository.updateIssueStatus(issue.id, "solved");
    return updated;
  },

  async getFixesBeforeReturn(productId: string) {
    return issueRepository.getPinnedSolutionsForProduct(productId);
  },
};
