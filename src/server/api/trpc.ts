import { initTRPC } from '@trpc/server';
import { db } from '@/server/db';
export const createInnerTRPCContext = () => ({
  db, 
});
export type Context = ReturnType<typeof createInnerTRPCContext>;
const t = initTRPC.context<Context>().create();

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;