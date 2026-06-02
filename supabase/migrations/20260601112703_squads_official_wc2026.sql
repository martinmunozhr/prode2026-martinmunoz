-- ============================================================
-- Official WC 2026 squads migration
-- 1) Fix position constraint: GK/MID/FWD → POR/MED/DEL (matches frontend)
-- 2) Add description column to teams
-- 3) Seed all team descriptions
-- 4) Seed official 26-player squads for all 48 teams
-- ============================================================

-- 1. Fix position constraint
ALTER TABLE public.players DROP CONSTRAINT IF EXISTS players_position_check;
ALTER TABLE public.players
  ADD CONSTRAINT players_position_check CHECK (position IN ('POR','DEF','MED','DEL'));

-- 2. Add description to teams
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS description TEXT;

-- 3. Team descriptions (tactical intro text)
UPDATE public.teams SET description = 'El proyecto futbolístico liderado por Julian Nagelsmann se presenta en Norteamérica con un enfoque táctico profundamente arraigado en la ocupación racional de los espacios y la fluidez posicional. Nagelsmann ha configurado una lista que prescinde en gran medida de referentes estáticos en el área, apostando por la movilidad de piezas como Kai Havertz y la irrupción desde la segunda línea de volantes creativos como Florian Wirtz y Jamal Musiala. El retorno de Manuel Neuer al arco, recuperando su estatus de titular indiscutido por encima del solvente Oliver Baumann, subraya la intención de mantener una salida de balón inmaculada desde la primera fase de construcción. A nivel defensivo, la inclusión de talento joven como Nathaniel Brown sugiere una búsqueda constante de amplitud y profundidad en los carriles exteriores. La presencia de Leon Goretzka, evaluado por el cuerpo técnico como una opción polivalente capaz de operar incluso como mediapunta, refleja la versatilidad exigida para este torneo.' WHERE id = 'ger';

UPDATE public.teams SET description = 'La selección argelina llega a la cita mundialista bajo la dirección técnica de Vladimir Petković, quien ha estructurado un equipo balanceado entre veteranos de mil batallas y jóvenes prospectos del fútbol europeo. Riyad Mahrez, capitán indiscutido y portador de 113 internacionalidades, lidera la ofensiva junto a figuras dinámicas como Amine Gouiri y Mohamed Amoura. La defensa recae sobre la inmensa experiencia de Aïssa Mandi, el jugador con más presencias en la historia de su país, asegurando la solvencia táctica en la línea de fondo.' WHERE id = 'alg';

UPDATE public.teams SET description = 'La escuadra campeona defensora se presenta con la firme intención de revalidar su corona, exhibiendo una plantilla donde Lionel Scaloni ha ejecutado una transición generacional casi imperceptible pero altamente efectiva. El núcleo histórico se mantiene con Lionel Messi, Nicolás Otamendi y Emiliano Martínez, garantizando liderazgo y manejo de los tiempos en instancias definitorias. La convocatoria destaca por la infusión de jóvenes talentos como Valentín Barco, Nico Paz y Thiago Almada. El eje del equipo sigue siendo su medular de posesión y presión asfixiante, apoyada en el despliegue técnico y físico de Enzo Fernández, Rodrigo De Paul y Alexis Mac Allister.' WHERE id = 'arg';

UPDATE public.teams SET description = 'El conjunto oceánico compite en Norteamérica tras refinar su habitual modelo de intensidad física con una mayor cuota de sofisticación táctica. La selección cuenta con mediocampistas curtidos en dinámicas de alta fricción en Europa, particularmente en Escocia e Inglaterra, como Jackson Irvine y Cammy Devlin. La inclusión de la joven promesa Nestory Irankunda añade un factor de imprevisibilidad y desborde por los costados, proveyendo al equipo de recursos vitales para vulnerar repliegues profundos.' WHERE id = 'aus';

UPDATE public.teams SET description = 'El combinado austríaco llega como uno de los máximos exponentes del Gegenpressing en el escenario internacional, modelado a imagen y semejanza de su entrenador Ralf Rangnick. Su plantilla oficial está profundamente influenciada por la Bundesliga alemana, otorgándole una identidad de transiciones veloces y rigor táctico inflexible. Rangnick ha potenciado al equipo asegurando talentos de doble nacionalidad como Carney Chukwuemeka y Paul Wanner. Liderados desde el fondo por David Alaba y en ofensiva por su goleador histórico Marko Arnautović, Austria buscará traducir su intensidad en dominio sostenido.' WHERE id = 'aut';

UPDATE public.teams SET description = 'La selección belga se encuentra en la última etapa de transición de su afamada generación dorada bajo la batuta táctica de Rudi Garcia. Pilares fundacionales como Kevin De Bruyne, Romelu Lukaku y Thibaut Courtois se mantienen como el núcleo que define la jerarquía del equipo. La nómina evidencia un recambio importante en la línea defensiva, integrando perfiles jóvenes como Zeno Debast y Arthur Theate. Ofensivamente, la explosividad de Jeremy Doku por los costados se erige como el mecanismo principal para desarticular zagas cerradas.' WHERE id = 'bel';

UPDATE public.teams SET description = 'El equipo europeo presenta una estructura táctica profundamente fundamentada en el equilibrio y el orden físico. La ofensiva bosnia recae nuevamente en la figura incombustible de Edin Džeko, un finalizador de garantías absolutas escoltado por Ermedin Demirović, delantero de brillante actualidad en el fútbol alemán. El éxito de Bosnia dependerá críticamente de su eficiencia en jugadas a balón parado y de mantener bloques compactos de baja penetración.' WHERE id = 'bih';

UPDATE public.teams SET description = 'La Canarinha aterriza en Norteamérica arrastrando la perpetua obligación de alzarse con el título. La nómina brasileña expone un inmenso arsenal ofensivo sustentado por una zaga de primerísima línea europea. En los carriles ofensivos, el talento es abrumador: Vinícius Júnior, Raphinha y la joya emergente Endrick ofrecen variables inagotables para desarticular cualquier cerrojo rival. El mediocampo de contención, liderado por Casemiro y Bruno Guimarães, proveerá el balance necesario en un equipo de naturaleza vertical y agresiva.' WHERE id = 'bra';

UPDATE public.teams SET description = 'En un hito histórico para la nación insular, Cabo Verde disputará su primera Copa del Mundo. La confección de su lista definitiva denota la consolidación de un programa futbolístico que ha madurado vertiginosamente en los últimos ciclos continentales africanos. El núcleo del equipo está integrado por trotamundos del fútbol europeo de ligas intermedias. El arquero Vozinha será la figura de resiliencia desde el fondo para un equipo que buscará incomodar desde la solidaridad táctica y las salidas rápidas.' WHERE id = 'cpv';

UPDATE public.teams SET description = 'Actuando en condición de coanfitrión, Canadá llega al torneo respaldada por lo que su técnico Jesse Marsch ha catalogado como la plantilla más profunda y talentosa en la historia del país. El plantel refleja un crecimiento geométrico. Alphonso Davies funge como el motor anímico y generador primario de ventajas por la banda izquierda, mientras Tajon Buchanan y Jonathan David garantizan una verticalidad letal de cara a portería.' WHERE id = 'can';

UPDATE public.teams SET description = 'Bajo la impecable gestión táctica de Néstor Lorenzo, Colombia ha forjado una identidad de juego armónica que fusiona el clásico trato depurado del balón sudamericano con la agresividad defensiva del balompié moderno. James Rodríguez y Juan Fernando Quintero son los cerebros designados para gobernar los hilos del partido. Esta plataforma sólida permite liberar el instinto explosivo de Luis Díaz y Jhon Córdoba en el frente de ataque.' WHERE id = 'col';

UPDATE public.teams SET description = 'El combinado surcoreano confía su suerte a una de las generaciones con mayor rodaje en las principales ligas del mundo, cimentando su esquema sobre dos pilares de clase mundial: Kim Min-jae como garante de la seguridad defensiva y Son Heung-min como el eje resolutivo absoluto en ataque. Su convocatoria destaca por tener alternativas versátiles capaces de adaptarse a transiciones defensivas vertiginosas sin perder contundencia arriba.' WHERE id = 'kor';

UPDATE public.teams SET description = 'Llegando con el impulso anímico de sus recientes éxitos continentales, Costa de Marfil exhibe una plantilla majestuosamente balanceada entre el físico imponente y la técnica exquisita. El eje central conformado por Franck Kessié e Ibrahim Sangaré es uno de los más dominantes del torneo en términos de recuperación y fricción. En el último tercio, la convocatoria apuesta fuerte por la agilidad perimetral de Amad Diallo y Nicolas Pépé para destrozar formaciones conservadoras.' WHERE id = 'civ';

UPDATE public.teams SET description = 'El combinado checo cimienta su modelo competitivo en una filosofía de desgaste físico extremo y un dominio superlativo de las acciones a balón parado. Basando gran porcentaje de su selección en el fútbol local (Slavia y Sparta Prague), el equipo goza de una compenetración táctica que emula dinámicas de club a nivel internacional. Mediocampistas de vasto recorrido como Tomáš Souček y definidores letales como Patrik Schick otorgan carácter eminentemente combativo a esta plantilla.' WHERE id = 'cze';

UPDATE public.teams SET description = 'La escuadra balcánica se caracteriza por poseer la capacidad singular de dominar el tempo psicológico y técnico de los partidos. Su lista final es una clase magistral de equilibrio: preserva a leyendas del control de la posesión como Luka Modrić y Mateo Kovačić, a la par que integra músculo y velocidad con Joško Gvardiol en la defensa. Este perfil hace de Croacia una de las selecciones más cerebrales del Mundial.' WHERE id = 'cro';

UPDATE public.teams SET description = 'Transformándose en el país más pequeño en clasificar históricamente a la cita global, Curazao representa el triunfo de la diáspora y la correcta asimilación técnica. La nómina extrae su matriz genética de la Eredivisie, heredando una ineludible concepción de juego de posición y salidas en corto. La experiencia de Leandro Bacuna en el eje organizador y Jurgen Locadia en el área dotará a esta debutante de la serenidad indispensable frente al estrés mundialista.' WHERE id = 'cuw';

UPDATE public.teams SET description = 'La actual camada ecuatoriana, bautizada como su Generación Dorada, llega a Norteamérica tras unas eliminatorias soberbias bajo el mando táctico de Sebastián Beccacece. La convocatoria explota la energía incansable de Moisés Caicedo como barómetro absoluto en la medular, escoltado por la firmeza jerárquica de Piero Hincapié y Willian Pacho en el fondo. Ecuador someterá a sus adversarios con un juego directo, presión asfixiante y la definición de Enner Valencia.' WHERE id = 'ecu';

UPDATE public.teams SET description = 'El retorno de Escocia a una Copa del Mundo tras 28 años se cristaliza gracias al incansable diseño táctico de Steve Clarke. La lista de 26 jugadores evidencia un enfoque claro hacia la solidez estructural: laterales agresivos con enorme bagaje en la Premier League como Andy Robertson y Kieran Tierney funcionan simultáneamente como resortes ofensivos, mientras Scott McTominay provee contención y poderío aéreo. La escuadra escocesa priorizará el repliegue solidario y la letalidad en segundas jugadas.' WHERE id = 'sco';

UPDATE public.teams SET description = 'Luis de la Fuente ha logrado evolucionar el tradicional modelo de posesión de La Roja hacia una faceta notablemente más vertical y lacerante en campo rival. La convocatoria definitiva resguarda el control innegociable de la medular a través del genio posicional de Rodri y la clarividencia de Pedri y Fabián Ruiz, al mismo tiempo que incorpora extremos puros de velocidad indescifrable como Lamine Yamal y Nico Williams.' WHERE id = 'esp';

UPDATE public.teams SET description = 'Como coanfitrión principal y bajo la batuta de Mauricio Pochettino, el USMNT aspira a consumar el potencial de su nutrida representación europea. La lista refleja una enorme madurez competitiva: volantes poliédricos como Weston McKennie y Tyler Adams brindan el equilibrio necesario para proyectar al frente a Christian Pulisic y Folarin Balogun. El libreto táctico buscará la intensidad en transiciones ofensivas y la sobrepoblación en carriles interiores.' WHERE id = 'usa';

UPDATE public.teams SET description = 'Didier Deschamps continúa modelando al conjunto galo bajo su inquebrantable dogma de pragmatismo y brutalidad atlética. La conformación de sus 26 elegidos demuestra una renuncia consciente a la clásica figura del creador de juego central, decantándose por mediocampistas todoterreno como Tchouaméni y Kanté. El caudal de recursos en ofensiva es intimidante: el desequilibrio de Kylian Mbappé y Ousmane Dembélé obligará a las defensas rivales a retroceder sus líneas irremediablemente.' WHERE id = 'fra';

UPDATE public.teams SET description = 'El seleccionado caribeño es un caso paradigmático de la globalización del fútbol; su lista definitiva está integrada en su inmensa mayoría por elementos de la segunda línea europea y franquicias norteamericanas. Haití confiará en un esquema reactivo donde el bloque bajo y los carriles poblados buscarán frustrar a sus oponentes. La calidad individual de volantes como Jean-Ricner Bellegarde dictará la efectividad de sus transiciones.' WHERE id = 'hai';

UPDATE public.teams SET description = 'Con Thomas Tuchel empuñando el timón táctico, los Three Lions presentan un grupo rigurosamente depurado donde el pragmatismo prima sobre el romanticismo ofensivo. La fluidez del juego inglés se subordinará a la maestría de Jude Bellingham y Declan Rice, encomendando la definición a la probada letalidad de Harry Kane y las incorporaciones fulgurantes por fuera de Bukayo Saka.' WHERE id = 'ing';

