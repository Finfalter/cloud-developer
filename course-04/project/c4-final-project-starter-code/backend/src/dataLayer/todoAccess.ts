import * as AWS  from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
const AWSXRay = require('aws-xray-sdk');
import { DocumentClient, DeleteItemOutput} from 'aws-sdk/clients/dynamodb'
//import { ConfigurationServicePlaceholders } from 'aws-sdk/lib/config_service_placeholders';
import {AWSError} from "aws-sdk/lib/error";
import {PromiseResult} from "aws-sdk/lib/request";

import { TodoItem } from '../models/TodoItem'

import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('todoAccess')

export class TodoAccess {

	constructor(
		private readonly docClient: DocumentClient = createDynamoDBClient(),
		private readonly todosTable = process.env.TODOS_TABLE
		//private readonly indexName = process.env.INDEX_NAME
		) {}

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

	async deleteTodo(userId: string, todoId: string) : Promise<TodoItem>{
		//logger.info('deleting with', {userId: userId, todoId:todoId})
		var params = {
			TableName: this.todosTable,
			Key:{
				"userId": userId,
				"todoId": todoId
			},
			ReturnValues: "ALL_OLD"
		};
		
		const result = this.docClient.delete(params).promise();
		return result.then((data: PromiseResult<DeleteItemOutput, AWSError>) => {
			if (data.$response && data.$response.error != null) {
				logger.warn('failure', {error: data.$response.error})
				return undefined		   												//"failure"
			} else 
				return data.Attributes as unknown as TodoItem //"success"
		})
	}


			// async deleteTodo(userId: string, todoId: string): Promise<string> {
			// 	var params = {
			// 		TableName:this.todosTable,
			// 		Key:{
			// 			"userId": "1",
			// 			"todoId": todoId
			// 		}
			// 	};
			// 	console.log("Attempting a conditional delete...");
			// 	await this.docClient.delete(params, function(err, data) {
			// 		if (err) {
			// 			logger.warn("DeleteItem failed:" + JSON.stringify(err, null, 2));
			// 			return 'failure'
			// 		} else {
			// 			logger.info("DeleteItem succeeded:" + JSON.stringify(data, null, 2));
			// 			return 'success'
			// 		}
			// 	}).promise()
			// 	return 'success'
			// }
			

			// async deleteTodo(userId: string, todoId: string): Promise<string> {
			// 	var params = {
			// 		TableName:this.todosTable,
			// 		Key:{
			// 			"userId": "1",
			// 			"todoId": todoId
			// 		}
			// 	};
			// 	console.log("Attempting a conditional delete...");
			// 	await this.docClient.delete(params, function(err, data) {
			// 		if (err) {
			// 			logger.warn("DeleteItem failed:" + JSON.stringify(err, null, 2));
			// 			return 'failure'
			// 		} else {
			// 			logger.info("DeleteItem succeeded:" + JSON.stringify(data, null, 2));
			// 			return 'success'
			// 		}
			// 	}).promise()
			// 	return 'success'
			// }
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
		logger.info('Creating a local DynamoDB instance')
		return new XAWS.DynamoDB.DocumentClient({
			region: 'localhost',
			endpoint: 'http://localhost:8000'
		})
	}

	return new XAWS.DynamoDB.DocumentClient()
}
