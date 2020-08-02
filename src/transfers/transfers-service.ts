interface TransfersService {
  getAllTransfersTotal: (any) => any;
  getTransfersByUser: (any, user: number) => any;
  createTransfer: (any, object) => any;
}

const transfersService: TransfersService = {
  getAllTransfersTotal(knex) {
    return knex
      .from('transfers')
      .sum('amount')
      .first();
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
