import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Todo } from './Todo';

type CreateTaskDto = { text: string };
type UpdateTaskTextDto = { id: string; text: string };

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8080' }),
  tagTypes: ['Todos'],
  endpoints: (builder) => ({
    getTodos: builder.query<Todo[], void>({
      query: () => '/tasks',
      providesTags: (result = []) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Todos' as const, id })),
              { type: 'Todos', id: 'LIST' },
            ]
          : [{ type: 'Todos', id: 'LIST' }],
    }),

    addTodo: builder.mutation<Todo, CreateTaskDto>({
      query: (task) => ({
        url: '/tasks',
        method: 'POST',
        body: task,
      }),
      invalidatesTags: [{ type: 'Todos', id: 'LIST' }],
    }),

    
    updateTaskText: builder.mutation<Todo, UpdateTaskTextDto>({
      query: ({ id, text }) => ({
        url: `/tasks/${id}`,
        method: 'POST',
        body: { text },
      }),
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        try {
          const { data: updatedTask } = await queryFulfilled;
          dispatch(
            apiSlice.util.updateQueryData('getTodos', undefined, (draft) => {
              const task = draft.find(t => t.id === id);
              if (task) {
                Object.assign(task, updatedTask);
              }
            })
          );
        } catch {}
      },
    }),

    completeTask: builder.mutation<Todo, string>({
      query: (id) => ({
        url: `/tasks/${id}/complete`,
        method: 'POST',
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const { data: updatedTask } = await queryFulfilled;
          dispatch(
            apiSlice.util.updateQueryData('getTodos', undefined, (draft) => {
               const task = draft.find(t => t.id === id);
               if (task) {
                 Object.assign(task, updatedTask);
               }
            })
          );
        } catch {}
      },
    }),

    incompleteTask: builder.mutation<Todo, string>({
      query: (id) => ({
        url: `/tasks/${id}/incomplete`,
        method: 'POST',
      }),
       async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const { data: updatedTask } = await queryFulfilled;
          dispatch(
            apiSlice.util.updateQueryData('getTodos', undefined, (draft) => {
               const task = draft.find(t => t.id === id);
               if (task) {
                 Object.assign(task, updatedTask);
               }
            })
          );
        } catch {}
      },
    }),


    deleteTodo: builder.mutation<void, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Todos', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetTodosQuery,
  useAddTodoMutation,
  useUpdateTaskTextMutation,
  useCompleteTaskMutation,
  useIncompleteTaskMutation,
  useDeleteTodoMutation,
} = apiSlice;