UPDATE public.teams SET description = 'El constante progreso del fútbol nipón se corona en esta lista de 26 jugadores, compuesta casi en su totalidad por legionarios probados en el competitivo rigor de las ligas europeas. Hajime Moriyasu confía en una arquitectura sumamente plástica; el equipo es capaz de metamorfosearse tácticamente gracias a la versatilidad de Wataru Endo y la técnica de Daichi Kamada. El regreso del incombustible Yuto Nagatomo para disputar su histórico quinto Mundial aporta un aura de liderazgo vital.' WHERE id = 'jpn';

UPDATE public.teams SET description = 'Tras deslumbrar al orbe en 2022 con un planteamiento defensivo numantino, Marruecos parece haber modificado su matriz. La incorporación de talentos jóvenes (10 de los seleccionados tienen menos de 25 años) y jugadores extremadamente creativos como Brahim Díaz y Bilal El Khannouss augura una postura de mayor control de balón y proactividad. La permanencia de Yassine Bounou y Achraf Hakimi garantiza que la resiliencia en la retaguardia seguirá siendo un sello indeleble.' WHERE id = 'mar';

UPDATE public.teams SET description = 'Sujeto a la inmensa presión y expectativa que conlleva oficiar como sede mundialista, el estratega Javier Aguirre apeló hasta el último suspiro de tiempo permitido para confirmar a sus 26 guerreros. La nómina de México cimenta sus aspiraciones en el empuje táctico de la Liga MX, complementada por la pericia de Edson Álvarez y la fiabilidad goleadora de Santiago Giménez. Con la épica convocatoria de Guillermo Ochoa para su potencial sexto Mundial, el equipo mezcla vitalidad juvenil con jerarquía legendaria.' WHERE id = 'mex';

UPDATE public.teams SET description = 'La ansiada reaparición noruega tras más de un cuarto de siglo gravita incuestionablemente alrededor del insaciable Erling Haaland, cuyo rol forzará ajustes tácticos adversarios permanentes. El equilibrio lo provee Martin Ødegaard como arquitecto del juego entre líneas, sostenido por volantes inagotables como Sander Berge y Morten Thorsby. Perfiles creativos y jóvenes como Antonio Nusa sugieren que Noruega utilizará transiciones muy punzantes para aislar a sus delanteros en el uno contra uno.' WHERE id = 'nor';

UPDATE public.teams SET description = 'Bajo el mando técnico de Darren Bazeley, la delegación neozelandesa procura consolidar la experiencia obtenida durante los ciclos clasificatorios. El plan táctico se sostiene primordialmente en el despliegue aéreo y físico superior proporcionado por el emblemático Chris Wood. La labor del núcleo de volantes, comandado por el equilibrio de Marko Stamenić, prioriza la absorción de presión rival, forzando la verticalidad por carriles exteriores hacia el área rival.' WHERE id = 'nzl';

UPDATE public.teams SET description = 'Ronald Koeman ha delineado una plantilla profundamente afincada en la robustez y solidez de su línea retaguardia. A nivel ofensivo, Cody Gakpo y Tijjani Reijnders portan la pesada responsabilidad creativa. Este entramado busca evitar pérdidas tempranas, obligando al rival a desgastarse antes de capitalizar la movilidad letal de su delantera en momentos críticos de los partidos.' WHERE id = 'ned';

UPDATE public.teams SET description = 'Confirmando el imparable ascenso del fútbol centroamericano, Thomas Christiansen ha conformado una convocatoria que irradia tenacidad táctica. Lejos de conformarse con ser un actor de reparto, la lista de 26 jugadores evidencia un bloque que premia el trato del esférico con sentido y orden. La responsabilidad rítmica descansará en el dinámico Adalberto Carrasquilla, mientras el capitán Aníbal Godoy garantiza estructura defensiva.' WHERE id = 'pan';

UPDATE public.teams SET description = 'Retornando a una justa mundialista tras su última excursión en 1974, el cuadro congoleño dirigido por Sébastien Desabre es uno de los contendientes más atléticos e intrigantes del campeonato. La defensa central liderada por Chancel Mbemba otorga enormes resguardos estructurales. El mediocampo asfixiante funciona como catapulta natural para transiciones meteóricas lideradas por ofensivos eléctricos como Yoane Wissa y el perenne definidor Cédric Bakambu.' WHERE id = 'cod';

UPDATE public.teams SET description = 'El seleccionado sudafricano implementa un enfoque que le otorga una ventaja abrumadora en términos de química relacional interna. Una gran porción de su núcleo operativo convive deportivamente en el club Mamelodi Sundowns, lo cual genera rutinas automatizadas que las selecciones usualmente requieren meses de entrenamiento conjunto para adquirir. La plantilla prioriza el despliegue combativo de Teboho Mokoena, mientras el ritmo infernal de Lyle Foster y Evidence Makgopa desglosará las formaciones defensivas.' WHERE id = 'rsa';

UPDATE public.teams SET description = 'Bajo la nueva tutela estratégica de Graham Potter, Suecia efectúa un retorno al escenario mundial cimentado sobre una mutación de estilo evidente. Potter abandona el acérrimo fútbol reactivo histórico escandinavo a favor de la progresión fluida. En el ataque figura una de las duplas más implacables de Europa con Alexander Isak y Viktor Gyökeres. El conjunto balanceará defensores recios como Victor Lindelöf que otorguen libertades extremas a la dupla de ataque.' WHERE id = 'swe';

UPDATE public.teams SET description = 'La conformación de la selección suiza emana solidez, orden y un conocimiento quirúrgico de sus propias limitaciones y virtudes. Granit Xhaka asume funciones primarias como director orquestal, acompañado incesantemente por la disciplina de Remo Freuler en la recuperación. En su versión más dañina, Suiza absorbe pasivamente el empuje del contrario para asestar contraofensivas lideradas por el dinamismo impredecible de Breel Embolo.' WHERE id = 'sui';

UPDATE public.teams SET description = 'La escuadra tunecina reafirma en su convocatoria su profunda convicción en el fútbol de carácter táctico-defensivo. Ellyes Skhiri asume un rol fundamental garantizando coberturas e interceptaciones, liberando marginalmente a los extremos y atacantes esporádicos en contragolpes fulgurantes. La consigna es mantener bloques irrompibles para lograr la frustración psicológica del rival.' WHERE id = 'tun';

UPDATE public.teams SET description = 'La idiosincrasia combativa uruguaya se fusiona ahora con la doctrina de asfixia y desgaste perpetuo del estratega Marcelo Bielsa. Bielsa asume determinaciones implacables marginando definitivamente a ídolos perennes como Luis Suárez. La inclusión récord de 7 futbolistas compitiendo en el Brasileirão confirma el tipo de nivel físico-táctico valorado por el cuerpo técnico. La medular integrada por Federico Valverde y Manuel Ugarte asegura que Uruguay dominará las transiciones ofensivas mediante pura voracidad.' WHERE id = 'uru';

-- 4. Official 26-player squads
-- Strategy: DELETE existing players per team, then INSERT official list
-- Position values: POR (GK), DEF, MED (MID), DEL (FWD)

-- ALEMANIA (ger)
DELETE FROM public.players WHERE team_id = 'ger';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('ger','Oliver Baumann','POR','Hoffenheim',false),
('ger','Manuel Neuer','POR','Bayern Munich',false),
('ger','Alexander Nübel','POR','Stuttgart',false),
('ger','Waldemar Anton','DEF','Borussia Dortmund',false),
('ger','Nathaniel Brown','DEF','Eintracht Frankfurt',false),
('ger','Joshua Kimmich','DEF','Bayern Munich',false),
('ger','David Raum','DEF','RB Leipzig',false),
('ger','Antonio Rüdiger','DEF','Real Madrid',false),
('ger','Nico Schlotterbeck','DEF','Borussia Dortmund',false),
('ger','Jonathan Tah','DEF','Bayern Munich',false),
('ger','Malick Thiaw','DEF','Newcastle United',false),
('ger','Nadiem Amiri','MED','Mainz',false),
('ger','Leon Goretzka','MED','Bayern Munich',false),
('ger','Pascal Groß','MED','Brighton and Hove Albion',false),
('ger','Jamie Leweling','MED','Stuttgart',false),
('ger','Jamal Musiala','MED','Bayern Munich',false),
('ger','Felix Nmecha','MED','Borussia Dortmund',false),
('ger','Aleksandar Pavlovic','MED','Bayern Munich',false),
('ger','Angelo Stiller','MED','Stuttgart',false),
('ger','Florian Wirtz','MED','Liverpool',false),
('ger','Maximilian Beier','DEL','Borussia Dortmund',false),
('ger','Kai Havertz','DEL','Arsenal',false),
('ger','Lennart Karl','DEL','Bayern Munich',false),
('ger','Leroy Sané','DEL','Galatasaray',false),
('ger','Deniz Undav','DEL','Stuttgart',false),
('ger','Nick Woltemade','DEL','Newcastle United',false);

-- ARGELIA (alg)
DELETE FROM public.players WHERE team_id = 'alg';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('alg','Luca Zidane','POR','Granada',false),
('alg','Oussama Benbot','POR','USM Alger',false),
('alg','Melvin Mastil','POR','Stade Nyonnais',false),
('alg','Rafik Belghali','DEF','Hellas Verona',false),
('alg','Samir Chergui','DEF','Red Star FC',false),
('alg','Rayan Aït-Nouri','DEF','Manchester City',false),
('alg','Jaouen Hadjam','DEF','BSC Young Boys',false),
('alg','Aïssa Mandi','DEF','LOSC Lille',false),
('alg','Ramy Bensebaini','DEF','Borussia Dortmund',false),
('alg','Zineddine Belaïd','DEF','JS Kabylie',false),
('alg','Achref Abada','DEF','USM Alger',false),
('alg','Mohamed Amine Tougaï','DEF','Espérance de Tunis',false),
('alg','Nabil Bentaleb','MED','LOSC Lille',false),
('alg','Hicham Boudaoui','MED','Nice',false),
('alg','Houssem Aouar','MED','Al-Ittihad',false),
('alg','Farès Chaïbi','MED','Eintracht Frankfurt',false),
('alg','Ibrahim Maza','MED','Bayer Leverkusen',false),
('alg','Yacine Titraoui','MED','Charleroi',false),
('alg','Ramiz Zerrouki','MED','FC Twente',false),
('alg','Mohamed Amine Amoura','DEL','VfL Wolfsburg',false),
('alg','Nadhir Benbouali','DEL','Győr',false),
('alg','Adil Boulbina','DEL','Al-Duhail',false),
('alg','Farès Ghedjemis','DEL','Frosinone',false),
('alg','Amine Gouiri','DEL','Olympique de Marseille',false),
('alg','Anis Hadj Moussa','DEL','Feyenoord',false),
('alg','Riyad Mahrez','DEL','Al-Ahli',true);

-- ARGENTINA (arg)
DELETE FROM public.players WHERE team_id = 'arg';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('arg','Emiliano Martínez','POR','Aston Villa',false),
('arg','Gerónimo Rulli','POR','Marseille',false),
('arg','Juan Musso','POR','Atlético Madrid',false),
('arg','Leonardo Balerdi','DEF','Marseille',false),
('arg','Nicolás Tagliafico','DEF','Lyon',false),
('arg','Gonzalo Montiel','DEF','River Plate',false),
('arg','Lisandro Martínez','DEF','Manchester United',false),
('arg','Cristian Romero','DEF','Tottenham',false),
('arg','Nicolás Otamendi','DEF','Benfica',false),
('arg','Facundo Medina','DEF','Marseille',false),
('arg','Nahuel Molina','DEF','Atlético Madrid',false),
('arg','Leandro Paredes','MED','Boca Juniors',false),
('arg','Rodrigo De Paul','MED','Inter Miami',false),
('arg','Valentín Barco','MED','Strasbourg',false),
('arg','Giovani Lo Celso','MED','Real Betis',false),
('arg','Exequiel Palacios','MED','Bayer Leverkusen',false),
('arg','Enzo Fernández','MED','Chelsea',false),
('arg','Alexis Mac Allister','MED','Liverpool',false),
('arg','Julián Álvarez','DEL','Atlético Madrid',false),
('arg','Lionel Messi','DEL','Inter Miami',true),
('arg','Nicolás González','DEL','Atlético Madrid',false),
('arg','Thiago Almada','DEL','Atlético Madrid',false),
('arg','Giuliano Simeone','DEL','Atlético Madrid',false),
('arg','Nico Paz','DEL','Como',false),
('arg','José Manuel López','DEL','Palmeiras',false),
('arg','Lautaro Martínez','DEL','Inter Milan',false);

-- AUSTRALIA (aus)
DELETE FROM public.players WHERE team_id = 'aus';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('aus','Mathew Ryan','POR','Levante',false),
('aus','Paul Izzo','POR','Randers',false),
('aus','Thomas Beach','POR','Melbourne City',false),
('aus','Aziz Behich','DEF','Melbourne City',false),
('aus','Jordan Bos','DEF','Feyenoord',false),
('aus','Cameron Burgess','DEF','Swansea City',false),
('aus','Alessandro Circati','DEF','Parma',false),
('aus','Milos Degenek','DEF','APOEL',false),
('aus','Jason Geria','DEF','Albirex Niigata',false),
('aus','Lucas Herrington','DEF','Colorado Rapids',false),
('aus','Jacob Italiano','DEF','Grazer',false),
('aus','Harry Souttar','DEF','Leicester City',false),
('aus','Alexander Trewin','DEF','New York City',false),
('aus','Cammy Devlin','MED','Heart of Midlothian',false),
('aus','Ajdin Hrustic','MED','Heracles Almelo',false),
('aus','Jackson Irvine','MED','St Pauli',false),
('aus','Connor Metcalfe','MED','St Pauli',false),
('aus','Paul Okon-Engstler','MED','Sydney FC',false),
('aus','Aiden O''Neill','MED','New York City',false),
('aus','Nestory Irankunda','DEL','Watford',false),
('aus','Mathew Leckie','DEL','Melbourne City',false),
('aus','Awer Mabil','DEL','Castellon',false),
('aus','Mohamed Toure','DEL','Norwich City',false),
('aus','Nishan Velupillay','DEL','Melbourne Victory',false),
('aus','Cristian Volpato','DEL','Sassuolo',false),
('aus','Tete Yengi','DEL','Machida Zelvia',false);

