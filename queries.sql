CREATE TABLE chats
(
    id     VARCHAR(255) NOT NULL,
    date   DATETIME     NOT NULL,
    offer  TEXT,
    answer TEXT,
    PRIMARY KEY (id)
);

REPLACE INTO chats (id, date, offer, answer) VALUES (%s, %s, %s, %s);

SELECT * FROM chats WHERE id = %s;

DELETE FROM chats WHERE id = %s;

DROP TABLE chats;
