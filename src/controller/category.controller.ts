import { CategoryService } from "../services/category.service";
import { CreateCategoryDto, UpdateCategoryDto } from "../dtos/category.dto";
import { HttpError } from "../errors/HttpError";

const categoryService = new CategoryService();

export const categoryController = {
    async getAll({ set }: { set: any }) {
        try {
            const data = await categoryService.getAll();
            return { success: true, message: "Categories fetched successfully", data };
        } catch (error) {
            const err = error as HttpError;
            set.status = err.statusCode || 500;
            return { success: false, message: err.message || "Internal Server Error" };
        }
    },

    async getById({ params, set }: { params: { id: string }; set: any }) {
        try {
            const data = await categoryService.getById(params.id);
            return { success: true, message: "Category fetched successfully", data };
        } catch (error) {
            const err = error as HttpError;
            set.status = err.statusCode || 500;
            return { success: false, message: err.message || "Internal Server Error" };
        }
    },

    async create({ body, set }: { body: unknown; set: any }) {
        const parsed = CreateCategoryDto.safeParse(body);
        if (!parsed.success) {
            set.status = 400;
            return {
                success: false,
                message: parsed.error.issues[0]?.message ?? "Invalid category data",
            };
        }
        try {
            const data = await categoryService.create(parsed.data);
            set.status = 201;
            return { success: true, message: "Category created successfully", data };
        } catch (error) {
            const err = error as HttpError;
            set.status = err.statusCode || 500;
            return { success: false, message: err.message || "Internal Server Error" };
        }
    },

    async update({ params, body, set }: { params: { id: string }; body: unknown; set: any }) {
        const parsed = UpdateCategoryDto.safeParse(body);
        if (!parsed.success) {
            set.status = 400;
            return {
                success: false,
                message: parsed.error.issues[0]?.message ?? "Invalid update data",
            };
        }
        try {
            const data = await categoryService.update(params.id, parsed.data);
            return { success: true, message: "Category updated successfully", data };
        } catch (error) {
            const err = error as HttpError;
            set.status = err.statusCode || 500;
            return { success: false, message: err.message || "Internal Server Error" };
        }
    },

    async delete({ params, set }: { params: { id: string }; set: any }) {
        try {
            await categoryService.delete(params.id);
            return { success: true, message: "Category deleted successfully" };
        } catch (error) {
            const err = error as HttpError;
            set.status = err.statusCode || 500;
            return { success: false, message: err.message || "Internal Server Error" };
        }
    },
};
