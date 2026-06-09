import { sellerApplicationService } from "../services/sellerApplication.service";
import { CreateSellerApplicationDto, RejectApplicationDto } from "../dtos/sellerApplication.dto";
import { HttpError } from "../errors/HttpError";

export const sellerApplicationController = {

  async apply({ body, user, set }: any) {
    const parsed = CreateSellerApplicationDto.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return { success: false, message: parsed.error?.issues?.[0]?.message ?? "Invalid input" };
    }
    try {
      const app = await sellerApplicationService.apply(user.id, parsed.data);
      set.status = 201;
      return { success: true, message: "Application submitted successfully", data: app };
    } catch (e) {
      const err = e as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async getMyApplication({ user, set }: any) {
    try {
      const app = await sellerApplicationService.getMyApplication(user.id);
      return { success: true, message: "Application fetched", data: app };
    } catch (e) {
      const err = e as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  // ── Admin handlers ──────────────────────────────────────────────────────────

  async getAllApplications({ query, set }: any) {
    try {
      const page   = Math.max(1, Number(query?.page) || 1);
      const size   = Math.min(50, Math.max(1, Number(query?.size) || 15));
      const status = query?.status || undefined;
      const data   = await sellerApplicationService.getAllApplications(page, size, status);
      return { success: true, message: "Applications fetched", data };
    } catch (e) {
      const err = e as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async approveApplication({ params, set }: any) {
    try {
      const result = await sellerApplicationService.approveApplication(params.id);
      return { success: true, message: result.message };
    } catch (e) {
      const err = e as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async rejectApplication({ params, body, set }: any) {
    const parsed = RejectApplicationDto.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return { success: false, message: parsed.error?.issues?.[0]?.message ?? "Rejection reason required" };
    }
    try {
      const result = await sellerApplicationService.rejectApplication(params.id, parsed.data.reason);
      return { success: true, message: result.message };
    } catch (e) {
      const err = e as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },
};
