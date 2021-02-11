import * as uuid from 'uuid'

import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { TodoAccess } from '../dataLayer/todoAccess'
import { TodoItem } from '../models/TodoItem'
import { parseUserId } from '../auth/utils'

const todoAccess = new TodoAccess()

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    jwtToken: string
  ): Promise<TodoItem> {
  
    const itemId = uuid.v4()
    const userId = parseUserId(jwtToken)
  
    return await todoAccess.createTodo({
			userId: userId,
			todoId: itemId,
			createdAt: new Date().toISOString(),
			name: createTodoRequest.name,
			dueDate: createTodoRequest.dueDate,
			done: false
    })
  }