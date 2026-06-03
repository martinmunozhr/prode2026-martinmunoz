-- Rareza por JERARQUÍA REAL del jugador (cualquier posición), no por posición.
-- Supera a 20260603120000_rarity_by_goal_threat.sql (que era puramente posicional:
-- DEF/POR=comun, MED=raro, DEL=epico). Ahora arqueros y defensores de élite suben
-- (Donnarumma, Van Dijk, Alisson, Maignan, Dibu Martínez, etc.).
--
-- Criterio: legendario = cracks/figuras del equipo; epico = titulares clave;
-- raro = plantel sólido; comun = fondo. Pirámide ~2/5/8/11 por equipo (potencias
-- hasta 4 legendarios). Research por país (jun-2026) + conocimiento futbolístico.
--
-- Reset global y reasignación por selección.
update players set rarity='comun' where team_id <> 'tbd';

-- ===== GRUPO A =====
update players set rarity='legendario' where team_id='kor' and name in ('Son Heung-min','Kim Min-jae');
update players set rarity='epico' where team_id='kor' and name in ('Lee Kang-in','Hwang Hee-chan','Hwang In-beom','Lee Jae-sung','Jo Hyeon-woo');
update players set rarity='raro' where team_id='kor' and name in ('Cho Gue-sung','Bae Jun-ho','Seol Young-woo','Kim Moon-hwan','Paik Seung-ho','Oh Hyeon-gyu','Cho Yu-min','Yang Hyun-jun');
update players set rarity='legendario' where team_id='mex' and name in ('Santiago Giménez','Edson Álvarez');
update players set rarity='epico' where team_id='mex' and name in ('Raúl Jiménez','Johan Vásquez','Orbelín Pineda','Gilberto Mora','Guillermo Ochoa');
update players set rarity='raro' where team_id='mex' and name in ('César Montes','Luis Romo','Luis Chávez','Roberto Alvarado','Alexis Vega','Julián Quiñones','Jorge Sánchez','Jesús Gallardo');
update players set rarity='legendario' where team_id='cze' and name in ('Patrik Schick','Tomáš Souček');
update players set rarity='epico' where team_id='cze' and name in ('Adam Hložek','Ladislav Krejčí','Vladimír Coufal','Lukáš Provod','Pavel Šulc');
update players set rarity='raro' where team_id='cze' and name in ('Jindřich Staněk','David Jurásek','Tomáš Holeš','Robin Hranáč','Michal Sadílek','Lukáš Červ','Tomáš Chorý','Vladimír Darida');
update players set rarity='legendario' where team_id='rsa' and name in ('Lyle Foster','Ronwen Williams');
update players set rarity='epico' where team_id='rsa' and name in ('Teboho Mokoena','Relebohile Mofokeng','Themba Zwane','Iqraam Rayners','Aubrey Modiba');
update players set rarity='raro' where team_id='rsa' and name in ('Khuliso Mudau','Nkosinathi Sibisi','Sphephelo Sithole','Thalente Mbatha','Jayden Adams','Evidence Makgopa','Thapelo Maseko','Oswin Apollis');

