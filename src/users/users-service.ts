import bcrypt from 'bcryptjs';
import xss from 'xss';

interface UsersService {
  getUserById: (any, id: number) => any;
  getUserByUsername: (any, username: string) => any;
  createUser: (any, object) => any;
  hashPassword: (password: string) => Promise<string>;
  serializeCreateUser: (user: {username: string, password: string}) => {
    username: string,
    password: string
  };
  serializeGetUser: (user:
    {id: string, username: string, password: string, date_created: Date}
  ) => {
    id: string,
    username: string,
    date_created: Date,
  };
};

const usersService: UsersService = {
  getUserById(knex, id) {
    return knex
      .from('users')
      .select('*')
      .where('id', id)
      .first();
  },
  getUserByUsername(knex, username) {
    return knex
      .from('users')
      .select('*')
      .where('username', username)
      .first();
  },
  createUser(knex, user) {
    return knex
      .insert(user)
      .into('users')
      .returning('*')
      .then(([user]) => user);
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  serializeCreateUser(user) {
    const {username, password} = user;
    return {
      username: xss.escapeHtml(username),
      password: xss.escapeHtml(password)
    }
  },
  serializeGetUser(user) {
    const {id, username, password, date_created} = user;
    return {
      id,
      username: xss.escapeHtml(username),
      date_created,
    };
  },
};

export default usersService;
