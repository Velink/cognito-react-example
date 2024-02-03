import React, { useState } from "react";
import { CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import UserPool from "../UserPool";

export default () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
  
    const user = new CognitoUser({
      Username: email,
      Pool: UserPool,
    });
  
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });
  
    user.authenticateUser(authDetails, {
      // ... (other callbacks)
      onSuccess: async (data) => {
        console.log("onSuccess:", data);

        // Extract the idToken from the authentication result
        const idToken = data.getIdToken().getJwtToken();
        console.log(idToken);
        // // Example API Gateway URL
        const apiGatewayUrl = "https://jvjqgujhfb.execute-api.eu-west-2.amazonaws.com/cognito-stage/login";

        // Make a fetch request to the API Gateway using the JWT token
        try {
          const response = await fetch(apiGatewayUrl, {
            method: "POST", // or "POST" or other HTTP methods
            headers: {
              Authorization: idToken,
              // Add other headers as needed
            },
          });

          const apiResponse = await response.json();
          console.log("API Response:", apiResponse);
        } catch (error) {
          console.error("Error making API request:", error);
        }
      },

      onFailure: err => {
        console.error("onFailure:", err);
      },
  
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        console.log("newPasswordRequired:", userAttributes, requiredAttributes);
  
        // Filter out non-writable attributes
        const writableAttributes = Object.entries(userAttributes).reduce((acc, [key, value]) => {
          if (requiredAttributes.includes(key)) {
            acc[key] = value;
          }
          return acc;
        }, {});
  
        // Complete new password challenge
        handleNewPassword(user, password, writableAttributes);
      },
    });
  };
  
  const handleNewPassword = (user, newPassword, sessionUserAttributes) => {
    user.completeNewPasswordChallenge(newPassword, sessionUserAttributes, {
      onSuccess: (result) => {
        console.log("Password changed successfully:", result);
      },
      onFailure: (err) => {
        console.error("Change password error:", err);
      },
    });
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button type="submit">Login</button>
      </form>
    </div>
  );
};