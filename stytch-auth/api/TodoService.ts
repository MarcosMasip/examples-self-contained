export type Todo = {
    id: string;
    text: string;
    completed: boolean;
}

/**
 * The `TodoService` class provides methods for managing a to-do list backed by Cloudflare KV storage.
 * This includes operations such as retrieving todos, adding new todos,
 * deleting existing todos, and marking todos as completed.
 *
 * The `TodoService` is uniquely bound to a single user at a time to prevent cross-user data access.
 */
const memory = new Map<string, Todo[]>()

class TodoService {
    constructor(
        private env: Env,
        private userID: string,
    ) {
    }

    get = async (): Promise<Todo[]> => {
        if (this.env.TODOS && 'get' in this.env.TODOS) {
            const todos = await this.env.TODOS.get<Todo[]>(this.userID, 'json')
            return todos || []
        }
        return memory.get(this.userID) || []
    }

    #set = async (todos: Todo[]): Promise<Todo[]> => {
        const sorted = todos.sort((t1, t2) => {
            if (t1.completed === t2.completed) {
                return t1.id.localeCompare(t2.id);
            }
            return t1.completed ? 1 : -1;
        });

        if (this.env.TODOS && 'put' in this.env.TODOS) {
            await this.env.TODOS.put(this.userID, JSON.stringify(sorted))
            return sorted
        }
        memory.set(this.userID, sorted)
        return sorted
    }

    add = async (todoText: string): Promise<Todo[]> => {
        const todos = await this.get()
        const newTodo: Todo = {
            id: Date.now().toString(),
            text: todoText,
            completed: false
        }
        todos.push(newTodo)
        return this.#set(todos)
    }

    delete = async (todoID: string): Promise<Todo[]> => {
        const todos = await this.get()
        const cleaned = todos.filter(t => t.id !== todoID);
        return this.#set(cleaned);
    }

    markCompleted = async (todoID: string): Promise<Todo[]> => {
        const todos = await this.get()
        const completedTodo = todos.find(t => t.id === todoID);
        if (completedTodo) {
            completedTodo.completed = true;
            return this.#set(todos);
        }
        return todos;
    }
}

export const todoService = (env: Env, userID: string) => new TodoService(env, userID)
