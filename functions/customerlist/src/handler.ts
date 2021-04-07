import type { APIGatewayProxyResult } from 'aws-lambda';

// Import required AWS SDK clients and commands for Node.js
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({});
export default async (): Promise<APIGatewayProxyResult> => {
  const response = await client.send(new ScanCommand({ TableName: 'Customers' }));
  const results = (response.Items || [])
    .map(({ customer_data }) => customer_data || { S: '{}' })
    .map(({ S }) => S || '{}')
    .map((data) => JSON.parse(data));
  return { statusCode: 200, body: JSON.stringify(results) };
};