-- ===== GRUPO B =====
update players set rarity='legendario' where team_id='sui' and name in ('Manuel Akanji','Granit Xhaka');
update players set rarity='epico' where team_id='sui' and name in ('Gregor Kobel','Dan Ndoye','Breel Embolo','Denis Zakaria','Ricardo Rodriguez');
update players set rarity='raro' where team_id='sui' and name in ('Nico Elvedi','Silvan Widmer','Remo Freuler','Michel Aebischer','Ruben Vargas','Ardon Jashari','Fabian Rieder','Noah Okafor');
update players set rarity='legendario' where team_id='can' and name in ('Alphonso Davies','Jonathan David');
update players set rarity='epico' where team_id='can' and name in ('Stephen Eustáquio','Tajon Buchanan','Cyle Larin','Alistair Johnston','Ismaël Koné');
update players set rarity='raro' where team_id='can' and name in ('Moïse Bombito','Derek Cornelius','Dayne St. Clair','Richie Laryea','Jonathan Osorio','Liam Millar','Tani Oluwaseyi','Promise David');
update players set rarity='legendario' where team_id='qat' and name in ('Akram Afif','Almoez Ali');
update players set rarity='epico' where team_id='qat' and name in ('Hassan Al-Haydos','Boualem Khoukhi','Assim Madibo','Meshaal Barsham','Karim Boudiaf');
update players set rarity='raro' where team_id='qat' and name in ('Bassam Al-Rawi','Pedro Miguel','Tarek Salman','Abdulaziz Hatem','Edmílson Junior','Ahmed Alaa','Lucas Mendes','Mohammed Mannai');
update players set rarity='legendario' where team_id='bih' and name in ('Edin Dzeko','Ermedin Demirovic');
update players set rarity='epico' where team_id='bih' and name in ('Sead Kolasinac','Amar Dedic','Benjamin Tahirovic','Nikola Katic','Haris Tabakovic');
update players set rarity='raro' where team_id='bih' and name in ('Nikola Vasilj','Amir Hadziahmetovic','Ivan Sunjic','Esmir Bajraktarevic','Nihad Mujakic','Armin Gigovic','Samed Bazdar','Dennis Hadzikadunic');

-- ===== GRUPO C =====
update players set rarity='legendario' where team_id='bra' and name in ('Vinícius Júnior','Raphinha','Neymar','Alisson');
update players set rarity='epico' where team_id='bra' and name in ('Marquinhos','Bruno Guimarães','Casemiro','Matheus Cunha','Gabriel Magalhães');
update players set rarity='raro' where team_id='bra' and name in ('Ederson','Danilo','Bremer','Lucas Paquetá','Gabriel Martinelli','Endrick','Wesley','Douglas Santos');
update players set rarity='legendario' where team_id='mar' and name in ('Achraf Hakimi','Yassine Bounou','Brahim Díaz');
update players set rarity='epico' where team_id='mar' and name in ('Nayef Aguerd','Noussair Mazraoui','Sofyan Amrabat','Bilal El Khannouss','Ayoub El Kaabi');
update players set rarity='raro' where team_id='mar' and name in ('Azzedine Ounahi','Soufiane Rahimi','Abdessamad Ezzalzouli','Ismael Saibari','Chadi Riad','Ayyoub Bouaddi','Neil El Aynaoui','Ahmed Reda Tagnaouti');
update players set rarity='legendario' where team_id='sco' and name in ('Andy Robertson','Scott McTominay');
update players set rarity='epico' where team_id='sco' and name in ('Billy Gilmour','John McGinn','Kieran Tierney','Lewis Ferguson','Che Adams');
update players set rarity='raro' where team_id='sco' and name in ('Angus Gunn','Jack Hendry','Grant Hanley','Ryan Christie','Lawrence Shankland','Ben Gannon-Doak','Nathan Patterson','Lyndon Dykes');
update players set rarity='legendario' where team_id='hai' and name in ('Wilson Isidor','Jean-Ricner Bellegarde');
update players set rarity='epico' where team_id='hai' and name in ('Duckens Nazon','Derrick Etienne Jr.','Hannes Delcroix','Danley Jean Jacques','Ruben Providence');
update players set rarity='raro' where team_id='hai' and name in ('Johnny Placide','Carlens Arcus','Jean-Kevin Duverné','Ricardo Adé','Carl Sainté','Frantzy Perrot','Josué Casimir','Lenny Joseph');

