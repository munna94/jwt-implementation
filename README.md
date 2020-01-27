# jwt-token-validation
full implementation of jwt
1. user can register with signup details
2. user can login 
3. once user logged in successfully 
4. after login user will be able to generate token
5. with the generated token now user can fetch any resources from server
6. when user logged out then that token will be invalidate 
7. and also there is auto expiry of token after 15 minutes

for session management I have used REDIS b/c of low latency

