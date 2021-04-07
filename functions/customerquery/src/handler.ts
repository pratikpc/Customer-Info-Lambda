import type {
  APIGatewayEventRequestContextWithAuthorizer,
  APIGatewayProxyResultV2,
} from 'aws-lambda';

// Import required AWS SDK clients and commands for Node.js
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({});
export default async (
  _event: never,
  context: APIGatewayEventRequestContextWithAuthorizer<any>
): Promise<APIGatewayProxyResultV2> => {
  const email = (context.authorizer || { email: 'email' }).email || 'email';
  const response = await client.send(
    new QueryCommand({
      TableName: 'Customers',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': { S: email },
      },
      ProjectionExpression: 'customer_data',
      Limit: 1,
    })
  );

  const results = (response.Items || [])
    .map(({ customer_data }) => customer_data || { S: '{}' })
    .map(({ S }) => S || '{}')
    .map((data) => JSON.parse(data));

  if (results.length === 0) return { statusCode: 404, body: '{}' };
  return { statusCode: 200, body: JSON.stringify(results) };
};