-- AUSTRIA (aut)
DELETE FROM public.players WHERE team_id = 'aut';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('aut','Patrick Pentz','POR','Brøndby IF',false),
('aut','Alexander Schlager','POR','FC Salzburg',false),
('aut','Florian Wiegele','POR','Viktoria Plzeň',false),
('aut','David Affengruber','DEF','Elche',false),
('aut','David Alaba','DEF','Real Madrid',true),
('aut','Kevin Danso','DEF','Tottenham Hotspur',false),
('aut','Marco Friedl','DEF','Werder Bremen',false),
('aut','Philipp Lienhart','DEF','SC Freiburg',false),
('aut','Phillipp Mwene','DEF','Mainz 05',false),
('aut','Stefan Posch','DEF','Mainz 05',false),
('aut','Alexander Prass','DEF','TSG Hoffenheim',false),
('aut','Michael Svoboda','DEF','Venezia',false),
('aut','Christoph Baumgartner','MED','RB Leipzig',false),
('aut','Carney Chukwuemeka','MED','Borussia Dortmund',false),
('aut','Florian Grillitsch','MED','SC Braga',false),
('aut','Konrad Laimer','MED','Bayern München',false),
('aut','Marcel Sabitzer','MED','Borussia Dortmund',false),
('aut','Xaver Schlager','MED','RB Leipzig',false),
('aut','Nicolas Seiwald','MED','RB Leipzig',false),
('aut','Romano Schmid','MED','Werder Bremen',false),
('aut','Alessandro Schöpf','MED','Wolfsberger AC',false),
('aut','Paul Wanner','MED','PSV Eindhoven',false),
('aut','Patrick Wimmer','MED','VfL Wolfsburg',false),
('aut','Marko Arnautović','DEL','Crvena Zvezda',false),
('aut','Michael Gregoritsch','DEL','Augsburg',false),
('aut','Sasa Kalajdzic','DEL','LASK',false);

-- BÉLGICA (bel)
DELETE FROM public.players WHERE team_id = 'bel';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('bel','Thibaut Courtois','POR','Real Madrid',false),
('bel','Senne Lammens','POR','Manchester United',false),
('bel','Mike Penders','POR','Strasbourg',false),
('bel','Timothy Castagne','DEF','Fulham',false),
('bel','Zeno Debast','DEF','Sporting CP',false),
('bel','Maxim De Cuyper','DEF','Brighton',false),
('bel','Koni De Winter','DEF','AC Milan',false),
('bel','Brandon Mechele','DEF','Club Brugge',false),
('bel','Thomas Meunier','DEF','Lille',false),
('bel','Nathan Ngoy','DEF','Lille',false),
('bel','Joaquin Seys','DEF','Club Brugge',false),
('bel','Arthur Theate','DEF','Eintracht Frankfurt',false),
('bel','Kevin De Bruyne','MED','Napoli',true),
('bel','Amadou Onana','MED','Aston Villa',false),
('bel','Nicolas Raskin','MED','Rangers',false),
('bel','Youri Tielemans','MED','Aston Villa',false),
('bel','Hans Vanaken','MED','Club Brugge',false),
('bel','Axel Witsel','MED','Girona',false),
('bel','Charles De Ketelaere','DEL','Atalanta',false),
('bel','Jeremy Doku','DEL','Manchester City',false),
('bel','Matias Fernandez-Pardo','DEL','Lille',false),
('bel','Romelu Lukaku','DEL','Napoli',false),
('bel','Dodi Lukebakio','DEL','Sevilla',false),
('bel','Diego Moreira','DEL','Chelsea',false),
('bel','Alexis Saelemaekers','DEL','Milan',false),
('bel','Leandro Trossard','DEL','Arsenal',false);

-- BOSNIA Y HERZEGOVINA (bih)
DELETE FROM public.players WHERE team_id = 'bih';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('bih','Nikola Vasilj','POR','St Pauli',false),
('bih','Martin Zlomislic','POR','Rijeka',false),
('bih','Osman Hadzikic','POR','Slaven Belupo',false),
('bih','Sead Kolasinac','DEF','Atalanta',false),
('bih','Amar Dedic','DEF','Benfica',false),
('bih','Nihad Mujakic','DEF','Gaziantep',false),
('bih','Nikola Katic','DEF','Schalke 04',false),
('bih','Tarik Muharemovic','DEF','Sassuolo',false),
('bih','Stjepan Radeljic','DEF','Rijeka',false),
('bih','Dennis Hadzikadunic','DEF','Sampdoria',false),
('bih','Nidal Celik','DEF','Lens',false),
('bih','Amir Hadziahmetovic','MED','Hull City',false),
('bih','Ivan Sunjic','MED','Pafos',false),
('bih','Ivan Basic','MED','Astana',false),
('bih','Dzenis Burnic','MED','Karlsruher SC',false),
('bih','Ermin Mahmic','MED','Slovan Liberec',false),
('bih','Benjamin Tahirovic','MED','Brondby',false),
('bih','Amar Memic','MED','Viktoria Plzen',false),
('bih','Armin Gigovic','MED','Young Boys',false),
('bih','Kerim Alajbegovic','MED','RB Salzburg',false),
('bih','Esmir Bajraktarevic','MED','PSV Eindhoven',false),
('bih','Ermedin Demirovic','DEL','VfB Stuttgart',false),
('bih','Jovo Lukic','DEL','Universitatea Cluj',false),
('bih','Samed Bazdar','DEL','Jagiellonia Bialystok',false),
('bih','Haris Tabakovic','DEL','Borussia Moenchengladbach',false),
('bih','Edin Dzeko','DEL','Schalke 04',true);

-- BRASIL (bra)
DELETE FROM public.players WHERE team_id = 'bra';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('bra','Alisson','POR','Liverpool',false),
('bra','Ederson','POR','Fenerbahçe',false),
('bra','Weverton','POR','Grêmio',false),
('bra','Wesley','DEF','Roma',false),
('bra','Douglas Santos','DEF','Zenit',false),
('bra','Alex Sandro','DEF','Flamengo',false),
('bra','Gabriel Magalhães','DEF','Arsenal',false),
('bra','Marquinhos','DEF','PSG',true),
('bra','Danilo','DEF','Flamengo',false),
('bra','Bremer','DEF','Juventus',false),
('bra','Ibañez','DEF','Al-Ahli',false),
('bra','Léo Pereira','DEF','Flamengo',false),
('bra','Bruno Guimarães','MED','Newcastle',false),
('bra','Casemiro','MED','Manchester United',false),
('bra','Danilo Santos','MED','Botafogo',false),
('bra','Fabinho','MED','Al-Ittihad',false),
('bra','Lucas Paquetá','MED','Flamengo',false),
('bra','Raphinha','DEL','Barcelona',false),
('bra','Neymar','DEL','Santos',false),
('bra','Vinícius Júnior','DEL','Real Madrid',false),
('bra','Luiz Henrique','DEL','Zenit',false),
('bra','Matheus Cunha','DEL','Manchester United',false),
('bra','Gabriel Martinelli','DEL','Arsenal',false),
('bra','Igor Thiago','DEL','Brentford',false),
('bra','Endrick','DEL','Lyon',false),
('bra','Rayan','DEL','Bournemouth',false);

-- CABO VERDE (cpv)
DELETE FROM public.players WHERE team_id = 'cpv';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('cpv','Josimar Dias "Vozinha"','POR','Chaves',false),
('cpv','Márcio da Rosa','POR','Montana',false),
('cpv','Carlos Santos','POR','San Diego',false),
('cpv','Steven Moreira','DEF','Columbus Crew',false),
('cpv','Wagner Pina','DEF','Trabzonspor',false),
('cpv','João Paulo Fernandes','DEF','FCSB',false),
('cpv','Sidny Lopes Cabral','DEF','Benfica',false),
('cpv','Logan Costa','DEF','Villarreal',false),
('cpv','Roberto Lopes "Pico"','DEF','Shamrock Rovers',false),
('cpv','Kelvin Pires','DEF','SJK',false),
('cpv','Ianique Tavares "Stopira"','DEF','Torreense',false),
('cpv','Edilson Borges "Diney"','DEF','Al Bataeh',false),
('cpv','Jamiro Monteiro','MED','PEC Zwolle',false),
('cpv','Telmo Arcanjo','MED','Vitória de Guimarães',false),
('cpv','Yannick Semedo','MED','Farense',false),
('cpv','Laros Duarte','MED','Puskás Akadémia',false),
('cpv','Deroy Duarte','MED','Ludogorets Razgrad',false),
('cpv','Kevin Pina','MED','Krasnodar',false),
('cpv','Gilson Benchimol','DEL','Akron Tolyatti',false),
('cpv','Jovane Cabral','DEL','Estrela da Amadora',false),
('cpv','Nuno da Costa','DEL','Basaksehir FK',false),
('cpv','Dailon Livramento','DEL','Casa Pia AC',false),
('cpv','Ryan Mendes','DEL','Igdir',false),
('cpv','Garry Rodrigues','DEL','Apollon Limassol',false),
('cpv','Willy Semedo','DEL','Omonia Nicosia',false),
('cpv','Helio Varela','DEL','Maccabi Tel Aviv',false);

-- CANADÁ (can)
DELETE FROM public.players WHERE team_id = 'can';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('can','Dayne St. Clair','POR','Inter Miami',false),
('can','Maxime Crépeau','POR','Orlando City',false),
('can','Owen Goodman','POR','Crystal Palace',false),
('can','Alistair Johnston','DEF','Celtic',false),
('can','Derek Cornelius','DEF','Marseille',false),
('can','Richie Laryea','DEF','Toronto',false),
('can','Niko Sigur','DEF','Hajduk Split',false),
('can','Joel Waterman','DEF','Chicago Fire',false),
('can','Luc De Fougerolles','DEF','Fulham',false),
('can','Moïse Bombito','DEF','Nice',false),
('can','Alphonso Davies','DEF','Bayern Munich',false),
('can','Alfie Jones','DEF','Middlesbrough',false),
('can','Stephen Eustáquio','MED','Porto',false),
('can','Ismaël Koné','MED','Sassuolo Calcio',false),
('can','Tajon Buchanan','MED','Villarreal',false),
('can','Mathieu Choinière','MED','Los Angeles FC',false),
('can','Ali Ahmed','MED','Norwich City',false),
('can','Nathan Saliba','MED','Anderlecht',false),
('can','Liam Millar','MED','Hull City',false),
('can','Marcelo Flores','MED','Tigres UANL',false),
('can','Jacob Shaffelburg','MED','Toronto',false),
('can','Jonathan Osorio','MED','Toronto',false),
('can','Jonathan David','DEL','Juventus',false),
('can','Cyle Larin','DEL','Southampton',false),
('can','Tani Oluwaseyi','DEL','Villarreal',false),
('can','Promise David','DEL','Royale Union Saint-Gilloise',false);

-- COLOMBIA (col)
DELETE FROM public.players WHERE team_id = 'col';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('col','Álvaro Montero','POR','Millonarios',false),
('col','Camilo Vargas','POR','Atlas',false),
('col','David Ospina','POR','Atlético Nacional',false),
('col','Daniel Muñoz','DEF','Crystal Palace',false),
('col','Santiago Arias','DEF','Bahia',false),
('col','Davinson Sánchez','DEF','Galatasaray',false),
('col','Jhon Lucumí','DEF','Bologna',false),
('col','Yerry Mina','DEF','Cagliari',false),
('col','Willer Ditta','DEF','Cruz Azul',false),
('col','Deiver Machado','DEF','Lens',false),
('col','Johan Mojica','DEF','Mallorca',false),
('col','Gustavo Puerta','MED','Bayer Leverkusen',false),
('col','James Rodríguez','MED','São Paulo',false),
('col','Jefferson Lerma','MED','Crystal Palace',false),
('col','Jhon Arias','MED','Fluminense',false),
('col','Jorge Carrascal','MED','Dinamo Moscow',false),
('col','Juan Fernando Quintero','MED','Racing Club',false),
('col','Richard Ríos','MED','Palmeiras',false),
('col','Kevin Castaño','MED','Krasnodar',false),
('col','Jaminton Campaz','MED','Rosario Central',false),
('col','Juan Camilo Portilla','MED','Talleres',false),
('col','Luis Díaz','DEL','Liverpool',false),
('col','Luis Suárez','DEL','Almería',false),
('col','Jhon Córdoba','DEL','Krasnodar',false),
('col','Carlos Andrés Gómez','DEL','Real Salt Lake',false),
('col','Juan Camilo Hernández','DEL','Columbus Crew',false);