-- ===== GRUPO D =====
update players set rarity='legendario' where team_id='aus' and name in ('Mathew Ryan','Jackson Irvine');
update players set rarity='epico' where team_id='aus' and name in ('Harry Souttar','Jordan Bos','Nestory Irankunda','Connor Metcalfe','Mathew Leckie');
update players set rarity='raro' where team_id='aus' and name in ('Aziz Behich','Cameron Burgess','Milos Degenek','Aiden O''Neill','Cristian Volpato','Awer Mabil','Ajdin Hrustic','Cammy Devlin');
update players set rarity='legendario' where team_id='usa' and name in ('Christian Pulisic','Weston McKennie','Antonee Robinson');
update players set rarity='epico' where team_id='usa' and name in ('Tyler Adams','Folarin Balogun','Sergiño Dest','Gio Reyna','Chris Richards');
update players set rarity='raro' where team_id='usa' and name in ('Tim Weah','Ricardo Pepi','Malik Tillman','Matt Turner','Brenden Aaronson','Miles Robinson','Tim Ream','Joe Scally');
update players set rarity='legendario' where team_id='par' and name in ('Miguel Almirón','Julio Enciso');
update players set rarity='epico' where team_id='par' and name in ('Gustavo Gómez','Omar Alderete','Antonio Sanabria','Andrés Cubas','Diego Gómez');
update players set rarity='raro' where team_id='par' and name in ('Junior Alonso','Fabián Balbuena','Mathías Villasanti','Ángel Romero','Ramón Sosa','Roberto Fernández','Gastón Giménez','Blas Riveros');
update players set rarity='legendario' where team_id='tur' and name in ('Arda Güler','Hakan Çalhanoğlu','Kenan Yıldız');
update players set rarity='epico' where team_id='tur' and name in ('Ferdi Kadıoğlu','Merih Demiral','Orkun Kökçü','Kerem Aktürkoğlu','Barış Alper Yılmaz');
update players set rarity='raro' where team_id='tur' and name in ('Çağlar Söyüncü','Zeki Çelik','Ozan Kabak','Salih Özcan','İrfan Can Kahveci','Yunus Akgün','Can Uzun','Ugurcan Çakır');

-- ===== GRUPO E =====
update players set rarity='legendario' where team_id='ger' and name in ('Florian Wirtz','Jamal Musiala','Joshua Kimmich','Kai Havertz');
update players set rarity='epico' where team_id='ger' and name in ('Antonio Rüdiger','Leroy Sané','Leon Goretzka','Nico Schlotterbeck','Manuel Neuer');
update players set rarity='raro' where team_id='ger' and name in ('Jonathan Tah','David Raum','Aleksandar Pavlovic','Angelo Stiller','Deniz Undav','Nick Woltemade','Maximilian Beier','Malick Thiaw');
update players set rarity='legendario' where team_id='civ' and name in ('Franck Kessié','Amad Diallo','Wilfried Singo');
update players set rarity='epico' where team_id='civ' and name in ('Evan Ndicka','Odilon Kossounou','Ibrahim Sangaré','Nicolas Pépé','Simon Adingra');
update players set rarity='raro' where team_id='civ' and name in ('Seko Fofana','Jean-Michaël Seri','Ousmane Diomande','Guela Doué','Evann Guessand','Elye Wahi','Alban Lafont','Yan Diomande');
update players set rarity='legendario' where team_id='cuw' and name in ('Tahith Chong','Leandro Bacuna');
update players set rarity='epico' where team_id='cuw' and name in ('Juninho Bacuna','Eloy Room','Jurgen Locadia','Riechedly Bazoer','Sontje Hansen');
update players set rarity='raro' where team_id='cuw' and name in ('Armando Obispo','Joshua Brenet','Shurandy Sambo','Livano Comenencia','Gervane Kastaneer','Brandley Kuwas','Kenji Gorré','Tyrese Noslin');
update players set rarity='legendario' where team_id='ecu' and name in ('Moisés Caicedo','Willian Pacho','Piero Hincapié');
update players set rarity='epico' where team_id='ecu' and name in ('Pervis Estupiñán','Enner Valencia','Kendry Páez','Gonzalo Plata','Ángelo Preciado');
update players set rarity='raro' where team_id='ecu' and name in ('Félix Torres','Joel Ordóñez','Alan Franco','Moisés Ramírez','Kevin Rodríguez','Nilson Angulo','Pedro Vite','Jeremy Arévalo');

