-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tombamento VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL,
    reserved_date DATE
);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
    id BIGSERIAL PRIMARY KEY,
    responsible VARCHAR(255) NOT NULL,
    requester VARCHAR(255) NOT NULL,
    reservation_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'AGUARDANDO_ACAUTELAMENTO',
    status_updated_by_name VARCHAR(255)
);

-- Reservation to Items join table
CREATE TABLE IF NOT EXISTS reserve_items (
    reservation_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    PRIMARY KEY (reservation_id, item_id),
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);
