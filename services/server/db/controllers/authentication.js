import jwt from 'jwt-simple';
import { AUTH_SECRET } from '../../config/config.js';

// sub: subject property
const tokenForUser = (email) => {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: email, iat: timestamp }, AUTH_SECRET);
}

export default {
  tokenForUser,
}
