import { AuthService } from "../services/auth.service";
import { RegisterDto, LoginDto } from "../dtos/user.dto";
import { HttpError } from "../errors/HttpError";

const authService = new AuthService();

export const authController = {
    async register({ body, set}: {body: unknown; set: any}) {
        const parsed = RegisterDto.safeParse(body);
        if(!parsed.success) {
            set.status = 400;
            return { success: false, message: parsed.error.issues?.[0]?.message ?? "Invalid registration data" }
        }
        try {
            const user = await authService.register(parsed.data);
            set.status = 201;
            return { success: true, message: "Registration successful", data: user};

        } catch (error) {
            const err = error as HttpError;
            set.status = err.statusCode || 500;
            return { success: false, message: err.message};
        }

    },

    async login({ body, set}: {body: unknown; set: any}) {
        const parsed = LoginDto.safeParse(body);
        if(!parsed.success) {
            set.status = 400;
            return { success: false, message: parsed.error.issues?.[0]?.message ?? "Invalid login data"};
        }
        try {
            const result = await authService.login(parsed.data);
            return { success: true, message: "Login successful", data: result };
        } catch (error) {
            const err = error as HttpError;
            set.status = err.statusCode || 500;
            return { success: false, message: err.message};
        }
    }
}