-- COREA DEL SUR (kor)
DELETE FROM public.players WHERE team_id = 'kor';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('kor','Jo Hyeon-woo','POR','Ulsan',false),
('kor','Kim Seung-gyu','POR','FC Tokyo',false),
('kor','Song Bum-keun','POR','Jeonbuk',false),
('kor','Kim Moon-hwan','DEF','Daejeon',false),
('kor','Kim Min-jae','DEF','Bayern Munich',false),
('kor','Kim Tae-hyon','DEF','Kashima Antlers',false),
('kor','Park Jin-seob','DEF','Zhejiang',false),
('kor','Seol Young-woo','DEF','Red Star Belgrade',false),
('kor','Jens Castrop','DEF','Borussia Monchengladbach',false),
('kor','Lee Ki-hyuk','DEF','Gangwon',false),
('kor','Lee Tae-seok','DEF','Austria Wien',false),
('kor','Lee Han-beom','DEF','Midtjylland',false),
('kor','Cho Yu-min','DEF','Sharjah',false),
('kor','Kim Jin-gyu','MED','Jeonbuk',false),
('kor','Bae Jun-ho','MED','Stoke City',false),
('kor','Paik Seung-ho','MED','Birmingham',false),
('kor','Yang Hyun-jun','MED','Celtic',false),
('kor','Eom Ji-sung','MED','Swansea',false),
('kor','Lee Kang-in','MED','Paris St-Germain',false),
('kor','Lee Dong-gyeong','MED','Ulsan',false),
('kor','Lee Jae-sung','MED','Mainz',false),
('kor','Hwang In-beom','MED','Feyenoord',false),
('kor','Hwang Hee-chan','DEL','Wolves',false),
('kor','Son Heung-min','DEL','LAFC',true),
('kor','Oh Hyeon-gyu','DEL','Besiktas',false),
('kor','Cho Gue-sung','DEL','Midtjylland',false);

-- COSTA DE MARFIL (civ)
DELETE FROM public.players WHERE team_id = 'civ';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('civ','Yahia Fofana','POR','Çaykur Rizespor',false),
('civ','Mohamed Koné','POR','Charleroi',false),
('civ','Alban Lafont','POR','Panathinaikos',false),
('civ','Emmanuel Agbadou','DEF','Beşiktaş',false),
('civ','Christopher Opéri','DEF','İstanbul Başakşehir',false),
('civ','Ousmane Diomande','DEF','Sporting CP',false),
('civ','Guela Doué','DEF','Strasbourg',false),
('civ','Ghislain Konan','DEF','Gil Vicente',false),
('civ','Odilon Kossounou','DEF','Atalanta BC',false),
('civ','Evan Ndicka','DEF','AS Roma',false),
('civ','Wilfried Singo','DEF','Galatasaray',false),
('civ','Seko Fofana','MED','Porto',false),
('civ','Parfait Guiagon','MED','Charleroi',false),
('civ','Christ Inao Oulaï','MED','Trabzonspor',false),
('civ','Franck Kessié','MED','Al-Ahli',false),
('civ','Ibrahim Sangaré','MED','Nottingham Forest',false),
('civ','Jean-Michaël Seri','MED','Maribor',false),
('civ','Simon Adingra','DEL','Monaco',false),
('civ','Ange-Yoan Bonny','DEL','Inter Milan',false),
('civ','Amad Diallo','DEL','Manchester United',false),
('civ','Oumar Diakité','DEL','Cercle Brugge',false),
('civ','Yan Diomande','DEL','RB Leipzig',false),
('civ','Evann Guessand','DEL','Crystal Palace',false),
('civ','Nicolas Pépé','DEL','Villarreal',false),
('civ','Bazoumana Touré','DEL','TSG Hoffenheim',false),
('civ','Elye Wahi','DEL','OGC Nice',false);

-- CHEQUIA (cze)
DELETE FROM public.players WHERE team_id = 'cze';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('cze','Matěj Kovář','POR','PSV Eindhoven',false),
('cze','Jindřich Staněk','POR','Slavia Prague',false),
('cze','Lukáš Horníček','POR','Braga',false),
('cze','Vladimír Coufal','DEF','TSG Hoffenheim',false),
('cze','Tomáš Holeš','DEF','Slavia Prague',false),
('cze','Ladislav Krejčí','DEF','Wolves',false),
('cze','David Zima','DEF','Slavia Prague',false),
('cze','Jaroslav Zelený','DEF','Sparta Prague',false),
('cze','David Jurásek','DEF','Slavia Prague',false),
('cze','David Douděra','DEF','Slavia Prague',false),
('cze','Robin Hranáč','DEF','TSG Hoffenheim',false),
('cze','Štěpán Chaloupek','DEF','Slavia Prague',false),
('cze','Tomáš Souček','MED','West Ham',false),
('cze','Vladimír Darida','MED','Hradec Králové',false),
('cze','Lukáš Provod','MED','Slavia Prague',false),
('cze','Michal Sadílek','MED','Slavia Prague',false),
('cze','Pavel Šulc','MED','Olympique Lyonnais',false),
('cze','Lukáš Červ','MED','Viktoria Plzeň',false),
('cze','Hugo Sochůrek','MED','Sparta Prague',false),
('cze','Alexandr Sojka','MED','Viktoria Plzeň',false),
('cze','Denis Višinský','MED','Viktoria Plzeň',false),
('cze','Patrik Schick','DEL','Bayer Leverkusen',true),
('cze','Adam Hložek','DEL','TSG Hoffenheim',false),
('cze','Jan Kuchta','DEL','Sparta Prague',false),
('cze','Mojmír Chytil','DEL','Slavia Prague',false),
('cze','Tomáš Chorý','DEL','Slavia Prague',false);

-- CROACIA (cro)
DELETE FROM public.players WHERE team_id = 'cro';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('cro','Dominik Livaković','POR','Dinamo Zagreb',false),
('cro','Dominik Kotarski','POR','København',false),
('cro','Ivor Pandur','POR','Hull City',false),
('cro','Joško Gvardiol','DEF','Manchester City',false),
('cro','Duje Ćaleta-Car','DEF','Real Sociedad',false),
('cro','Josip Šutalo','DEF','Ajax',false),
('cro','Josip Stanišić','DEF','Bayern München',false),
('cro','Marin Pongračić','DEF','Fiorentina',false),
('cro','Martin Erlić','DEF','Midtjylland',false),
('cro','Luka Vušković','DEF','Hamburger SV',false),
('cro','Luka Modrić','MED','Real Madrid',true),
('cro','Mateo Kovačić','MED','Manchester City',false),
('cro','Mario Pašalić','MED','Atalanta',false),
('cro','Nikola Vlašić','MED','Torino',false),
('cro','Luka Sučić','MED','Real Sociedad',false),
('cro','Martin Baturina','MED','Como',false),
('cro','Kristijan Jakić','MED','Augsburg',false),
('cro','Petar Sučić','MED','Internazionale',false),
('cro','Nikola Moro','MED','Bologna',false),
('cro','Toni Fruk','MED','Rijeka',false),
('cro','Ivan Perišić','DEL','PSV Eindhoven',false),
('cro','Andrej Kramarić','DEL','Hoffenheim',false),
('cro','Ante Budimir','DEL','Osasuna',false),
('cro','Marco Pašalić','DEL','Orlando City',false),
('cro','Petar Musa','DEL','Dallas',false),
('cro','Igor Matanović','DEL','Freiburg',false);

-- CURAZAO (cuw)
DELETE FROM public.players WHERE team_id = 'cuw';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('cuw','Eloy Room','POR','Miami FC',false),
('cuw','Trevor Dorrnbusch','POR','VVV-Venlo',false),
('cuw','Tyrick Bodak','POR','Telstar',false),
('cuw','Jurien Gaari','DEF','Abha',false),
('cuw','Roshon van Eijma','DEF','RKC Waalwijk',false),
('cuw','Sherel Floranus','DEF','PEC Zwolle',false),
('cuw','Joshua Brenet','DEF','Kayserispor',false),
('cuw','Shurandy Sambo','DEF','Sparta Rotterdam',false),
('cuw','Armando Obispo','DEF','PSV',false),
('cuw','Riechedly Bazoer','DEF','Konyaspor',false),
('cuw','Deveron Fonville','DEF','NEC',false),
('cuw','Leandro Bacuna','MED','Igdir',false),
('cuw','Juninho Bacuna','MED','Volendam',false),
('cuw','Godfried Roemeratoe','MED','RKC Waalwijk',false),
('cuw','Kevin Felida','MED','Den Bosch',false),
('cuw','Livano Comenencia','MED','Zurich',false),
('cuw','Ar''jany Martha','MED','Rotherham United',false),
('cuw','Tyrese Noslin','MED','Telstar',false),
('cuw','Kenji Gorré','DEL','Maccabi Haifa',false),
('cuw','Brandley Kuwas','DEL','Volendam',false),
('cuw','Gervane Kastaneer','DEL','Terengganu',false),
('cuw','Jeremy Antonisse','DEL','Kifisia',false),
('cuw','Jearl Margaritha','DEL','Beveren',false),
('cuw','Jurgen Locadia','DEL','Miami FC',false),
('cuw','Sontje Hansen','DEL','Middlesbrough',false),
('cuw','Tahith Chong','DEL','Sheffield United',false);

-- ECUADOR (ecu)
DELETE FROM public.players WHERE team_id = 'ecu';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('ecu','Hernán Galíndez','POR','Huracán',false),
('ecu','Moisés Ramírez','POR','AE Kifisias',false),
('ecu','Gonzalo Valle','POR','LDU Quito',false),
('ecu','Willian Pacho','DEF','PSG',false),
('ecu','Piero Hincapié','DEF','Arsenal',false),
('ecu','Joel Ordóñez','DEF','Club Brugge',false),
('ecu','Félix Torres','DEF','Internacional',false),
('ecu','Pervis Estupiñán','DEF','AC Milan',false),
('ecu','Ángelo Preciado','DEF','Atlético Mineiro',false),
('ecu','Jackson Porozo','DEF','Club Tijuana',false),
('ecu','Moisés Caicedo','MED','Chelsea',false),
('ecu','Jordy Alcívar','MED','Independiente del Valle',false),
('ecu','Denil Castillo','MED','Midtjylland',false),
('ecu','Alan Franco','MED','Atlético Mineiro',false),
('ecu','Pedro Vite','MED','Pumas UNAM',false),
('ecu','Kendry Páez','MED','River Plate',false),
('ecu','Yaimar Medina','MED','KRC Genk',false),
('ecu','Kevin Rodríguez','DEL','Union Saint-Gilloise',false),
('ecu','Anthony Valencia','DEL','Royal Antwerp',false),
('ecu','Enner Valencia','DEL','Pachuca',true),
('ecu','Jordy Caicedo','DEL','Huracán',false),
('ecu','Jeremy Arévalo','DEL','Stuttgart',false),
('ecu','Gonzalo Plata','DEL','Flamengo',false),
('ecu','Alan Minda','DEL','Atlético Mineiro',false),
('ecu','John Yeboah','DEL','Venezia',false),
('ecu','Nilson Angulo','DEL','Sunderland',false);

-- ESCOCIA (sco)
DELETE FROM public.players WHERE team_id = 'sco';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('sco','Craig Gordon','POR','Hearts',false),
('sco','Angus Gunn','POR','Nottingham Forest',false),
('sco','Liam Kelly','POR','Rangers',false),
('sco','Grant Hanley','DEF','Hibernian',false),
('sco','Jack Hendry','DEF','Al-Ettifaq',false),
('sco','Aaron Hickey','DEF','Brentford',false),
('sco','Dom Hyam','DEF','Wrexham',false),
('sco','Scott McKenna','DEF','Dinamo Zagreb',false),
('sco','Nathan Patterson','DEF','Everton',false),
('sco','Anthony Ralston','DEF','Celtic',false),
('sco','Andy Robertson','DEF','Liverpool',true),
('sco','John Souttar','DEF','Rangers',false),
('sco','Kieran Tierney','DEF','Celtic',false),
('sco','Ryan Christie','MED','Bournemouth',false),
('sco','Findlay Curtis','MED','Rangers',false),
('sco','Lewis Ferguson','MED','Bologna',false),
('sco','Ben Gannon-Doak','MED','Bournemouth',false),
('sco','Billy Gilmour','MED','Napoli',false),
('sco','John McGinn','MED','Aston Villa',false),
('sco','Kenny McLean','MED','Norwich City',false),
('sco','Scott McTominay','MED','Napoli',false),
('sco','Che Adams','DEL','Torino',false),
('sco','Lyndon Dykes','DEL','Charlton Athletic',false),
('sco','George Hirst','DEL','Ipswich Town',false),
('sco','Lawrence Shankland','DEL','Hearts',false),
('sco','Ross Stewart','DEL','Southampton',false);

-- ESPAÑA (esp)
DELETE FROM public.players WHERE team_id = 'esp';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('esp','Unai Simón','POR','Athletic Club',false),
('esp','David Raya','POR','Arsenal',false),
('esp','Joan García','POR','Barcelona',false),
('esp','Pedro Porro','DEF','Tottenham Hotspur',false),
('esp','Marcos Llorente','DEF','Atlético Madrid',false),
('esp','Aymeric Laporte','DEF','Athletic Club',false),
('esp','Pau Cubarsí','DEF','Barcelona',false),
('esp','Marc Pubill','DEF','Atlético Madrid',false),
('esp','Eric García','DEF','Barcelona',false),
('esp','Marc Cucurella','DEF','Chelsea',false),
('esp','Alejandro Grimaldo','DEF','Bayer Leverkusen',false),
('esp','Rodrigo Hernández (Rodri)','MED','Manchester City',false),
('esp','Martín Zubimendi','MED','Arsenal',false),
('esp','Pedri González','MED','Barcelona',false),
('esp','Fabián Ruiz','MED','PSG',false),
('esp','Mikel Merino','MED','Arsenal',false),
('esp','Pablo Páez ''Gavi''','MED','Barcelona',false),
('esp','Álex Baena','MED','Atlético Madrid',false),
('esp','Mikel Oyarzabal','DEL','Real Sociedad',false),
('esp','Lamine Yamal','DEL','Barcelona',false),
('esp','Ferran Torres','DEL','Barcelona',false),
('esp','Borja Iglesias','DEL','Celta Vigo',false),
('esp','Dani Olmo','DEL','Barcelona',false),
('esp','Víctor Múñoz','DEL','Osasuna',false),
('esp','Nico Williams','DEL','Athletic Club',false),
('esp','Yéremy Pino','DEL','Crystal Palace',false);

