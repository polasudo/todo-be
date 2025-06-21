import React, { useState, useEffect } from 'react';
import { Todo } from '../features/todos/Todo';
import { useUpdateTaskTextMutation, useCompleteTaskMutation, useIncompleteTaskMutation, useDeleteTodoMutation } from '../features/todos/todosApiSlice';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

interface TodoItemProps {
  todo: Todo;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const [updateTaskText] = useUpdateTaskTextMutation();
  const [completeTask] = useCompleteTaskMutation();
  const [incompleteTask] = useIncompleteTaskMutation();
  const [deleteTodo] = useDeleteTodoMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(todo.text);

  useEffect(() => { setText(todo.text); }, [todo.text]);

  const handleToggleCompleted = () => {
    if (todo.completed) {
      incompleteTask(todo.id);
    } else {
      completeTask(todo.id);
    }
  };

  const handleRename = () => {
    setIsEditing(false);
    const trimmedText = text.trim();
    if (trimmedText && trimmedText !== todo.text) {
      updateTaskText({ id: todo.id, text: trimmedText });
    } else {
      setText(todo.text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleRename();
    else if (e.key === 'Escape') {
      setText(todo.text);
      setIsEditing(false);
    }
  };

  return (
    <ListItem
      divider
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: 2,
        px: 1,
        bgcolor: isEditing ? 'grey.50' : 'white',
        '&:hover': { bgcolor: 'grey.100' },
      }}
      onDoubleClick={() => setIsEditing(true)}
      disableGutters
    >
      {isEditing ? (
        <Box display="flex" alignItems="center" width="100%" gap={2}>
          <TextField
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            variant="standard"
            fullWidth
            autoFocus
            sx={{ mr: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleRename}
            disabled={text.trim() === todo.text || !text.trim()}
            sx={{ minWidth: 80 }}
          >
            Update
          </Button>
        </Box>
      ) : (
        <>
          <IconButton onClick={handleToggleCompleted} color={todo.completed ? 'success' : 'default'} sx={{ mr: 2 }} aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}>
            {todo.completed ? '✓' : '○'}
          </IconButton>
          <Box flexGrow={1}>
            <Typography
              variant="body1"
              sx={{
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? 'text.disabled' : 'text.primary',
                userSelect: 'none',
              }}
            >
              {todo.text}
            </Typography>
          </Box>
          <IconButton color="error" onClick={() => deleteTodo(todo.id)} aria-label="Delete todo" sx={{ ml: 2 }}>
            ✕
          </IconButton>
        </>
      )}
    </ListItem>
  );
};