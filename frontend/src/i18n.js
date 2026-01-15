import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        home: "Home",
        findResources: "Find Resources",
        about: "About",
        getHelpNow: "Get Help Now"
      },
      // Hero Section
      hero: {
        stateOf: "State of Minnesota",
        title: "ReEntry Connect MN",
        description: "Official resource directory connecting individuals returning from incarceration with housing, employment, legal aid, healthcare, and essential services across Minnesota.",
        findResources: "Find Resources",
        aboutProgram: "About This Program"
      },
      // Stats
      stats: {
        resources: "Resources",
        categories: "Categories",
        aiAssistant: "AI Assistant",
        always: "Always"
      },
      // Categories Section
      categories: {
        title: "Find the Help You Need",
        subtitle: "Browse resources by category to find services that match your needs",
        viewAll: "View All Resources",
        housing: "Housing & Shelter",
        legal: "Legal Aid",
        employment: "Employment Services",
        healthcare: "Healthcare & Mental Health",
        education: "Education & Training",
        food: "Food Assistance"
      },
      // How It Works
      howItWorks: {
        title: "How It Works",
        subtitle: "Getting help is simple. Here's how to find the resources you need.",
        step1Title: "1. Search",
        step1Desc: "Search by category, location, or keyword to find resources near you",
        step2Title: "2. Connect",
        step2Desc: "View details, hours, and contact information for each resource",
        step3Title: "3. Get Help",
        step3Desc: "Reach out directly or use our AI assistant for guidance"
      },
      // CTA Section
      cta: {
        title: "Ready to Get Started?",
        description: "Our AI assistant is available 24/7 to help you find the right resources. Click the chat icon in the corner to start a conversation.",
        browseNow: "Browse Resources Now"
      },
      // Resources Page
      resources: {
        title: "Find Resources",
        subtitle: "Search and filter to find the services you need in Minnesota",
        searchPlaceholder: "Search resources, services, or locations...",
        list: "List",
        map: "Map",
        all: "All",
        found: "resources found",
        foundSingular: "resource found",
        in: "in",
        noResults: "No resources found",
        noResultsDesc: "Try adjusting your search or filter criteria",
        callNow: "Call Now"
      },
      // Resource Details
      resourceDetail: {
        contactInfo: "Contact Information",
        address: "Address",
        phone: "Phone",
        website: "Website",
        hours: "Hours",
        services: "Services Offered",
        eligibility: "Eligibility"
      },
      // About Page
      about: {
        title: "About ReEntry Connect MN",
        subtitle: "We're dedicated to helping individuals returning from incarceration find the resources they need to successfully reintegrate into their communities across Minnesota.",
        missionTitle: "Our Mission",
        missionSubtitle: "Connecting People to Opportunities",
        missionP1: "ReEntry Connect MN was created to address a critical need: helping individuals returning from incarceration navigate the complex landscape of available resources in Minnesota.",
        missionP2: "We understand that the transition from incarceration to community life can be overwhelming. Finding housing, employment, healthcare, and other essential services shouldn't add to that stress.",
        missionP3: "That's why we've built a comprehensive, easy-to-use platform that puts all the information you need in one place, along with an AI assistant available 24/7 to help guide you through your journey.",
        valuesTitle: "Our Values",
        valuesSubtitle: "What Guides Us",
        compassion: "Compassion",
        compassionDesc: "We believe everyone deserves a second chance and approach our work with empathy and understanding.",
        dignity: "Dignity",
        dignityDesc: "We respect the dignity of all individuals and are committed to providing non-judgmental support.",
        community: "Community",
        communityDesc: "We work alongside community partners to create a network of support for those returning home.",
        featuresTitle: "Platform Features",
        featuresSubtitle: "Built for Your Needs",
        featuresDesc: "ReEntry Connect MN is designed with you in mind. We've created features that make finding and connecting with resources as simple as possible.",
        feature1: "Comprehensive resource directory for Minnesota",
        feature2: "Easy search and filter functionality",
        feature3: "Interactive map to find nearby services",
        feature4: "AI-powered assistant for personalized guidance",
        feature5: "Regularly updated resource information",
        feature6: "Mobile-friendly design for access anywhere",
        ctaTitle: "Start Your Search Today",
        ctaDesc: "Whether you're looking for housing, employment, legal aid, or other services, we're here to help you find what you need.",
        browseResources: "Browse Resources"
      },
      // Chatbot
      chat: {
        title: "ReEntry Assistant",
        subtitle: "Here to help 24/7",
        placeholder: "Type your message...",
        disclaimer: "AI assistant may make mistakes. Verify important information.",
        greeting: "Hello! I'm here to help you find resources for your reentry journey in Minnesota. What kind of assistance are you looking for today?",
        thinking: "Thinking...",
        error: "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or browse our resource directory directly for assistance."
      },
      // Language
      language: {
        en: "English",
        es: "Español",
        so: "Soomaali",
        hmn: "Hmoob"
      },
      // Footer
      footer: {
        copyright: "© 2025 ReEntry Connect MN"
      }
    }
  },
  es: {
    translation: {
      // Navigation
      nav: {
        home: "Inicio",
        findResources: "Buscar Recursos",
        about: "Acerca de",
        getHelpNow: "Obtener Ayuda"
      },
      // Hero Section
      hero: {
        stateOf: "Estado de Minnesota",
        title: "ReEntry Connect MN",
        description: "Directorio oficial de recursos que conecta a personas que regresan de la encarcelación con vivienda, empleo, asistencia legal, atención médica y servicios esenciales en todo Minnesota.",
        findResources: "Buscar Recursos",
        aboutProgram: "Sobre Este Programa"
      },
      // Stats
      stats: {
        resources: "Recursos",
        categories: "Categorías",
        aiAssistant: "Asistente IA",
        always: "Siempre"
      },
      // Categories Section
      categories: {
        title: "Encuentra la Ayuda que Necesitas",
        subtitle: "Explora recursos por categoría para encontrar servicios que se ajusten a tus necesidades",
        viewAll: "Ver Todos los Recursos",
        housing: "Vivienda y Refugio",
        legal: "Asistencia Legal",
        employment: "Servicios de Empleo",
        healthcare: "Salud y Salud Mental",
        education: "Educación y Capacitación",
        food: "Asistencia Alimentaria"
      },
      // How It Works
      howItWorks: {
        title: "Cómo Funciona",
        subtitle: "Obtener ayuda es sencillo. Así puedes encontrar los recursos que necesitas.",
        step1Title: "1. Buscar",
        step1Desc: "Busca por categoría, ubicación o palabra clave para encontrar recursos cerca de ti",
        step2Title: "2. Conectar",
        step2Desc: "Ve detalles, horarios e información de contacto de cada recurso",
        step3Title: "3. Obtener Ayuda",
        step3Desc: "Comunícate directamente o usa nuestro asistente de IA para orientación"
      },
      // CTA Section
      cta: {
        title: "¿Listo para Comenzar?",
        description: "Nuestro asistente de IA está disponible 24/7 para ayudarte a encontrar los recursos adecuados. Haz clic en el ícono de chat en la esquina para iniciar una conversación.",
        browseNow: "Explorar Recursos Ahora"
      },
      // Resources Page
      resources: {
        title: "Buscar Recursos",
        subtitle: "Busca y filtra para encontrar los servicios que necesitas en Minnesota",
        searchPlaceholder: "Buscar recursos, servicios o ubicaciones...",
        list: "Lista",
        map: "Mapa",
        all: "Todos",
        found: "recursos encontrados",
        foundSingular: "recurso encontrado",
        in: "en",
        noResults: "No se encontraron recursos",
        noResultsDesc: "Intenta ajustar tu búsqueda o criterios de filtro",
        callNow: "Llamar Ahora"
      },
      // Resource Details
      resourceDetail: {
        contactInfo: "Información de Contacto",
        address: "Dirección",
        phone: "Teléfono",
        website: "Sitio Web",
        hours: "Horario",
        services: "Servicios Ofrecidos",
        eligibility: "Elegibilidad"
      },
      // About Page
      about: {
        title: "Acerca de ReEntry Connect MN",
        subtitle: "Estamos dedicados a ayudar a las personas que regresan de la encarcelación a encontrar los recursos que necesitan para reintegrarse exitosamente en sus comunidades en todo Minnesota.",
        missionTitle: "Nuestra Misión",
        missionSubtitle: "Conectando Personas con Oportunidades",
        missionP1: "ReEntry Connect MN fue creado para abordar una necesidad crítica: ayudar a las personas que regresan de la encarcelación a navegar el complejo panorama de recursos disponibles en Minnesota.",
        missionP2: "Entendemos que la transición de la encarcelación a la vida comunitaria puede ser abrumadora. Encontrar vivienda, empleo, atención médica y otros servicios esenciales no debería aumentar ese estrés.",
        missionP3: "Por eso hemos construido una plataforma completa y fácil de usar que pone toda la información que necesitas en un solo lugar, junto con un asistente de IA disponible 24/7 para ayudarte a guiar tu camino.",
        valuesTitle: "Nuestros Valores",
        valuesSubtitle: "Lo Que Nos Guía",
        compassion: "Compasión",
        compassionDesc: "Creemos que todos merecen una segunda oportunidad y abordamos nuestro trabajo con empatía y comprensión.",
        dignity: "Dignidad",
        dignityDesc: "Respetamos la dignidad de todas las personas y estamos comprometidos a brindar apoyo sin juzgar.",
        community: "Comunidad",
        communityDesc: "Trabajamos junto a socios comunitarios para crear una red de apoyo para quienes regresan a casa.",
        featuresTitle: "Características de la Plataforma",
        featuresSubtitle: "Diseñado para Tus Necesidades",
        featuresDesc: "ReEntry Connect MN está diseñado pensando en ti. Hemos creado funciones que hacen que encontrar y conectar con recursos sea lo más simple posible.",
        feature1: "Directorio completo de recursos para Minnesota",
        feature2: "Funcionalidad de búsqueda y filtro fácil",
        feature3: "Mapa interactivo para encontrar servicios cercanos",
        feature4: "Asistente con IA para orientación personalizada",
        feature5: "Información de recursos actualizada regularmente",
        feature6: "Diseño adaptable para acceso desde cualquier lugar",
        ctaTitle: "Comienza Tu Búsqueda Hoy",
        ctaDesc: "Ya sea que busques vivienda, empleo, asistencia legal u otros servicios, estamos aquí para ayudarte a encontrar lo que necesitas.",
        browseResources: "Explorar Recursos"
      },
      // Chatbot
      chat: {
        title: "Asistente de Reingreso",
        subtitle: "Aquí para ayudar 24/7",
        placeholder: "Escribe tu mensaje...",
        disclaimer: "El asistente de IA puede cometer errores. Verifica la información importante.",
        greeting: "¡Hola! Estoy aquí para ayudarte a encontrar recursos para tu proceso de reingreso en Minnesota. ¿Qué tipo de asistencia estás buscando hoy?",
        thinking: "Pensando...",
        error: "Lo siento, pero tengo problemas para conectarme en este momento. Por favor, intenta de nuevo en un momento, o explora nuestro directorio de recursos directamente para obtener asistencia."
      },
      // Language
      language: {
        en: "English",
        es: "Español",
        so: "Soomaali",
        hmn: "Hmoob"
      },
      // Footer
      footer: {
        copyright: "© 2025 ReEntry Connect MN"
      }
    }
  },
  so: {
    translation: {
      // Navigation
      nav: {
        home: "Bogga Hore",
        findResources: "Raadi Kheyraadka",
        about: "Ku Saabsan",
        getHelpNow: "Hel Caawimo Hadda"
      },
      // Hero Section
      hero: {
        stateOf: "Gobolka Minnesota",
        title: "ReEntry Connect MN",
        description: "Hagaha kheyraadka ee ku xira dadka ka soo laabanaya xabsiga oo leh guryo, shaqo, caawimo sharci, daryeel caafimaad, iyo adeegyada muhiimka ah ee Minnesota oo dhan.",
        findResources: "Raadi Kheyraadka",
        aboutProgram: "Ku Saabsan Barnaamijkan"
      },
      // Stats
      stats: {
        resources: "Kheyraadka",
        categories: "Qaybaha",
        aiAssistant: "Caawiye AI",
        always: "Mar walba"
      },
      // Categories Section
      categories: {
        title: "Hel Caawimada Aad U Baahan Tahay",
        subtitle: "Baadh kheyraadka si aad u hesho adeegyada ku habboon baahidaada",
        viewAll: "Arag Dhammaan Kheyraadka",
        housing: "Guryo & Hoy",
        legal: "Caawimo Sharci",
        employment: "Adeegyada Shaqada",
        healthcare: "Caafimaad & Maskaxda",
        education: "Waxbarasho & Tababar",
        food: "Caawimo Cunto"
      },
      // How It Works
      howItWorks: {
        title: "Sidee U Shaqeeyaa",
        subtitle: "Helitaanka caawimo waa fudud. Halkan waxaa ku yaal sida loo helo kheyraadka aad u baahan tahay.",
        step1Title: "1. Raadi",
        step1Desc: "Raadi qaybta, goobta, ama ereyga si aad u hesho kheyraadka kuu dhow",
        step2Title: "2. Ku Xidh",
        step2Desc: "Arag faahfaahinta, saacadaha, iyo macluumaadka la xiriirka ee kheyraad kasta",
        step3Title: "3. Hel Caawimo",
        step3Desc: "Si toos ah ula xiriir ama isticmaal caawiyaha AI-ga hagitaanka"
      },
      // CTA Section
      cta: {
        title: "Diyaar Ma U Tahay Inaad Bilaabato?",
        description: "Caawiyahayaga AI wuxuu diyaar u yahay 24/7 si uu kugu caawiyo helitaanka kheyraadka saxda ah. Guji sumadda wadahadalka geeska si aad u bilowdo wada hadal.",
        browseNow: "Baadh Kheyraadka Hadda"
      },
      // Resources Page
      resources: {
        title: "Raadi Kheyraadka",
        subtitle: "Raadi oo shaandhee si aad u hesho adeegyada aad u baahan tahay Minnesota",
        searchPlaceholder: "Raadi kheyraadka, adeegyada, ama goobaha...",
        list: "Liiska",
        map: "Khariidada",
        all: "Dhammaan",
        found: "kheyraad la helay",
        foundSingular: "kheyraad la helay",
        in: "gudaha",
        noResults: "Lama helin kheyraad",
        noResultsDesc: "Isku day inaad beddeshid raadintaada ama shuruudaha shaandhaynta",
        callNow: "Wac Hadda"
      },
      // Resource Details
      resourceDetail: {
        contactInfo: "Macluumaadka La Xiriirka",
        address: "Cinwaanka",
        phone: "Telefoonka",
        website: "Websaydhka",
        hours: "Saacadaha",
        services: "Adeegyada La Bixiyo",
        eligibility: "U Qalmitaanka"
      },
      // About Page
      about: {
        title: "Ku Saabsan ReEntry Connect MN",
        subtitle: "Waxaan u heellannahay inaan caawino dadka ka soo laabanaya xabsiga inay helaan kheyraadka ay u baahan yihiin si ay si guul leh ugu soo noqdaan bulshadadooda Minnesota oo dhan.",
        missionTitle: "Hadafkayaga",
        missionSubtitle: "Ku Xirida Dadka Fursadaha",
        missionP1: "ReEntry Connect MN waxaa loo sameeyay si loo wajaho baahi muhiim ah: caawinta dadka ka soo laabanaya xabsiga inay maraan kheyraadka adag ee ka jira Minnesota.",
        missionP2: "Waan fahamsanahay in kala guurka xabsiga ilaa nolosha bulshada ay noqon karto mid aad u adag. Helitaanka guryo, shaqo, daryeel caafimaad, iyo adeegyo kale oo muhiim ah ma aha inay ku daraan walbahaarka.",
        missionP3: "Sidaas darteed waxaan dhisnay barnaamij dhameystiran oo sahlan oo dhigaya dhammaan macluumaadka aad u baahan tahay meel keliya, oo ay la socoto caawiye AI oo diyaar u ah 24/7 si uu kugu caawiyo socdaalkaaga.",
        valuesTitle: "Qiyamkayaga",
        valuesSubtitle: "Waxa Na Haga",
        compassion: "Naxariis",
        compassionDesc: "Waxaan rumaysanahay in qof walba uu xaq u leeyahay fursad labaad waxaanan u muuqanaa shaqadayada naxariis iyo faham.",
        dignity: "Sharaf",
        dignityDesc: "Waxaan ixtiraamaa sharafta dhammaan dadka waxaanan u heellannahay inaan bixino taageero aan xukun lahayn.",
        community: "Bulsho",
        communityDesc: "Waxaan la shaqaynaynaa iskaashiyada bulshada si aan u abuurno shabakad taageero ah kuwa guryahooda ku soo laabanaya.",
        featuresTitle: "Astaamaha Barnaamijka",
        featuresSubtitle: "Loo Dhisay Baahidaada",
        featuresDesc: "ReEntry Connect MN waxaa loo qaabeeyay adiga. Waxaan abuurnay astaamo ka dhigaya helitaanka iyo ku xirnaanta kheyraadka mid aad u fudud.",
        feature1: "Hagaha kheyraadka oo dhammaystiran ee Minnesota",
        feature2: "Raadinta iyo shaandhaynta fudud",
        feature3: "Khariidad dhaqdhaqaaqa ah oo lagu helo adeegyada kuu dhow",
        feature4: "Caawiye AI ah oo hagitaan gaar ah",
        feature5: "Macluumaadka kheyraadka oo si joogto ah loo cusboonaysiiyo",
        feature6: "Naqshad mobile-friendly ah oo meel kasta laga geli karo",
        ctaTitle: "Bilow Raadintaada Maanta",
        ctaDesc: "Ha ahaato inaad raadinayso guryo, shaqo, caawimo sharci, ama adeegyo kale, waxaan halkaan u joogaa inaan ku caawino helitaanka waxa aad u baahan tahay.",
        browseResources: "Baadh Kheyraadka"
      },
      // Chatbot
      chat: {
        title: "Caawiyaha Soo-noqoshada",
        subtitle: "Halkan si aan kaaga caawino 24/7",
        placeholder: "Ku qor fariintaada...",
        disclaimer: "Caawiyaha AI wuxuu samayn karaa khaladaad. Xaqiiji macluumaadka muhiimka ah.",
        greeting: "Salaan! Waxaan halkan u joogaa inaan ku caawiyo helitaanka kheyraadka socdaalkaaga soo-noqoshada ee Minnesota. Noocee caawimo ah ayaad maanta raadinaysaa?",
        thinking: "Waan fikiraa...",
        error: "Waan ka xumahay, laakiin waxaan la kulanyay dhibaato isku xirista. Fadlan isku day mar kale dhawayd, ama si toos ah u baadh hagahayaga kheyraadka."
      },
      // Language
      language: {
        en: "English",
        es: "Español",
        so: "Soomaali",
        hmn: "Hmoob"
      },
      // Footer
      footer: {
        copyright: "© 2025 ReEntry Connect MN"
      }
    }
  },
  hmn: {
    translation: {
      // Navigation
      nav: {
        home: "Tsev",
        findResources: "Nrhiav Cov Kev Pab",
        about: "Hais Txog",
        getHelpNow: "Tau Kev Pab Tam Sim No"
      },
      // Hero Section
      hero: {
        stateOf: "Xeev Minnesota",
        title: "ReEntry Connect MN",
        description: "Phau ntawv qhia txog cov kev pab uas txuas cov neeg rov qab los ntawm kev raug kaw nrog tsev nyob, hauj lwm, kev pab lij choj, kev kho mob, thiab cov kev pab tseem ceeb thoob plaws Minnesota.",
        findResources: "Nrhiav Cov Kev Pab",
        aboutProgram: "Hais Txog Qhov Program No"
      },
      // Stats
      stats: {
        resources: "Cov Kev Pab",
        categories: "Pawg",
        aiAssistant: "AI Pab",
        always: "Ib txwm"
      },
      // Categories Section
      categories: {
        title: "Nrhiav Kev Pab Uas Koj Xav Tau",
        subtitle: "Xauj cov kev pab los ntawm pawg kom nrhiav tau cov kev pab uas haum rau koj qhov kev xav tau",
        viewAll: "Saib Tag Nrho Cov Kev Pab",
        housing: "Tsev Nyob & Chaw Nyob",
        legal: "Kev Pab Lij Choj",
        employment: "Kev Pab Nrhiav Hauj Lwm",
        healthcare: "Kev Kho Mob & Kev Puas Siab Puas Ntsws",
        education: "Kev Kawm & Kev Cob Qhia",
        food: "Kev Pab Zaub Mov"
      },
      // How It Works
      howItWorks: {
        title: "Nws Ua Hauj Lwm Li Cas",
        subtitle: "Tau kev pab yooj yim heev. Nov yog yuav ua li cas nrhiav cov kev pab uas koj xav tau.",
        step1Title: "1. Nrhiav",
        step1Desc: "Nrhiav los ntawm pawg, qhov chaw, los yog lo lus tseem ceeb kom nrhiav tau cov kev pab ze koj",
        step2Title: "2. Txuas",
        step2Desc: "Saib cov ntsiab lus, teev sij hawm, thiab cov ntaub ntawv tiv tauj rau txhua qhov kev pab",
        step3Title: "3. Tau Kev Pab",
        step3Desc: "Hu ncaj qha los yog siv peb tus AI pab rau kev qhia"
      },
      // CTA Section
      cta: {
        title: "Npaj Pib Lawm?",
        description: "Peb tus AI pab muaj 24/7 los pab koj nrhiav cov kev pab zoo. Nyem lub cim sib tham hauv lub ces kaum kom pib sib tham.",
        browseNow: "Xauj Cov Kev Pab Tam Sim No"
      },
      // Resources Page
      resources: {
        title: "Nrhiav Cov Kev Pab",
        subtitle: "Nrhiav thiab lim kom nrhiav tau cov kev pab uas koj xav tau hauv Minnesota",
        searchPlaceholder: "Nrhiav cov kev pab, kev pab cuam, los yog qhov chaw...",
        list: "Daim Ntawv",
        map: "Daim Duab Qhia",
        all: "Tag Nrho",
        found: "cov kev pab nrhiav tau",
        foundSingular: "kev pab nrhiav tau",
        in: "hauv",
        noResults: "Tsis nrhiav tau kev pab",
        noResultsDesc: "Sim kho koj qhov kev nrhiav los yog cov kev xaiv",
        callNow: "Hu Tam Sim No"
      },
      // Resource Details
      resourceDetail: {
        contactInfo: "Ntaub Ntawv Tiv Tauj",
        address: "Chaw Nyob",
        phone: "Xov Tooj",
        website: "Lub Vev Xaib",
        hours: "Teev Sij Hawm",
        services: "Cov Kev Pab Muaj",
        eligibility: "Kev Tsim Nyog"
      },
      // About Page
      about: {
        title: "Hais Txog ReEntry Connect MN",
        subtitle: "Peb mob siab rau kev pab cov neeg rov qab los ntawm kev raug kaw nrhiav cov kev pab uas lawv xav tau kom rov qab los koom nrog lawv cov zej zog hauv Minnesota.",
        missionTitle: "Peb Lub Hom Phiaj",
        missionSubtitle: "Txuas Neeg Rau Cov Hauv Kev",
        missionP1: "ReEntry Connect MN tau tsim los daws ib qho kev xav tau tseem ceeb: pab cov neeg rov qab los ntawm kev raug kaw taug kev hauv cov kev pab nyuaj hauv Minnesota.",
        missionP2: "Peb to taub tias kev hloov los ntawm kev raug kaw mus rau lub neej hauv zej zog tuaj yeem ua rau nyuaj heev. Nrhiav tsev nyob, hauj lwm, kev kho mob, thiab lwm yam kev pab tseem ceeb yuav tsum tsis txhob ntxiv rau qhov kev ntxhov siab ntawd.",
        missionP3: "Yog li ntawd peb tau tsim ib qho kev pab cuam yooj yim siv uas muab tag nrho cov ntaub ntawv uas koj xav tau hauv ib qho chaw, nrog rau tus AI pab 24/7 los pab coj koj hauv koj txoj kev.",
        valuesTitle: "Peb Cov Nqi",
        valuesSubtitle: "Yam Uas Coj Peb",
        compassion: "Kev Hlub Tshua",
        compassionDesc: "Peb ntseeg tias txhua tus neeg tsim nyog tau txais lub sijhawm thib ob thiab peb ua peb txoj haujlwm nrog kev hlub tshua thiab kev nkag siab.",
        dignity: "Kev Hwm",
        dignityDesc: "Peb hwm txhua tus neeg txoj kev muaj nuj nqis thiab peb cog lus tias yuav muab kev txhawb nqa tsis txiav txim.",
        community: "Zej Zog",
        communityDesc: "Peb ua haujlwm nrog cov koom haum hauv zej zog los tsim ib lub network ntawm kev txhawb nqa rau cov neeg rov qab los tsev.",
        featuresTitle: "Cov Yam Ntxwv Ntawm Platform",
        featuresSubtitle: "Tsim Rau Koj Qhov Kev Xav Tau",
        featuresDesc: "ReEntry Connect MN tau tsim nrog koj hauv siab. Peb tau tsim cov yam ntxwv uas ua rau kev nrhiav thiab txuas nrog cov kev pab yooj yim li sai tau.",
        feature1: "Phau ntawv qhia kev pab tag nrho rau Minnesota",
        feature2: "Kev nrhiav thiab lim yooj yim",
        feature3: "Daim duab qhia interactive los nrhiav cov kev pab ze",
        feature4: "AI pab rau kev qhia tus kheej",
        feature5: "Cov ntaub ntawv kev pab hloov tshiab tas li",
        feature6: "Tsim rau xov tooj kom nkag tau qhov twg los tau",
        ctaTitle: "Pib Koj Txoj Kev Nrhiav Hnub No",
        ctaDesc: "Txawm tias koj tab tom nrhiav tsev nyob, hauj lwm, kev pab lij choj, los yog lwm yam kev pab, peb nyob ntawm no los pab koj nrhiav yam koj xav tau.",
        browseResources: "Xauj Cov Kev Pab"
      },
      // Chatbot
      chat: {
        title: "Tus Pab Rov Qab Los",
        subtitle: "Nyob ntawm no pab 24/7",
        placeholder: "Ntaus koj cov lus...",
        disclaimer: "AI pab yuav ua tau yuam kev. Xyuas cov ntaub ntawv tseem ceeb.",
        greeting: "Nyob zoo! Kuv nyob ntawm no los pab koj nrhiav cov kev pab rau koj txoj kev rov qab los hauv Minnesota. Hom kev pab twg koj tab tom nrhiav hnub no?",
        thinking: "Tab tom xav...",
        error: "Kuv thov txim, tab sis kuv muaj teeb meem txuas tam sim no. Thov sim dua ib pliag, los yog xauj peb phau ntawv qhia kev pab ncaj qha."
      },
      // Language
      language: {
        en: "English",
        es: "Español",
        so: "Soomaali",
        hmn: "Hmoob"
      },
      // Footer
      footer: {
        copyright: "© 2025 ReEntry Connect MN"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
