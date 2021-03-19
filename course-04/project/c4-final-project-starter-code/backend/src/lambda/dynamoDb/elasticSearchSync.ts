import { createLogger } from '../../utils/logger'
import { DynamoDBStreamEvent, DynamoDBStreamHandler, AttributeValue, StreamRecord } from 'aws-lambda'
import 'source-map-support/register'
import { Client } from '@elastic/elasticsearch';

const es_client = getESClient()
const logger = createLogger('elasticSearchSync')

function getESClient() {
	if (process.env.IS_OFFLINE) {
		return new Client({ node: 'http://localhost:9200' })
	}
	return new Client({ node: process.env.ES_ENDPOINT })
}

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
  for (const record of event.Records) 
  {
    const esIndex = await getIndex(record.dynamodb)
    logger.info(`Index is ${esIndex}`)

    if(esIndex == undefined) 
    {
      logger.warn('event did not trigger an ES sync', {key: event})
      return
    }

    if (record.eventName === 'INSERT') 
    {
      logger.info('Insertion', {key: JSON.stringify(record)})
      index_todo(record.dynamodb.NewImage, esIndex)

    } else if (record.eventName === 'REMOVE') 
    {
      logger.info('Removal', {key: JSON.stringify(record)})
      remove_todo_from_index(record.dynamodb.Keys, esIndex)
    } else continue
  }
}

async function getIndex(isIndex : StreamRecord) : Promise<string> {
  // https://docs.aws.amazon.com/elasticsearch-service/latest/developerguide/es-indexing.html
  if (isIndex === undefined || isIndex.Keys === undefined || isIndex.Keys.userId === undefined) 
  {
    logger.warn('index could not be evaluated', {key: isIndex})
    return Promise.reject(undefined)
  }

  const indexName = isIndex.Keys.userId.S.toLowerCase().replace("|", "-")
  const indexCreation : string = await es_client.indices.exists({
    index: indexName
    }).then(async function (exists) 
    {
    if (!exists) 
    {
      logger.debug(`Creating index ${indexName} ...`)
      return es_client.indices.create(
        {
        index: indexName
      }).then(function (r) 
      {
        logger.debug(`Index ${indexName} created: ${r}`)
        return Promise.resolve(indexName)
      })
    } else 
    {
      logger.debug(`Index ${indexName} exists`)
      return Promise.resolve(indexName)
    }
    }).catch(function (err) 
    {
    logger.error(`Unable to create index index ${indexName} ... ${err}`)
    return Promise.reject(undefined)
    })
    logger.debug(`Result of indexCreation ${indexCreation}`)
    return indexCreation
}

async function index_todo(newItem: { [key: string]: AttributeValue; }, indexName: string) 
{
  if (newItem == undefined || newItem.todoId == undefined) {
    logger.warn('new item\'s id could not be evaluated', {key: newItem})
    return 
  }
  
  const body = 
  {
    name: newItem.name.S,
    dueDate: newItem.dueDate.S,
    createdAt: newItem.createdAt.S,
    done: newItem.done.BOOL
  }

  await es_client.index(
    {
    index: indexName,
    type: 'todos',
    id: newItem.todoId.S,
    body
  })

  // here we are forcing an index refresh, otherwise we will not
  // get any result in a subsequent search
  await es_client.indices.refresh({ index: indexName })
}

async function remove_todo_from_index(obsoleteItem: { [key: string]: AttributeValue; }, indexName : string) {
  if (obsoleteItem == undefined || obsoleteItem.todoId == undefined) {
    logger.warn('obsolete item\'s id could not be evaluated', {key: obsoleteItem})
    return 
  }

  const todoId : string = obsoleteItem.todoId.S;
  
  logger.debug('Id to be removed', {key: todoId})
  await es_client.delete({
    index: indexName,
    type: 'todos',
    id: todoId
  })

  // here we are forcing an index refresh, otherwise we will not
  // get any result in a subsequent search
  await es_client.indices.refresh({ index: indexName })
}


// const indexName : string = newItem.userId.S.replace("|", "-")
// es_client.indices.exists({
//   index: indexName
//  }).then(async function (exists) {
//   if (!exists) {
//     logger.debug(`Creating index ${indexName} ...`)
//     return es_client.indices.create({
//       index: indexName
//     }).then(function (r) {
//       logger.info(`Index ${indexName} created: ${r}`)
//       return Promise.resolve(r)
//     })
//   } else {
//     logger.debug(`Index ${indexName} exists`)
//     return Promise.resolve("fsd")
//   }
//  }).catch(function (err) {
//   logger.error(`Unable to create index index ${indexName} ... ${err}`)
//   return Promise.reject(err)
//  })