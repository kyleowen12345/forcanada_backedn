import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import user from './routes/user.js'
import helmet from 'helmet'
import cors from 'cors';




dotenv.config()


const app = express()

const corsOptions = {
	origin: process.env.PUBLIC_URL,
	optionsSuccessStatus: 200, // For legacy browser support
	// method: "GET, POST, DELETE,",
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(helmet({ contentSecurityPolicy: (process.env.NODE_ENV === 'production') ? undefined : false })) 
app.use(user)


// Database

mongoose.connect(
    process.env.MONGODB_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    () => console.log('connected to MongoDB')

)

mongoose.connection.on('error', function (err) {
	console.log('Mongoose connection error: ' + err);
  });
  
  mongoose.connection.on('disconnected', function () {
	console.log('Mongoose disconnected');
  });

// Port
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running at port:${port}`));  

