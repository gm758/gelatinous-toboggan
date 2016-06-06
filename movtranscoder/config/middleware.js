import morgan from 'morgan';
import bodyParser from 'body-parser';

const middleware = (app) => {
  app.use(morgan('dev'));
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }));
};

export default middleware;
