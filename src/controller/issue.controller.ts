import type { Context } from "elysia";
import { issueService } from "../services/issue.service";
import { CreateIssueDto, CreateSolutionDto } from "../dtos/issue.dto";

export const issueController = {

  async reportIssue({ body, user, set }: any) {
    const parsed = CreateIssueDto.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return { success: false, message: parsed.error?.issues?.[0]?.message ?? "Invalid input" };
    }
    const issue = await issueService.reportIssue(user.id, parsed.data);
    set.status = 201;
    return { success: true, message: "Issue reported", data: issue };
  },

  async getProductIssues({ params, set }: any) {
    const issues = await issueService.getProductIssues(params.productId);
    return { success: true, message: "Issues fetched", data: issues };
  },

  async getIssue({ params, set }: any) {
    const issue = await issueService.getIssueWithSolutions(params.id);
    return { success: true, message: "Issue fetched", data: issue };
  },

  async postSolution({ params, body, user, set }: any) {
    const parsed = CreateSolutionDto.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return { success: false, message: parsed.error?.issues?.[0]?.message ?? "Invalid input" };
    }
    const solution = await issueService.postSolution(params.id, user.id, parsed.data.content);
    set.status = 201;
    return { success: true, message: "Solution posted", data: solution };
  },

  async toggleVote({ params, user, set }: any) {
    const result = await issueService.toggleVote(params.solutionId, user.id);
    return { success: true, message: result.voted ? "Upvoted" : "Vote removed", data: result.solution };
  },

  async pinSolution({ params, user, set }: any) {
    const result = await issueService.pinSolution(params.solutionId, user.id, user.role);
    return { success: true, message: result?.isPinned ? "Solution pinned" : "Solution unpinned", data: result };
  },

  async acceptSolution({ params, user, set }: any) {
    const result = await issueService.acceptSolution(params.solutionId, user.id);
    return { success: true, message: "Solution accepted — issue marked as solved", data: result };
  },

  async getFixesBeforeReturn({ params }: any) {
    const fixes = await issueService.getFixesBeforeReturn(params.productId);
    return { success: true, message: "Common fixes fetched", data: fixes };
  },
};
