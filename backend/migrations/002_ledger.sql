CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 40),
  type       TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX categories_user_type_name_unique
  ON categories (user_id, type, lower(name));


CREATE TABLE transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id),
  amount      NUMERIC(12,2) NOT NULL CHECK (amount > 0 AND amount < 1000000000),
  note        TEXT NOT NULL DEFAULT '' CHECK (char_length(note) <= 200),
  occurred_on DATE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX transactions_user_date_idx ON transactions (user_id, occurred_on DESC);
CREATE INDEX transactions_category_idx  ON transactions (category_id);

CREATE TABLE budgets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id   UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  monthly_limit NUMERIC(12,2) NOT NULL CHECK (monthly_limit > 0 AND monthly_limit < 1000000000),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, category_id)
);

CREATE TABLE recurring_entries (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id        UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount             NUMERIC(12,2) NOT NULL CHECK (amount > 0 AND amount < 1000000000),
  note               TEXT NOT NULL DEFAULT '' CHECK (char_length(note) <= 200),
  day_of_month       SMALLINT NOT NULL CHECK (day_of_month BETWEEN 1 AND 28),
  last_applied_month DATE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);