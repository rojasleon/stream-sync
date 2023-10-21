import {
  batcherTransform,
  dynamoInserterTransform,
  generateUserStream
} from '@/utils';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { pipeline } from 'stream/promises';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    if (!process.env.USER_TABLE_NAME) {
      throw new Error('USER_TABLE_NAME is not defined');
    }

    const body = JSON.parse(event.body || '{}');

    const totalUsers = body.totalUsers || 1000;
    const batchSize = 25;

    await pipeline(
      generateUserStream(totalUsers),
      batcherTransform(batchSize),
      // TODO: Get the unprocessed items and retry them using a sqs queue.
      dynamoInserterTransform(process.env.USER_TABLE_NAME)
    );

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Bulk user creation went well'
      })
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message })
    };
  }
};
