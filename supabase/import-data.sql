-- FlyInGuate Data Import
-- Generated from CSV data

-- Insert Experiences
INSERT INTO experiences (name, description, category, location, duration_hours, base_price, max_passengers, is_active, includes, highlights, requirements, meeting_point, metadata) VALUES (
  'Experiencia Romántica Hotel Atitlán',
  'Discover and fly over the most beautiful lake in the world.
Enjoy an included breakfast (or lunch) à la carte at Hotel Atitlán, in their exclusive gardens, with a reserved romantic setup, private waiter, and personalized attention. Escape the routine and discover Guatemala in all its splendor at the favorite destination of many...

Land, relax, and enjoy over 3 hours of free time on the ground, giving you a chance to explore Panajachel, the largest town on the shores of the magical Lake Atitlán. Immerse yourself in the local culture. Explore and experience something new, unique, and exclusive. The perfect option for celebrating special occasions! Surprise your partner with an unforgettable and one-of-a-kind adventure.

Create memories... Live the experience! Available every day of the year. (Subject to weather conditions.)',
  'helitour',
  'Lago de Atitlán',
  3,
  1.299,
  10,
  true,
  ARRAY['Ida y vuelta el mismo dia + Servicios incluidos'],
  ARRAY['Day-Flight Expeditions'],
  ARRAY[]::text[],
  '',
  '{"subcategory":"Day-Flight Expeditions","service_taxonomy":"Ida y vuelta el mismo dia + Servicios incluidos","region_taxonomy":"Lago de Atitlán","resumed_info":"Destination: Lake Atitlán\nDuration: 30-minute flight\nMeal options: À la carte breakfast or lunch at Hotel Atitlán\nSpecial features:\nReserved romantic setup in exclusive gardens\nPrivate waiter and personalized service\nFree time: 3+ hours to explore Panajachel\nPerfect for: Celebrating special occasions\nType: Round-trip private flight","pricing":{"robinson_r66_1_2":1.299,"robinson_r66_3_4":null,"airbus_h125_4_5":null,"robinson_r66_x2_6":null,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO experiences (name, description, category, location, duration_hours, base_price, max_passengers, is_active, includes, highlights, requirements, meeting_point, metadata) VALUES (
  'Finca San Cayetano , Alotenango.',
  'Enjoy an included à la carte breakfast (or lunch) at Finca San Cayetano, with the best views of the majestic volcanoes surrounding the colonial city.
Fly over Antigua Guatemala and the slopes of Volcán de Fuego during the approach. Spend over 3 hours of free time on the ground. Then, return to Guatemala City with a scenic flight over Lake Amatitlán. Available every day. A perfect option to share with your loved ones. Available all year round. (Subject to weather conditions).
',
  'helitour',
  'Antigua Guatemala',
  3,
  1.5,
  10,
  true,
  ARRAY['Ida y vuelta el mismo dia + Servicios incluidos'],
  ARRAY['Day-Flight Expeditions'],
  ARRAY[]::text[],
  '',
  '{"subcategory":"Day-Flight Expeditions","service_taxonomy":"Ida y vuelta el mismo dia + Servicios incluidos","region_taxonomy":"Antigua Guatemala","resumed_info":"Destination: Finca San Cayetano, Alotenango\nDuration: Scenic flight over Antigua and Volcán de Fuego\nMeal options: À la carte breakfast or lunch at Finca San Cayetano with volcano views\nFree time: 3+ hours to explore and relax\nReturn flight: Includes scenic flyover of Lake Amatitlán\nPerfect for: Sharing special moments with loved ones\nType: Round-trip private fligh","pricing":{"robinson_r66_1_2":1.5,"robinson_r66_3_4":1.5,"airbus_h125_4_5":2.2,"robinson_r66_x2_6":3,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO experiences (name, description, category, location, duration_hours, base_price, max_passengers, is_active, includes, highlights, requirements, meeting_point, metadata) VALUES (
  'Heli-Tour & Pesca Deportiva',
  'Can you imagine going on a fishing expedition to the Pacific Ocean, leaving the city at 6:00 AM, and returning home after lunch?
Forget the traffic and enjoy the flight. Get ready for an air and sea adventure. The expedition includes all necessary equipment for deep-sea sport fishing. Available every day, subject to availability and weather conditions. Yacht/boat fully equipped for the entire expedition. Enjoy the chance to spot marine wildlife during the trip.',
  'helitour',
  'Costa Sur',
  1,
  3.599,
  10,
  true,
  ARRAY['Ida y vuelta el mismo dia + Servicios incluidos'],
  ARRAY['Day-Flight Expeditions'],
  ARRAY[]::text[],
  '',
  '{"subcategory":"Day-Flight Expeditions","service_taxonomy":"Ida y vuelta el mismo dia + Servicios incluidos","region_taxonomy":"Costa Sur","resumed_info":"Destination: Pacific Ocean for a fishing expedition\nDeparture time: 6:00 AM\nDuration: Morning fishing trip, returning after lunch\nIncludes:\nFully equipped yacht/boat for deep-sea sport fishing\nAll fishing gear provided\nMarine wildlife sightings\nType: Round-trip private flight\nAvailability: Daily (subject to availability and weather conditions)","pricing":{"robinson_r66_1_2":3.599,"robinson_r66_3_4":3.599,"airbus_h125_4_5":4.5,"robinson_r66_x2_6":7.198,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO experiences (name, description, category, location, duration_hours, base_price, max_passengers, is_active, includes, highlights, requirements, meeting_point, metadata) VALUES (
  'Heli-Tour 35 min a la Ciudad, Antigua & Laguna Calderas',
  'Heli-Tour and panoramic helicopter flyover.
With a duration of 35 minutes, immerse yourself in the world of rotary-wing flight. Discover a new perspective of Guatemala City, Antigua, Laguna Calderas, Lake Amatitlán, and Pacaya Volcano. This tour is ideal for those seeking a unique and thrilling experience to share with family or friends. It’s more than just a flight—it’s an experience. Available every day of the year. (Subject to weather conditions). Take off from La Aurora International Airport.',
  'helitour',
  'Ciudad capital + Antigua y volcán Pacaya',
  0.5833333333333334,
  1.6,
  10,
  true,
  ARRAY['Sobrevuelo privado en helicóptero.'],
  ARRAY['Sobrevuelos'],
  ARRAY[]::text[],
  '',
  '{"subcategory":"Sobrevuelos","service_taxonomy":"Sobrevuelo privado en helicóptero.","region_taxonomy":"Ciudad capital + Antigua y volcán Pacaya","resumed_info":"Tour name: Helicopter Panoramic Heli-Tour\nDuration: 35-minute helicopter flight\nIncludes:\nAerial views of Guatemala City, Antigua, Laguna Calderas, Lake Amatitlán, and Pacaya Volcano\nDeparture location: La Aurora International Airport\nPerfect for: Sharing with family or friends\nType: Round-trip scenic helicopter flight\nAvailability: Daily (subject to weather conditions)","pricing":{"robinson_r66_1_2":59900,"robinson_r66_3_4":99900,"airbus_h125_4_5":1.6,"robinson_r66_x2_6":1.998,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO experiences (name, description, category, location, duration_hours, base_price, max_passengers, is_active, includes, highlights, requirements, meeting_point, metadata) VALUES (
  'Heli-Tour 45 min Guatemala y Alrededores',
  'Heli-Tour and 45-minute panoramic flyover.
Enjoy an extended tour over Guatemala City, Antigua, Alotenango, and the slopes of the Agua, Fuego, and Acatenango volcanoes. Take in unique views of Pacaya Volcano and its surroundings. This is the best option for those who have never flown in a helicopter and want to discover Guatemala in a completely different way. Available every day of the year. (Subject to weather conditions). Take off from La Aurora International Airport.',
  'helitour',
  'Ciudad capital + Antigua y volcán Pacaya',
  1,
  1.175,
  10,
  true,
  ARRAY['Sobrevuelo privado en helicóptero.'],
  ARRAY['Sobrevuelos'],
  ARRAY[]::text[],
  '',
  '{"subcategory":"Sobrevuelos","service_taxonomy":"Sobrevuelo privado en helicóptero.","region_taxonomy":"Ciudad capital + Antigua y volcán Pacaya","resumed_info":"Tour name: 45-Minute Helicopter Panoramic Heli-Tour\nDuration: 45-minute helicopter flight\nIncludes:\nAerial views of Guatemala City, Antigua, Alotenango, and the Agua, Fuego, and Acatenango volcanoes\nUnique views of Pacaya Volcano and surroundings\nDeparture location: La Aurora International Airport\nPerfect for: First-time helicopter flyers and anyone wanting a unique view of Guatemala\nType: Round-trip scenic helicopter flight\nAvailability: Daily (subject to weather conditions)","pricing":{"robinson_r66_1_2":89900,"robinson_r66_3_4":1.175,"airbus_h125_4_5":1.6,"robinson_r66_x2_6":2.35,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO experiences (name, description, category, location, duration_hours, base_price, max_passengers, is_active, includes, highlights, requirements, meeting_point, metadata) VALUES (
  'Hotel Atitlán, Panajachel',
  'Discover and fly over the most beautiful lake in the world.
Enjoy an included à la carte breakfast (or lunch) at Hotel Atitlán. Escape the routine and discover Guatemala in all its splendor at one of the country''s favorite destinations. Land, relax, and enjoy 3+ hours of free time on the ground to explore Panajachel, the largest town on the shores of the magical Lake Atitlán. Immerse yourself in the local culture. Explore, and take the chance to live a new, unique, and exclusive experience. Share this adventure if you''re looking to create unforgettable moments. Available every day of the year. (Subject to weather conditions). Take off from La Aurora International Airport.
',
  'helitour',
  'Lago de Atitlán',
  1,
  1.175,
  10,
  true,
  ARRAY['Ida y vuelta el mismo dia + Servicios incluidos'],
  ARRAY['Day-Flight Expeditions'],
  ARRAY[]::text[],
  '',
  '{"subcategory":"Day-Flight Expeditions","service_taxonomy":"Ida y vuelta el mismo dia + Servicios incluidos","region_taxonomy":"Lago de Atitlán","resumed_info":"Tour name: Lake Atitlán Scenic Flight with Breakfast or Lunch\nDuration: 30-minute flight to Lake Atitlán\nMeal options: À la carte breakfast or lunch at Hotel Atitlán\nFree time: 3+ hours to explore Panajachel and its local culture\nPerfect for: Creating unforgettable moments and sharing with loved ones\nDeparture location: La Aurora International Airport\nType: Round-trip private flight\nAvailability: Daily (subject to weather conditions)","pricing":{"robinson_r66_1_2":1.175,"robinson_r66_3_4":1.599,"airbus_h125_4_5":1.899,"robinson_r66_x2_6":3.198,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO experiences (name, description, category, location, duration_hours, base_price, max_passengers, is_active, includes, highlights, requirements, meeting_point, metadata) VALUES (
  'Hotel Casa Palopó',
  'Descubre y sobrevuela el lago más bello del mundo, disfruta de un desayuno (ó almuerzo) incluido (a la carta) en Hotel Casa Palopó ó su nuevo restaurante Kinni´k. Escápate de la rutina y descubre Guatemala en todo su esplendor, en el destino favorito de muchos...  Aterriza, relájate y disfruta de + 3.0 Horas de tiempo libre y espera en tierra, para quue puedas descubrir Panajachel y Santa Catarina Palopó, poblaciones frente al mágico Lago de Atitlán. Inmérsete en la cultura local. Explora y anímate a vivir una experiencia nueva, única y exclusiva.  Comparte ésta experiencia, si lo que buscas es crear momentos inolvidables.  Disponible todos los días del año. (Sujeto a condiciones meterológicas) ',
  'helitour',
  'Lago de Atitlán',
  3,
  1.599,
  10,
  true,
  ARRAY['Ida y vuelta el mismo dia + Servicios incluidos'],
  ARRAY['Day-Flight Expeditions'],
  ARRAY[]::text[],
  '',
  '{"subcategory":"Day-Flight Expeditions","service_taxonomy":"Ida y vuelta el mismo dia + Servicios incluidos","region_taxonomy":"Lago de Atitlán","resumed_info":"","pricing":{"robinson_r66_1_2":99500,"robinson_r66_3_4":1.599,"airbus_h125_4_5":1.599,"robinson_r66_x2_6":3.198,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO experiences (name, description, category, location, duration_hours, base_price, max_passengers, is_active, includes, highlights, requirements, meeting_point, metadata) VALUES (
  'Heli-Tour Extendido 1 Hora',
  'Nuestro Helitour más solicitado, en su version extendida. Disfruta de una inmersiva experiencia al vuelo en helicoptero, sobre Guatemala. Una nueva perspectiva de la ciudad capital, Antigua, faldas de los volcanes Agua, Fuego, Acatenango y un acercamiento planificado al volcán Pacaya, finalizando sobre lago Amatitlán y ciudad Cayalá. La mejor opción para aquellos que quisieran qué su primera vez en helicóptero. Elige el día de tu vuelo y descubre tu nueva pasión! Disponible todos los días del año. (Sujeto a condiciones meterológicas)',
  'helitour',
  'Ciudad capital + Antigua y volcán Pacaya',
  1,
  1.199,
  10,
  true,
  ARRAY['Sobrevuelo privado en helicóptero'],
  ARRAY['Sobrevuelos'],
  ARRAY[]::text[],
  '',
  '{"subcategory":"Sobrevuelos","service_taxonomy":"Sobrevuelo privado en helicóptero","region_taxonomy":"Ciudad capital + Antigua y volcán Pacaya","resumed_info":"","pricing":{"robinson_r66_1_2":79900,"robinson_r66_3_4":1.199,"airbus_h125_4_5":1.199,"robinson_r66_x2_6":2.398,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO experiences (name, description, category, location, duration_hours, base_price, max_passengers, is_active, includes, highlights, requirements, meeting_point, metadata) VALUES (
  'Hotel El Faro, Monterrico',
  'Sol, Playa y arena a sólo 25 minutos! Vuelo privado, ida y vuelta el mismo día con + 7.0 horas de espera, almuerzo incluído, piscina, Day Pass y mucho más... ¿Sale puerto? Descubre Hotel El Faro, ubicado en las playas de Monterrico, Santa Rosa. Sobrevuela el litoral en aproximación y descubre nuestras playas de arena volcánica desde las alturas! Olvídate del tráfico y el cansado trayecto manejando. Relájate y escápate de la rutina. Disponible todos los días del año. (Sujeto a condiciones meterológicas) ',
  'helitour',
  'Costa Sur',
  0.4166666666666667,
  1.199,
  10,
  true,
  ARRAY['Ida y vuelta el mismo dia + Servicios incluidos'],
  ARRAY['Day-Flight Expeditions'],
  ARRAY[]::text[],
  '',
  '{"subcategory":"Day-Flight Expeditions","service_taxonomy":"Ida y vuelta el mismo dia + Servicios incluidos","region_taxonomy":"Costa Sur","resumed_info":"","pricing":{"robinson_r66_1_2":1.199,"robinson_r66_3_4":1.799,"airbus_h125_4_5":1.799,"robinson_r66_x2_6":3.598,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO experiences (name, description, category, location, duration_hours, base_price, max_passengers, is_active, includes, highlights, requirements, meeting_point, metadata) VALUES (
  'Heli-Tour Romántico',
  'Heli-Tour y sobrevuelo panorámico en helicóptero. Con una duracíon de 35 minutos, y un arreglo romántico de flores incluído y tiempo libre para fotografías. Descubre una nueva perspectiva de la Ciudad de Guatemala, Antigua, Laguna Calderas, Lago Amatitlán y Volcán Pacaya. Un recorrido ideal para los que buscan una experiencia diferente y emocional para compartir con ésa persona especial. Disponible todos los días del año. (Sujeto a condiciones meterológicas)',
  'helitour',
  'Ciudad capital + Antigua y volcán Pacaya',
  0.5833333333333334,
  46000,
  10,
  true,
  ARRAY['Sobrevuelo privado en helicóptero.'],
  ARRAY['Eventos especiales'],
  ARRAY[]::text[],
  '',
  '{"subcategory":"Eventos especiales","service_taxonomy":"Sobrevuelo privado en helicóptero.","region_taxonomy":"Ciudad capital + Antigua y volcán Pacaya","resumed_info":"","pricing":{"robinson_r66_1_2":46000,"robinson_r66_3_4":null,"airbus_h125_4_5":null,"robinson_r66_x2_6":null,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO experiences (name, description, category, location, duration_hours, base_price, max_passengers, is_active, includes, highlights, requirements, meeting_point, metadata) VALUES (
  'Heli-Tour y sobrevuelo / 4 Volcanes',
  'Llevamos nuestro sobrevuelo panorámico a nuevas alturas. Volando en una aeronave más potente y rápida, podrás apreciar de cerca y a más de 10,000 pies sobre nivel del mar, los 4 volcanes que rodean la ciudad de Guatemala. Volcan de Agua, Fuego, Acatenango y Pacaya.  Inmérsete en una experiencia de velocidad, adrenalina y vistas que te dejarán sin aliento. Si tienes suerte, quizás puedas presenciar una erupción cómo nunca antes! Vuela y vive una experiencia nueva y exclusiva. Ideal para aquellos que no han podido escalar un volcán, pero anhelan esas mágicas vistas de nuestra bella e imponente Guatemala. ',
  'helitour',
  'Ciudad capital + Antigua y volcán Pacaya',
  1,
  1.799,
  10,
  true,
  ARRAY['Sobrevuelo privado en helicóptero'],
  ARRAY['Sobrevuelos'],
  ARRAY[]::text[],
  '',
  '{"subcategory":"Sobrevuelos","service_taxonomy":"Sobrevuelo privado en helicóptero","region_taxonomy":"Ciudad capital + Antigua y volcán Pacaya","resumed_info":"","pricing":{"robinson_r66_1_2":1.799,"robinson_r66_3_4":1.799,"airbus_h125_4_5":1.799,"robinson_r66_x2_6":3.598,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO experiences (name, description, category, location, duration_hours, base_price, max_passengers, is_active, includes, highlights, requirements, meeting_point, metadata) VALUES (
  'Hotel Casa Palopó Paquete Romántico',
  'Descubre y sobrevuela el lago más bello del mundo, disfruta de un desayuno (ó almuerzo) incluido (a la carta) en Hotel Casa Palopó, con un arreglo de rosas, en un área reservada, una botella de espumante, fresas con chocolate, y más. Escápa de la rutina y descubre Guatemala en todo su esplendor, en el destino favorito de muchos...  Aterriza, relájate y disfruta de + 4.0 Horas de tiempo libre y espera en tierra, para que puedas descubrir Panajachel, la población más grande frente al mágico Lago de Atitlán. Inmérsete en la cultura local. Explora y anímate a vivir una experiencia nueva, única y exclusiva. La mejor opción para celebrar fechas y ocasiones especiales! Sorprénde a tu pareja con una aventura inolvidable e irrepetible. Crea momentos..Vive la experiencia! Disponible todos los días del año. (Sujeto a condiciones meterológicas)',
  'helitour',
  'Lago de Atitlán',
  4,
  1.275,
  10,
  true,
  ARRAY['Ida y vuelta el mismo dia + Servicios incluidos'],
  ARRAY['Eventos especiales'],
  ARRAY[]::text[],
  '',
  '{"subcategory":"Eventos especiales","service_taxonomy":"Ida y vuelta el mismo dia + Servicios incluidos","region_taxonomy":"Lago de Atitlán","resumed_info":"","pricing":{"robinson_r66_1_2":1.275,"robinson_r66_3_4":null,"airbus_h125_4_5":null,"robinson_r66_x2_6":null,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO experiences (name, description, category, location, duration_hours, base_price, max_passengers, is_active, includes, highlights, requirements, meeting_point, metadata) VALUES (
  'Parque Nacional Tikal 1 Day Experience',
  'Descubre el Mundo Maya, cómo nunca antes!  Uno de los mayores yacimientos arquelógicos de una civilización perdida. Vuelo en avión privado, Ida y vuelta el mismo día desde la ciudad capital. Tour completo guiado con entradas al parque nacional Tikal. Llega a Santa Elena/Flores Petén, en sólo 1 hora y 15 minutos. Disfruta de traslados terrestres con A/C y de guías expertos locales. Inmérsete en la flora y fauna de la biósfera maya de manera privada y exclusiva. Disponible todos los días del año! ',
  'helitour',
  'Mundo Maya',
  1,
  1.899,
  10,
  true,
  ARRAY['Ida y vuelta el mismo dia + Servicios incluidos'],
  ARRAY['Day-Flight Expeditions'],
  ARRAY[]::text[],
  '',
  '{"subcategory":"Day-Flight Expeditions","service_taxonomy":"Ida y vuelta el mismo dia + Servicios incluidos","region_taxonomy":"Mundo Maya","resumed_info":"","pricing":{"robinson_r66_1_2":1.899,"robinson_r66_3_4":2.799,"airbus_h125_4_5":3.199,"robinson_r66_x2_6":5.598,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO experiences (name, description, category, location, duration_hours, base_price, max_passengers, is_active, includes, highlights, requirements, meeting_point, metadata) VALUES (
  'Río Dulce - Todo Incluído',
  'El lago más grande de Guatemala, nuestra salida al mar caribe, y hogar del manatí. Vuelo privado, ida y vuelta el mismo día, con almuerzo incluído. Cónoce el castillo de San Felipe!  Río Dulce se encuentra en el departamento de Izabal, y ofrece una amplia diversidad de destinos turisticos, historicos y recreativos. Olvídate de manejar 8 horas y disfruta de tan sólo 1 hora de vuelo, con vistas panorámicas de la sierra de las minas, valle del río Motagua y valle del río Polochic. Aterrizando en Hotel Nana Juana (Helipuertos).',
  'helitour',
  'Oriente e Izabal',
  8,
  1.999,
  10,
  true,
  ARRAY['Ida y vuelta el mismo dia + Servicios incluidos'],
  ARRAY['Day-Flight Expeditions'],
  ARRAY[]::text[],
  '',
  '{"subcategory":"Day-Flight Expeditions","service_taxonomy":"Ida y vuelta el mismo dia + Servicios incluidos","region_taxonomy":"Oriente e Izabal","resumed_info":"","pricing":{"robinson_r66_1_2":1.999,"robinson_r66_3_4":3.199,"airbus_h125_4_5":3.199,"robinson_r66_x2_6":6.398,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO experiences (name, description, category, location, duration_hours, base_price, max_passengers, is_active, includes, highlights, requirements, meeting_point, metadata) VALUES (
  'Semuc Champey + Cuevas Kan''ba',
  'Vuelo privado, ida y vuelta el mismo día, guías y tour completo, almuerzo incluido y tiempo libre para relajarte en éste paraíso natural oculto entre las montañas. Evita 8 horas en carreteras complicadas, y llega volando en 45 minutos! Declarado como Monumento Natural en 1999, Semuc Champey , qué significa (donde el río se esconde bajo las piedras), es un conjunto de piscinas y cuevas de pidra caliza, naturales, ubicada en Lanquín, Alta Verapaz. Los colores verde turqueza intensos de sus aguas, cambian a lo largo del año, dependiendo del clima y otros factores del entorno. Éste tesoro escondido es uno de los atactivos turisticos más visitados del país. Su belleza única lo resalta como úno de los enclaves naturales más emblemáticos en su tipo alrededor del mundo.  ¿Qué esperas? Reserva con anticipación, y vive una aventura de altura, única en el mundo.',
  'helitour',
  'Alta Verapaz',
  8,
  1.499,
  10,
  true,
  ARRAY['Ida y vuelta el mismo dia + Servicios incluidos'],
  ARRAY['Day-Flight Expeditions'],
  ARRAY[]::text[],
  '',
  '{"subcategory":"Day-Flight Expeditions","service_taxonomy":"Ida y vuelta el mismo dia + Servicios incluidos","region_taxonomy":"Alta Verapaz","resumed_info":"","pricing":{"robinson_r66_1_2":1.499,"robinson_r66_3_4":2.299,"airbus_h125_4_5":2.299,"robinson_r66_x2_6":4.598,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO experiences (name, description, category, location, duration_hours, base_price, max_passengers, is_active, includes, highlights, requirements, meeting_point, metadata) VALUES (
  'Heli-Tour y sobrevuelo /  7 volcanes + Atitlán',
  'Llevamos nuestro sobrevuelo panorámico a nuevas alturas y aún más lejos... Volando en una aeronave más potente y rápida. Podrás apreciar de cerca y a más de 10,000 pies sobre nivel del mar, los 8 volcanes que van sobre el cinturón de Fuego, desde la ciudad hasta Lago de Atitlán. Volcanes; Pacaya, Agua, Fuego, Acatenango, Tolimán, Atitlán, San Pedro y Paquisis. Aterrizando en Hotel Atitlán, con desayuno (a la carta) incluído para cada pasajero. Inmérsete en una experiencia de velocidad, adrenalina y vistas que te dejarán sin aliento. Si tienes suerte, quizás puedas presenciar una erupción cómo nunca antes! Vuela y vive una experiencia nueva y exclusiva. Ideal para aquellos que no han podido escalar un volcán, pero anhelan esas mágicas vistas de nuestra bella e imponente Guatemala. ',
  'helitour',
  'Altos de Occidente ',
  1,
  1.999,
  10,
  true,
  ARRAY['Sobrevuelo privado en helicóptero'],
  ARRAY['Day-Flight Expeditions'],
  ARRAY[]::text[],
  '',
  '{"subcategory":"Day-Flight Expeditions","service_taxonomy":"Sobrevuelo privado en helicóptero","region_taxonomy":"Altos de Occidente ","resumed_info":"","pricing":{"robinson_r66_1_2":1.999,"robinson_r66_3_4":2.999,"airbus_h125_4_5":2.999,"robinson_r66_x2_6":5.998,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO experiences (name, description, category, location, duration_hours, base_price, max_passengers, is_active, includes, highlights, requirements, meeting_point, metadata) VALUES (
  'Villas La Mar Monterrico',
  'Sol, Playa y arena a sólo 25 minutos! Vuelo privado, ida y vuelta el mismo día con + 7.0 horas de espera, almuerzo incluído, piscina, Day Pass y una Villa privada por el día... ¿Sale puerto? Descubre Villas La Mar, ubicado en las playas de Monterrico, Santa Rosa. Sobrevuela el litoral en aproximación y descubre nuestras playas de arena volcánica desde las alturas! Olvídate del tráfico y el cansado trayecto manejando. Relájate y escápate de la rutina. Disponible todos los días del año. (Sujeto a condiciones meterológicas) ',
  'helitour',
  'Costa Sur',
  0.4166666666666667,
  1.399,
  10,
  true,
  ARRAY['Ida y vuelta el mismo dia + Servicios incluidos'],
  ARRAY['Day-Flight Expeditions'],
  ARRAY[]::text[],
  '',
  '{"subcategory":"Day-Flight Expeditions","service_taxonomy":"Ida y vuelta el mismo dia + Servicios incluidos","region_taxonomy":"Costa Sur","resumed_info":"","pricing":{"robinson_r66_1_2":1.399,"robinson_r66_3_4":1.999,"airbus_h125_4_5":1.999,"robinson_r66_x2_6":3.998,"robinson_airbus_8_10":null}}'::jsonb
);



