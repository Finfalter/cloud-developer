import * as AWS  from 'aws-sdk'
//import { Integer } from 'aws-sdk/clients/apigateway';
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
		private readonly s3 = new XAWS.S3({signatureVersion: 'v4'}),
		private readonly todosTable = process.env.TODOS_TABLE,
		private readonly bucketName = process.env.TODOS_S3_BUCKET,
		private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION) {}


	async setImageUrl(todoId: string, userId: string, url: string) 
	{
		var params = {
			TableName: this.todosTable,
			Key:{
				"userId": userId,
				"todoId": todoId
			},
			UpdateExpression: "set attachmentUrl=:url",
			ExpressionAttributeValues:{
				":url": url,

			},
			ReturnValues:"UPDATED_NEW"
		};
		
		const result = this.docClient.update(params).promise();
		return result.then((data: PromiseResult<DeleteItemOutput, AWSError>) => {
			if (data.$response && data.$response.error != null) {
				logger.warn('failure', {error: data.$response.error})
				return undefined								//"failure"
			} else 
				return data.Attributes as unknown as TodoItem 	//"success"
		})
	}

	async signUrl(todoId: string) {
		return this.s3.getSignedUrl('putObject', {
			Bucket: this.bucketName,
			Key: todoId,
			Expires: parseInt(this.urlExpiration)
		})
	}

	async todoExists(userId: string, todoId: string) : Promise<Boolean>{
			const result = await this.docClient.get({
					TableName: this.todosTable,
					Key: {
						userId: userId,
						todoId: todoId
					}
				})
				.promise()
		
			console.log('Get group: ', result)
			return !!result.Item
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

	async updateTodo(todo: TodoItem): Promise<TodoItem> 
	{
		var params = {
			TableName: this.todosTable,
			Key:{
				"userId": todo.userId,
				"todoId": todo.todoId
			},
			UpdateExpression: "set #tdn=:n, dueDate=:dd, done=:d",
			ExpressionAttributeValues:{
				":n": todo.name,
				":dd":todo.dueDate,
				":d": todo.done
			},
			ExpressionAttributeNames:{"#tdn": "name"},
			ReturnValues:"UPDATED_NEW"
		};
		
		const result = this.docClient.update(params).promise();
		return result.then((data: PromiseResult<DeleteItemOutput, AWSError>) => {
			if (data.$response && data.$response.error != null) {
				logger.warn('failure', {error: data.$response.error})
				return undefined								//"failure"
			} else 
				return data.Attributes as unknown as TodoItem 	//"success"
		})
	}

	async deleteTodo(userId: string, todoId: string) : Promise<TodoItem>
	{
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
				return undefined								//"failure"
			} else 
				return data.Attributes as unknown as TodoItem 	//"success"
		})
	}

	async createTodo(todo: TodoItem): Promise<TodoItem> 
	{
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