-- ===== GRUPO F =====
update players set rarity='legendario' where team_id='ned' and name in ('Virgil van Dijk','Frenkie de Jong','Memphis Depay','Cody Gakpo');
update players set rarity='epico' where team_id='ned' and name in ('Denzel Dumfries','Nathan Aké','Ryan Gravenberch','Tijjani Reijnders','Jurriën Timber');
update players set rarity='raro' where team_id='ned' and name in ('Bart Verbruggen','Micky van de Ven','Jorrel Hato','Teun Koopmeiners','Donyell Malen','Brian Brobbey','Justin Kluivert','Noa Lang');
update players set rarity='legendario' where team_id='jpn' and name in ('Takefusa Kubo','Wataru Endo','Daichi Kamada');
update players set rarity='epico' where team_id='jpn' and name in ('Takehiro Tomiyasu','Ko Itakura','Ritsu Doan','Junya Ito','Zion Suzuki');
update players set rarity='raro' where team_id='jpn' and name in ('Hiroki Ito','Ao Tanaka','Daizen Maeda','Ayase Ueda','Keito Nakamura','Yukinari Sugawara','Koki Ogawa','Kaishu Sano');
update players set rarity='legendario' where team_id='swe' and name in ('Alexander Isak','Viktor Gyökeres');
update players set rarity='epico' where team_id='swe' and name in ('Anthony Elanga','Victor Lindelöf','Isak Hien','Lucas Bergvall','Gabriel Gudmundsson');
update players set rarity='raro' where team_id='swe' and name in ('Mattias Svanberg','Ken Sema','Yasin Ayari','Benjamin Nygren','Viktor Johansson','Carl Starfelt','Daniel Svensson','Jesper Karlström');
update players set rarity='legendario' where team_id='tun' and name in ('Hannibal Mejbri','Ellyes Skhiri');
update players set rarity='epico' where team_id='tun' and name in ('Montassar Talbi','Ali Abdi','Dylan Bronn','Elias Saad','Sebastian Tounekti');
update players set rarity='raro' where team_id='tun' and name in ('Rani Khedira','Anis Ben Slimane','Omar Rekik','Yan Valery','Aymen Dahmene','Elias Achouri','Firas Chaouat','Ismael Gharbi');

-- ===== GRUPO G =====
update players set rarity='legendario' where team_id='bel' and name in ('Kevin De Bruyne','Thibaut Courtois','Romelu Lukaku','Jeremy Doku');
update players set rarity='epico' where team_id='bel' and name in ('Youri Tielemans','Amadou Onana','Leandro Trossard','Charles De Ketelaere','Timothy Castagne');
update players set rarity='raro' where team_id='bel' and name in ('Zeno Debast','Koni De Winter','Arthur Theate','Thomas Meunier','Maxim De Cuyper','Hans Vanaken','Alexis Saelemaekers','Dodi Lukebakio');
update players set rarity='legendario' where team_id='irn' and name in ('Mehdi Taremi','Alireza Jahanbakhsh');
update players set rarity='epico' where team_id='irn' and name in ('Saman Ghoddos','Mehdi Ghaedi','Alireza Beiranvand','Ehsan Hajsafi','Ramin Rezaeian');
update players set rarity='raro' where team_id='irn' and name in ('Saeid Ezatolahi','Rouzbeh Cheshmi','Mohammad Mohebi','Milad Mohammadi','Shoja Khalilzadeh','Amirhossein Hosseinzadeh','Ali Alipour','Mehdi Torabi');
update players set rarity='legendario' where team_id='egy' and name in ('Mohamed Salah','Omar Marmoush');
update players set rarity='epico' where team_id='egy' and name in ('Mahmoud Hassan Trezeguet','Mohamed El-Shenawy','Emam Ashour','Mohamed Abdelmonem','Ahmed Zizo');
update players set rarity='raro' where team_id='egy' and name in ('Hamdi Fathi','Ibrahim Adel','Ahmed Fatouh','Mohamed Hany','Rami Rabia','Marwan Attia','Akram Tawfik','Ahmed Abdelkader');
update players set rarity='legendario' where team_id='nzl' and name in ('Chris Wood','Liberato Cacace');
update players set rarity='epico' where team_id='nzl' and name in ('Marko Stamenić','Tyler Bindon','Alex Paulsen','Ben Old','Matt Garbett');
update players set rarity='raro' where team_id='nzl' and name in ('Michael Boxall','Tommy Smith','Tim Payne','Joe Bell','Ryan Thomas','Sarpreet Singh','Kosta Barbarouses','Ben Waine');

