import Elysia from "elysia";
import { authMiddleware } from "../middlewares/auth.middleware";
import { issueController } from "../controller/issue.controller";

export const issueRoutes = new Elysia({ prefix: "/api/issues" })
  // Public
  .get("/product/:productId",              issueController.getProductIssues)
  .get("/:id",                             issueController.getIssue)
  .get("/fixes/:productId",               issueController.getFixesBeforeReturn)

  // Auth required
  .use(authMiddleware)
  .post("/",                               issueController.reportIssue)
  .post("/:id/solutions",                  issueController.postSolution)
  .post("/solutions/:solutionId/vote",     issueController.toggleVote)
  .patch("/solutions/:solutionId/pin",     issueController.pinSolution)
  .patch("/solutions/:solutionId/accept",  issueController.acceptSolution);
