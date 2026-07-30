export type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

const todos: Todo[] = [
  { id: 1, title: "MVC 구조 이해하기", completed: true },
  { id: 2, title: "Model에서 데이터 관리하기", completed: false },
  { id: 3, title: "View는 화면 렌더링만 맡기기", completed: false },
];

export function getTodos() {
  return todos;
}
