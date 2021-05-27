# Customer-Info-Lambda

Created for our college Cloud Computing pracs

## Technology used
1. AWS Lambda (to host functions)  
2. Amazon HTTP API Gateway
3. Amazon DynamoDB
4. Amazon Simple Email Service
5. Amazon S3 (for website hosting)

## SAM
The entire code is defined with the help of AWS SAM templates.  
AWS SAM templates help:-
1. Make it easy for us to visualize and understand our AWS infrastructure
2. Make it easy for us to make changes
3. Make it easy for us to change zones

## Our functions
1. Functions to support reading and writing Customer Info
2. Function to send emails to new customers (uses DynamoDB to trigger function which sends email)

## Why Firebase Auth?
1. Most users would already have Google Account
2. Firebase makes it easy to use Google Auth
3. Firebase Auth is free
4. Firebase Auth is easy to integrate.  
For further details, check @pratikpc's [article](https://aws.plainenglish.io/using-firebase-authentication-with-aws-lambda-api-gateway-sam-ccb27fd9547b)

## Frontend
1. Our frontend is written in React
2. Uses GitHub Actions to deploy to Amazon S3 Web Hosting and GitHub Pages

## Members
1. @pratikpc
2. @RahimChunara
