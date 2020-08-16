interface TransfersService {
  getAllTransfersTotal: (any) => any;
  getTransfersByUser: (any, user: number) => any;
  createTransfer: (any, object) => any;
}

const transfersService: TransfersService = {
  getAllTransfersTotal(knex) {
    return knex.raw(`
        SELECT sum(amount) as total, count(*) as count
        FROM transfers;
      `)
  },
  getTransfersByUser(knex, user) {
    return knex
      .from('transfers')
      .select('*')
      .where('sender', user)
      .orWhere('receiver', user);
  },
  createTransfer(knex, transfer) {
    const {sender, receiver, amount} = transfer;

    return knex
      .insert(transfer)
      .into('transfers')
      .returning('*')
      .then(([transfer]) => transfer);
  }
}

export default transfersService;
