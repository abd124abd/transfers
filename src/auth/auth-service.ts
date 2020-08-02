import bcrypt from 'bcryptjs';
import {sign, verify} from 'jsonwebtoken';
import config from '../config';

const {JWT_SECRET, JWT_EXPIRY} = config;

interface AuthService {
  getUserByUsername: (any, username: string) => any;
  comparePasswords: (password: string, hash: string) => Promise<boolean>;
  createJWT: (username: string, payload: {user_id: string}) => string;
  verifyJWT: (token: string) => any;
};

const authService: AuthService = {
  getUserByUsername(knex, username) {
    return knex
      .from('users')
      .select('*')
      .where('username', username)
      .first();
  },
  comparePasswords(password, hash) {
    return bcrypt.compare(password, hash);
  },
  createJWT(subject, payload) {
    return sign(payload, JWT_SECRET, {
      subject,
      expiresIn: JWT_EXPIRY,
      algorithm: "HS256"
    });
  },
  verifyJWT(token) {
    return verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });
  }
};

export default authService;
