import type { Todo } from "@/mvc/models/todoModel";

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
            Model?Ä ?∞Ïù¥?∞Î?, Controller???îÎ©¥???ÑÏöî???ÅÌÉúÎ•? View??            ?åÎçîÎßÅÏùÑ ?¥Îãπ?©Îãà??
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <SummaryItem label="?ÑÏ≤¥" value={totalCount} />
          <SummaryItem label="?ÑÎ£å" value={completedCount} />
          <SummaryItem label="?®Ïùå" value={remainingCount} />
        </div>

        <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-foreground">
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
    <div className="rounded-lg border border-zinc-200 bg-foreground p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}