-- Insert Destinations
INSERT INTO destinations (name, description, location, coordinates, features, is_active, metadata) VALUES (
  'Antigua Guatemala',
  'Fly directly to the colonial city in just 10 minutes! Say goodbye to traffic. Land directly at the "Tenedor del Cerro" or Hotel Casa Santo Domingo helipads. Price includes helipad usage and ground transportation to your final destination. (Private transfer, ONE-WAY only).',
  'Antigua Guatemala',
  '{"lat": 14.5891, "lng": -90.5515}'::jsonb,
  ARRAY['Traslados VIP'],
  true,
  '{"category":"Traslados VIP","subcategory":"Traslados VIP","service_taxonomy":"Vuelo privado en helicóptero.","region_taxonomy":"Antigua Guatemala","resumed_info":"Destination: Antigua Guatemala\nDuration: 10-minute flight\nLanding locations: Tenedor del Cerro or Hotel Casa Santo Domingo\nIncludes:\nHelipad\nGround transfer to final destination\nType: One-way private transfer","pricing":{"robinson_r66_1_2":1.175,"robinson_r66_3_4":1.175,"airbus_h125_4_5":1.6,"robinson_r66_x2_6":2.35,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO destinations (name, description, location, coordinates, features, is_active, metadata) VALUES (
  'Chiquimula / Esquipulas',
  'Known as "The Pearl of the East," Chiquimula is just a 45-minute flight from the capital city.
Leave behind the traffic on the Atlantic Highway and enjoy an experience filled with unmatched views of the Sierra de las Minas and the Motagua River. (Private transfer, ONE-WAY only).',
  'Oriente e Izabal',
  '{"lat": 14.5891, "lng": -90.5515}'::jsonb,
  ARRAY['Traslados VIP'],
  true,
  '{"category":"Traslados VIP","subcategory":"Traslados VIP","service_taxonomy":"Vuelo privado en helicóptero.","region_taxonomy":"Oriente e Izabal","resumed_info":"Destination: Chiquimula\nDuration: 45-minute flight\nIncludes: Panoramic views of the Sierra de las Minas and Motagua River\nType: One-way private transfer","pricing":{"robinson_r66_1_2":2.2,"robinson_r66_3_4":2.2,"airbus_h125_4_5":3.2,"robinson_r66_x2_6":4.4,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO destinations (name, description, location, coordinates, features, is_active, metadata) VALUES (
  'Ciudad de Guatemala >>> El Salvador.',
  'In just 55 minutes, reach the capital of our neighboring brother country, El Salvador.
Enjoy the beautiful views of eastern Guatemala as you fly. Land at Ilopango Airport in San Salvador. Available as a one-way or same-day round trip. Save time and accomplish your missions without delays. (Private transfer, ONE-WAY only).
',
  'El Salvador',
  '{"lat": 14.5891, "lng": -90.5515}'::jsonb,
  ARRAY['Traslados VIP'],
  true,
  '{"category":"Traslados VIP","subcategory":"Traslados VIP","service_taxonomy":"Vuelo privado en helicóptero.","region_taxonomy":"El Salvador","resumed_info":"Destination: San Salvador, El Salvador\nDuration: 55-minute flight\nLanding location: Ilopango Airport, San Salvador\nIncludes: Panoramic views of eastern Guatemala\nType: One-way private transfer (round-trip available)","pricing":{"robinson_r66_1_2":3.3,"robinson_r66_3_4":3.3,"airbus_h125_4_5":3.9,"robinson_r66_x2_6":6.6,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO destinations (name, description, location, coordinates, features, is_active, metadata) VALUES (
  'Cobán, Alta Verapaz / MGCB',
  'Cobán, municipality, city, and the capital of Alta Verapaz.
The second-largest urban area in the country and one of the most visited tourist destinations. Save those 5 hours of driving and arrive in just 35 minutes from the capital city. Enjoy unique views of the Verapaces region and the Chixoy River along the way. (Private transfer, ONE-WAY only).',
  'Alta Verapaz',
  '{"lat": 14.5891, "lng": -90.5515}'::jsonb,
  ARRAY['Traslados VIP'],
  true,
  '{"category":"Traslados VIP","subcategory":"Traslados VIP","service_taxonomy":"Vuelo privado en helicóptero.","region_taxonomy":"Alta Verapaz","resumed_info":"Destination: Cobán, Alta Verapaz\nDuration: 35-minute flight\nIncludes: Panoramic views of the Verapaces region and Chixoy River\nType: One-way private transfer","pricing":{"robinson_r66_1_2":1.9,"robinson_r66_3_4":1.9,"airbus_h125_4_5":2.4,"robinson_r66_x2_6":3.8,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO destinations (name, description, location, coordinates, features, is_active, metadata) VALUES (
  'Finca San Cayetano - Alotenango',
  'Just 17 minutes from a unique destination...
Located in the Alotenango canyon, Finca San Cayetano offers unparalleled views of the Agua, Fuego, and Acatenango volcanoes. Whether you are a future guest or attending a special event, we’ll take you there! Enjoy panoramic views of Antigua Guatemala as you approach. Prices include helipad usage. (Private transfer, ONE-WAY only).',
  'Antigua Guatemala',
  '{"lat": 14.5891, "lng": -90.5515}'::jsonb,
  ARRAY['Traslados VIP'],
  true,
  '{"category":"Traslados VIP","subcategory":"Traslados VIP","service_taxonomy":"Vuelo privado en helicóptero.","region_taxonomy":"Antigua Guatemala","resumed_info":"Destination: Finca San Cayetano, Alotenango\nDuration: 17-minute flight\nViews: Agua, Fuego, and Acatenango volcanoes\nIncludes: Helipad usage\nSpecial features: Panoramic views of Antigua Guatemala during approach\nType: One-way private transfer","pricing":{"robinson_r66_1_2":1.175,"robinson_r66_3_4":1.175,"airbus_h125_4_5":1.6,"robinson_r66_x2_6":2.35,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO destinations (name, description, location, coordinates, features, is_active, metadata) VALUES (
  'Huehuetenango - MGHT',
  'Tierras altas lejanas de Nor Occidente. Huehuetango ofrece destinos espectaculares y poco concurridos. Descubre Laguna Brava, Los cuchumatanes, ó coordina un tarslado VIP al punto que lo requieras. Llega en tán sólo 45 minutos de vuelo con vistas inigualabes de Quiché, Sacatepequez y las imponentes montañas de "Huehue".   Aterrizando en el aeropuerto local. (Traslado privado SOLO IDA)',
  'Altos de Occidente ',
  '{"lat": 14.5891, "lng": -90.5515}'::jsonb,
  ARRAY['Traslados VIP'],
  true,
  '{"category":"Traslados VIP","subcategory":"Traslados VIP","service_taxonomy":"Vuelo privado en helicóptero.","region_taxonomy":"Altos de Occidente ","resumed_info":"","pricing":{"robinson_r66_1_2":1.26,"robinson_r66_3_4":1.95,"airbus_h125_4_5":1.95,"robinson_r66_x2_6":3.9,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO destinations (name, description, location, coordinates, features, is_active, metadata) VALUES (
  'La Antigua >>> A Lago Atitlán (Viceversa)',
  '¿ Estás en Antigua y necesitas llegar a Atitlán? (ó al revés?) Ya no busques más!  Llega en 15 minutos al lago más bello del mundo desde la ciudad colonial. (ó viceversa) Precios ya incluyen uso de helipuertos en ambos destinos. Relájate y disfruta de vistas panorámicas inigualables. Vuela de forma rápida, cómoda y segura a tu destino.  (Traslado privado SOLO IDA)',
  'Lago de Atitlán',
  '{"lat": 14.5891, "lng": -90.5515}'::jsonb,
  ARRAY['Traslados VIP'],
  true,
  '{"category":"Traslados VIP","subcategory":"Traslados VIP","service_taxonomy":"Vuelo privado en helicóptero.","region_taxonomy":"Lago de Atitlán","resumed_info":"","pricing":{"robinson_r66_1_2":99900,"robinson_r66_3_4":1.599,"airbus_h125_4_5":1.799,"robinson_r66_x2_6":3.198,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO destinations (name, description, location, coordinates, features, is_active, metadata) VALUES (
  'Lago de Izabal - Río Dulce',
  'El lago más grande de Guatemala, nuestra salida al mar caribe, y hogar del manatí. Río Dulce se encuentra en el departamento de Izabal, y ofrece una amplia diversidad de destinos turisticos, historicos y recreativos. Olvídate de manejar 8 horas y disfruta de tan sólo 1 hora de vuelo, con vistas panorámicas de la sierra de las minas, valle del río Motagua y valle del río Polochic. Aterrizando en Hotel Nana Juana (Helipuertos) ó en pista de Aeroclub. (Traslado privado SOLO IDA)',
  'Oriente e Izabal',
  '{"lat": 14.5891, "lng": -90.5515}'::jsonb,
  ARRAY['Traslados VIP'],
  true,
  '{"category":"Traslados VIP","subcategory":"Traslados VIP","service_taxonomy":"Vuelo privado en helicóptero.","region_taxonomy":"Oriente e Izabal","resumed_info":"","pricing":{"robinson_r66_1_2":1.799,"robinson_r66_3_4":2.76,"airbus_h125_4_5":2.76,"robinson_r66_x2_6":5.52,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO destinations (name, description, location, coordinates, features, is_active, metadata) VALUES (
  'Lanquín, Alta Verapaz (Semuc Champey)',
  'Oculto en las montañas de Alta Verapaz. Lanquín ofrece diferentes tipos de aventura para disfrutar la mayor parte del año. Semuc Champey se distingue como el atractivo local más reconocido incluso a nivel mundial. Olvídate de manejar 8 horas por complicadas carreteras. Vuela y llega de la manera más cómoda y eficiente en tan sólo 45 minutos. Vive la experiencia de volar adónde quieras, cúando quieras. ¿Planeas ir a Zehyr Lodge u hoteles cercanos? No lo dudes más. (Traslado privado SOLO IDA)',
  'Alta Verapaz',
  '{"lat": 14.5891, "lng": -90.5515}'::jsonb,
  ARRAY['Traslados VIP'],
  true,
  '{"category":"Traslados VIP","subcategory":"Traslados VIP","service_taxonomy":"Vuelo privado en helicóptero.","region_taxonomy":"Alta Verapaz","resumed_info":"","pricing":{"robinson_r66_1_2":1.399,"robinson_r66_3_4":2.399,"airbus_h125_4_5":2.399,"robinson_r66_x2_6":4.798,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO destinations (name, description, location, coordinates, features, is_active, metadata) VALUES (
  'Marina del Sur & El Paredón',
  'De la ciudad a tu casa de descanso en 25 minutos. Ólvidate del trafico, y el estrés de manejar. Juan Gaviota - Marina del Sur / ó El Paredón de la forma más rápida, cómoda y segura disponible. Optimiza tu tiempo. Vuela y comparte la experiencia. (Traslado privado SOLO IDA)',
  'Costa Sur',
  '{"lat": 14.5891, "lng": -90.5515}'::jsonb,
  ARRAY['Traslados VIP'],
  true,
  '{"category":"Traslados VIP","subcategory":"Traslados VIP","service_taxonomy":"Vuelo privado en helicóptero.","region_taxonomy":"Costa Sur","resumed_info":"","pricing":{"robinson_r66_1_2":87500,"robinson_r66_3_4":1.275,"airbus_h125_4_5":1.275,"robinson_r66_x2_6":2.55,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO destinations (name, description, location, coordinates, features, is_active, metadata) VALUES (
  'Monterrico, Santa Rosa',
  'A 30 minutos de sol, playa y arena. Vuela de ciudad de Guatemala a cualquier destino en Monterrico o cercanías. Optimiza tu tiempo, relájate y disfruta del vuelo. Hotel El Faro, Oceana Resort, Le Blanc, Villas La Mar, y mucho más! (Traslado privado SOLO IDA)',
  'Costa Sur',
  '{"lat": 14.5891, "lng": -90.5515}'::jsonb,
  ARRAY['Traslados VIP'],
  true,
  '{"category":"Traslados VIP","subcategory":"Traslados VIP","service_taxonomy":"Vuelo privado en helicóptero.","region_taxonomy":"Costa Sur","resumed_info":"","pricing":{"robinson_r66_1_2":87500,"robinson_r66_3_4":1.275,"airbus_h125_4_5":1.275,"robinson_r66_x2_6":2.55,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO destinations (name, description, location, coordinates, features, is_active, metadata) VALUES (
  'Puerto Barrios / MGPB',
  'Ubicado en la Bahía de Amatique, en el Mar Caribe, Puerto Barrios es uno de los principales puertos y puntos estratégicos de Guatemala entorno al turismo y actividades comerciales. Vuela directo, ahorrando tiempo y llegando en tan sólo 1 hora y 10 minutos al aeropuerto local. (MGPB) (Traslado privado SOLO IDA)',
  'Oriente e Izabal',
  '{"lat": 14.5891, "lng": -90.5515}'::jsonb,
  ARRAY['Traslados VIP'],
  true,
  '{"category":"Traslados VIP","subcategory":"Traslados VIP","service_taxonomy":"Vuelo privado en helicóptero.","region_taxonomy":"Oriente e Izabal","resumed_info":"","pricing":{"robinson_r66_1_2":2.399,"robinson_r66_3_4":3.275,"airbus_h125_4_5":3.275,"robinson_r66_x2_6":6.55,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO destinations (name, description, location, coordinates, features, is_active, metadata) VALUES (
  'Retalhuleu / MGRT',
  '"Reu" a sólo 45 minutos de la capital. No más peajes, carreteras y cansados viajes. Sube abordo y disfruta de un traslado directo, cómodo y eficiente. Optimiza tu tiempo, viaja de manera cómoda y segura. Aterrizando en el aeropuerto u hostales del IRTRA. (Traslado privado SOLO IDA)',
  'Costa Sur',
  '{"lat": 14.5891, "lng": -90.5515}'::jsonb,
  ARRAY['Traslados VIP'],
  true,
  '{"category":"Traslados VIP","subcategory":"Traslados VIP","service_taxonomy":"Vuelo privado en helicóptero.","region_taxonomy":"Costa Sur","resumed_info":"","pricing":{"robinson_r66_1_2":1.26,"robinson_r66_3_4":1.95,"airbus_h125_4_5":1.95,"robinson_r66_x2_6":3.9,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO destinations (name, description, location, coordinates, features, is_active, metadata) VALUES (
  'San Pedro Soloma, Huehuetenango',
  'Entre las lejanas montañas de Nor Occidente, al norte de la sierra de los cuchumatanes, se encuentra San Pedro Sóloma. Reduce tu trayecto de 7-8 horas, a sólo 55 minutos volando de la manera más rápida, cómoda y segura disponible en Guatemala. Optimiza tu tiempo, cuida tu segurridad. (Traslado privado SOLO IDA)',
  'Altos de Occidente ',
  '{"lat": 14.5891, "lng": -90.5515}'::jsonb,
  ARRAY['Traslados VIP'],
  true,
  '{"category":"Traslados VIP","subcategory":"Traslados VIP","service_taxonomy":"Vuelo privado en helicóptero.","region_taxonomy":"Altos de Occidente ","resumed_info":"","pricing":{"robinson_r66_1_2":2.76,"robinson_r66_3_4":2.76,"airbus_h125_4_5":2.76,"robinson_r66_x2_6":5.52,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO destinations (name, description, location, coordinates, features, is_active, metadata) VALUES (
  'Santa Cruz del Quiché',
  'Inmérsete en la cultura del Quiché, disfrutando vistas inigualables del panorama del altiplano Guatemalteco. Optimiza tu tiempo y disfruta de la máxima comdidad, llegando rápido, cómodo y seguro a tu destino. Olvidate del cansado viaje y llega en 35 minutos a la cabecera del departamento desde ciudad de Guatemala. (Traslado privado SOLO IDA)',
  'Altos de Occidente ',
  '{"lat": 14.5891, "lng": -90.5515}'::jsonb,
  ARRAY['Traslados VIP'],
  true,
  '{"category":"Traslados VIP","subcategory":"Traslados VIP","service_taxonomy":"Vuelo privado en helicóptero.","region_taxonomy":"Altos de Occidente ","resumed_info":"","pricing":{"robinson_r66_1_2":1.099,"robinson_r66_3_4":1.525,"airbus_h125_4_5":1.525,"robinson_r66_x2_6":3.05,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO destinations (name, description, location, coordinates, features, is_active, metadata) VALUES (
  'Santa Elena / Isla de Flores, Petén / MGMM',
  'Tierra y cuna de la civilización Maya. Ubicado en el área más lejana al norte de la capital, Flores y Santa Elena conforman la cabecera del departamento de Petén. Volando puedes llegar en cuestion de 1 hora y 25 minutos. Contrario al arduo viaje de hasta 10 horas en carretera. Viaja rápido, cómodo y siempre seguro en aeronaves privadas, seleccionadas de acuerdo a la misión y tus requerimientos.  (Traslado privado SOLO IDA)',
  'Mundo Maya',
  '{"lat": 14.5891, "lng": -90.5515}'::jsonb,
  ARRAY['Traslados VIP'],
  true,
  '{"category":"Traslados VIP","subcategory":"Traslados VIP","service_taxonomy":"Vuelo privado en helicóptero.","region_taxonomy":"Mundo Maya","resumed_info":"","pricing":{"robinson_r66_1_2":2.399,"robinson_r66_3_4":3.275,"airbus_h125_4_5":3.275,"robinson_r66_x2_6":6.55,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO destinations (name, description, location, coordinates, features, is_active, metadata) VALUES (
  'Xela, Quetzaltenango / MGQZ',
  'Conocida por su nombre en Maya; "Xelajú" ó "Xela". La ciudad de quetzaltenango se encuentra en un valle entre las montañas de occidente, a más de 2300 metros sobre nivel del mar.  Descubre panoramas visuales únicos en ruta, de Lago Atitlán y el altiplano guatemalteco. A 35 minutos, en un vuelo directo, rápido, cómodo y seguro.  (Traslado privado SOLO IDA)',
  'Altos de Occidente ',
  '{"lat": 14.5891, "lng": -90.5515}'::jsonb,
  ARRAY['Traslados VIP'],
  true,
  '{"category":"Traslados VIP","subcategory":"Traslados VIP","service_taxonomy":"Vuelo privado en helicóptero.","region_taxonomy":"Altos de Occidente ","resumed_info":"","pricing":{"robinson_r66_1_2":1.26,"robinson_r66_3_4":1.95,"airbus_h125_4_5":1.95,"robinson_r66_x2_6":3.9,"robinson_airbus_8_10":null}}'::jsonb
);

INSERT INTO destinations (name, description, location, coordinates, features, is_active, metadata) VALUES (
  'Zacapa y Gualán',
  'Tierra caliente de oriente. ólvida las 5 horas en tierrra y llega en 40 minutos al aeropuerto local ó a las coordenadas de tu elección. Rápido, cómodo y seguro al destino de tu preferencia. Optimiza tu tiempo, supervisa operaciones de la manera más eficiente.  (Traslado privado SOLO IDA)',
  'Oriente e Izabal',
  '{"lat": 14.5891, "lng": -90.5515}'::jsonb,
  ARRAY['Traslados VIP'],
  true,
  '{"category":"Traslados VIP","subcategory":"Traslados VIP","service_taxonomy":"Vuelo privado en helicóptero.","region_taxonomy":"Oriente e Izabal","resumed_info":"","pricing":{"robinson_r66_1_2":1.26,"robinson_r66_3_4":1.899,"airbus_h125_4_5":1.899,"robinson_r66_x2_6":3.798,"robinson_airbus_8_10":null}}'::jsonb
);