-- ESTADOS UNIDOS (usa)
DELETE FROM public.players WHERE team_id = 'usa';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('usa','Chris Brady','POR','Chicago Fire',false),
('usa','Matt Freese','POR','New York City FC',false),
('usa','Matt Turner','POR','New England Revolution',false),
('usa','Max Arfsten','DEF','Columbus Crew',false),
('usa','Sergiño Dest','DEF','PSV',false),
('usa','Alex Freeman','DEF','Villarreal',false),
('usa','Mark McKenzie','DEF','Toulouse',false),
('usa','Tim Ream','DEF','Charlotte FC',false),
('usa','Chris Richards','DEF','Crystal Palace',false),
('usa','Antonee Robinson','DEF','Fulham',false),
('usa','Miles Robinson','DEF','FC Cincinnati',false),
('usa','Joe Scally','DEF','Borussia Mönchengladbach',false),
('usa','Auston Trusty','DEF','Celtic',false),
('usa','Tyler Adams','MED','AFC Bournemouth',false),
('usa','Sebastian Berhalter','MED','Vancouver Whitecaps',false),
('usa','Weston McKennie','MED','Juventus',false),
('usa','Cristian Roldan','MED','Seattle Sounders',false),
('usa','Gio Reyna','MED','Borussia Mönchengladbach',false),
('usa','Malik Tillman','MED','Bayer Leverkusen',false),
('usa','Folarin Balogun','DEL','AS Monaco',false),
('usa','Ricardo Pepi','DEL','PSV',false),
('usa','Haji Wright','DEL','Coventry City',false),
('usa','Brenden Aaronson','DEL','Leeds United',false),
('usa','Christian Pulisic','DEL','Milan',false),
('usa','Tim Weah','DEL','Marseille',false),
('usa','Alejandro Zendejas','DEL','Club América',false);

-- FRANCIA (fra)
DELETE FROM public.players WHERE team_id = 'fra';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('fra','Mike Maignan','POR','AC Milan',false),
('fra','Brice Samba','POR','Rennes',false),
('fra','Robin Risser','POR','Lens',false),
('fra','Dayot Upamecano','DEF','Bayern Munich',false),
('fra','William Saliba','DEF','Arsenal',false),
('fra','Lucas Digne','DEF','Aston Villa',false),
('fra','Theo Hernandez','DEF','Al-Hilal',false),
('fra','Lucas Hernandez','DEF','PSG',false),
('fra','Ibrahima Konaté','DEF','Liverpool',false),
('fra','Jules Koundé','DEF','Barcelona',false),
('fra','Malo Gusto','DEF','Chelsea',false),
('fra','Maxence Lacroix','DEF','Crystal Palace',false),
('fra','N''Golo Kanté','MED','Fenerbahce',false),
('fra','Adrien Rabiot','MED','AC Milan',false),
('fra','Manu Koné','MED','Roma',false),
('fra','Aurélien Tchouaméni','MED','Real Madrid',false),
('fra','Warren Zaïre-Emery','MED','PSG',false),
('fra','Maghnes Akliouche','DEL','AS Monaco',false),
('fra','Bradley Barcola','DEL','PSG',false),
('fra','Rayan Cherki','DEL','Lyon',false),
('fra','Ousmane Dembélé','DEL','PSG',false),
('fra','Désiré Doué','DEL','PSG',false),
('fra','Jean-Philippe Mateta','DEL','Crystal Palace',false),
('fra','Kylian Mbappé','DEL','Real Madrid',true),
('fra','Michael Olise','DEL','Bayern Munich',false),
('fra','Marcus Thuram','DEL','Inter Milan',false);

-- HAITÍ (hai)
DELETE FROM public.players WHERE team_id = 'hai';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('hai','Johnny Placide','POR','Bastia',false),
('hai','Alexandre Pierre','POR','Sochaux',false),
('hai','Josué Duverger','POR','Cosmos Koblenz',false),
('hai','Ricardo Adé','DEF','LDU Quito',false),
('hai','Carlens Arcus','DEF','Angers',false),
('hai','Martin Experience','DEF','Nancy',false),
('hai','Jean-Kevin Duverné','DEF','Gent',false),
('hai','Duke Lacroix','DEF','Colorado Springs Switchbacks',false),
('hai','Wilguens Paugain','DEF','Zulte Waregem',false),
('hai','Hannes Delcroix','DEF','Lugano',false),
('hai','Keeto Thermoncy','DEF','Young Boys',false),
('hai','Leverton Pierre','MED','Vizela',false),
('hai','Danley Jean Jacques','MED','Philadelphia Union',false),
('hai','Carl Sainté','MED','El Paso Locomotive',false),
('hai','Jean-Ricner Bellegarde','MED','Wolves',false),
('hai','Woodensky Pierre','MED','Violette',false),
('hai','Dominique Simon','MED','Tatran Presov',false),
('hai','Duckens Nazon','DEL','Esteghlal',false),
('hai','Frantzy Perrot','DEL','Çaykur Rizespor',false),
('hai','Derrick Etienne Jr.','DEL','Toronto FC',false),
('hai','Louicius Deedson','DEL','FC Dallas',false),
('hai','Ruben Providence','DEL','Almere City',false),
('hai','Josué Casimir','DEL','Auxerre',false),
('hai','Yassin Fortuné','DEL','Vizela',false),
('hai','Wilson Isidor','DEL','Sunderland',false),
('hai','Lenny Joseph','DEL','Ferencvaros',false);

-- INGLATERRA (ing)
DELETE FROM public.players WHERE team_id = 'ing';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('ing','Dean Henderson','POR','Crystal Palace',false),
('ing','Jordan Pickford','POR','Everton',false),
('ing','James Trafford','POR','Manchester City',false),
('ing','Dan Burn','DEF','Newcastle United',false),
('ing','Marc Guehi','DEF','Crystal Palace',false),
('ing','Reece James','DEF','Chelsea',false),
('ing','Ezri Konsa','DEF','Aston Villa',false),
('ing','Tino Livramento','DEF','Newcastle United',false),
('ing','Nico O''Reilly','DEF','Manchester City',false),
('ing','Jarell Quansah','DEF','Liverpool',false),
('ing','Djed Spence','DEF','Tottenham Hotspur',false),
('ing','John Stones','DEF','Manchester City',false),
('ing','Elliot Anderson','MED','Nottingham Forest',false),
('ing','Jude Bellingham','MED','Real Madrid',false),
('ing','Eberechi Eze','MED','Arsenal',false),
('ing','Jordan Henderson','MED','Brentford',false),
('ing','Kobbie Mainoo','MED','Manchester United',false),
('ing','Declan Rice','MED','Arsenal',false),
('ing','Morgan Rogers','MED','Aston Villa',false),
('ing','Anthony Gordon','DEL','Barcelona',false),
('ing','Harry Kane','DEL','Bayern Munich',true),
('ing','Noni Madueke','DEL','Arsenal',false),
('ing','Marcus Rashford','DEL','Barcelona',false),
('ing','Bukayo Saka','DEL','Arsenal',false),
('ing','Ivan Toney','DEL','Al-Ahli',false),
('ing','Ollie Watkins','DEL','Aston Villa',false);

-- JAPÓN (jpn)
DELETE FROM public.players WHERE team_id = 'jpn';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('jpn','Tomoki Hayakawa','POR','Kashima Antlers',false),
('jpn','Keisuke Osako','POR','Sanfrecce Hiroshima',false),
('jpn','Zion Suzuki','POR','Parma',false),
('jpn','Ko Itakura','DEF','Ajax',false),
('jpn','Hiroki Ito','DEF','Bayern Munich',false),
('jpn','Yuto Nagatomo','DEF','FC Tokyo',false),
('jpn','Ayumu Seko','DEF','Le Havre',false),
('jpn','Yukinari Sugawara','DEF','Werder Bremen',false),
('jpn','Junnosuke Suzuki','DEF','København',false),
('jpn','Shogo Taniguchi','DEF','Sint-Truiden',false),
('jpn','Takehiro Tomiyasu','DEF','Ajax',false),
('jpn','Tsuyoshi Watanabe','DEF','Feyenoord',false),
('jpn','Ritsu Doan','MED','Eintracht Frankfurt',false),
('jpn','Wataru Endo','MED','Liverpool',false),
('jpn','Junya Ito','MED','Genk',false),
('jpn','Daichi Kamada','MED','Crystal Palace',false),
('jpn','Takefusa Kubo','MED','Real Sociedad',false),
('jpn','Keito Nakamura','MED','Reims',false),
('jpn','Kaishu Sano','MED','Mainz',false),
('jpn','Ao Tanaka','MED','Leeds United',false),
('jpn','Keisuke Goto','DEL','Sint-Truiden',false),
('jpn','Daizen Maeda','DEL','Celtic',false),
('jpn','Koki Ogawa','DEL','Nijmegen',false),
('jpn','Kento Shiogai','DEL','Wolfsburg',false),
('jpn','Yuito Suzuki','DEL','Freiburg',false),
('jpn','Ayase Ueda','DEL','Feyenoord',false);

-- MARRUECOS (mar)
DELETE FROM public.players WHERE team_id = 'mar';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('mar','Yassine Bounou','POR','Al Hilal',false),
('mar','Munir El Kajoui','POR','RS Berkane',false),
('mar','Ahmed Reda Tagnaouti','POR','AS FAR',false),
('mar','Noussair Mazraoui','DEF','Manchester United',false),
('mar','Anass Salah-Eddine','DEF','PSV Eindhoven',false),
('mar','Youssef Belammari','DEF','Al Ahly',false),
('mar','Nayef Aguerd','DEF','Olympique de Marseille',false),
('mar','Chadi Riad','DEF','Crystal Palace',false),
('mar','Issa Diop','DEF','Fulham',false),
('mar','Redouane Halhal','DEF','Mechelen',false),
('mar','Achraf Hakimi','DEF','PSG',false),
('mar','Zakaria El Ouahdi','DEF','Genk',false),
('mar','Samir El Mourabet','MED','Strasbourg',false),
('mar','Ayyoub Bouaddi','MED','Lille',false),
('mar','Neil El Aynaoui','MED','AS Roma',false),
('mar','Sofyan Amrabat','MED','Real Betis',false),
('mar','Azzedine Ounahi','MED','Girona',false),
('mar','Bilal El Khannouss','MED','Stuttgart',false),
('mar','Ismael Saibari','MED','PSV Eindhoven',false),
('mar','Abdessamad Ezzalzouli','DEL','Real Betis',false),
('mar','Chemsdine Talbi','DEL','Sunderland',false),
('mar','Soufiane Rahimi','DEL','Al Ain',false),
('mar','Ayoub El Kaabi','DEL','Olympiacos',false),
('mar','Brahim Díaz','DEL','Real Madrid',false),
('mar','Gessime Yassine','DEL','Strasbourg',false),
('mar','Ayoube Amaïmouni','DEL','Eintracht Frankfurt',false);

-- MÉXICO (mex)
DELETE FROM public.players WHERE team_id = 'mex';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('mex','Raúl Rangel','POR','Guadalajara',false),
('mex','Guillermo Ochoa','POR','AEL Limassol',false),
('mex','Carlos Acevedo','POR','Santos Laguna',false),
('mex','Jorge Sánchez','DEF','PAOK',false),
('mex','Israel Reyes','DEF','Club América',false),
('mex','César Montes','DEF','Lokomotiv Moscow',false),
('mex','Johan Vásquez','DEF','Genoa',false),
('mex','Jesús Gallardo','DEF','Toluca',false),
('mex','Mateo Chávez','DEF','AZ Alkmaar',false),
('mex','Erik Lira','MED','Cruz Azul',false),
('mex','Orbelín Pineda','MED','AEK Athens',false),
('mex','Álvaro Fidalgo','MED','Real Betis',false),
('mex','Roberto Alvarado','MED','Guadalajara',false),
('mex','Brian Gutiérrez','MED','Guadalajara',false),
('mex','Luis Romo','MED','Guadalajara',false),
('mex','Edson Álvarez','MED','Fenerbahçe',false),
('mex','Obed Vargas','MED','Atlético Madrid',false),
('mex','Gilberto Mora','MED','Tijuana',false),
('mex','Luis Chávez','MED','Dynamo Moscow',false),
('mex','César Huerta','DEL','Anderlecht',false),
('mex','Alexis Vega','DEL','Toluca',false),
('mex','Julián Quiñones','DEL','Al-Qadsiah',false),
('mex','Guillermo Martínez','DEL','UNAM',false),
('mex','Armando González','DEL','Guadalajara',false),
('mex','Santiago Giménez','DEL','AC Milan',false),
('mex','Raúl Jiménez','DEL','Fulham',false);

