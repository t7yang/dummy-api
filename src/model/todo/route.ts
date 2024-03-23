import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import * as v from 'valibot';
import { db } from '../../db/index.js';
import { loginHook } from '../../routes/auth/handler.js';
import { getItemById, getNextId } from '../shared/calc/data.js';
import { idParamSchema, paginationQuerySchema } from '../shared/schema/index.js';
import { todoCreateSchema, todosQuerySchema, type Todo } from './type.js';

export const todoRoutes = new Hono();

todoRoutes.use(loginHook);

todoRoutes.get('/:id', vValidator('param', idParamSchema), async ctx => {
  const id = ctx.req.valid('param').id;
  const todo = getItemById(db.data.todos, id);

  return todo ? ctx.json(todo) : ctx.text('Todo not found', 404);
});

const getTodosQuerySchema = v.intersect([paginationQuerySchema, todosQuerySchema]);
todoRoutes.get('/', vValidator('query', getTodosQuerySchema), async ctx => {
  const { skip, limit, completed, userId } = ctx.req.valid('query');
  const allTodos = db.data.todos.filter(
    todo => (completed == null || todo.completed === completed) && (userId == null || todo.userId === userId),
  );

  return ctx.json({ todos: allTodos.slice(skip, skip + limit), total: allTodos.length });
});

todoRoutes.post('/', vValidator('json', todoCreateSchema), async ctx => {
  const { todo, completed, userId } = ctx.req.valid('json');

  const user = db.data.users.find(u => u.id === userId);
  if (!user) return ctx.text('Invalid userId', 400);

  const newId = getNextId(db.data.todos);
  const newTodo: Todo = { id: newId, todo, completed, userId };

  db.data.todos.push(newTodo);
  await db.write();

  return ctx.json(newTodo);
});

todoRoutes.put(
  '/:id',
  vValidator('param', idParamSchema),
  vValidator('json', v.partial(todoCreateSchema)),
  async ctx => {
    const todoId = ctx.req.valid('param').id;

    const existingTodo = db.data.todos.find(t => t.id === todoId);

    if (!existingTodo) return ctx.text('Todo not found', 404);

    Object.assign(existingTodo, ctx.req.valid('json'));
    await db.write();
    return ctx.json(existingTodo);
  },
);

todoRoutes.delete('/:id', vValidator('param', idParamSchema), async ctx => {
  const index = db.data.todos.findIndex(t => t.id === ctx.req.valid('param').id);

  if (index === -1) return ctx.text('Todo not found', 404);

  const todo = db.data.todos.splice(index, 1)[0];
  await db.write();
  return ctx.json(todo);
});

todoRoutes.delete('/', vValidator('query', todosQuerySchema), async ctx => {
  const { completed, userId } = ctx.req.valid('query');
  const { kept, removed } = db.data.todos.reduce(
    (grouped, todo) => {
      todo.userId === userId && todo.completed === completed ? grouped.removed.push(todo) : grouped.kept.push(todo);
      return grouped;
    },
    { kept: [] as Todo[], removed: [] as Todo[] },
  );

  db.data.todos = kept;
  await db.write();

  return ctx.json(removed);
});
