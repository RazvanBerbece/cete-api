// IMPORTS
// ==========================================================================================
import express from 'express';
import bodyParser from 'body-parser';
import Response from './models/Response/Response';

// EXPRESS APP CONFIGURATION
// ==========================================================================================
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 

// SERVER CONNECTION DETAILS
// ==========================================================================================
const PORT = process.env.PORT || 5050;

// API ROUTES
// ==========================================================================================
const router = express.Router();
router.get('/', (req, res) => {
    res.json(
        new Response(200, new Date().toLocaleString(), '/api/v1/', { message: `Server listening on port ${PORT}` })
    );
})

// REGISTER ROUTES
// prefix with /api/v1
// ==========================================================================================
app.use('/api/v1', router);

// RUN SERVER
// ==========================================================================================
app.listen(PORT);