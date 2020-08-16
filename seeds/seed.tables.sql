INSERT INTO users (username, password)
VALUES
  ('user123', 'password123'),
  ('user124', 'password124'),
  ('user125', 'password125'),
  ('user126', 'password126'),
  ('user127', 'password127');

INSERT INTO transfers (sender, receiver, amount)
VALUES
  (1, 2, 234.22),
  (1, 4, 2828.22),
  (2, 3, 24.22),
  (4, 1, 4.22),
  (1, 5, 2.22);

INSERT INTO payees (sender, receiver)
VALUES
  (1, 2),
  (4, 2),
  (1, 3),
  (3, 2),
  (2, 5);
