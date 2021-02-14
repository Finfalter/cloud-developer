import * as AWS  from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
const AWSXRay = require('aws-xray-sdk');
import { DocumentClient, ItemList } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'

export class TodoAccess {

	constructor(
			private readonly docClient: DocumentClient = createDynamoDBClient(),
			private readonly todosTable = process.env.TODOS_TABLE) {
	}

	async getTodosOfUser(userId: string): Promise<TodoItem[]>{
		const result = await this.docClient.query({
			TableName: this.todosTable,
			KeyConditionExpression: 'userId = :userId',
			ExpressionAttributeValues: {
				':userId': userId
			},
			ScanIndexForward: false
		}).promise()
		return result.Items as TodoItem[]
	}

	async updateTodo(todo: TodoItem): Promise<TodoItem> {
		return this.createTodo(todo)
	}

	async createTodo(todo: TodoItem): Promise<TodoItem> {
		await this.docClient.put({
			TableName: this.todosTable,
			Item: todo
		}).promise()

		return todo
	}
}

function createDynamoDBClient() {
	if (process.env.IS_OFFLINE) {
		console.log('Creating a local DynamoDB instance')
		return new XAWS.DynamoDB.DocumentClient({
			region: 'localhost',
			endpoint: 'http://localhost:8000'
		})
	}

	return new XAWS.DynamoDB.DocumentClient()
}
