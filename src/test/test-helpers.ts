import AuthService from '../auth/auth-service';

class TestHelpers {

  public tableGeneratorFunctions = {
    'transfers': this.generateTransfers(),
    'payees': this.generatePayees(),
    'users': this.generateUsers(),
  };

  // getAuthToken(user) => token
  public generateAuthToken(user) {
    return AuthService.createJWT(user.username, {user_id: user.id});
  }

  public dropTables(db) {
    db
      .raw(`
        DROP TABLE IF EXISTS payees cascade;
        DROP TABLE IF EXISTS transfers cascade;
        DROP TABLE IF EXISTS users cascade;
      `);
  }

  public truncateTables(db) {
    return db
      .raw(`
        truncate table payees, transfers, users cascade;
      `)
  }

  public seedTables(db, tables) {
    tables.forEach(table => {
      db
      .insert(this.tableGeneratorFunctions[table])
      .into(table)
      .returning('*')
      .then((data) => data);
    });
  };

  public generateTransfers() {
    return [
      {
        'id': 1,
        'date_created': new Date('2020-08-03T16:48:01.123Z'),
        'sender': 1,
        'receiver': 'testuser2',
        'amount': 2342.22,
      },
      {
        'id': 4,
        'date_created': new Date('2020-08-03T16:48:01.123Z'),
        'sender': 1,
        'receiver': 'testuser3',
        'amount': 111,
      },
      {
        'id': 2,
        'date_created': new Date('2020-08-03T16:48:01.123Z'),
        'sender': 2,
        'receiver': 'testuser1',
        'amount': 5,
      },
      {
        'id': 3,
        'date_created': new Date('2020-08-03T16:48:01.123Z'),
        'sender': 4,
        'receiver': 'testuser2',
        'amount': 88,
      },
    ];
  };

  public generatePayees() {
    return [
      {
        'sender': 1,
        'payee': 2
      },
      {
        'sender': 2,
        'payee': 3
      },
      {
        'sender': 3,
        'payee': 4
      },
      {
        'sender': 1,
        'payee': 3
      },
    ];
  };

  public generateUsers() {
    return [
      {
        'id': 1,
        'username': 'testuser',
        'password': 'password',
        'date_created': new Date('2020-08-03T16:48:01.123Z')
      },
      {
        id: 2,
        'username': 'testuser2',
        'password': 'password',
        'date_created': new Date('2020-08-03T16:48:01.123Z')
      },
      {
        id: 3,
        'username': 'testuser3',
        'password': 'password',
        'date_created': new Date('2020-08-03T16:48:01.123Z')
      },
      {
        id: 4,
        'username': 'testuser4',
        'password': 'password',
        'date_created': new Date('2020-08-03T16:48:01.123Z')
      },
    ];
  };

}

export default TestHelpers;
