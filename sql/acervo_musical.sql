CREATE DATABASE IF NOT EXISTS acervo_musical;
USE acervo_musical;

CREATE TABLE IF NOT EXISTS artistas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  tipo VARCHAR(100) NOT NULL,
  ano INT NOT NULL
);

INSERT INTO artistas (nome, tipo, ano) VALUES
  ('Legião Urbana', 'Banda', 1982),
  ('Marisa Monte', 'Artista', 1985),
  ('Os Paralamas do Sucesso', 'Banda', 1982);
