import { sellerApplicationRepository } from "../repositories/sellerApplication.repository";
import { AdminRepository } from "../repositories/admin.repository";
import { NotificationService } from "./notification.service";
import { HttpError } from "../errors/HttpError";
import type { CreateSellerApplicationDto } from "../dtos/sellerApplication.dto";

const adminRepo      = new AdminRepository();
const notificationSvc = new NotificationService();

export const sellerApplicationService = {

  async apply(userId: string, data: CreateSellerApplicationDto) {
    // One application at a time — block if pending or approved
    const existing = await sellerApplicationRepository.getByUserId(userId);
    if (existing?.status === "pending") {
      throw new HttpError(400, "You already have a pending application");
    }
    if (existing?.status === "approved") {
      throw new HttpError(400, "Your application has already been approved");
    }
    return sellerApplicationRepository.create(userId, data);
  },

  async getMyApplication(userId: string) {
    return sellerApplicationRepository.getByUserId(userId);
  },

  // ── Admin actions ──────────────────────────────────────────────────────────

  async getAllApplications(page: number, size: number, status?: string) {
    const offset = (page - 1) * size;
    const { applications, total } = await sellerApplicationRepository.getAll(offset, size, status);
    return {
      applications,
      pagination: { page, size, total, totalPages: Math.ceil(total / size) },
    };
  },

  async approveApplication(applicationId: string) {
    const app = await sellerApplicationRepository.getById(applicationId);
    if (!app) throw new HttpError(404, "Application not found");
    if (app.status !== "pending") throw new HttpError(400, "Application is not pending");

    // 1. Update application status
    await sellerApplicationRepository.updateStatus(applicationId, "approved");

    // 2. Promote user → seller + mark approved
    await adminRepo.updateUser(app.userId, { role: "seller", isApproved: true });

    // 3. Notify user
    await notificationSvc.createNotification(
      app.userId,
      "Seller Application Approved!",
      `Congratulations! Your seller application for "${app.businessName}" has been approved. You can now access your seller dashboard.`,
      "system",
      applicationId,
    );

    return { message: "Application approved. User is now a seller." };
  },

  async rejectApplication(applicationId: string, reason: string) {
    const app = await sellerApplicationRepository.getById(applicationId);
    if (!app) throw new HttpError(404, "Application not found");
    if (app.status !== "pending") throw new HttpError(400, "Application is not pending");

    // 1. Update application status with reason
    await sellerApplicationRepository.updateStatus(applicationId, "rejected", reason);

    // 2. Notify user
    await notificationSvc.createNotification(
      app.userId,
      "Seller Application Rejected",
      `Your seller application for "${app.businessName}" was not approved. Reason: ${reason}. You may apply again after addressing the issues.`,
      "system",
      applicationId,
    );

    return { message: "Application rejected." };
  },
};
