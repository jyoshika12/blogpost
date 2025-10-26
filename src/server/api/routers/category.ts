import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { db } from '@/server/db';
import { categories } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

const createCategorySchema = z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters.'),
});

export const categoryRouter = createTRPCRouter({
    getAll: publicProcedure.query(async () => {
        return db.query.categories.findMany({
            orderBy: (categories, { asc }) => [asc(categories.name)],
        });
    }),
    create: publicProcedure
        .input(createCategorySchema)
        .mutation(async ({ input }) => {
            const [newCategory] = await db
                .insert(categories)
                .values({
                    name: input.name,
                    slug: input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                })
                .returning();
            return newCategory;
        }),

    delete: publicProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
            await db.delete(categories).where(eq(categories.id, input.id));
            return { success: true };
        }),
});