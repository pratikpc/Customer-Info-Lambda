import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

// Import required AWS SDK clients and commands for Node.js
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({});
export default async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const jwt = (event.requestContext.authorizer || { jwt: { claims: {} } }).jwt;
  const claims = jwt.claims || { email: 'email' };
  const email = String(claims['email'] || 'email');

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