-- ===== GRUPO H =====
update players set rarity='legendario' where team_id='esp' and name in ('Lamine Yamal','Rodrigo Hernández Rodri','Pedri González','Nico Williams');
update players set rarity='epico' where team_id='esp' and name in ('Pablo Páez Gavi','Fabián Ruiz','Dani Olmo','Mikel Merino','David Raya');
update players set rarity='raro' where team_id='esp' and name in ('Aymeric Laporte','Pau Cubarsí','Marc Cucurella','Pedro Porro','Alejandro Grimaldo','Martín Zubimendi','Ferran Torres','Mikel Oyarzabal');
update players set rarity='legendario' where team_id='uru' and name in ('Federico Valverde','Ronald Araújo','Darwin Núñez');
update players set rarity='epico' where team_id='uru' and name in ('Rodrigo Bentancur','Manuel Ugarte','José María Giménez','Giorgian de Arrascaeta','Nicolás de la Cruz');
update players set rarity='raro' where team_id='uru' and name in ('Mathías Olivera','Joaquín Piquerez','Sebastián Cáceres','Guillermo Varela','Sergio Rochet','Maximiliano Araújo','Brian Rodríguez','Fernando Muslera');
update players set rarity='legendario' where team_id='ksa' and name in ('Salem Al-Dawsari','Firas Al-Buraikan');
update players set rarity='epico' where team_id='ksa' and name in ('Mohammed Al-Owais','Saud Abdulhamid','Mohammed Kanno','Nasser Al-Dawsari','Saleh Al-Shehri');
update players set rarity='raro' where team_id='ksa' and name in ('Hassan Tambakti','Abdulelah Al Amri','Sultan Al-Ghannam','Ali Lajami','Abdullah Al Khaibari','Khalid Al Ghannam','Musab Al Juwayr','Abdullah Al-Hamdan');
update players set rarity='legendario' where team_id='cpv' and name in ('Ryan Mendes','Logan Costa');
update players set rarity='epico' where team_id='cpv' and name in ('Jovane Cabral','Garry Rodrigues','Jamiro Monteiro','Steven Moreira','Deroy Duarte');
update players set rarity='raro' where team_id='cpv' and name in ('Roberto Lopes Pico','Ianique Tavares Stopira','Wagner Pina','Josimar Dias Vozinha','Kevin Pina','Laros Duarte','Telmo Arcanjo','Willy Semedo');

-- ===== GRUPO I =====
update players set rarity='legendario' where team_id='fra' and name in ('Kylian Mbappé','Ousmane Dembélé','Mike Maignan','William Saliba');
update players set rarity='epico' where team_id='fra' and name in ('Aurélien Tchouaméni','Jules Koundé','Dayot Upamecano','Marcus Thuram','Michael Olise');
update players set rarity='raro' where team_id='fra' and name in ('Ibrahima Konaté','Theo Hernandez','Adrien Rabiot','N''Golo Kanté','Bradley Barcola','Rayan Cherki','Désiré Doué','Warren Zaïre-Emery');
update players set rarity='legendario' where team_id='sen' and name in ('Sadio Mané','Kalidou Koulibaly','Nicolas Jackson');
update players set rarity='epico' where team_id='sen' and name in ('Ismaïla Sarr','Pape Matar Sarr','Idrissa Gana Gueye','Iliman Ndiaye','Edouard Mendy');
update players set rarity='raro' where team_id='sen' and name in ('Lamine Camara','Habib Diarra','Pape Gueye','Krepin Diatta','El Hadji Malick Diouf','Ismail Jakobs','Moussa Niakhate','Assane Diao');
update players set rarity='legendario' where team_id='nor' and name in ('Erling Haaland','Martin Ødegaard','Alexander Sørloth');
update players set rarity='epico' where team_id='nor' and name in ('Antonio Nusa','Sander Berge','Kristoffer Ajer','Fredrik Aursnes','Oscar Bobb');
update players set rarity='raro' where team_id='nor' and name in ('Julian Ryerson','Leo Skiri Østigård','Andreas Schjelderup','Kristian Thorstvedt','Jørgen Strand Larsen','Ørjan Nyland','Patrick Berg','Thelo Aasgaard');
update players set rarity='legendario' where team_id='irq' and name in ('Ali Al-Hamadi','Zidane Iqbal');
update players set rarity='epico' where team_id='irq' and name in ('Aymen Hussein','Mohanad Ali','Amir Al-Ammari','Aimar Sher','Ali Adnan');
update players set rarity='raro' where team_id='irq' and name in ('Jalal Hassan','Rebin Sulaka','Hussein Ali','Osama Rashid','Ali Jassim','Amjad Attwan','Ibrahim Bayesh','Ahmed Yasin');

