class TestHelpers {

  public tableGeneratorFunctions = {
    'transfers': this.generateTransfers(),
    'payees': this.generatePayees(),
    'users': this.generateUsers(),
  };

  public truncateTables(db, tables) {
    tables.forEach(table => {
      db
        .raw(`truncate ${table}`)
        .then(() => {});
    });
  };

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
        'receiver': 2,
        'amount': 2342.22,
      },
      {
        'id': 4,
        'date_created': new Date('2020-08-03T16:48:01.123Z'),
        'sender': 1,
        'receiver': 3,
        'amount': 111,
      },
      {
        'id': 2,
        'date_created': new Date('2020-08-03T16:48:01.123Z'),
        'sender': 2,
        'receiver': 1,
        'amount': 5,
      },
      {
        'id': 3,
        'date_created': new Date('2020-08-03T16:48:01.123Z'),
        'sender': 4,
        'receiver': 2,
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
        'sender': 1,
        'payee': 2
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
