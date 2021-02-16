import * as uuid from 'uuid'

import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { TodoAccess } from '../dataLayer/todoAccess'
import { TodoItem } from '../models/TodoItem'
//import { parseUserId } from '../auth/utils'

const todoAccess = new TodoAccess()

// export async function deleteTodo(
//   userId: string,
//   todoId: string): Promise<string> {
//     return await todoAccess.deleteTodo(userId, todoId)
//   }

export async function deleteTodo(
  userId: string,
  todoId: string) : Promise<TodoItem>{
    return await todoAccess.deleteTodo(userId, todoId)
  }

export async function updateTodo(
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<TodoItem> {

  //const userId = parseUserId(jwtToken)
  const userId = "1"

  return await todoAccess.updateTodo({
    userId: userId,
    todoId: todoId,
    createdAt: new Date().toISOString(),
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    done: updateTodoRequest.done
  })
}

export async function getTodosOfUser(
  validUserId: string
): Promise<TodoItem[]> {
  return await todoAccess.getTodosOfUser(validUserId)
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    jwtToken: string
  ): Promise<TodoItem> {
  
    const itemId = uuid.v4()
    //const userId = parseUserId(jwtToken)
    const userId = "1"
  
    return await todoAccess.createTodo({
			userId: userId,
			todoId: itemId,
			createdAt: new Date().toISOString(),
			name: createTodoRequest.name,
			dueDate: createTodoRequest.dueDate,
			done: false
    })
  }