-- ===== GRUPO J =====
update players set rarity='legendario' where team_id='arg' and name in ('Lionel Messi','Lautaro Martínez','Emiliano Martínez','Julián Álvarez');
update players set rarity='epico' where team_id='arg' and name in ('Cristian Romero','Lisandro Martínez','Enzo Fernández','Alexis Mac Allister','Rodrigo De Paul');
update players set rarity='raro' where team_id='arg' and name in ('Nicolás Otamendi','Nahuel Molina','Nicolás Tagliafico','Gonzalo Montiel','Leandro Paredes','Giovani Lo Celso','Nicolás González','Thiago Almada');
update players set rarity='legendario' where team_id='aut' and name in ('David Alaba','Marcel Sabitzer');
update players set rarity='epico' where team_id='aut' and name in ('Konrad Laimer','Christoph Baumgartner','Kevin Danso','Nicolas Seiwald','Marko Arnautović');
update players set rarity='raro' where team_id='aut' and name in ('Xaver Schlager','Patrick Wimmer','Romano Schmid','Paul Wanner','Alexander Prass','Philipp Lienhart','Stefan Posch','Michael Gregoritsch');
update players set rarity='legendario' where team_id='alg' and name in ('Riyad Mahrez','Amine Gouiri','Ramy Bensebaini');
update players set rarity='epico' where team_id='alg' and name in ('Mohamed Amine Amoura','Rayan Aït-Nouri','Houssem Aouar','Farès Chaïbi','Nabil Bentaleb');
update players set rarity='raro' where team_id='alg' and name in ('Aïssa Mandi','Hicham Boudaoui','Ramiz Zerrouki','Ibrahim Maza','Anis Hadj Moussa','Luca Zidane','Jaouen Hadjam','Adil Boulbina');
update players set rarity='legendario' where team_id='jor' and name in ('Mousa Al Tamari','Yazan Al-Naimat');
update players set rarity='epico' where team_id='jor' and name in ('Ali Olwan','Noor Al Rawabdeh','Nizar Al Rashdan','Yazan Al Arab','Mahmoud Al-Mardi');
update players set rarity='raro' where team_id='jor' and name in ('Abdallah Nasib','Mohammad Abualnadi','Saleem Obaid','Ahmad Eid','Rajaei Ayed','Yousef Qashi','Abdallah Al Fakhouri','Baha Faisal');

