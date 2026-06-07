import { db } from '../database';
import { productIssues, issueSolutions, solutionVotes } from '../models/issue.models';
import { users } from '../models/user.model';
import { eq, desc, sql } from 'drizzle-orm';

export const issueRepository = {
    // --Issues -----------

    async createIssue(data: {
        productId: string; orderId?: string;
        userId: string; title: string; description: string;
    }) {
        const [issue] = await db.insert(productIssues).values(data).returning();
        return issue;
    },

    async getIssuesByProductId(productId: string) {
        return db.select(
            {
                id: productIssues.id,
                title: productIssues.title,
                description: productIssues.description,
                status: productIssues.status,
                createdAt: productIssues.createdAt,
                users: {
                    id: users.id,
                    name: users.name,
                },
                solutionCount: sql<number>`
          (SELECT COUNT(*) FROM issue_solutions WHERE issue_id = ${productIssues.id})
        `.as("solutionCount"),
            }
        )
        .from(productIssues)
        .innerJoin(users, eq(productIssues.userId, users.id))
        .where(eq(productIssues.productId, productId))
        .orderBy(desc(productIssues.createdAt));
    },

     async getIssueById(id: string) {
    const [issue] = await db
      .select({
        id:          productIssues.id,
        productId:   productIssues.productId,
        orderId:     productIssues.orderId,
        title:       productIssues.title,
        description: productIssues.description,
        status:      productIssues.status,
        createdAt:   productIssues.createdAt,
        userId:      productIssues.userId,
        user: {
          id:   users.id,
          name: users.name,
        },
      })
      .from(productIssues)
      .innerJoin(users, eq(users.id, productIssues.userId))
      .where(eq(productIssues.id, id));
    return issue;
  },

  async updateIssueStatus(id: string, status: string) {
    const [issue] = await db
        .update(productIssues)
        .set({ status, updatedAt: new Date() })
        .where(eq(productIssues.id, id))
        .returning();
    return issue;
  },


    // --Solutions -----------

    async createSolution(data: { issueId: string; userId: string; content: string  }) {
        const [solution] = await db.insert(issueSolutions).values(data).returning();
        return solution;
    },

      async getSolutionsByIssueId(issueId: string) {
    return db
      .select({
        id:         issueSolutions.id,
        content:    issueSolutions.content,
        isPinned:   issueSolutions.isPinned,
        isAccepted: issueSolutions.isAccepted,
        voteCount:  issueSolutions.voteCount,
        createdAt:  issueSolutions.createdAt,
        userId:     issueSolutions.userId,
        user: {
          id:   users.id,
          name: users.name,
        },
      })
      .from(issueSolutions)
      .innerJoin(users, eq(users.id, issueSolutions.userId))
      .where(eq(issueSolutions.issueId, issueId))
      // pinned first, then accepted, then by votes
      .orderBy(
        desc(issueSolutions.isPinned),
        desc(issueSolutions.isAccepted),
        desc(issueSolutions.voteCount),
      );
  },

  async getSolutionById(id: string) {
    const [s] = await db.select().from(issueSolutions).where(eq(issueSolutions.id, id));
    return s;
  },

   async pinSolution(id: string, isPinned: boolean) {
    const [s] = await db
      .update(issueSolutions).set({ isPinned })
      .where(eq(issueSolutions.id, id)).returning();
    return s;
  },

   async acceptSolution(id: string) {
    const [s] = await db
      .update(issueSolutions).set({ isAccepted: true })
      .where(eq(issueSolutions.id, id)).returning();
    return s;
  },

//   ------ votes ----------
async getVote(solutionId: string, userId: string) {
    const [ v] = await db
        .select().from(solutionVotes)
        .where(eq(solutionVotes.solutionId, solutionId));
    return v;
 }, 
 
 async addVote(solutionId: string, userId: string ) {
    await db.insert(solutionVotes).values({ solutionId, userId });
    const [s] = await db
        .update(issueSolutions)
        .set({ voteCount: sql`${issueSolutions.voteCount} + 1` })
      .where(eq(issueSolutions.id, solutionId))
      .returning();
    return s;
 },

 async removeVote(solutionId: string, userId: string) {
    await db.delete(solutionVotes)
      .where(eq(solutionVotes.solutionId, solutionId));
    const [s] = await db
      .update(issueSolutions)
      .set({ voteCount: sql`GREATEST(${issueSolutions.voteCount} - 1, 0)` })
      .where(eq(issueSolutions.id, solutionId))
      .returning();
    return s;
  },

  // Returns all pinned solutions for a product (used in Fix Before Return)
  async getPinnedSolutionsForProduct(productId: string) {
    return db
      .select({
        id:       issueSolutions.id,
        content:  issueSolutions.content,
        issueTitle: productIssues.title,
      })
      .from(issueSolutions)
      .innerJoin(productIssues, eq(productIssues.id, issueSolutions.issueId))
      .where(
        sql`${productIssues.productId} = ${productId} AND ${issueSolutions.isPinned} = true`
      )
      .orderBy(desc(issueSolutions.voteCount))
      .limit(5);
  },
};