-- NORUEGA (nor)
DELETE FROM public.players WHERE team_id = 'nor';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('nor','Ørjan Nyland','POR','Sevilla',false),
('nor','Egil Selvik','POR','Watford',false),
('nor','Sander Tangvik','POR','Hamburger SV',false),
('nor','Julian Ryerson','DEF','Borussia Dortmund',false),
('nor','Marcus Holmgren Pedersen','DEF','Torino',false),
('nor','David Møller Wolfe','DEF','Wolverhampton Wanderers',false),
('nor','Fredrik Bjørkan','DEF','Bodø/Glimt',false),
('nor','Kristoffer Ajer','DEF','Brentford',false),
('nor','Torbjørn Heggelund','DEF','Bologna',false),
('nor','Leo Skiri Østigård','DEF','Genoa',false),
('nor','Sondre Langås','DEF','Derby County',false),
('nor','Henrik Falchener','DEF','Viking',false),
('nor','Martin Ødegaard','MED','Arsenal',false),
('nor','Sander Berge','MED','Fulham',false),
('nor','Fredrik Aursnes','MED','Benfica',false),
('nor','Patrick Berg','MED','Bodø/Glimt',false),
('nor','Kristian Thorstvedt','MED','Sassuolo',false),
('nor','Morten Thorsby','MED','Cremonese',false),
('nor','Thelo Aasgaard','MED','Rangers',false),
('nor','Andreas Schjelderup','MED','Benfica',false),
('nor','Jens Petter Hauge','MED','Bodø/Glimt',false),
('nor','Erling Haaland','DEL','Manchester City',true),
('nor','Alexander Sørloth','DEL','Atlético Madrid',false),
('nor','Jørgen Strand Larsen','DEL','Crystal Palace',false),
('nor','Oscar Bobb','DEL','Fulham',false),
('nor','Antonio Nusa','DEL','RB Leipzig',false);

-- NUEVA ZELANDA (nzl)
DELETE FROM public.players WHERE team_id = 'nzl';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('nzl','Max Crocombe','POR','Millwall FC',false),
('nzl','Alex Paulsen','POR','Lechia Gdańsk',false),
('nzl','Michael Woud','POR','Auckland FC',false),
('nzl','Tim Payne','DEF','Wellington Phoenix',false),
('nzl','Francis De Vries','DEF','Auckland FC',false),
('nzl','Tyler Bindon','DEF','Nottingham Forest',false),
('nzl','Michael Boxall','DEF','Minnesota United',false),
('nzl','Liberato Cacace','DEF','Wrexham AFC',false),
('nzl','Nando Pijnaaker','DEF','Auckland FC',false),
('nzl','Finn Surman','DEF','Portland Timbers',false),
('nzl','Callan Elliot','DEF','Auckland FC',false),
('nzl','Tommy Smith','DEF','Braintree Town',false),
('nzl','Joe Bell','MED','Viking FK',false),
('nzl','Marko Stamenić','MED','Swansea City',false),
('nzl','Alex Rufer','MED','Wellington Phoenix',false),
('nzl','Ryan Thomas','MED','PEC Zwolle',false),
('nzl','Lachlan Bayliss','MED','Newcastle Jets',false),
('nzl','Matt Garbett','MED','Peterborough United',false),
('nzl','Sarpreet Singh','MED','Wellington Phoenix',false),
('nzl','Eli Just','MED','Motherwell FC',false),
('nzl','Ben Old','MED','Saint-Étienne',false),
('nzl','Callum McCowatt','DEL','Silkeborg',false),
('nzl','Kosta Barbarouses','DEL','Western Sydney Wanderers',false),
('nzl','Jesse Randall','DEL','Auckland FC',false),
('nzl','Ben Waine','DEL','Port Vale',false),
('nzl','Chris Wood','DEL','Nottingham Forest',true);

-- PAÍSES BAJOS (ned)
DELETE FROM public.players WHERE team_id = 'ned';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('ned','Mark Flekken','POR','Bayer Leverkusen',false),
('ned','Robin Roefs','POR','Sunderland',false),
('ned','Bart Verbruggen','POR','Brighton',false),
('ned','Nathan Aké','DEF','Manchester City',false),
('ned','Denzel Dumfries','DEF','Inter Milan',false),
('ned','Jorrel Hato','DEF','Chelsea',false),
('ned','Jurriën Timber','DEF','Arsenal',false),
('ned','Jan Paul van Hecke','DEF','Brighton',false),
('ned','Micky van de Ven','DEF','Tottenham Hotspur',false),
('ned','Virgil van Dijk','DEF','Liverpool',true),
('ned','Frenkie de Jong','MED','Barcelona',false),
('ned','Marten de Roon','MED','Atalanta',false),
('ned','Ryan Gravenberch','MED','Liverpool',false),
('ned','Teun Koopmeiners','MED','Juventus',false),
('ned','Tijjani Reijnders','MED','Manchester City',false),
('ned','Guus Til','MED','PSV',false),
('ned','Quinten Timber','MED','Marseille',false),
('ned','Mats Wieffer','MED','Brighton',false),
('ned','Brian Brobbey','DEL','Sunderland',false),
('ned','Memphis Depay','DEL','Corinthians',false),
('ned','Cody Gakpo','DEL','Liverpool',false),
('ned','Justin Kluivert','DEL','Bournemouth',false),
('ned','Noa Lang','DEL','Galatasaray',false),
('ned','Donyell Malen','DEL','Roma',false),
('ned','Crysencio Summerville','DEL','West Ham',false),
('ned','Wout Weghorst','DEL','Ajax',false);

-- PANAMÁ (pan)
DELETE FROM public.players WHERE team_id = 'pan';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('pan','Orlando Mosquera','POR','Al-Fayha FC',false),
('pan','Luis Mejía','POR','Club Nacional',false),
('pan','César Samudio','POR','CD Marathon',false),
('pan','César Blackman','DEF','Slovan Bratislava',false),
('pan','Jorge Gutiérrez','DEF','Deportivo La Guaira',false),
('pan','Amir Murillo','DEF','Besiktas',false),
('pan','Fidel Escobar','DEF','Deportivo Saprissa',false),
('pan','Andrés Andrade','DEF','LASK',false),
('pan','Edgardo Fariña','DEF','FC Pari Nizhniy Novgorod',false),
('pan','José Córdoba','DEF','Norwich City',false),
('pan','Eric Davis','DEF','CD Plaza Amador',false),
('pan','Jiovani Ramos','DEF','Academia Puerto Cabello',false),
('pan','Roderick Miller','DEF','Turan Tovuz',false),
('pan','Aníbal Godoy','MED','San Diego FC',true),
('pan','Adalberto Carrasquilla','MED','UNAM Pumas',false),
('pan','Carlos Harvey','MED','Minnesota United FC',false),
('pan','Cristian Martínez','MED','Ironi Kiryat Shmona',false),
('pan','José Luis Rodríguez','MED','FC Juarez',false),
('pan','Cesar Yanis','MED','CD Cobresal',false),
('pan','Yoel Bárcenas','MED','Mazatlan FC',false),
('pan','Alberto Quintero','MED','CD Plaza Amador',false),
('pan','Azarías Londoño','MED','CD Universidad Católica',false),
('pan','Ismael Diaz','DEL','Club León',false),
('pan','Cecilio Waterman','DEL','Universidad de Concepción',false),
('pan','Jose Fajardo','DEL','Universidad Católica del Ecuador',false),
('pan','Tomas Rodriguez','DEL','Deportivo Saprissa',false);

-- RD DEL CONGO (cod)
DELETE FROM public.players WHERE team_id = 'cod';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('cod','Lionel Mpasi','POR','Le Havre',false),
('cod','Matthieu Epolo','POR','Standard Liège',false),
('cod','Timothy Fayulu','POR','FC Noah',false),
('cod','Chancel Mbemba','DEF','Lille',true),
('cod','Axel Tuanzebe','DEF','Burnley',false),
('cod','Arthur Masuaku','DEF','Lens',false),
('cod','Gédéon Kalulu','DEF','Aris Limassol',false),
('cod','Joris Kayembe','DEF','Genk',false),
('cod','Aaron Wan-Bissaka','DEF','West Ham United',false),
('cod','Steve Kapuadi','DEF','Widzew Łódź',false),
('cod','Dylan Batubinsika','DEF','AEL',false),
('cod','Rocky Bushiri','DEF','Hibernian',false),
('cod','Noah Sadiki','MED','Sunderland',false),
('cod','Charles Pickel','MED','Espanyol',false),
('cod','Edo Kayembe','MED','Watford',false),
('cod','Samuel Moutoussamy','MED','Atromitos',false),
('cod','Ngal''ayel Mukau','MED','Lille',false),
('cod','Nathanaël Mbuku','MED','Montpellier',false),
('cod','Meschak Elia','MED','Alanyaspor',false),
('cod','Brian Cipenga','MED','Castellón',false),
('cod','Gaël Kakuta','MED','AEL',false),
('cod','Théo Bongonda','DEL','Spartak Moscow',false),
('cod','Simon Banza','DEL','Al Jazira',false),
('cod','Yoane Wissa','DEL','Newcastle United',false),
('cod','Fiston Mayele','DEL','Pyramids FC',false),
('cod','Cédric Bakambu','DEL','Real Betis',false);

-- SUDÁFRICA (rsa)
DELETE FROM public.players WHERE team_id = 'rsa';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('rsa','Ronwen Williams','POR','Mamelodi Sundowns',false),
('rsa','Ricardo Goss','POR','Siwelele FC',false),
('rsa','Sipho Chaine','POR','Orlando Pirates',false),
('rsa','Khuliso Mudau','DEF','Mamelodi Sundowns',false),
('rsa','Aubrey Modiba','DEF','Mamelodi Sundowns',false),
('rsa','Khulumani Ndamane','DEF','Mamelodi Sundowns',false),
('rsa','Olwethu Makhanya','DEF','Philadelphia Union',false),
('rsa','Bradley Cross','DEF','Kaizer Chiefs',false),
('rsa','Thabang Matuludi','DEF','Polokwane City',false),
('rsa','Nkosinathi Sibisi','DEF','Orlando Pirates',false),
('rsa','Kamogelo Sebelebele','DEF','Orlando Pirates',false),
('rsa','Ime Okon','DEF','Hannover 96',false),
('rsa','Samukele Kabini','DEF','Molde FK',false),
('rsa','Mbekezeli Mbokazi','DEF','Chicago Fire',false),
('rsa','Teboho Mokoena','MED','Mamelodi Sundowns',false),
('rsa','Jayden Adams','MED','Mamelodi Sundowns',false),
('rsa','Thalente Mbatha','MED','Orlando Pirates',false),
('rsa','Sphephelo Sithole','MED','CD Tondela',false),
('rsa','Oswin Apollis','DEL','Orlando Pirates',false),
('rsa','Tshepang Moremi','DEL','Orlando Pirates',false),
('rsa','Evidence Makgopa','DEL','Orlando Pirates',false),
('rsa','Relebohile Mofokeng','DEL','Orlando Pirates',false),
('rsa','Lyle Foster','DEL','Burnley',false),
('rsa','Iqraam Rayners','DEL','Mamelodi Sundowns',false),
('rsa','Themba Zwane','DEL','Mamelodi Sundowns',false),
('rsa','Thapelo Maseko','DEL','AEL Limassol',false);

-- SUECIA (swe)
DELETE FROM public.players WHERE team_id = 'swe';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('swe','Kristoffer Nordfeldt','POR','AIK',false),
('swe','Viktor Johansson','POR','Stoke City',false),
('swe','Jacob Widell Zetterström','POR','Derby County',false),
('swe','Gustaf Lagerbielke','POR','Braga',false),
('swe','Victor Lindelöf','DEF','Aston Villa',false),
('swe','Isak Hien','DEF','Atalanta',false),
('swe','Gabriel Gudmundsson','DEF','Leeds United',false),
('swe','Carl Starfelt','DEF','Celta Vigo',false),
('swe','Herman Johansson','DEF','FC Dallas',false),
('swe','Hjalmar Ekdal','DEF','Burnley',false),
('swe','Daniel Svensson','DEF','Borussia Dortmund',false),
('swe','Eric Smith','MED','FC St Pauli',false),
('swe','Elliot Stroud','MED','Mjallby AIF',false),
('swe','Mattias Svanberg','MED','VfL Wolfsburg',false),
('swe','Jesper Karlström','MED','Udinese',false),
('swe','Yasin Ayari','MED','Brighton & Hove Albion',false),
('swe','Lucas Bergvall','MED','Tottenham Hotspur',false),
('swe','Benjamin Nygren','MED','Celtic',false),
('swe','Ken Sema','MED','Pafos FC',false),
('swe','Besfort Zeneli','MED','Saint-Gilloise',false),
('swe','Taha Ali','DEL','Malmö FF',false),
('swe','Alexander Bernhardsson','DEL','Holstein Kiel',false),
('swe','Anthony Elanga','DEL','Newcastle United',false),
('swe','Viktor Gyökeres','DEL','Arsenal',false),
('swe','Alexander Isak','DEL','Liverpool',false),
('swe','Gustaf Nilsson','DEL','Club Brugge',false);

-- SUIZA (sui)
DELETE FROM public.players WHERE team_id = 'sui';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('sui','Gregor Kobel','POR','Borussia Dortmund',false),
('sui','Yvon Mvogo','POR','Lorient',false),
('sui','Marvin Keller','POR','Young Boys',false),
('sui','Miro Muheim','DEF','Hamburger SV',false),
('sui','Silvan Widmer','DEF','Mainz 05',false),
('sui','Nico Elvedi','DEF','Borussia Mönchengladbach',false),
('sui','Manuel Akanji','DEF','Inter Milan',false),
('sui','Ricardo Rodriguez','DEF','Real Betis',false),
('sui','Eray Comert','DEF','Valencia',false),
('sui','Aurele Amenda','DEF','Eintracht Frankfurt',false),
('sui','Luca Jaquez','DEF','VfB Stuttgart',false),
('sui','Denis Zakaria','MED','Monaco',false),
('sui','Remo Freuler','MED','Bologna',false),
('sui','Johan Manzambi','MED','SC Freiburg',false),
('sui','Granit Xhaka','MED','Sunderland',true),
('sui','Ardon Jashari','MED','AC Milan',false),
('sui','Djibril Sow','MED','Sevilla',false),
('sui','Christian Fassnacht','MED','Young Boys',false),
('sui','Michel Aebischer','MED','Pisa',false),
('sui','Fabian Rieder','MED','FC Augsburg',false),
('sui','Breel Embolo','DEL','Stade Rennais',false),
('sui','Dan Ndoye','DEL','Nottingham Forest',false),
('sui','Ruben Vargas','DEL','Sevilla',false),
('sui','Noah Okafor','DEL','Leeds United',false),
('sui','Zeki Amdouni','DEL','Burnley',false),
('sui','Cedric Itten','DEL','Fortuna Dusseldorf',false);

