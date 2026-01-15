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
        es: "Español"
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
        es: "Español"
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
