-- Script de seed: limpa e insere itens do inventário
-- Categorias: Câmeras/Filmadoras, Microfones, Pedestais, Notebooks, Caixas de Som, Projetores, Telas de Projeção
-- Executar: docker exec postgres_db psql -U admin -d inventory -f /scripts/seed_items.sql

DELETE FROM reserve_items;
DELETE FROM reservations;
DELETE FROM items;

INSERT INTO items (name, description, tombamento, status, state, reserved_date) VALUES

-- =====================
-- CÂMERAS / FILMADORAS
-- =====================
('Câmera Superzoom 60x', 'Câmera fotográfica digital superzoom 60x, Nikon', '2018002805', 'ON_ROOM', 'AVAILABLE', NULL),
('Câmera Superzoom 60x', 'Câmera fotográfica digital superzoom 60x, Nikon', '2017041878', 'ON_ROOM', 'AVAILABLE', NULL),
('Câmera Superzoom 60x', 'Câmera fotográfica digital superzoom 60x, Nikon', '2018000334', 'ON_ROOM', 'AVAILABLE', NULL),
('Câmera Superzoom 26x', 'Câmera fotográfica digital superzoom 26x, Sony Cyber-Shot DSC', '2018034647', 'ON_ROOM', 'AVAILABLE', NULL),
('Câmera Digital 7.2MP', 'Câmera fotográfica digital compacta 7.2 megapixels, Sony', '2016001290', 'ON_ROOM', 'AVAILABLE', NULL),
('Câmera Digital 7.2MP', 'Câmera fotográfica digital compacta 7.2 megapixels, Kodak', '2009048938', 'ON_ROOM', 'AVAILABLE', NULL),
('Câmera Digital Semi-Profissional', 'Câmera fotográfica digital semi-profissional, modelo SP800UZ', '2011013256', 'ON_ROOM', 'AVAILABLE', NULL),
('Filmadora Full HD', 'Filmadora digital Handycam Full HD, Sony', '2011059639', 'ON_ROOM', 'AVAILABLE', NULL),
('Filmadora Full HD', 'Filmadora digital Handycam Full HD, Sony', '2011059640', 'ON_ROOM', 'AVAILABLE', NULL),
('Filmadora Full HD 16GB', 'Filmadora digital Handycam Full HD com 16GB de armazenamento interno, Sony HDR-CX260V', '2014064769', 'ON_ROOM', 'AVAILABLE', NULL),
('Filmadora HDD', 'Filmadora digital com armazenamento em disco rígido (HDD), Sony', '2011004198', 'ON_ROOM', 'AVAILABLE', NULL),

-- ============
-- MICROFONES
-- ============
('Microfone Dinâmico', 'Microfone dinâmico para uso em eventos e apresentações', '2003003471', 'ON_ROOM', 'AVAILABLE', NULL),
('Microfone Dinâmico', 'Microfone dinâmico para uso em eventos e apresentações', '2003003472', 'ON_ROOM', 'AVAILABLE', NULL),
('Microfone Dinâmico', 'Microfone dinâmico para uso em eventos e apresentações', '2003003473', 'ON_ROOM', 'AVAILABLE', NULL),
('Microfone Dinâmico', 'Microfone dinâmico para uso em eventos e apresentações', '2003003474', 'ON_ROOM', 'AVAILABLE', NULL),
('Microfone Cardioide com Fio', 'Microfone cardioide dinâmico com fio, padrão cardioide para voz e apresentações, IYCO', '2012064886', 'ON_ROOM', 'AVAILABLE', NULL),

-- ============
-- PEDESTAIS
-- ============
('Pedestal de Mesa', 'Pedestal articulado de mesa para microfone, Visão', '2013008598', 'ON_ROOM', 'AVAILABLE', NULL),
('Pedestal de Mesa', 'Pedestal articulado de mesa para microfone, Visão', '2013008599', 'ON_ROOM', 'AVAILABLE', NULL),
('Pedestal de Mesa', 'Pedestal articulado de mesa para microfone, Visão', '2013008600', 'ON_ROOM', 'AVAILABLE', NULL),

