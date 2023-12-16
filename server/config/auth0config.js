import {auth} from 'express-oauth2-jwt-bearer'

const jwtCheck = auth({
    audience: "http://localhost:8000",
    issuerBaseURL: "https://dev-rxfy3ialsh7twjr7.us.auth0.com", 
})

export default jwtCheck;

