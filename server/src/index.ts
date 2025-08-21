import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import { 
  createCounterInputSchema, 
  counterOperationInputSchema, 
  resetCounterInputSchema 
} from './schema';

// Import handlers
import { createCounter } from './handlers/create_counter';
import { getCounter } from './handlers/get_counter';
import { getCounters } from './handlers/get_counters';
import { incrementCounter } from './handlers/increment_counter';
import { decrementCounter } from './handlers/decrement_counter';
import { resetCounter } from './handlers/reset_counter';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Counter operations
  createCounter: publicProcedure
    .input(createCounterInputSchema)
    .mutation(({ input }) => createCounter(input)),
    
  getCounter: publicProcedure
    .input(counterOperationInputSchema)
    .query(({ input }) => getCounter(input.id)),
    
  getCounters: publicProcedure
    .query(() => getCounters()),
    
  incrementCounter: publicProcedure
    .input(counterOperationInputSchema)
    .mutation(({ input }) => incrementCounter(input)),
    
  decrementCounter: publicProcedure
    .input(counterOperationInputSchema)
    .mutation(({ input }) => decrementCounter(input)),
    
  resetCounter: publicProcedure
    .input(resetCounterInputSchema)
    .mutation(({ input }) => resetCounter(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();