-- ============
-- NOTEBOOKS
-- ============
('Notebook HP 6455B', 'Notebook executivo HP modelo 6455B para uso administrativo e multimídia', '2012022603', 'ON_ROOM', 'AVAILABLE', NULL),
('Notebook HP Avançado', 'Notebook de alto desempenho Hewlett Packard, perfil avançado para trabalho intensivo', '2017007742', 'ON_ROOM', 'AVAILABLE', NULL),
('Notebook Lenovo Administrativo', 'Notebook Lenovo para uso administrativo, perfil Tipo I', '2018006875', 'ON_ROOM', 'AVAILABLE', NULL),
('Notebook HP Executivo', 'Notebook executivo Hewlett Packard para uso em campo e apresentações', '2015010651', 'ON_ROOM', 'AVAILABLE', NULL),
('Notebook HP Executivo', 'Notebook executivo Hewlett Packard para uso em campo e apresentações', '2015010652', 'ON_ROOM', 'AVAILABLE', NULL),
('Notebook Lenovo ThinkPad B490', 'Notebook Lenovo ThinkPad B490 14 polegadas para uso administrativo e desenvolvimento', '2015020517', 'ON_ROOM', 'AVAILABLE', NULL),
('Notebook HP Executivo', 'Notebook executivo Hewlett Packard para uso em campo e apresentações', '2015039515', 'ON_ROOM', 'AVAILABLE', NULL),

-- ================
-- CAIXAS DE SOM
-- ================
('Caixa de Som Portátil', 'Caixa de som portátil com alça e rodas para transporte, AMVOX ACA-280', '2018026593', 'ON_ROOM', 'AVAILABLE', NULL),
('Caixa de Som Portátil', 'Caixa de som portátil com alça e rodas para transporte, AMVOX ACA-280', '2018026594', 'ON_ROOM', 'AVAILABLE', NULL),
('Caixa de Som Portátil', 'Caixa de som portátil com alça e rodas para transporte, AMVOX ACA-280', '2018026595', 'ON_ROOM', 'AVAILABLE', NULL),
('Caixa de Som Amplificada', 'Caixa de som amplificada para eventos e apresentações, ONEAL', '2011036908', 'ON_ROOM', 'AVAILABLE', NULL),

-- ============
-- PROJETORES
-- ============
('Projetor Multimídia Wireless', 'Projetor multimídia com conectividade wireless, Epson', '2018020703', 'ON_ROOM', 'AVAILABLE', NULL),
('Projetor Multimídia HDMI/VGA', 'Projetor multimídia com entradas HDMI e VGA, Epson', '2022000373', 'ON_ROOM', 'AVAILABLE', NULL),
('Projetor Multimídia HDMI/VGA', 'Projetor multimídia com entradas HDMI e VGA, Epson', '2022000376', 'ON_ROOM', 'AVAILABLE', NULL),
('Projetor para Sala de Aula', 'Projetor multimídia para uso em sala de aula, NEC VT695', '2009048380', 'ON_ROOM', 'AVAILABLE', NULL),
('Projetor para Sala de Aula', 'Projetor multimídia para uso em sala de aula, Epson', '2010048921', 'ON_ROOM', 'AVAILABLE', NULL),
('Projetor para Sala de Aula', 'Projetor multimídia para uso em sala de aula, Epson 1220', '2011046164', 'ON_ROOM', 'AVAILABLE', NULL),

-- ====================
-- TELAS DE PROJEÇÃO
-- ====================
('Tela de Projeção', 'Tela para projeção de imagens, Nardelli', '2009022530', 'ON_ROOM', 'AVAILABLE', NULL),
('Tela de Projeção Retrátil com Tripé', 'Tela de projeção retrátil 240x180cm com tripé para uso em eventos e salas de aula, Cineflex CRT 007', '2015041563', 'ON_ROOM', 'AVAILABLE', NULL);