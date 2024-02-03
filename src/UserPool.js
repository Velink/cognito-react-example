import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: 'eu-west-2_Msf9RQgEz',
  ClientId: '7bkdpkqno63tfe0706n5sb705s'
};

export default new CognitoUserPool(poolData);