-- ===== GRUPO K =====
update players set rarity='legendario' where team_id='por' and name in ('Cristiano Ronaldo','Bruno Fernandes','Rafael Leão','Rúben Dias');
update players set rarity='epico' where team_id='por' and name in ('Vitinha','Bernardo Silva','Nuno Mendes','Diogo Costa','João Neves');
update players set rarity='raro' where team_id='por' and name in ('João Cancelo','Diogo Dalot','Gonçalo Inácio','Pedro Neto','João Félix','Gonçalo Ramos','Rúben Neves','Matheus Nunes');
update players set rarity='legendario' where team_id='col' and name in ('Luis Díaz','James Rodríguez','Richard Ríos');
update players set rarity='epico' where team_id='col' and name in ('Davinson Sánchez','Jhon Lucumí','Daniel Muñoz','Jefferson Lerma','Jhon Córdoba');
update players set rarity='raro' where team_id='col' and name in ('Jhon Arias','Juan Fernando Quintero','Jorge Carrascal','Kevin Castaño','Camilo Vargas','David Ospina','Yerry Mina','Johan Mojica');
update players set rarity='legendario' where team_id='cod' and name in ('Yoane Wissa','Chancel Mbemba');
update players set rarity='epico' where team_id='cod' and name in ('Aaron Wan-Bissaka','Arthur Masuaku','Théo Bongonda','Cédric Bakambu','Gaël Kakuta');
update players set rarity='raro' where team_id='cod' and name in ('Edo Kayembe','Charles Pickel','Samuel Moutoussamy','Noah Sadiki','Simon Banza','Fiston Mayele','Rocky Bushiri','Axel Tuanzebe');
update players set rarity='legendario' where team_id='uzb' and name in ('Abdukodir Khusanov','Eldor Shomurodov');
update players set rarity='epico' where team_id='uzb' and name in ('Abbos Fayzullayev','Jaloliddin Masharipov','Otabek Shukurov','Igor Sergeyev','Jamshid Iskanderov');
update players set rarity='raro' where team_id='uzb' and name in ('Doston Hamdamov','Khojiakbar Alijonov','Sanjar Tursunov','Odil Hamrobekov','Aziz Ganiyev','Ruslan Jiyanov','Oston Orunov','Jasurbek Yakhshiboev');

-- ===== GRUPO L =====
update players set rarity='legendario' where team_id='ing' and name in ('Jude Bellingham','Harry Kane','Bukayo Saka','Declan Rice');
update players set rarity='epico' where team_id='ing' and name in ('John Stones','Marc Guehi','Reece James','Jordan Pickford','Marcus Rashford');
update players set rarity='raro' where team_id='ing' and name in ('Ezri Konsa','Eberechi Eze','Kobbie Mainoo','Morgan Rogers','Anthony Gordon','Ollie Watkins','Noni Madueke','Dan Burn');
update players set rarity='legendario' where team_id='cro' and name in ('Luka Modrić','Joško Gvardiol','Mateo Kovačić');
update players set rarity='epico' where team_id='cro' and name in ('Josip Stanišić','Josip Šutalo','Marin Pongračić','Andrej Kramarić','Dominik Livaković');
update players set rarity='raro' where team_id='cro' and name in ('Luka Sučić','Petar Sučić','Mario Pašalić','Nikola Vlašić','Ivan Perišić','Petar Musa','Duje Ćaleta-Car','Martin Baturina');
update players set rarity='legendario' where team_id='gha' and name in ('Thomas Partey','Iñaki Williams','Antoine Semenyo');
update players set rarity='epico' where team_id='gha' and name in ('Jordan Ayew','Mohammed Salisu','Tariq Lamptey','Abdul Fatawu','Ernest Nuamah');
update players set rarity='raro' where team_id='gha' and name in ('Kamal Deen Sulemana','Alexander Djiku','Alidu Seidu','Daniel Amartey','Salis Abdul Samed','Majeed Ashimeru','Lawrence Ati-Zigi','Daniel Kofi Kyereh');
update players set rarity='legendario' where team_id='pan' and name in ('Adalberto Carrasquilla','Ismael Diaz');
update players set rarity='epico' where team_id='pan' and name in ('José Córdoba','Amir Murillo','Jose Fajardo','Aníbal Godoy','Cecilio Waterman');
update players set rarity='raro' where team_id='pan' and name in ('Fidel Escobar','Eric Davis','César Blackman','Carlos Harvey','Yoel Bárcenas','Andrés Andrade','José Luis Rodríguez','Alberto Quintero');
