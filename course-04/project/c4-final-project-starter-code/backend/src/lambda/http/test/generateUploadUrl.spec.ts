import { APIGatewayProxyResult } from 'aws-lambda'
import { testEvent, createLogger, validUserId } from './test_utils.test'

const async = require('async')
const assert = require("assert");
const sinon = require("sinon");

const todos = require('../../../businessLogic/todos');
const logger = require('../../../utils/logger');
const utils = require('../../utils');

describe("generateUploadUrl", function () {
	let getUserIdStub;
	let todoExists;
	let signUrl;
	let setImageUrl;
  let createLoggerStub;

	beforeEach(function () {
		getUserIdStub = sinon.stub(utils, "getUserId");
		todoExists = sinon.stub(todos, "todoExists");
		signUrl = sinon.stub(todos, "signUrl");
		setImageUrl = sinon.stub(todos, "setImageUrl");
    createLoggerStub = sinon.stub(logger, "createLogger").returns(createLogger('generateUploadUrl'));
	});

	afterEach(function () {
		getUserIdStub.restore();
		todoExists.restore();
		signUrl.restore();
		setImageUrl.restore();
    createLoggerStub.restore();
	});

	describe("when the user id is invalid", function () {
		it("respond with a 401, 'User is not authorized'", async function () {
			getUserIdStub.returns(undefined);

			// embedded require to be able to mock createLogger
			const lambdas = require("../updateTodo");
			// calling the handler
			const result : APIGatewayProxyResult = await lambdas.handler(testEvent);

			// Assertions
			assert.equal(getUserIdStub.calledOnce, true);
			assert.equal(result.statusCode, 401);
			assert.equal(result.body, JSON.stringify({error: 'User is not authorized'}));
		});
	});

	async.each([false], function(isValidTodo) {
		describe("when the todo does not exist", function () {
			it("respond with a 404, Not Found, and 'Todo does not exist'", async function () {
				getUserIdStub.returns(validUserId);
				todoExists.returns(Promise.resolve(isValidTodo));

				// embedded require to be able to mock createLogger
				const lambdas = require("../generateUploadUrl");
				// calling the handler
				const result : APIGatewayProxyResult = await lambdas.handler(testEvent);

				// Assertions
				assert.equal(getUserIdStub.calledOnce, true);
				assert.equal(result.statusCode, 404);
				assert.equal(result.body, JSON.stringify({
					error: 'Todo does not exist'
				}));
			});
		});
	});

	describe("when the todo exists and a signed url was generated", function () {
		it("respond with a 201, Created, return the corresponding upload url", async function () {
			const validTodoId = '123'
			const uploadUrl = `https://aNiceBucket.s3.amazonaws.com/123456`;
			getUserIdStub.returns(validUserId);
			todoExists.returns(Promise.resolve(validTodoId));
			signUrl.returns(uploadUrl);
			setImageUrl.returns();

			// embedded require to be able to mock createLogger
			const lambdas = require("../generateUploadUrl");
			// calling the handler
			const result : APIGatewayProxyResult = await lambdas.handler(testEvent);

			// Assertions
			assert.equal(getUserIdStub.calledOnce, true);
			assert.equal(result.statusCode, 201);
			assert.equal(result.body, JSON.stringify({
				uploadUrl: uploadUrl
			}));
		});
	});

});