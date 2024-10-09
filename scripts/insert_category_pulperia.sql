INSERT INTO pulperia_category (pulperia_id, categorie_id)
SELECT p.id, c.id
FROM pulperia p, category c
WHERE p.id IN (10,11,12,13,14,15,16);