-- TÚNEZ (tun)
DELETE FROM public.players WHERE team_id = 'tun';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('tun','Sabri Ben Hassan','POR','Etoile Sahel',false),
('tun','Abdelmouhib Chamakh','POR','Club Africain',false),
('tun','Aymen Dahmene','POR','CS Sfaxien',false),
('tun','Ali Abdi','DEF','Nice',false),
('tun','Adem Arous','DEF','Kasimpasa',false),
('tun','Mohamed Amine Ben Hamida','DEF','Espérance',false),
('tun','Dylan Bronn','DEF','Servette Geneva',false),
('tun','Raed Chikhaouï','DEF','US Monastir',false),
('tun','Moutaz Neffati','DEF','Norrkoping',false),
('tun','Omar Rekik','DEF','NK Maribor',false),
('tun','Montassar Talbi','DEF','Lorient',false),
('tun','Yan Valery','DEF','Young Boys Berne',false),
('tun','Mortadha Ben Ouanes','MED','Kasimpasa',false),
('tun','Anis Ben Slimane','MED','Norwich City',false),
('tun','Ismael Gharbi','MED','FC Augsburg',false),
('tun','Rani Khedira','MED','Union Berlin',false),
('tun','Mohamed Hadj Mahmoud','MED','Lugano',false),
('tun','Hannibal Mejbri','MED','Burnley',false),
('tun','Ellyes Skhiri','MED','Eintracht Frankfurt',true),
('tun','Elias Achouri','DEL','FC Copenhagen',false),
('tun','Khalil Ayari','DEL','Paris St Germain',false),
('tun','Firas Chaouat','DEL','Club Africain',false),
('tun','Rayan Elloumy','DEL','Vancouver Whitecaps',false),
('tun','Hazem Mastouri','DEL','Dynamo Makhachkala',false),
('tun','Elias Saad','DEL','Hannover 96',false),
('tun','Sebastian Tounekti','DEL','Celtic',false);

-- URUGUAY (uru)
DELETE FROM public.players WHERE team_id = 'uru';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('uru','Sergio Rochet','POR','Internacional',false),
('uru','Fernando Muslera','POR','Estudiantes',false),
('uru','Santiago Mele','POR','Monterrey',false),
('uru','Guillermo Varela','DEF','Flamengo',false),
('uru','Ronald Araújo','DEF','Barcelona',false),
('uru','José María Giménez','DEF','Atlético de Madrid',false),
('uru','Santiago Bueno','DEF','Wolves',false),
('uru','Sebastián Cáceres','DEF','CF América',false),
('uru','Mathías Olivera','DEF','Napoli',false),
('uru','Joaquín Piquerez','DEF','Palmeiras',false),
('uru','Matías Viña','DEF','River Plate',false),
('uru','Manuel Ugarte','MED','Manchester United',false),
('uru','Emiliano Martínez','MED','Palmeiras',false),
('uru','Rodrigo Bentancur','MED','Tottenham Hotspur',false),
('uru','Federico Valverde','MED','Real Madrid',false),
('uru','Agustín Canobbio','MED','Fluminense',false),
('uru','Juan Manuel Sanabria','MED','Real Salt Lake City',false),
('uru','Giorgian de Arrascaeta','MED','Flamengo',false),
('uru','Nicolás de la Cruz','MED','Flamengo',false),
('uru','Rodrigo Zalazar','MED','Braga',false),
('uru','Facundo Pellitri','MED','Panathinaikos',false),
('uru','Maximiliano Araújo','MED','Sporting CP',false),
('uru','Brian Rodríguez','MED','CF América',false),
('uru','Rodrigo Aguirre','DEL','Tigres',false),
('uru','Federico Viñas','DEL','Real Oviedo',false),
('uru','Darwin Núñez','DEL','Al-Hilal',false);

-- ============================================================
-- REMAINING 12 TEAMS (squads researched 2026-06-01)
-- Teams marked ~approximate~ have pending official confirmation
-- ============================================================

-- PORTUGAL (por) — 26 players from official 27; spot for Diogo Jota excluded
DELETE FROM public.players WHERE team_id = 'por';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('por','Diogo Costa','POR','FC Porto',false),
('por','Rui Silva','POR','Sporting CP',false),
('por','José Sá','POR','Wolverhampton Wanderers',false),
('por','Rúben Dias','DEF','Manchester City',false),
('por','Gonçalo Inácio','DEF','Sporting CP',false),
('por','João Cancelo','DEF','FC Barcelona',false),
('por','Nuno Mendes','DEF','Paris Saint-Germain',false),
('por','Diogo Dalot','DEF','Manchester United',false),
('por','Nélson Semedo','DEF','Fenerbahçe SK',false),
('por','Tomás Araújo','DEF','Benfica',false),
('por','Renato Veiga','DEF','Villarreal',false),
('por','Vitinha','MED','Paris Saint-Germain',false),
('por','João Neves','MED','Paris Saint-Germain',false),
('por','Bruno Fernandes','MED','Manchester United',true),
('por','Rúben Neves','MED','Al-Hilal',false),
('por','Matheus Nunes','MED','Manchester City',false),
('por','Samú Costa','MED','Real Mallorca',false),
('por','Bernardo Silva','MED','Manchester City',false),
('por','Cristiano Ronaldo','DEL','Al-Nassr',false),
('por','Francisco Trincão','DEL','Sporting CP',false),
('por','João Félix','DEL','Al-Nassr',false),
('por','Gonçalo Ramos','DEL','Paris Saint-Germain',false),
('por','Pedro Neto','DEL','Chelsea',false),
('por','Francisco Conceição','DEL','Juventus',false),
('por','Rafael Leão','DEL','AC Milan',false),
('por','Gonçalo Guedes','DEL','Real Sociedad',false);

-- SENEGAL (sen) — 26 players
DELETE FROM public.players WHERE team_id = 'sen';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('sen','Edouard Mendy','POR','Al-Ahly',false),
('sen','Mory Diaw','POR',NULL,false),
('sen','Yehvann Diouf','POR','Dijon FCO',false),
('sen','Antoine Mendy','DEF','Leicester City',false),
('sen','Kalidou Koulibaly','DEF','Al-Hilal',true),
('sen','El Hadji Malick Diouf','DEF',NULL,false),
('sen','Mamadou Sarr','DEF',NULL,false),
('sen','Moussa Niakhate','DEF','Lens',false),
('sen','Moustapha Mbow','DEF','Watford',false),
('sen','Abdoulaye Seck','DEF','Lorient',false),
('sen','Ismail Jakobs','DEF','OGC Nice',false),
('sen','Idrissa Gana Gueye','MED','Everton',false),
('sen','Pape Gueye','MED','Olympique Marseille',false),
('sen','Lamine Camara','MED','Monaco',false),
('sen','Habib Diarra','MED','Strasbourg',false),
('sen','Pathe Ciss','MED','Metz',false),
('sen','Pape Matar Sarr','MED','Tottenham Hotspur',false),
('sen','Sadio Mané','DEL','Al-Nassr',false),
('sen','Ismaïla Sarr','DEL','Fenerbahçe',false),
('sen','Iliman Ndiaye','DEL','Everton',false),
('sen','Assane Diao','DEL','Real Betis',false),
('sen','Nicolas Jackson','DEL','Chelsea',false),
('sen','Bamba Dieng','DEL','Al-Shabab',false),
('sen','Cherif Ndiaye','DEL','Al-Fayha',false),
('sen','Krepin Diatta','DEL','Monchengladbach',false),
('sen','Ibrahim Mbaye','DEL','Dijon FCO',false);

-- QATAR (qat) — 26 players
DELETE FROM public.players WHERE team_id = 'qat';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('qat','Saad Al-Sheeb','POR','Al-Sadd',false),
('qat','Meshaal Barsham','POR','Al-Sadd',false),
('qat','Mohammed Al-Shalawi','POR','Al-Duhail',false),
('qat','Boualem Khoukhi','DEF','Al-Sadd',false),
('qat','Pedro Miguel','DEF','Al-Sadd',false),
('qat','Sultan Al Brake','DEF','Al-Duhail',false),
('qat','Bassam Al-Rawi','DEF','Al-Duhail',false),
('qat','Tarek Salman','DEF','Al-Sadd',false),
('qat','Issa Laye','DEF','Al-Arabi',false),
('qat','Lucas Mendes','DEF','Al-Wakrah',false),
('qat','Ahmed Fathi','MED','Al-Arabi',false),
('qat','Jassim Gaber','MED','Al-Rayyan',false),
('qat','Assim Madibo','MED','Al-Wakrah',false),
('qat','Abdulaziz Hatem','MED','Al-Rayyan',false),
('qat','Karim Boudiaf','MED','Al-Duhail',false),
('qat','Mohammed Mannai','MED','Al-Shamal',false),
('qat','Homam Al-Amin','MED','Cultural Leonesa',false),
('qat','Rayyan Al-Ali','MED','Al-Gharafa',false),
('qat','Almoez Ali','DEL','Al-Duhail',false),
('qat','Akram Afif','DEL','Al-Sadd',true),
('qat','Tahsin Mohammed','DEL','Al-Duhail',false),
('qat','Edmílson Junior','DEL','Al-Duhail',false),
('qat','Ahmed Al-Ganehi','DEL','Al-Gharafa',false),
('qat','Ahmed Alaa','DEL','Al-Rayyan',false),
('qat','Hassan Al-Haydos','DEL','Al-Sadd',false),
('qat','Sebastián Soria','DEL','Qatar SC',false);

-- PARAGUAY (par) — ~approximate squad, official list pending
DELETE FROM public.players WHERE team_id = 'par';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('par','Antony Silva','POR','San Lorenzo',false),
('par','Roberto Fernández','POR','Al-Wahda',false),
('par','Alfredo Aguilar','POR','Olimpia',false),
('par','Gustavo Gómez','DEF','Palmeiras',false),
('par','Fabián Balbuena','DEF','Nacional',false),
('par','Omar Alderete','DEF','Getafe',false),
('par','Santiago Villalba','DEF','Lanús',false),
('par','Matías Rojas','DEF','Racing Club',false),
('par','Junior Alonso','DEF','Atlético Mineiro',false),
('par','Iván Piris','DEF','Internacional',false),
('par','Diego Viera','DEF','San Lorenzo',false),
('par','Andrés Cubas','MED','Nantes',false),
('par','Miguel Almirón','MED','Real Betis',false),
('par','Diego Gómez','MED','Brighton',false),
('par','Ángel Romero','MED','Universidad de Chile',false),
('par','Mathías Villasanti','MED','Grêmio',false),
('par','Robert Morales','MED','Olimpia',false),
('par','Gastón Giménez','MED','FC Juarez',false),
('par','Carlos González','DEL','Nottingham Forest',false),
('par','Ramón Sosa','DEL','Nottingham Forest',false),
('par','Julio Enciso','DEL','Brighton',false),
('par','Antonio Sanabria','DEL','Torino',false),
('par','Gabriel Ávalos','DEL','River Plate',false),
('par','Hernán Pérez','DEL','Colón',false),
('par','Marcelo Gamarra','DEF','Cerro Porteño',false),
('par','Blas Riveros','DEF','Huracán',false);

-- TURQUÍA (tur) — best 26 from 35-man preliminary (final announced June 2)
DELETE FROM public.players WHERE team_id = 'tur';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('tur','Altay Bayindir','POR','Manchester United',false),
('tur','Mert Günok','POR','Galatasaray',false),
('tur','Ugurcan Çakır','POR','Galatasaray',false),
('tur','Abdulkerim Bardakci','DEF','Galatasaray',false),
('tur','Çağlar Söyüncü','DEF','Fenerbahçe',false),
('tur','Ferdi Kadıoğlu','DEF','Fenerbahçe',false),
('tur','Merih Demiral','DEF','Al-Ahli',false),
('tur','Mert Müldür','DEF','Fenerbahçe',false),
('tur','Ozan Kabak','DEF','Brighton',false),
('tur','Zeki Çelik','DEF','AS Roma',false),
('tur','Atakan Karazor','MED','Sassuolo',false),
('tur','Hakan Çalhanoğlu','MED','Internazionale',true),
('tur','İsmail Yüksek','MED','Fenerbahçe',false),
('tur','Kaan Ayhan','MED','Fortuna Düsseldorf',false),
('tur','Orkun Kökçü','MED','Besiktas',false),
('tur','Salih Özcan','MED','Borussia Dortmund',false),
('tur','Demir Ege Tıknaz','MED','Galatasaray',false),
('tur','Arda Güler','DEL','Real Madrid',false),
('tur','Barış Alper Yılmaz','DEL','Galatasaray',false),
('tur','Can Uzun','DEL','Nuremberg',false),
('tur','İrfan Can Kahveci','DEL','Fenerbahçe',false),
('tur','Kenan Yıldız','DEL','Juventus',false),
('tur','Kerem Aktürkoğlu','DEL','AS Roma',false),
('tur','Oğuz Aydın','DEL','Galatasaray',false),
('tur','Yunus Akgün','DEL','Galatasaray',false),
('tur','Aral Şimşir','DEL','Eintracht Frankfurt',false);

