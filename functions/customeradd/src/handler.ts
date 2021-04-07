import type {
  APIGatewayEventRequestContextWithAuthorizer,
  APIGatewayProxyEventV2,
  APIGatewayProxyResult,
} from 'aws-lambda';

// Import required AWS SDK clients and commands for Node.js
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({});

export default async (
  event: APIGatewayProxyEventV2,
  context: APIGatewayEventRequestContextWithAuthorizer<{ email: string | undefined }>
): Promise<APIGatewayProxyResult> => {
  const email = (context.authorizer || { email: 'email' }).email || 'email';
  const results = await client.send(
    new UpdateItemCommand({
      TableName: 'Customers',
      Key: { email: { S: email } },
      ReturnValues: 'ALL_NEW',
      UpdateExpression: 'SET customer_data = :customer_data',
      ExpressionAttributeValues: { ':customer_data': { S: event.body || '{}' } },
    })
  );
  return { statusCode: 200, body: JSON.stringify(results) };
};
