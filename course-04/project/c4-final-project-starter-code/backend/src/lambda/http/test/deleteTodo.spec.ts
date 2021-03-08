import { APIGatewayProxyResult } from 'aws-lambda'
import {testEvent, createLogger, testTodoItem} from './test_utils.test'

const assert = require("assert");
const sinon = require("sinon");

const todos = require('../../../businessLogic/todos');
const logger = require('../../../utils/logger');
const utils = require('../../utils');

describe("deleteTodo", function () {
	let getUserIdStub;
	let deleteTodoStub;
  let createLoggerStub;

	beforeEach(function () {
		getUserIdStub = sinon.stub(utils, "getUserId");
		deleteTodoStub = sinon.stub(todos, "deleteTodo");
    createLoggerStub = sinon.stub(logger, "createLogger").returns(createLogger('deleteTodo'));
	});

	afterEach(function () {
		getUserIdStub.restore();
		deleteTodoStub.restore();
    createLoggerStub.restore();
	});

	describe("when the user id is invalid", function () {
		it("shall respond with a 401, 'User is not authorized'", async function () {
			getUserIdStub.returns(undefined);

			// embedded require to be able to mock createLogger
			const lambdas = require("../deleteTodo");
			// calling the handler
			const result : APIGatewayProxyResult = await lambdas.handler(testEvent);

			// Assertions
			assert.equal(getUserIdStub.calledOnce, true);
			assert.equal(result.statusCode, 401);
			assert.equal(result.body, JSON.stringify({error: 'User is not authorized'}));
		});
	});

	describe("when the todo to delete does not exist", function () {
		it("shall respond with a 404, Not Found, and an empty body ", async function () {
			getUserIdStub.returns("123");
			deleteTodoStub.returns(Promise.resolve(undefined));

			// embedded require to be able to mock createLogger
			const lambdas = require("../deleteTodo");
			// calling the handler
			const result : APIGatewayProxyResult = await lambdas.handler(testEvent);

			// Assertions
			assert.equal(getUserIdStub.calledOnce, true);
			assert.equal(deleteTodoStub.calledOnce, true);
			assert.equal(result.statusCode, 404);
			assert.equal(result.body, '');
		}); 
	});

	describe("when a todo was deleted with the correct todoId", function () {
		it("shall respond with a 201, Created, and an empty body ", async function () {
			getUserIdStub.returns("123");
			deleteTodoStub.returns(Promise.resolve(testTodoItem));

			// embedded require to be able to mock createLogger
			const lambdas = require("../deleteTodo");
			// calling the handler
			const result : APIGatewayProxyResult = await lambdas.handler(testEvent);

			// Assertions
			assert.equal(getUserIdStub.calledOnce, true);
			assert.equal(deleteTodoStub.calledOnce, true);
			assert.equal(result.statusCode, 201);
			assert.equal(result.body, '');
		}); 
	});

	describe("when a todo was deleted with with an unsuspected todoId", function () {
		it("shall respond with a 500, Internal Server Error, and an empty body ", async function () {
			const spectialTestTodoItem = {
				userId: "123",
				todoId: 911,
				createdAt: '2020-01-01',
				name: 'nevermind',
				dueDate: '2020-01-02',
				done: false
			}

			getUserIdStub.returns("123");
			deleteTodoStub.returns(Promise.resolve(spectialTestTodoItem));

			// embedded require to be able to mock createLogger
			const lambdas = require("../deleteTodo");
			// calling the handler
			const result : APIGatewayProxyResult = await lambdas.handler(testEvent);

			// Assertions
			assert.equal(getUserIdStub.calledOnce, true);
			assert.equal(deleteTodoStub.calledOnce, true);
			assert.equal(result.statusCode, 500);
			assert.equal(result.body, '');
		}); 
	});

});
