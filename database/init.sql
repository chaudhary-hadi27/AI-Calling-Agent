CREATE TABLE calls (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);
