import { getTodos } from "@/models/todoModel";

export function getTodoViewModel() {
  const todos = getTodos();
  const completedCount = todos.filter((todo) => todo.completed).length;

  return {
    todos,
    totalCount: todos.length,
    completedCount,
    remainingCount: todos.length - completedCount,
  };
}
