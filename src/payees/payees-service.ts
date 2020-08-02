interface PayeesService {
  getAllPayeesBySender: (any, sender: number) => any;
  getPayeeSenderEntry: (any, sender: number, payee: number) => any;
  addPayee: (any, sender: number, payee: number) => any;
  deletePayee: (any, sender: number, payee: number) => any;
}

const payeesService: PayeesService = {
  getAllPayeesBySender(knex, sender) {
    return knex
      .from('payees')
      .select('*')
      .where('sender', sender);
  },
  getPayeeSenderEntry(knex, sender, payee) {
    return knex
      .from('payees')
      .select('*')
      .where('sender', sender)
      .andWhere('payee', payee);
  },
  addPayee(knex, sender, payee) {
    return knex
      .insert({sender,payee})
      .into('payees')
      .returning('*');
  },
  deletePayee(knex, sender, payee) {
    return knex
      .from('payees')
      .where({sender, payee})
      .del();
  }
};

export default payeesService;
