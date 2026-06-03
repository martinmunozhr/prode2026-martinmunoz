-- Reasignación de rareza por relevancia / amenaza de gol.
-- Objetivo: que la rareza sea una pista intuitiva para elegir goleadores
-- (alta rareza = candidato más probable a convertir) y que también ordene
-- la economía de figuritas. Antes de esto los 1248 jugadores eran 'comun'.
--
-- Criterio:
--   legendario  estrellas / goleadores reconocibles (≥1 por selección, varios en potencias)
--   epico       delanteros (DEL)
--   raro        mediocampistas (MED)
--   comun       defensores (DEF) + arqueros (POR)
--
-- Caveat: el sync de planteles (admin.functions.ts) reinserta jugadores sin
-- rareza. Si se re-importa un plantel, hay que re-correr esta migración.

-- 1) Base por posición
update players set rarity = (case position
  when 'DEL' then 'epico'
  when 'MED' then 'raro'
  else 'comun'
end)::card_rarity;

-- 2) Legendarios curados (grafía exacta de la DB)
update players set rarity = 'legendario'::card_rarity
where name in (
  'Riyad Mahrez','Mohamed Amine Amoura',
  'Lionel Messi','Lautaro Martínez','Julián Álvarez','Nicolás González',
  'Mathew Leckie',
  'Marko Arnautović',
  'Romelu Lukaku','Jeremy Doku','Leandro Trossard',
  'Edin Dzeko',
  'Vinícius Júnior','Neymar','Raphinha','Endrick','Matheus Cunha',
  'Jonathan David','Cyle Larin',
  'Nicolas Pépé','Amad Diallo','Simon Adingra',
  'Yoane Wissa',
  'Luis Díaz','Jhon Córdoba',
  'Jovane Cabral',
  'Andrej Kramarić','Ivan Perišić',
  'Tahith Chong',
  'Patrik Schick','Adam Hložek',
  'Enner Valencia','Gonzalo Plata',
  'Mohamed Salah','Omar Marmoush',
  'Lamine Yamal','Nico Williams','Ferran Torres','Dani Olmo',
  'Kylian Mbappé','Ousmane Dembélé','Marcus Thuram','Michael Olise',
  'Kai Havertz','Leroy Sané',
  'Iñaki Williams','Jordan Ayew','Antoine Semenyo',
  'Wilson Isidor',
  'Harry Kane','Bukayo Saka','Marcus Rashford','Ollie Watkins',
  'Mehdi Taremi',
  'Ali Al-Hamadi',
  'Mousa Al Tamari',
  'Ayase Ueda','Daizen Maeda',
  'Son Heung-min','Hwang Hee-chan',
  'Firas Al-Buraikan',
  'Brahim Díaz','Ayoub El Kaabi','Soufiane Rahimi',
  'Santiago Giménez','Raúl Jiménez',
  'Memphis Depay','Cody Gakpo','Donyell Malen',
  'Erling Haaland','Alexander Sørloth',
  'Chris Wood',
  'Ismael Diaz',
  'Julio Enciso','Antonio Sanabria',
  'Cristiano Ronaldo','Rafael Leão','João Félix','Gonçalo Ramos',
  'Akram Afif','Almoez Ali',
  'Lyle Foster',
  'Che Adams',
  'Sadio Mané','Nicolas Jackson','Ismaïla Sarr',
  'Breel Embolo','Dan Ndoye',
  'Alexander Isak','Viktor Gyökeres','Anthony Elanga',
  'Elias Saad',
  'Arda Güler','Kenan Yıldız','Kerem Aktürkoğlu',
  'Darwin Núñez',
  'Christian Pulisic','Folarin Balogun','Ricardo Pepi',
  'Eldor Shomurodov'
);
