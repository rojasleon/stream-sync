import { User } from '@/entity/user';
import { DatabaseManager } from '@/services/db';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

export const handler: APIGatewayProxyHandlerV2 = async (_, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const db = await DatabaseManager.getInstance();
  const count = await db.manager.getRepository(User).count();

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Counted users',
      data: {
        count
      }
    }),
    headers: { 'Content-Type': 'application/json' }
  };
};