-- EGIPTO (egy) — official squad (Mohamed Salah reclassified to FWD)
DELETE FROM public.players WHERE team_id = 'egy';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('egy','Mohamed El-Shenawy','POR','Al-Ahly',false),
('egy','Mostafa Shobeir','POR','Al-Ahly',false),
('egy','El-Mahdi Soliman','POR','Zamalek',false),
('egy','Mohamed Abdelmonem','DEF','OGC Nice',false),
('egy','Mohamed Hany','DEF','Al-Ahly',false),
('egy','Yasser Ibrahim','DEF','Al-Ahly',false),
('egy','Hossam Abdelmaguid','DEF','Zamalek',false),
('egy','Ahmed Fatouh','DEF','Zamalek',false),
('egy','Rami Rabia','DEF','Al-Ain',false),
('egy','Hamdi Fathi','DEF','Al-Wakrah',false),
('egy','Karim Hafez','DEF','Pyramids',false),
('egy','Marwan Attia','MED','Al-Ahly',false),
('egy','Ahmed Zizo','MED','Al-Ahly',false),
('egy','Mahmoud Hassan Trezeguet','MED','Al-Ahly',false),
('egy','Emam Ashour','MED','Al-Ahly',false),
('egy','Mohannad Lasheen','MED','Pyramids',false),
('egy','Haitham Hassan','MED','Real Oviedo',false),
('egy','Tarek Alaa','DEF','ZED',false),
('egy','Omar Marmoush','DEL','Manchester City',false),
('egy','Mohamed Salah','DEL','Liverpool',true),
('egy','Hamza Abdel Karim','DEL','Nordsjaelland',false),
('egy','Ibrahim Adel','DEL','Nordsjaelland',false),
('egy','Akram Tawfik','DEL',NULL,false),
('egy','Ahmed Abdelkader','DEL','Al-Ahly',false),
('egy','Mostafa Abdel Raouf','MED',NULL,false),
('egy','Karim Salah','DEL','Sporting CP',false);

-- ARABIA SAUDITA (ksa) — ~26 players
DELETE FROM public.players WHERE team_id = 'ksa';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('ksa','Mohammed Al-Owais','POR','Al-Hilal',false),
('ksa','Nawaf Al-Aqidi','POR','Al-Fayha',false),
('ksa','Mohammed Al-Rubaie','POR','Al-Ahli',false),
('ksa','Hassan Tambakti','DEF','Al-Hilal',false),
('ksa','Jehad Thikri','DEF','Al-Qadsiah',false),
('ksa','Ali Lajami','DEF','Al-Hilal',false),
('ksa','Saud Abdulhamid','DEF','RC Lens',false),
('ksa','Ali Majrashi','DEF','Al-Ahli',false),
('ksa','Moteb Al Harbi','DEF','Al-Hilal',false),
('ksa','Nawaf Boushal','DEF','Al-Nassr',false),
('ksa','Sultan Al-Ghannam','DEF','Al-Nassr',false),
('ksa','Mohammed Kanno','MED','Al-Hilal',false),
('ksa','Abdullah Al Khaibari','MED','Al-Nassr',false),
('ksa','Nasser Al-Dawsari','MED','Al-Hilal',false),
('ksa','Musab Al Juwayr','MED','Al-Qadsiah',false),
('ksa','Salem Al-Dawsari','MED','Al-Hilal',true),
('ksa','Khalid Al Ghannam','MED','Al-Ettifaq',false),
('ksa','Ayman Yahya','MED','Al-Nassr',false),
('ksa','Ziyad Al Johani','MED','Al-Ahli',false),
('ksa','Firas Al-Buraikan','DEL','Al-Ahli',false),
('ksa','Saleh Al-Shehri','DEL','Al-Ittihad',false),
('ksa','Abdullah Al-Hamdan','DEL','Al-Nassr',false),
('ksa','Hassan Kadesh','DEL','Al-Ittihad',false),
('ksa','Alaa Al Hajji','MED','Neom',false),
('ksa','Mohammed Abu Al Shamat','DEF','Al-Qadsiah',false),
('ksa','Abdulelah Al Amri','DEF','Al-Nassr',false);

-- IRÁN (irn) — official squad
DELETE FROM public.players WHERE team_id = 'irn';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('irn','Alireza Beiranvand','POR','Persepolis',false),
('irn','Hossein Hosseini','POR','Persepolis',false),
('irn','Payam Niazmand','POR','Esteghlal',false),
('irn','Danial Eiri','DEF','Esteghlal',false),
('irn','Ehsan Hajsafi','DEF','Trabzonspor',true),
('irn','Saleh Hardani','DEF','Saipa',false),
('irn','Hossein Kanaani','DEF','Persepolis',false),
('irn','Shoja Khalilzadeh','DEF','AEK Athens',false),
('irn','Milad Mohammadi','DEF','Atalanta',false),
('irn','Ali Nemati','DEF','Persepolis',false),
('irn','Ramin Rezaeian','DEF',NULL,false),
('irn','Rouzbeh Cheshmi','MED','Sunderland',false),
('irn','Saeid Ezatolahi','MED','Volga Nizhny Novgorod',false),
('irn','Mehdi Ghaedi','MED','Esteghlal',false),
('irn','Saman Ghoddos','MED','Brentford',false),
('irn','Mohammad Ghorbani','MED','Persepolis',false),
('irn','Alireza Jahanbakhsh','MED','AEK Athens',false),
('irn','Mohammad Mohebi','MED','Esteghlal',false),
('irn','Amir Mohammad Razzaghinia','MED','Persepolis',false),
('irn','Mehdi Taremi','DEL','Olympiacos',false),
('irn','Ali Alipour','DEL','Kaiserslautern',false),
('irn','Amirhossein Hosseinzadeh','DEL','Al-Fayha',false),
('irn','Hadi Habibinejad','DEL','Persepolis',false),
('irn','Kasra Taheri','DEL',NULL,false),
('irn','Mehdi Torabi','DEL',NULL,false),
('irn','Aria Yousefi','DEL','Volos NFC',false);

-- IRAK (irq) — partial squad (full list pending confirmation)
DELETE FROM public.players WHERE team_id = 'irq';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('irq','Ahmed Basil','POR','Beerschot',false),
('irq','Jalal Hassan','POR','Al-Zawraa',false),
('irq','Fahad Talib','POR','Al-Zawraa',false),
('irq','Ali Adnan','DEF','Colorado Rapids',false),
('irq','Ali Faez','DEF','Al-Zawraa',false),
('irq','Hussein Ali','DEF','Al-Zawraa',false),
('irq','Rebin Sulaka','DEF','Hammarby',false),
('irq','Mustafa Nadhim','DEF','Al-Zawraa',false),
('irq','Amjad Kalaf','DEF','Al-Zawraa',false),
('irq','Hmood Almosawi','DEF','Al-Shorta',false),
('irq','Kevin Yakob','DEF',NULL,false),
('irq','Amjad Attwan','MED','Al-Zawraa',false),
('irq','Safaa Hadi','MED','Al-Zawraa',false),
('irq','Zidane Iqbal','MED','Utrecht',false),
('irq','Aimar Sher','MED','Heerenveen',false),
('irq','Ali Jassim','MED',NULL,false),
('irq','Amir Al-Ammari','MED',NULL,false),
('irq','Osama Rashid','MED','Al-Shorta',false),
('irq','Mohanad Ali','MED','Al-Zawraa',false),
('irq','Aymen Hussein','DEL','Al-Zawraa',true),
('irq','Ali Al-Hamadi','DEL','Ipswich Town',false),
('irq','Alaa Abbas','DEL','Al-Zawraa',false),
('irq','Ibrahim Bayesh','DEL','Al-Shorta',false),
('irq','Ahmed Yasin','DEL','Al-Zawraa',false),
('irq','Emad Mohammed','DEL','Al-Zawraa',false),
('irq','Bassam Rashed','DEL','Al-Diwaniya',false);

-- JORDANIA (jor) — ~26 players (partial official data)
DELETE FROM public.players WHERE team_id = 'jor';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('jor','Yazid Abulaila','POR','Al-Hussein',false),
('jor','Abdallah Al Fakhouri','POR','Al-Wehdat',false),
('jor','Nour Bani Attiah','POR','Al-Faisaly',false),
('jor','Mohammad Abualnadi','DEF','Selangor',false),
('jor','Yousef Abu Al Jazar','DEF','Al-Hussein',false),
('jor','Husam Abu Dahab','DEF','Al-Samiya',false),
('jor','Mohammad Abu Hashish','DEF','Al-Karma',false),
('jor','Yazan Al Arab','DEF','Suwon Samsung Bluewings',false),
('jor','Abdallah Nasib','DEF','Al-Zawraa',false),
('jor','Saleem Obaid','DEF','Al-Hussein',false),
('jor','Mohammad Al Dawoud','MED','Al-Wehdat',false),
('jor','Nizar Al Rashdan','MED','Qatar SC',false),
('jor','Noor Al Rawabdeh','MED','Selangor',false),
('jor','Rajaei Ayed','MED','Al-Hussein',false),
('jor','Amer Jamous','MED','Al-Zawraa',false),
('jor','Yousef Qashi','MED',NULL,false),
('jor','Ibrahim Sadeh','MED','Al-Karma',false),
('jor','Ahmad Eid','MED','Al-Faisaly',false),
('jor','Mousa Al Tamari','DEL','Stade Rennais',false),
('jor','Mahmoud Al-Mardi','DEL','Al-Hussein',false),
('jor','Mohannad Abu Taha','DEL','Al-Quwa',false),
('jor','Yazan Al-Naimat','DEL','Al-Arabi',false),
('jor','Ali Olwan','DEL','Al-Sailiya',false),
('jor','Ibrahim Sabra','DEL','Dinamo Zagreb',false),
('jor','Baha Faisal','DEL','Al-Faisaly',false),
('jor','Omar Al-Dmeiri','DEF','Al-Hayat',false);

-- UZBEKISTÁN (uzb) — partial squad
DELETE FROM public.players WHERE team_id = 'uzb';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('uzb','O''tkir Yusupov','POR','Pakhtakor',false),
('uzb','Botirali Ergashev','POR','Navbahor',false),
('uzb','Abduvohid Ne''matov','POR',NULL,false),
('uzb','Abdukodir Khusanov','DEF','Manchester City',false),
('uzb','Khojiakbar Alijonov','DEF',NULL,false),
('uzb','Igor Sergeyev','DEF',NULL,false),
('uzb','Sanjar Tursunov','DEF','Pakhtakor',false),
('uzb','Jasurbek Yakhshiboev','DEF','Pakhtakor',false),
('uzb','Dostonbek Khamdamov','DEF',NULL,false),
('uzb','Behruzbek Shomurodov','DEF','Pakhtakor',false),
('uzb','Sherzod Esanov','MED','Lokomotiv Moscow',false),
('uzb','Odil Hamrobekov','MED','Pakhtakor',false),
('uzb','Akmal Mozgovoy','MED',NULL,false),
('uzb','Otabek Shukurov','MED','Al-Wasl',false),
('uzb','Jamshid Iskanderov','MED',NULL,false),
('uzb','Jasur Jaloliddinov','MED','Pakhtakor',false),
('uzb','Aziz G''aniyev','MED',NULL,false),
('uzb','Umarali Rahmonaliyev','MED',NULL,false),
('uzb','Sherzod Temirov','MED','Pakhtakor',false),
('uzb','Eldor Shomurodov','DEL','Istanbul Basaksehir',true),
('uzb','Abbos Fayzullayev','DEL','Al-Shamal',false),
('uzb','Jaloliddin Masharipov','DEL',NULL,false),
('uzb','Doston Hamdamov','DEL','Pakhtakor',false),
('uzb','Oston O''runov','DEL',NULL,false),
('uzb','Aziz Amonov','DEL','Pakhtakor',false),
('uzb','Ruslan Jiyanov','DEL',NULL,false);

-- GHANA (gha) — ~26 players (partial official data)
DELETE FROM public.players WHERE team_id = 'gha';
INSERT INTO public.players (team_id, name, position, club, is_captain) VALUES
('gha','Lawrence Ati-Zigi','POR','St Gallen',false),
('gha','Ibrahim Danlad','POR','Asante Kotoko',false),
('gha','Richard Ofori','POR','Orlando Pirates',false),
('gha','Alexander Djiku','DEF','Fenerbahçe',false),
('gha','Daniel Amartey','DEF','Besiktas',false),
('gha','Gideon Mensah','DEF','Auxerre',false),
('gha','Baba Abdul Rahman','DEF','Al-Wehdat',false),
('gha','Mohammed Salisu','DEF','Southampton',false),
('gha','Tariq Lamptey','DEF','Brighton',false),
('gha','Dennis Odoi','DEF','Club Brugge',false),
('gha','Alidu Seidu','DEF','Clermont Foot',false),
('gha','Thomas Partey','MED','Villarreal',true),
('gha','Elisha Owusu','MED','AZ Alkmaar',false),
('gha','Abdul Fatawu','MED','Leicester City',false),
('gha','Daniel Kofi Kyereh','MED','Freiburg',false),
('gha','Salis Abdul Samed','MED','RC Lens',false),
('gha','Majeed Ashimeru','MED','Anderlecht',false),
('gha','Emmanuel Lomotey','MED','Ferencváros',false),
('gha','Iñaki Williams','DEL','Athletic Club',false),
('gha','Antoine Semenyo','DEL','Manchester City',false),
('gha','Jordan Ayew','DEL','Leicester City',false),
('gha','Ernest Nuamah','DEL','Olympique Lyonnais',false),
('gha','Christopher Bonsu Baah','DEL','Al-Qadsiah',false),
('gha','Kamal Deen Sulemana','DEL','Atlanta United',false),
('gha','Brandon Thomas-Asante','DEL','Coventry City',false),
('gha','Abdul Manaf Nurudeen','POR','Eupen',false);

-- ============================================================
-- REMOVE ITALY (not in WC 2026)
-- ============================================================
DELETE FROM public.players WHERE team_id = 'ita';
