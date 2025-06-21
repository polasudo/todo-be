import React, { useState, useMemo } from 'react';
import { useGetTodosQuery, useAddTodoMutation, useCompleteTaskMutation, useDeleteTodoMutation } from './features/todos/todosApiSlice';
import { TodoItem } from './components/TodoItem';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';

// Type for filter status
// 'all' = show all, 'active' = only incomplete, 'completed' = only completed
// Used for filtering the todo list
//
type FilterStatus = 'all' | 'active' | 'completed';

const App: React.FC = () => {
  // --- State and API hooks ---
  const { data: todos = [], isLoading, isError } = useGetTodosQuery();
  const [addTodo, { isLoading: isAdding }] = useAddTodoMutation();
  const [completeTask] = useCompleteTaskMutation();
  const [deleteTodo] = useDeleteTodoMutation();
  
  const [newTodoText, setNewTodoText] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');

  // --- Handlers ---

  // Add a new todo
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedText = newTodoText.trim();
    if (trimmedText) {
      try {
        await addTodo({ text: trimmedText }).unwrap();
        setNewTodoText('');
      } catch (err) {
        console.error('Nepodařilo se přidat úkol: ', err);
        alert('Chyba: Úkol se nepodařilo uložit na server.');
      }
    }
  };

  // Filter todos based on current filter
  const filteredTodos = useMemo(() => todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  }), [todos, filter]);

  // Count completed and active todos
  const completedCount = useMemo(() => todos.filter(t => t.completed).length, [todos]);
  const activeCount = todos.length - completedCount;

  // Bulk: Mark all visible todos as completed
  const handleCompleteAllVisible = async () => {
    await Promise.all(filteredTodos.filter(t => !t.completed).map(t => completeTask(t.id)));
  };

  // Bulk: Remove all completed todos
  const handleClearCompleted = async () => {
    const tasksToDelete = todos.filter(t => t.completed);
    await Promise.all(tasksToDelete.map(t => deleteTodo(t.id)));
  };

  // --- Render loading and error states ---
  if (isLoading) return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
      <CircularProgress size={48} sx={{ mb: 2 }} />
      <Typography variant="h6" color="text.secondary">Loading...</Typography>
    </Box>
  );
  if (isError) return <Box textAlign="center" p={8} color="error.main">Chyba při načítání dat.</Box>;

  // --- Main UI ---
  return (
    <Box sx={{ bgcolor: 'grey.100', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        {/* App header */}
        <Box textAlign="center" my={6}>
          <Typography variant="h2" fontWeight={200} color="text.primary" gutterBottom>todos</Typography>
        </Box>
        <Paper elevation={6} sx={{ borderRadius: 3, overflow: 'hidden', border: 1, borderColor: 'grey.200' }}>
          {/* Add new todo form */}
          <Box component="form" onSubmit={handleAddTodo} borderBottom={1} borderColor="grey.200" px={2} py={2} display="flex" alignItems="center" gap={2}>
            <TextField
              fullWidth
              variant="standard"
              placeholder="What needs to be done?"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              disabled={isAdding}
              InputProps={{ disableUnderline: true }}
            />
            <Button type="submit" variant="contained" color="primary" disabled={isAdding || !newTodoText.trim()} sx={{ minWidth: 100 }}>
              Add
            </Button>
          </Box>
          {/* Helper text for editing */}
          <Typography variant="caption" color="text.secondary" px={2} pb={1}>
            Double click a task to edit it.
          </Typography>
          <Divider />
          {/* Bulk action buttons */}
          <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2} px={2} pt={2} mb={2}>
            <Button
              size="small"
              variant="outlined"
              color="success"
              onClick={handleCompleteAllVisible}
              disabled={filteredTodos.length === 0 || filteredTodos.every(t => t.completed)}
            >
              Mark all visible as completed
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={handleClearCompleted}
              disabled={completedCount === 0}
            >
              Remove all completed
            </Button>
          </Box>
          {/* Todo list */}
          <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
            {filteredTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </Box>
          {/* Footer: counts and filter buttons */}
          {todos.length > 0 && (
            <Box component="footer" px={2} py={2} bgcolor="grey.50" borderTop={1} borderColor="grey.200">
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Typography variant="body2">
                  {activeCount} {activeCount === 1 ? 'item' : 'items'} left
                  {completedCount > 0 && (
                    <>
                      {' | '}
                      <b>{completedCount}</b> completed
                    </>
                  )}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant={filter === 'all' ? 'contained' : 'outlined'} onClick={() => setFilter('all')}>All</Button>
                  <Button size="small" variant={filter === 'active' ? 'contained' : 'outlined'} onClick={() => setFilter('active')}>Active</Button>
                  <Button size="small" variant={filter === 'completed' ? 'contained' : 'outlined'} onClick={() => setFilter('completed')}>Completed</Button>
                </Stack>
              </Stack>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default App;