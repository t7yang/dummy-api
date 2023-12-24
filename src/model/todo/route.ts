// src/routes/todo.ts
import { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';
import { addLoginHook } from '../../routes/auth/handler.js';
import { getItemById, getNextId } from '../shared/calc/data.js';
import { idParamSchema, paginationQuerySchema } from '../shared/schema/index.js';
import { Todo, todoCreateSchema, todosQuerySchema } from './type.js';

export const todoRoutes = async (fastify: FastifyInstance) => {
  addLoginHook(fastify);

  fastify.get('/:id', async (request, reply) => {
    const id = idParamSchema.safeParse(request.params);

    if (!id.success) return reply.status(400).send('Invalid id');

    const todo = getItemById(db.data.todos, id.data.id);

    if (todo) {
      reply.send(todo);
    } else {
      reply.status(404).send('Todo not found');
    }
  });

  const getTodosQuerySchema = paginationQuerySchema.and(todosQuerySchema);
  fastify.get('/', async (request, reply) => {
    const queries = getTodosQuerySchema.safeParse(request.query);

    if (!queries.success) return reply.status(400).send('Invalid query parameters');

    const { skip, limit, completed, userId } = queries.data;
    const allTodos = db.data.todos.filter(
      todo => (completed == null || todo.completed === completed) && (userId == null || todo.userId === userId),
    );

    reply.send({ todos: allTodos.slice(skip, skip + limit), total: allTodos.length });
  });

  fastify.post('/', async (request, reply) => {
    const payload = todoCreateSchema.safeParse(request.body);

    if (!payload.success) return reply.status(400).send('Invalid payload');

    const { todo, completed, userId } = payload.data;

    const user = db.data.users.find(u => u.id === userId);

    if (!user) return reply.status(400).send('Invalid userId');

    const newId = getNextId(db.data.todos);

    const newTodo: Todo = { id: newId, todo, completed, userId };

    db.data.todos.push(newTodo);
    await db.write();

    reply.send(newTodo);
  });

  fastify.put('/:id', async (request, reply) => {
    const id = idParamSchema.safeParse(request.params);
    const payload = todoCreateSchema.partial().safeParse(request.body);

    if (!id.success || !payload.success) return reply.status(400).send('Invalid id or payload');

    const todoId = id.data.id;

    const existingTodo = db.data.todos.find(t => t.id === todoId);

    if (!existingTodo) return reply.status(404).send('Todo not found');

    Object.assign(existingTodo, payload.data);
    await db.write();
    return existingTodo;
  });

  fastify.delete('/:id', async (request, reply) => {
    const id = idParamSchema.safeParse(request.params);

    if (!id.success) return reply.status(400).send('Invalid id');

    const todoId = id.data.id;

    const index = db.data.todos.findIndex(t => t.id === todoId);

    if (index === -1) return reply.status(404).send('Todo not found');

    const todo = db.data.todos.splice(index, 1)[0];
    await db.write();
    reply.send(todo);
  });
};
