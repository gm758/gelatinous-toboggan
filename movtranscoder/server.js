/* eslint no-console: [2, { allow: ["log", "warn", "error"] }] */
import express from 'express';
import middleware from './config/middleware';
import routes from './config/routes';


const app = express();
middleware(app, express);
routes(app, express);

// start listening to requests on port 8000
const port = Number(process.env.PORT || 8001);
app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});


// export our app for testing and flexibility, required by index.js
export default app;
