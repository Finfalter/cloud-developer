import * as uuid from 'uuid'

import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { TodoAccess } from '../dataLayer/todoAccess'
import { TodoItem } from '../models/TodoItem'

const todoAccess = new TodoAccess()

export async function setImageUrl(todoId: string, userId: string, url: string) {
  return await todoAccess.setImageUrl(todoId, userId,url);
}

export async function signUrl(
  todoId: string) {
  return await todoAccess.signUrl(todoId)
}

export async function todoExists(
  userId: string,
  todoId: string) : Promise<Boolean>{
    return await todoAccess.todoExists(userId, todoId)
}

export async function deleteTodo(
  userId: string,
  todoId: string) : Promise<TodoItem>{
    return await todoAccess.deleteTodo(userId, todoId)
}

export async function updateTodo(
  userId: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<TodoItem> 
{
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
    userId: string
  ): Promise<TodoItem> {
  
    const todoId = uuid.v4()
  
    return await todoAccess.createTodo({
			userId: userId,
			todoId: todoId,
			createdAt: new Date().toISOString(),
			name: createTodoRequest.name,
			dueDate: createTodoRequest.dueDate,
			done: false
    })
  }