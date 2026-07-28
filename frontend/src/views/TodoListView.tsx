import type { Todo } from "@/models/todoModel";

type TodoListViewProps = {
  todos: Todo[];
  totalCount: number;
  completedCount: number;
  remainingCount: number;
};

export function TodoListView({
  todos,
  totalCount,
  completedCount,
  remainingCount,
}: TodoListViewProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-6 py-12">
      <section className="space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase text-blue-600">
            Simple MVC Example
          </p>
          <h1 className="text-4xl font-bold text-zinc-950">Todo MVC</h1>
          <p className="text-zinc-600">
            Model은 데이터를, Controller는 화면에 필요한 상태를, View는
            렌더링을 담당합니다.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <SummaryItem label="전체" value={totalCount} />
          <SummaryItem label="완료" value={completedCount} />
          <SummaryItem label="남음" value={remainingCount} />
        </div>

        <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
          {todos.map((todo) => (
            <li key={todo.id} className="flex items-center gap-3 px-4 py-4">
              <span
                className={`h-3 w-3 rounded-full ${
                  todo.completed ? "bg-emerald-500" : "bg-zinc-300"
                }`}
                aria-hidden="true"
              />
              <span
                className={
                  todo.completed
                    ? "text-zinc-500 line-through"
                    : "text-zinc-900"
                }
              >
                {todo.title}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}
