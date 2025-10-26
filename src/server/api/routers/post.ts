import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { db } from '@/server/db';
import { posts, postsToCategories } from '@/server/db/schema';
import { eq, inArray, desc } from 'drizzle-orm'; 

const createPostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  content: z.string().min(50, 'Content must be at least 50 characters.'),
  categoryIds: z.array(z.number()).optional(), 
});

const updatePostSchema = z.object({
  id: z.number(), 
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  content: z.string().min(50, 'Content must be at least 50 characters.'),
  categoryIds: z.array(z.number()).optional(), 
});

const filterPostsSchema = z.object({
  categoryId: z.number().optional(), 
});
// -------------------

export const postRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(filterPostsSchema.optional()) 
    .query(async (opts) => {
      const input = opts.input || {}; 
      
      if (input.categoryId) {
        const postsInTargetCategory = await db.selectDistinct({ id: posts.id })
            .from(posts)
            .innerJoin(postsToCategories, eq(posts.id, postsToCategories.postId))
            .where(eq(postsToCategories.categoryId, input.categoryId));

        const postIds = postsInTargetCategory.map(p => p.id);
        
        if (postIds.length === 0) {
            return [];
        }

        return db.query.posts.findMany({
            where: inArray(posts.id, postIds),
            with: { postsToCategories: { with: { category: true } } },
            orderBy: (posts) => [desc(posts.createdAt)],
        });
      }
      return db.query.posts.findMany({
        with: { postsToCategories: { with: { category: true } } },
        orderBy: (posts) => [desc(posts.createdAt)],
      });
    }),
  getById: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
        return db.query.posts.findFirst({
            where: eq(posts.slug, input.slug),
            with: { postsToCategories: { with: { category: true } } },
        });
    }),
    
  create: publicProcedure
    .input(createPostSchema)
    .mutation(async ({ input, ctx }) => {
      return ctx.db.transaction(async (tx) => {
        const [newPost] = await tx
          .insert(posts)
          .values({
            title: input.title,
            slug: input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50) + '-' + Date.now(),
            content: input.content,
          })
          .returning();

        if (input.categoryIds && input.categoryIds.length > 0) {
          const relations = input.categoryIds.map((categoryId) => ({
            postId: newPost.id,
            categoryId: categoryId,
          }));
          await tx.insert(postsToCategories).values(relations);
        }
        return newPost;
      });
    }),

  update: publicProcedure
    .input(updatePostSchema)
    .mutation(async ({ input, ctx }) => {
        const { id, title, content, categoryIds } = input;
        
        return ctx.db.transaction(async (tx) => {
            await tx.update(posts)
                .set({
                    title: title,
                    content: content,
                    updatedAt: new Date(),
                })
                .where(eq(posts.id, id));

            await tx.delete(postsToCategories)
                .where(eq(postsToCategories.postId, id));

            if (categoryIds && categoryIds.length > 0) {
                const newRelations = categoryIds.map((categoryId) => ({
                    postId: id,
                    categoryId: categoryId,
                }));
                await tx.insert(postsToCategories).values(newRelations);
            }
            
            return { success: true, updatedId: id }; 
        });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(posts).where(eq(posts.id, input.id));
      return { success: true };
    }),
});