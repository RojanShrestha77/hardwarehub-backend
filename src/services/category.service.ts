import { CategoryRepository } from "../repositories/category.repository";
import { HttpError } from "../errors/HttpError";
import type { CreateCategoryDto, UpdateCategoryDto } from "../dtos/category.dto";

const categoryRepo = new CategoryRepository();

const slugify = (name: string) =>
    name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export class CategoryService {
    async getAll() {
        return categoryRepo.getAll();
    }

    async getById(id: string) {
        const cat = await categoryRepo.getById(id);
        if (!cat) throw new HttpError(404, "Category not found");
        return cat;
    }

    async create(data: CreateCategoryDto) {
        const existing = await categoryRepo.getByName(data.name);
        if (existing) throw new HttpError(409, "Category with this name already exists");

        const slug = data.slug || slugify(data.name);

        const slugExists = await categoryRepo.getBySlug(slug);
        if (slugExists) throw new HttpError(409, "Category with this slug already exists");

        return categoryRepo.create({ ...data, slug });
    }

    async update(id: string, data: UpdateCategoryDto) {
        const cat = await categoryRepo.getById(id);
        if (!cat) throw new HttpError(404, "Category not found");

        if (data.name && data.name !== cat.name) {
            const existing = await categoryRepo.getByName(data.name);
            if (existing) throw new HttpError(409, "Category with this name already exists");
        }

        const slug = data.slug ?? (data.name ? slugify(data.name) : undefined);
        return categoryRepo.update(id, { ...data, ...(slug ? { slug } : {}) });
    }

    async delete(id: string) {
        const cat = await categoryRepo.getById(id);
        if (!cat) throw new HttpError(404, "Category not found");
        await categoryRepo.delete(id);
    }
}
