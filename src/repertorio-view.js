/**
 * REPERTORIO - Catálogo Magazine & Presentación de Oferta ZentryOS
 * SSOT Oficial de Productos, Planes de Implementación, Beneficios y Economía de Referencias
 */

import {
  CATALOG_CATEGORIES,
  PRODUCTS_CATALOG,
  getAllCatalogProducts,
  getProductsByCategory,
  getProductBySku,
  getProductsByFamilyCode
} from './products-catalog.js';

export const REPERTORIO_DATA = {
  exchangeRate: 3.40, // 1 USD = 3.40 PEN

  // Catálogo de Productos Físicos Oficial
  products: {
    st: {
      code: 'st',
      name: 'Smart Tab',
      shortName: 'Smart Tab',
      tagline: 'Pantalla de alta resolución calibrada para estudio, foco y creatividad.',
      priceUSD: 1300,
      pricePEN: 4420,
      image: '/assets/repertorio/prod_smarttab.png',
      icon: '📱',
      badge: 'Hardware Central'
    },
    sb: {
      code: 'sb',
      name: 'Smart Band',
      shortName: 'Smart Band',
      tagline: 'Monitoreo discreto de actividad física, sueño y biorritmo infantil y juvenil.',
      priceUSD: 350,
      pricePEN: 1190,
      image: '/assets/repertorio/prod_smartband.png',
      icon: '⌚',
      badge: 'Hábito & Sueño'
    },
    sr: {
      code: 'sr',
      name: 'Smart Ring',
      shortName: 'Smart Ring',
      tagline: 'Anillo biométrico de titanio para monitoreo no intrusivo de salud y temperatura.',
      priceUSD: 450,
      pricePEN: 1530,
      image: '/assets/repertorio/prod_smartring.png',
      icon: '💍',
      badge: 'Biometría Invisible'
    },
    ss: {
      code: 'ss',
      name: 'Smart Sound',
      shortName: 'Smart Sound',
      tagline: 'Audio espacial multiroom sin pantalla para rutinas matutinas, estudio y meditación.',
      priceUSD: 650,
      pricePEN: 2210,
      image: '/assets/repertorio/prod_smartsound.png',
      icon: '🔊',
      badge: 'Acústica & Foco'
    },
    sw: {
      code: 'sw',
      name: 'Smart Watch',
      shortName: 'Smart Watch',
      tagline: 'Reloj inteligente de pulso con enlace prioritario y notificaciones parentales seguras.',
      priceUSD: 650,
      pricePEN: 2210,
      image: '/assets/repertorio/prod_smartwatch.png',
      icon: '🧭',
      badge: 'Conectividad Directa'
    },
    sp: {
      code: 'sp',
      name: 'Smart Phone',
      shortName: 'Smart Phone',
      tagline: 'Terminal móvil con núcleo ZentryOS blindado contra algoritmos adictivos.',
      priceUSD: 1200,
      pricePEN: 4080,
      image: '/assets/repertorio/prod_smartphone.png',
      icon: '📲',
      badge: 'Ecosistema Total'
    }
  },

  // Planes de Implementación de Software en dispositivos propios del usuario
  implementations: {
    individual: {
      id: 'individual',
      name: 'Implementación Individual',
      target: '1 Hijo (2 dispositivos asignados)',
      devicesIncluded: 2,
      usersIncluded: 1,
      dashboardViews: '2 vistas (Padre y Madre)',
      dashboardDevices: 'Celular, tablet, PC o laptop',
      priceUSD: 1145,
      pricePEN: 3893,
      description: 'Despliegue e instalación de ZentryOS en 2 dispositivos del hijo (ej. tablet y teléfono/laptop) más Parental Dashboard multidispositivo para ambos padres.'
    },
    dual: {
      id: 'dual',
      name: 'Implementación Dual',
      target: '2 Hijos (4 dispositivos asignados)',
      devicesIncluded: 4,
      usersIncluded: 2,
      dashboardViews: '2 vistas (Padre y Madre)',
      dashboardDevices: 'Celular, tablet, PC o laptop',
      priceUSD: 1690, // Estrategia escalonada con 30% desc. en el 2do hijo
      pricePEN: 5740,
      discountNote: 'Ahorro del 30% en el segundo hijo ya aplicado',
      description: 'Despliegue para 2 hijos con hasta 4 dispositivos en total, calibrando rutinas y perfiles pedagógicos independientes con Parental Dashboard consolidado.'
    },
    custom: {
      id: 'custom',
      name: 'Hijo Adicional (Custom)',
      target: 'A partir del 3er hijo',
      devicesPerUser: 2,
      priceUSDPerChild: 500,
      pricePENPerChild: 1700,
      description: 'Agrega un hijo adicional con 2 dispositivos implementados y sincronizados al Parental Dashboard familiar.'
    }
  },

  // Beneficios y Regalos Incluidos con la Implementación
  benefits: [
    {
      id: 'ai_classes',
      title: '3 Clases de Inteligencia Artificial para Padres',
      tag: 'Formación Parental',
      valuePEN: 385,
      valueUSD: 113.24,
      description: 'Sesiones personalizadas 1 a 1 para dominar IA, automatización y supervisión parental ética.',
      icon: '🧠'
    },
    {
      id: 'studio_credits',
      title: '100 Créditos de Generación Studio',
      tag: 'Lanzamiento 15 Nov',
      valuePEN: 200,
      valueUSD: 58.82,
      description: 'Creación asistida de microapps educativas, imágenes y contenido multimedia para los hijos.',
      icon: '✨'
    },
    {
      id: 'zentry_experience',
      title: 'Pase Familiar "Zentry Experience"',
      tag: 'Evento Presencial / Virtual',
      valuePEN: 200,
      valueUSD: 58.82,
      description: 'Jornada inmersiva para padres e hijos con mentores en vivo y dinámicas lúdicas de enfoque.',
      conversionNote: 'Convertible automáticamente en 100 créditos adicionales si no asistes al evento.',
      icon: '🎟️'
    }
  ],

  // Dinámica de Economía de Créditos y Programa de Referencias (Citas Concretadas)
  referralsProgram: [
    {
      citas: 7,
      credits: 500,
      rewardCode: 'sb',
      rewardName: 'Smart Band',
      rewardIcon: '⌚',
      commercialValuePEN: 1190,
      commercialValueUSD: 350
    },
    {
      citas: 10,
      credits: 650,
      rewardCode: 'sr',
      rewardName: 'Smart Ring',
      rewardIcon: '💍',
      commercialValuePEN: 1530,
      commercialValueUSD: 450
    },
    {
      citas: 20,
      credits: 1000,
      rewardCode: 'ss_or_sw',
      rewardName: 'Smart Sound Ó Smart Watch',
      rewardIcon: '🔊 / 🧭',
      commercialValuePEN: 2210,
      commercialValueUSD: 650
    },
    {
      citas: 30,
      credits: 2000,
      rewardCode: 'sp',
      rewardName: 'Smart Phone',
      rewardIcon: '📲',
      commercialValuePEN: 4080,
      commercialValueUSD: 1200
    }
  ],

  // Arquetipos de Familias
  families: {
    nuclear_1h: {
      id: 'nuclear_1h',
      name: 'Familia Nuclear',
      membersLabel: '2 Padres + 1 Hijo',
      membersSubtitle: '2 Padres • 1 Hijo',
      badge: 'Estructura Nuclear',
      description: 'Enfocada en proteger y potenciar al único hijo en el hogar, con sincronización total entre ambos padres.',
      defaultImpl: 'individual',
      childrenCount: 1,
      parentsCount: 2,
      grandparentsCount: 0,
      totalMembers: 3,
      familyPhotoImg: '/assets/repertorio/family_nuclear_1h.png',
      coverImg: '/assets/repertorio/portada_nuclear_1h.png',
      lifestyleImg: '/assets/repertorio/lifestyle_lounge.png',
      story: 'El hijo centraliza la atención formativa del hogar. Sus dos dispositivos de uso cotidiano se integran de forma simbiótica, mientras que papá y mamá monitorean hábitos desde sus teléfonos y computadoras.'
    },
    extensa_1h: {
      id: 'extensa_1h',
      name: 'Familia Extensa',
      membersLabel: '2 Padres + 1 Hijo + 3 Abuelos',
      membersSubtitle: '2 Padres • 1 Hijo • 3 Abuelos',
      badge: 'Multigeneracional',
      description: 'Cuidado integral que une el desarrollo pedagógico del niño con el monitoreo de bienestar y salud de los abuelos.',
      defaultImpl: 'individual',
      childrenCount: 1,
      parentsCount: 2,
      grandparentsCount: 3,
      totalMembers: 6,
      familyPhotoImg: '/assets/repertorio/family_extensa_1h.png',
      coverImg: '/assets/repertorio/portada_extensa_1h.png',
      lifestyleImg: '/assets/repertorio/lifestyle_lounge.png',
      story: 'La coexistencia de tres generaciones en el hogar exige armonía acústica y cuidado médico silencioso. Los anillos y pulseras inteligentes velan por el descanso de los abuelos y la concentración del menor.'
    },
    nuclear_2h: {
      id: 'nuclear_2h',
      name: 'Familia Nuclear x2',
      membersLabel: '2 Padres + 2 Hijos',
      membersSubtitle: '2 Padres • 2 Hijos',
      badge: 'Hermanos & Rutinas',
      description: 'Equilibrio de pantallas entre hermanos con límites y cronogramas pedagógicos personalizados para cada uno.',
      defaultImpl: 'dual',
      childrenCount: 2,
      parentsCount: 2,
      grandparentsCount: 0,
      totalMembers: 4,
      familyPhotoImg: '/assets/repertorio/family_nuclear_2h.png',
      coverImg: '/assets/repertorio/portada_nuclear_2h.png',
      lifestyleImg: '/assets/repertorio/lifestyle_lounge.png',
      story: 'Dos hijos representan mundos cognitivos diferentes. Cada uno dispone de su tablet y wearable calibrados individualmente, evitando disputas y garantizando que el tiempo de ocio no canibalice el estudio.'
    },
    extensa_2h: {
      id: 'extensa_2h',
      name: 'Familia Extensa x2',
      membersLabel: '2 Padres + 2 Hijos + 3 Abuelos',
      membersSubtitle: '2 Padres • 2 Hijos • 3 Abuelos',
      badge: 'Dinastía Integral',
      description: 'Máxima cobertura tecnológica y biométrica para una casa viva y activa con múltiples generaciones.',
      defaultImpl: 'dual',
      childrenCount: 2,
      parentsCount: 2,
      grandparentsCount: 3,
      totalMembers: 7,
      familyPhotoImg: '/assets/repertorio/family_extensa_2h.png',
      coverImg: '/assets/repertorio/portada_extensa_2h.png',
      lifestyleImg: '/assets/repertorio/lifestyle_lounge.png',
      story: 'El hogar en su máxima expresión. Múltiples zonas acústicas, monitoreo biométrico preventivo para los adultos mayores y un ecosistema pedagógico robusto para ambos hermanos.'
    }
  },

  // Matriz de Sets por Familia (Exacta de la imagen de sets)
  setsMatrix: {
    nuclear_1h: {
      essential: {
        id: 'essential',
        name: 'Essential Set',
        tierName: 'Esencial',
        tagline: 'El umbral de autonomía y protección digital para el hijo.',
        items: [{ code: 'sb', qty: 1 }, { code: 'st', qty: 1 }, { code: 'sr', qty: 1 }],
        image: '/assets/repertorio/set_nuclear_1h_essential.png',
        highlight: '1 Tab + 1 Band + 1 Ring',
        experience: 'El hijo cuenta con su Smart Tab para estudio activo y su Smart Band para el biorritmo del sueño. Se añade un Smart Ring para uno de los padres o monitoreo biométrico fino.'
      },
      omni: {
        id: 'omni',
        name: 'OMNI Set',
        tierName: 'Omnipresente',
        tagline: 'Sincronización biométrica para padre, madre e hijo.',
        items: [{ code: 'sb', qty: 1 }, { code: 'st', qty: 1 }, { code: 'sr', qty: 2 }],
        image: '/assets/repertorio/set_nuclear_1h_omni.png',
        highlight: '1 Tab + 1 Band + 2 Rings',
        experience: 'Ambos padres portan el Smart Ring para supervisar salud y estrés en tiempo real, mientras el hijo mantiene su entorno de estudio y monitoreo activo.'
      },
      integral: {
        id: 'integral',
        name: 'Integral Set',
        tierName: 'Integral',
        tagline: 'Ambiente acústico sin pantallas y foco auditivo compartido.',
        inheritedFrom: 'omni',
        addedItems: [{ code: 'ss', qty: 1 }],
        items: [{ code: 'sb', qty: 1 }, { code: 'st', qty: 1 }, { code: 'sr', qty: 2 }, { code: 'ss', qty: 1 }],
        image: '/assets/repertorio/set_nuclear_1h_integral.png',
        highlight: 'OMNI + 1 Smart Sound',
        experience: 'La integración de Smart Sound en la sala o estudio transforma los hábitos: alarmas circadianas, música de alta fidelidad para el foco y rutinas habladas sin pantallas que distraigan.'
      },
      fullhouse: {
        id: 'fullhouse',
        name: 'Full House Set',
        tierName: 'Ecosistema Total',
        tagline: 'El estándar definitivo de interconexión familiar Zentry.',
        inheritedFrom: 'integral',
        addedItems: [{ code: 'sw', qty: 1 }, { code: 'sp', qty: 1 }],
        items: [{ code: 'sb', qty: 1 }, { code: 'st', qty: 1 }, { code: 'sr', qty: 2 }, { code: 'ss', qty: 1 }, { code: 'sw', qty: 1 }, { code: 'sp', qty: 1 }],
        image: '/assets/repertorio/set_nuclear_1h_fullhouse.png',
        highlight: 'Integral + 1 Smart Watch + 1 Smart Phone',
        experience: 'Control absoluto dentro y fuera de casa. El teléfono seguro con ZentryOS y el Smart Watch permiten comunicación directa protegida ante cualquier estímulo adictivo exterior.'
      }
    },

    extensa_1h: {
      essential: {
        id: 'essential',
        name: 'Essential Set',
        tierName: 'Esencial',
        tagline: 'Protección infantil y cuidado biométrico para abuelos.',
        items: [{ code: 'sb', qty: 1 }, { code: 'st', qty: 1 }, { code: 'sr', qty: 2 }],
        image: '/assets/repertorio/set_extensa_1h_essential.png',
        highlight: '1 Tab + 1 Band + 2 Rings',
        experience: 'El Smart Tab y Smart Band atienden al niño, mientras dos Smart Rings salvaguardan los signos vitales clave de los abuelos.'
      },
      omni: {
        id: 'omni',
        name: 'OMNI Set',
        tierName: 'Omnipresente',
        tagline: 'Doble pantalla y doble anillo para el hogar extendido.',
        items: [{ code: 'sb', qty: 2 }, { code: 'st', qty: 2 }, { code: 'sr', qty: 2 }],
        image: '/assets/repertorio/set_extensa_1h_omni.png',
        highlight: '2 Tabs + 2 Bands + 2 Rings',
        experience: 'Dos estaciones de tablet para lectura de adultos mayores y deberes escolares, con anillos y bandas repartidas entre la familia.'
      },
      integral: {
        id: 'integral',
        name: 'Integral Set',
        tierName: 'Integral',
        tagline: 'Acústica relajante para toda la casa.',
        inheritedFrom: 'omni',
        addedItems: [{ code: 'ss', qty: 1 }],
        items: [{ code: 'sb', qty: 2 }, { code: 'st', qty: 2 }, { code: 'sr', qty: 2 }, { code: 'ss', qty: 1 }],
        image: '/assets/repertorio/set_extensa_1h_integral.png',
        highlight: 'OMNI + 1 Smart Sound',
        experience: 'Smart Sound centralizado para ambientar el living familiar con sonido sin estridencias, ideal para la convivencia intergeneracional.'
      },
      fullhouse: {
        id: 'fullhouse',
        name: 'Full House Set',
        tierName: 'Ecosistema Total',
        tagline: 'Blindaje digital absoluto para la casa grande.',
        inheritedFrom: 'integral',
        addedItems: [{ code: 'sw', qty: 1 }, { code: 'sp', qty: 1 }],
        items: [{ code: 'sb', qty: 2 }, { code: 'st', qty: 2 }, { code: 'sr', qty: 2 }, { code: 'ss', qty: 1 }, { code: 'sw', qty: 1 }, { code: 'sp', qty: 1 }],
        image: '/assets/repertorio/set_extensa_2h_fullhouse.png',
        highlight: 'Integral + 1 Smart Watch + 1 Smart Phone',
        experience: 'Máxima capacidad: un Smart Phone seguro para el joven o tutor y Smart Watch con monitoreo inmediato en cualquier rincón del hogar.'
      }
    },

    nuclear_2h: {
      essential: {
        id: 'essential',
        name: 'Essential Set',
        tierName: 'Esencial',
        tagline: 'Paridad pedagógica para 2 hermanos.',
        items: [{ code: 'sb', qty: 2 }, { code: 'st', qty: 2 }, { code: 'sr', qty: 2 }],
        image: '/assets/repertorio/set_nuclear_2h_essential.png',
        highlight: '2 Tabs + 2 Bands + 2 Rings',
        experience: 'Cada hijo recibe su Smart Tab y su Smart Band para erradicar comparaciones y disputas, respaldados por los Smart Rings para ambos padres.'
      },
      omni: {
        id: 'omni',
        name: 'OMNI Set',
        tierName: 'Omnipresente',
        tagline: 'Doble pantalla y doble pulsera de hábitos consolidados.',
        items: [{ code: 'sb', qty: 2 }, { code: 'st', qty: 2 }, { code: 'sr', qty: 2 }],
        image: '/assets/repertorio/set_nuclear_2h_omni.png',
        highlight: '2 Tabs + 2 Bands + 2 Rings',
        experience: 'Configuración equilibrada para dos hijos con supervisión parental activa y dashboards segmentados por edad escolar.'
      },
      integral: {
        id: 'integral',
        name: 'Integral Set',
        tierName: 'Integral',
        tagline: 'Doble zona acústica: estudio y sala.',
        inheritedFrom: 'omni',
        addedItems: [{ code: 'ss', qty: 2 }],
        items: [{ code: 'sb', qty: 2 }, { code: 'st', qty: 2 }, { code: 'sr', qty: 2 }, { code: 'ss', qty: 2 }],
        image: '/assets/repertorio/set_nuclear_2h_integral.png',
        highlight: 'OMNI + 2 Smart Sounds',
        experience: 'Dos altavoces Smart Sound para dos dormitorios o zonas de estudio independientes: cada hermano tiene su propio ecosistema de audio para concentrarse.'
      },
      fullhouse: {
        id: 'fullhouse',
        name: 'Full House Set',
        tierName: 'Ecosistema Total',
        tagline: 'Doble reloj, doble teléfono, sin dependencias.',
        inheritedFrom: 'integral',
        addedItems: [{ code: 'sw', qty: 2 }, { code: 'sp', qty: 2 }],
        items: [{ code: 'sb', qty: 2 }, { code: 'st', qty: 2 }, { code: 'sr', qty: 2 }, { code: 'ss', qty: 2 }, { code: 'sw', qty: 2 }, { code: 'sp', qty: 2 }],
        image: '/assets/repertorio/set_nuclear_2h_fullhouse.png',
        highlight: 'Integral + 2 Smart Watches + 2 Smart Phones',
        experience: 'El pináculo del catálogo Zentry: ambos hijos disponen de su smartwatch de seguridad y su smartphone ZentryOS para salidas, escuela y deportes.'
      }
    },

    extensa_2h: {
      essential: {
        id: 'essential',
        name: 'Essential Set',
        tierName: 'Esencial',
        tagline: 'Equipamiento dual escolar y biométrico.',
        items: [{ code: 'sb', qty: 2 }, { code: 'st', qty: 2 }, { code: 'sr', qty: 2 }],
        image: '/assets/repertorio/set_extensa_2h_essential.png',
        highlight: '2 Tabs + 2 Bands + 2 Rings',
        experience: 'Herramientas equitativas para ambos hermanos en edad escolar, con anillos para el monitoreo de los adultos mayores.'
      },
      omni: {
        id: 'omni',
        name: 'OMNI Set',
        tierName: 'Omnipresente',
        tagline: 'Armonía y paridad para todo el clan.',
        items: [{ code: 'sb', qty: 2 }, { code: 'st', qty: 2 }, { code: 'sr', qty: 2 }],
        image: '/assets/repertorio/set_extensa_2h_omni.png',
        highlight: '2 Tabs + 2 Bands + 2 Rings',
        experience: 'Doble terminal de trabajo con sincronización cloud instantánea hacia el Parental Dashboard.'
      },
      integral: {
        id: 'integral',
        name: 'Integral Set',
        tierName: 'Integral',
        tagline: 'Doble altavoz ambiental para la casa compartida.',
        inheritedFrom: 'omni',
        addedItems: [{ code: 'ss', qty: 2 }],
        items: [{ code: 'sb', qty: 2 }, { code: 'st', qty: 2 }, { code: 'sr', qty: 2 }, { code: 'ss', qty: 2 }],
        image: '/assets/repertorio/set_extensa_2h_integral.png',
        highlight: 'OMNI + 2 Smart Sounds',
        experience: 'Dos Smart Sound estratégicamente colocados (área social y área de dormitorios) para guiar los ritmos circadianos de toda la familia.'
      },
      fullhouse: {
        id: 'fullhouse',
        name: 'Full House Set',
        tierName: 'Ecosistema Total',
        tagline: 'La cumbre de hardware Zentry para la dinastía.',
        inheritedFrom: 'integral',
        addedItems: [{ code: 'sw', qty: 2 }, { code: 'sp', qty: 2 }],
        items: [{ code: 'sb', qty: 2 }, { code: 'st', qty: 2 }, { code: 'sr', qty: 2 }, { code: 'ss', qty: 2 }, { code: 'sw', qty: 2 }, { code: 'sp', qty: 2 }],
        image: '/assets/repertorio/set_extensa_2h_fullhouse.png',
        highlight: 'Integral + 2 Smart Watches + 2 Smart Phones',
        experience: 'Ningún miembro queda desatendido. Sincronización absoluta de software y hardware con cobertura total.'
      }
    }
  }
};

/**
 * Estado reactivo del Repertorio
 */
export const repertorioState = {
  selectedFamily: 'nuclear_1h', // 'nuclear_1h', 'extensa_1h', 'nuclear_2h', 'extensa_2h'
  currency: 'USD', // 'USD' | 'PEN'
  currentSpread: 2, // 1 to 6 (Por defecto Spread 2: Essential Set)
  selectedSetTier: 'essential', // 'essential', 'omni', 'integral', 'fullhouse'
  additionalChildren: 0,
  includeImplementation: true,
  viewMode: 'magazine', // 'family-picker' | 'magazine' | 'custom-builder'

  // Estado del Personalizador de Sets a Medida (Matriz de Productos y SKUs)
  customBuilderCategory: 'all',
  customSetItems: [
    { sku: 'ZT-TAB11-BLK', qty: 1 },
    { sku: 'ZT-RING-WHT', qty: 1 },
    { sku: 'ZT-PHN-BLK', qty: 1 }
  ],
  productAngles: {} // Mapa de sku -> 'front' | 'back'
};

/**
 * Helper para formatear montos según la moneda activa
 */
export function formatMoney(usdAmount, penAmount = null, currency = repertorioState.currency) {
  if (currency === 'PEN') {
    const val = penAmount !== null ? penAmount : Math.round(usdAmount * REPERTORIO_DATA.exchangeRate);
    return `S/ ${val.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  return `$${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} USD`;
}

/**
 * Calcula los totales para un set y familia dados
 */
export function calculateSetTotals(familyId, setKey, additionalChildren = repertorioState.additionalChildren, includeImpl = repertorioState.includeImplementation) {
  const family = REPERTORIO_DATA.families[familyId];
  const set = REPERTORIO_DATA.setsMatrix[familyId][setKey];
  
  let hardwareUSD = 0;
  let hardwarePEN = 0;
  let totalItemsCount = 0;

  set.items.forEach(item => {
    const prod = REPERTORIO_DATA.products[item.code];
    if (prod) {
      hardwareUSD += prod.priceUSD * item.qty;
      hardwarePEN += prod.pricePEN * item.qty;
      totalItemsCount += item.qty;
    }
  });

  const implData = REPERTORIO_DATA.implementations[family.defaultImpl];
  let implementationUSD = includeImpl ? implData.priceUSD : 0;
  let implementationPEN = includeImpl ? implData.pricePEN : 0;

  if (includeImpl && additionalChildren > 0) {
    implementationUSD += additionalChildren * REPERTORIO_DATA.implementations.custom.priceUSDPerChild;
    implementationPEN += additionalChildren * REPERTORIO_DATA.implementations.custom.pricePENPerChild;
  }

  // Beneficios de regalo valorizados
  const benefitsValuePEN = REPERTORIO_DATA.benefits.reduce((acc, b) => acc + b.valuePEN, 0);
  const benefitsValueUSD = Math.round(benefitsValuePEN / REPERTORIO_DATA.exchangeRate);

  const totalUSD = hardwareUSD + implementationUSD;
  const totalPEN = hardwarePEN + implementationPEN;

  return {
    hardwareUSD,
    hardwarePEN,
    implementationUSD,
    implementationPEN,
    benefitsValueUSD,
    benefitsValuePEN,
    totalUSD,
    totalPEN,
    totalItemsCount,
    set,
    family,
    implData
  };
}

/**
 * Calcula los totales para el Set a Medida (Custom Set)
 */
export function calculateCustomSetTotals() {
  const family = REPERTORIO_DATA.families[repertorioState.selectedFamily] || REPERTORIO_DATA.families['nuclear_1h'];
  const items = repertorioState.customSetItems.map(item => {
    const product = getProductBySku(item.sku);
    return {
      sku: item.sku,
      qty: item.qty,
      product: product
    };
  }).filter(i => i.product);

  let hardwareUSD = 0;
  let hardwarePEN = 0;
  let hardwareCount = 0;
  let softwareUSD = 0;
  let softwarePEN = 0;
  let softwareCount = 0;
  let totalItemsCount = 0;

  items.forEach(item => {
    const isSoftware = item.product.category === 'implementations';
    const subUSD = item.product.priceUSD * item.qty;
    const subPEN = item.product.pricePEN * item.qty;
    if (isSoftware) {
      softwareUSD += subUSD;
      softwarePEN += subPEN;
      softwareCount += item.qty;
    } else {
      hardwareUSD += subUSD;
      hardwarePEN += subPEN;
      hardwareCount += item.qty;
    }
    totalItemsCount += item.qty;
  });

  const totalUSD = hardwareUSD + softwareUSD;
  const totalPEN = hardwarePEN + softwarePEN;

  return {
    family,
    items,
    totalItemsCount,
    hardwareCount,
    softwareCount,
    hardwareUSD,
    hardwarePEN,
    softwareUSD,
    softwarePEN,
    totalUSD,
    totalPEN
  };
}

/**
 * Renderizador Principal de la Vista Repertorio
 */
export function renderRepertorioView() {
  const workspace = document.querySelector('.workspace');
  const isScrollable = repertorioState.viewMode === 'custom-builder' || repertorioState.viewMode === 'family-picker';

  if (workspace) {
    workspace.classList.add('minimal-view');
    workspace.classList.add('full-width-view');
    workspace.classList.add('repertorio-view-active');
    
    if (isScrollable) {
      workspace.classList.add('scrollable-repertorio');
    } else {
      workspace.classList.remove('scrollable-repertorio');
    }
  }

  document.getElementById('page-title').textContent = 'Repertorio & Presentación de Oferta';
  document.getElementById('page-icon').textContent = '🎭';
  const propBlock = document.getElementById('properties-block');
  if (propBlock) propBlock.style.display = 'none';
  const wsHeader = document.querySelector('.workspace-header');
  if (wsHeader) wsHeader.style.display = 'none';
  const wsBanner = document.querySelector('.workspace-banner');
  if (wsBanner) wsBanner.style.display = 'none';

  const container = document.getElementById('workspace-content');
  if (!container) return;

  container.innerHTML = `
    <div class="repertorio-app-wrapper ${isScrollable ? 'is-scrollable' : ''}" id="repertorio-app-root">
      ${renderTopNavBar()}
      
      ${repertorioState.viewMode === 'family-picker' 
        ? renderFamilySelectorScreen() 
        : (repertorioState.viewMode === 'custom-builder' 
            ? renderCustomBuilderScreen() 
            : renderMagazineExperience())}
    </div>
  `;

  attachRepertorioEvents();
}

/**
 * Retorna el sufijo abreviado oficial para las slides de cada familia (FN, FE, FNx2, FEx2)
 */
function getFamilySlideSuffix(famId) {
  switch (famId) {
    case 'nuclear_1h':
      return 'FN';
    case 'extensa_1h':
      return 'FE';
    case 'nuclear_2h':
      return 'FNx2';
    case 'extensa_2h':
      return 'FEx2';
    default:
      return 'FN';
  }
}

/**
 * Barra superior de navegación y controles de presentación
 * Estructura de directorio: Recursos Comerciales / Repertorio / Slides [SUFIJO]
 */
function renderTopNavBar() {
  const isFamilyPicker = repertorioState.viewMode === 'family-picker';
  const isCustomBuilder = repertorioState.viewMode === 'custom-builder';
  const slideSuffix = getFamilySlideSuffix(repertorioState.selectedFamily);
  const customCount = repertorioState.customSetItems.reduce((acc, item) => acc + item.qty, 0);

  return `
    <header class="repertorio-header-bar">
      <div class="repertorio-header-left">
        <nav class="repertorio-breadcrumbs" aria-label="Ruta de navegación">
          <!-- 1. Recursos Comerciales -->
          <a href="#demobook" class="crumb-nav-link" title="Ir a Recursos Comerciales">Recursos Comerciales</a>
          <span class="crumb-separator">/</span>

          <!-- 2. Repertorio (Redirección a selección de familias) -->
          <button 
            type="button" 
            class="crumb-nav-btn ${isFamilyPicker ? 'crumb-active-pill' : 'crumb-nav-link'}" 
            id="crumb-nav-repertorio" 
            title="Selector de Familias y Repertorio"
          >
            Repertorio
          </button>
          <span class="crumb-separator">/</span>

          <!-- 3. Modo Activo -->
          ${isCustomBuilder ? `
            <span class="crumb-active-pill">
              Set a Medida
            </span>
          ` : `
            <button 
              type="button" 
              class="crumb-nav-btn ${!isFamilyPicker ? 'crumb-active-pill' : 'crumb-nav-link'}" 
              id="crumb-link-slides" 
              title="Presentación de Slides (${slideSuffix})"
            >
              <span>Slides ${slideSuffix}</span>
              ${!isFamilyPicker ? '<span class="crumb-arrow-down" style="font-size: 10px; margin-left: 2px;">▾</span>' : ''}
            </button>
          `}
        </nav>

        <!-- Segmented Mode Switcher: Sets Prearmados vs Armar Set a Medida -->
        <div class="repertorio-mode-tabs" role="tablist">
          <button 
            type="button" 
            class="mode-tab-pill ${!isCustomBuilder ? 'active' : ''}" 
            id="tab-mode-magazine"
            title="Ver Sets Oficiales y Catálogo Magazine"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            <span>Sets Prearmados</span>
          </button>
          <button 
            type="button" 
            class="mode-tab-pill ${isCustomBuilder ? 'active' : ''}" 
            id="tab-mode-custom"
            title="Personalizar Set a Medida con Matriz de SKUs e Imágenes"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            <span>Armar Set a Medida</span>
            ${customCount > 0 ? `<span class="custom-badge-pill">${customCount}</span>` : ''}
          </button>
        </div>
      </div>

      <div class="repertorio-header-controls">
        <!-- Switch de Moneda USD / PEN -->
        <div class="currency-toggle-group" title="Tipo de cambio oficial: 1 USD = 3.40 PEN">
          <button type="button" class="currency-btn ${repertorioState.currency === 'USD' ? 'active' : ''}" data-currency="USD">
            USD ($)
          </button>
          <button type="button" class="currency-btn ${repertorioState.currency === 'PEN' ? 'active' : ''}" data-currency="PEN">
            PEN (S/)
          </button>
        </div>

        <!-- Botón Resumen de Oferta / Cotizador -->
        <button type="button" class="btn btn-primary btn-quote-action" id="btn-open-quote-modal">
          + Cotización de Oferta
        </button>
      </div>
    </header>
  `;
}

/**
 * Retorna el icono SVG vectorial para cada estructura familiar (Zero Emojis)
 */
function getFamilyIconSvg(famId) {
  switch (famId) {
    case 'nuclear_1h':
      // Icono Usuarios / Núcleo Familiar
      return `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      `;
    case 'extensa_1h':
      // Icono Hogar Multigeneracional
      return `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      `;
    case 'nuclear_2h':
      // Icono Múltiples Usuarios / Hermanos
      return `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 21a8 8 0 0 0-16 0"></path>
          <circle cx="10" cy="8" r="5"></circle>
          <path d="M22 20c0-3.37-2-6.5-5-7.5"></path>
          <circle cx="19" cy="8" r="3"></circle>
        </svg>
      `;
    case 'extensa_2h':
      // Icono Corona / Gran Dinastía Integral
      return `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path>
        </svg>
      `;
    default:
      return `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
        </svg>
      `;
  }
}

/**
 * Pantalla 1: Selector Visual de Estructura Familiar (Onboarding)
 */
function renderFamilySelectorScreen() {
  return `
    <div class="repertorio-family-screen animate-fade-in">
      <div class="family-screen-hero">
        <span class="hero-kicker">FASE 1: DIAGNÓSTICO FAMILIAR</span>
        <h1 class="hero-headline">Selecciona la Estructura de tu Hogar</h1>
      </div>

      <div class="family-cards-grid">
        ${Object.values(REPERTORIO_DATA.families).map(fam => {
          const isSelected = fam.id === repertorioState.selectedFamily;
          const totals = calculateSetTotals(fam.id, 'essential');

          return `
            <div class="family-select-card ${isSelected ? 'is-selected' : ''}" data-family-id="${fam.id}">
              <div class="family-card-pill-tag">${fam.badge}</div>

              <div class="family-card-header">
                <div class="family-card-icon-badge">
                  ${getFamilyIconSvg(fam.id)}
                </div>
                <h3 class="family-card-name">${fam.name}</h3>
              </div>

              <div class="family-card-specs-grid">
                <div class="spec-cell">
                  <span class="spec-cell-bold">${fam.childrenCount === 1 ? 'Desde 1 usuario' : 'Desde 2 usuarios'}</span>
                  <span class="spec-cell-sub">${fam.childrenCount === 1 ? 'Desde 2 dispositivos' : 'Desde 4 dispositivos'}</span>
                </div>
                <div class="spec-cell">
                  <span class="spec-cell-bold">Parental Dashboard</span>
                  <span class="spec-cell-sub">2 Vistas (Padre & Madre)</span>
                </div>
              </div>

              <!-- Placeholder / Fotografía Familiar de la cantidad de integrantes -->
              <div class="family-card-photo-box" title="Retrato Familiar: ${fam.name} (${fam.totalMembers} Integrantes)">
                <img 
                  src="${fam.familyPhotoImg}" 
                  alt="Retrato Familiar ${fam.name} (${fam.totalMembers} Integrantes)" 
                  class="family-card-photo-img" 
                  loading="lazy"
                  onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                />
                <div class="family-card-photo-placeholder-frame" style="display: none;">
                  <div class="placeholder-cam-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  </div>
                  <span class="placeholder-label">Retrato Familiar</span>
                </div>
                <div class="family-photo-members-pill">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <span>${fam.totalMembers} Integrantes</span>
                </div>
              </div>

              <div class="family-card-price-row">
                <span class="price-kicker">DESDE:</span>
                <span class="price-amount">${formatMoney(totals.totalUSD, totals.totalPEN)}</span>
              </div>

              <button type="button" class="btn btn-select-family-action ${isSelected ? 'is-selected' : ''}" data-family-id="${fam.id}">
                ${isSelected ? '✓ Seleccionado' : 'Seleccionar'}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/**
 * Pantalla 2: Experiencia Magazine / Catálogo Editorial de Lujo (Flipbook Spreads)
 */
function renderMagazineExperience() {
  const currentFam = REPERTORIO_DATA.families[repertorioState.selectedFamily];
  const activeSpread = repertorioState.currentSpread;

  return `
    <div class="repertorio-magazine-container animate-fade-in">
      
      <!-- Contenedor del Libro Magazine (Doble Página) -->
      <div class="magazine-viewport" id="magazine-viewport">
        <!-- El Spread Activo (Fijo y aislado) -->
        <div class="magazine-spread" id="magazine-active-spread">
          ${renderSpreadContent(activeSpread, currentFam)}
        </div>
      </div>

      <!-- Barra Inferior de Navegación & Thumbnails del Magazine -->
      <div class="magazine-footer-controls">
        <div class="magazine-page-counter">
          <span class="counter-label">SPREAD EDITORIAL</span>
          <span class="counter-numbers"><strong>0${activeSpread}</strong> / 05</span>
        </div>

        <div class="magazine-thumbnails-strip">
          ${[
            { num: 1, title: 'Portada', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>' },
            { num: 2, title: 'Essential Set', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>' },
            { num: 3, title: 'OMNI Set', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>' },
            { num: 4, title: 'Integral Set', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>' },
            { num: 5, title: 'Full House Set', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>' }
          ].map(thumb => `
            <button type="button" class="magazine-thumb-btn ${thumb.num === activeSpread ? 'active' : ''}" data-spread-num="${thumb.num}">
              <span class="thumb-icon">${thumb.icon}</span>
              <span class="thumb-text">${thumb.num}. ${thumb.title}</span>
            </button>
          `).join('')}
        </div>

        <div class="magazine-footer-actions">
          <button type="button" class="btn btn-secondary btn-sm" id="btn-quick-overview" style="display:inline-flex; align-items:center; gap:6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
            Mapa General
          </button>
        </div>
      </div>

    </div>
  `;
}

/**
 * Pantalla 3: Personalizador de Sets a Medida (Custom Set Builder)
 * Reducción del 85% de texto: enfoque minimalista, visual y directo
 */
function renderCustomBuilderScreen() {
  const currentFam = REPERTORIO_DATA.families[repertorioState.selectedFamily] || REPERTORIO_DATA.families['nuclear_1h'];

  return `
    <div class="repertorio-custom-builder animate-fade-in">
      
      <!-- Zona Superior Consolidada Fija (Sin huecos, fondo sólido continuo) -->
      <div class="custom-builder-sticky-header-zone">
        
        <!-- Barra 2: Controles de Familia y Opciones -->
        <div class="custom-builder-controls-panel">
          <!-- Selector de Familia -->
          <div class="config-control-group">
            <span class="config-label">Familia:</span>
            <div class="config-pills-row">
              ${Object.values(REPERTORIO_DATA.families).map(fam => `
                <button 
                  type="button" 
                  class="config-pill-btn ${fam.id === repertorioState.selectedFamily ? 'active' : ''}" 
                  data-custom-family="${fam.id}"
                  title="${fam.membersLabel}"
                >
                  ${fam.name}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Presets Rápidos -->
          <div class="config-presets-group">
            <span class="presets-label">Base:</span>
            <div class="presets-buttons">
              <button type="button" class="btn btn-xs btn-outline" data-load-template="essential">Esencial</button>
              <button type="button" class="btn btn-xs btn-outline" data-load-template="omni">OMNI</button>
              <button type="button" class="btn btn-xs btn-outline" data-load-template="integral">Integral</button>
              <button type="button" class="btn btn-xs btn-outline" data-load-template="fullhouse">Full House</button>
              ${repertorioState.customSetItems.length > 0 ? `
                <button type="button" class="btn btn-xs btn-outline" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.3);" id="btn-clear-custom-set">Vaciar</button>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Barra 3: Pestañas de Categoría de Productos -->
        <div class="catalog-category-tabs">
          ${CATALOG_CATEGORIES.map(cat => `
            <button 
              type="button" 
              class="category-tab-btn ${repertorioState.customBuilderCategory === cat.id ? 'active' : ''}" 
              data-cat-id="${cat.id}"
            >
              <span class="cat-icon">${cat.icon}</span>
              <span class="cat-name">${cat.name}</span>
            </button>
          `).join('')}
        </div>

      </div>

      <!-- Layout de Dos Columnas: Catálogo + Resumen Sticky -->
      <div class="custom-builder-layout">
        
        <!-- Columna de Catálogo (Grid de Productos) -->
        <div class="custom-builder-catalog-col">
          <div class="custom-catalog-grid" id="custom-catalog-grid-container">
            ${renderProductCatalogGrid()}
          </div>
        </div>

        <!-- Columna de Resumen Lateral -->
        <aside class="custom-builder-summary-col">
          <div class="custom-summary-card" id="custom-summary-panel">
            ${renderCustomSummaryCardContent()}
          </div>
        </aside>

      </div>
    </div>
  `;
}

/**
 * Renderiza las tarjetas de productos: Diseño limpio con 85% menos texto
 */
function renderProductCatalogGrid() {
  const filteredProducts = getProductsByCategory(repertorioState.customBuilderCategory);

  if (!filteredProducts || filteredProducts.length === 0) {
    return `<div style="padding: 30px; text-align: center; color: #64748b;">No hay productos en esta categoría.</div>`;
  }

  return filteredProducts.map(prod => {
    const activeAngle = repertorioState.productAngles[prod.sku] || 'front';
    const activeImgSrc = prod.angles[activeAngle] || prod.angles.front;
    const existingItem = repertorioState.customSetItems.find(i => i.sku === prod.sku);
    const inSetQty = existingItem ? existingItem.qty : 0;
    const isInSet = inSetQty > 0;

    // Buscar variantes en la misma familia/modelo
    const familyVariants = PRODUCTS_CATALOG.filter(p => p.familyCode === prod.familyCode && p.modelName === prod.modelName);

    return `
      <div class="custom-product-card ${isInSet ? 'is-in-set' : ''}" data-card-sku="${prod.sku}">
        
        <!-- Visor de Imagen con Ángulos Compactos -->
        <div class="product-card-preview-box">
          <img 
            src="${activeImgSrc}" 
            alt="${prod.fullName}" 
            class="product-card-preview-img" 
            id="img-preview-${prod.sku}"
            loading="lazy"
            onerror="this.src='/assets/repertorio/prod_${prod.familyCode}.png'"
          />
          <div class="product-angle-overlay">
            <button 
              type="button" 
              class="angle-mini-btn ${activeAngle === 'front' ? 'active' : ''}" 
              data-angle-sku="${prod.sku}" 
              data-angle="front"
              title="Frontal"
            >
              Front
            </button>
            ${prod.angles.back ? `
              <button 
                type="button" 
                class="angle-mini-btn ${activeAngle === 'back' ? 'active' : ''}" 
                data-angle-sku="${prod.sku}" 
                data-angle="back"
                title="Trasera"
              >
                Back
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Info Limpia: Nombre, SKU, Color y Precio Directo -->
        <div class="product-card-info">
          <div class="product-card-header-row">
            <h3 class="product-card-title">${prod.shortName}</h3>
            ${familyVariants.length > 1 ? `
              <div class="product-swatches-row">
                ${familyVariants.map(v => `
                  <span 
                    class="color-dot variant-switch-dot" 
                    style="background-color: ${v.color.hex}; transform: ${v.sku === prod.sku ? 'scale(1.25)' : 'scale(0.95)'}; border: ${v.sku === prod.sku ? '2px solid #533b87' : '1px solid rgba(0,0,0,0.18)'};" 
                    data-switch-to-sku="${v.sku}"
                    title="${v.color.name}"
                  ></span>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <div class="product-card-sub-row">
            <span class="product-color-label">${prod.color.name}</span>
            <span class="product-sku-code">${prod.sku}</span>
          </div>

          <!-- Precio y Botón de Acción Directo -->
          <div class="product-card-bottom-row">
            <span class="pricing-number">${formatMoney(prod.priceUSD, prod.pricePEN)}</span>
            
            <div class="product-card-action-box">
              ${isInSet ? `
                <div class="custom-item-stepper">
                  <button type="button" class="stepper-btn danger" data-stepper-action="dec" data-sku="${prod.sku}">−</button>
                  <span class="stepper-qty">${inSetQty}</span>
                  <button type="button" class="stepper-btn" data-stepper-action="inc" data-sku="${prod.sku}">+</button>
                </div>
              ` : `
                <button type="button" class="btn-add-to-custom-mini" data-add-sku="${prod.sku}">
                  + Agregar
                </button>
              `}
            </div>
          </div>

        </div>
      </div>
    `;
  }).join('');
}

/**
 * Renderiza el contenido del panel lateral de resumen del Set Personalizado
 */
function renderCustomSummaryCardContent() {
  const customTotals = calculateCustomSetTotals();
  const isEmpty = customTotals.items.length === 0;

  return `
    <div class="custom-summary-header">
      <h3 class="custom-summary-title">Tu Set</h3>
      <span class="custom-badge-pill">${customTotals.totalItemsCount}</span>
    </div>

    <div class="custom-summary-body">
      ${isEmpty ? `
        <div class="summary-empty-state">
          <p class="summary-empty-text">Elige dispositivos para cotizar.</p>
        </div>
      ` : `
        <!-- Lista de Items en el Set -->
        <div class="summary-items-list">
          ${customTotals.items.map(item => `
            <div class="summary-item-row" data-summary-sku="${item.sku}">
              <img 
                src="${item.product.angles.front}" 
                alt="${item.product.shortName}" 
                class="summary-item-thumb"
                onerror="this.src='/assets/repertorio/prod_${item.product.familyCode}.png'"
              />
              <div class="summary-item-details">
                <div class="summary-item-name">${item.product.shortName}</div>
                <div class="summary-item-subtotal">${formatMoney(item.product.priceUSD * item.qty, item.product.pricePEN * item.qty)}</div>
              </div>
              <div class="summary-item-actions">
                <button type="button" class="summary-qty-btn" data-stepper-action="dec" data-sku="${item.sku}">−</button>
                <span class="summary-qty-num">${item.qty}</span>
                <button type="button" class="summary-qty-btn" data-stepper-action="inc" data-sku="${item.sku}">+</button>
              </div>
            </div>
          `).join('')}
        </div>
      `}

      <!-- Cuadro de Totales Financieros -->
      <div class="summary-breakdown-box">
        <div class="summary-breakdown-line">
          <span>Hardware (${customTotals.hardwareCount}):</span>
          <strong>${formatMoney(customTotals.hardwareUSD, customTotals.hardwarePEN)}</strong>
        </div>
        ${customTotals.softwareCount > 0 ? `
          <div class="summary-breakdown-line">
            <span>Software ZentryOS (${customTotals.softwareCount}):</span>
            <strong>${formatMoney(customTotals.softwareUSD, customTotals.softwarePEN)}</strong>
          </div>
        ` : ''}
        <div class="summary-grand-total">
          <span class="grand-total-label">Total:</span>
          <span class="grand-total-amount">${formatMoney(customTotals.totalUSD, customTotals.totalPEN)}</span>
        </div>
      </div>
    </div>

    <div class="custom-summary-footer">
      <button 
        type="button" 
        class="btn-whatsapp-custom" 
        id="btn-copy-custom-whatsapp"
        ${isEmpty ? 'disabled style="opacity:0.6; cursor:not-allowed;"' : ''}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
        <span>Copiar para WhatsApp</span>
      </button>

      <button 
        type="button" 
        class="btn-view-quote-custom" 
        id="btn-view-custom-quote"
        ${isEmpty ? 'disabled style="opacity:0.6; cursor:not-allowed;"' : ''}
      >
        <span>Ver Propuesta Formal</span>
      </button>
    </div>
  `;
}

/**
 * Genera el guion formateado para WhatsApp del Set Personalizado
 */
export function copyCustomQuoteToWhatsApp(customTotals) {
  const currency = repertorioState.currency;
  const hardwareItems = customTotals.items.filter(i => i.product.category !== 'implementations');
  const softwareItems = customTotals.items.filter(i => i.product.category === 'implementations');

  const hwText = hardwareItems.length > 0 
    ? hardwareItems.map(i => `  • x${i.qty} ${i.product.fullName} [SKU: ${i.sku}] (${formatMoney(i.product.priceUSD * i.qty, i.product.pricePEN * i.qty, currency)})`).join('\n')
    : '  • Ningún dispositivo de hardware agregado';

  const swText = softwareItems.length > 0
    ? softwareItems.map(i => `  • x${i.qty} ${i.product.fullName} [SKU: ${i.sku}] (${formatMoney(i.product.priceUSD * i.qty, i.product.pricePEN * i.qty, currency)})`).join('\n')
    : (hardwareItems.length > 0 ? '  • Hardware con sistema ZentryOS pre-instalado de fábrica' : '  • Ninguna implementación seleccionada');

  const text = `*PROPUESTA DE SET PERSONALIZADO ZENTRYOS*\n` +
    `👨‍👩‍👧 *Estructura:* ${customTotals.family.name} (${customTotals.family.membersLabel})\n` +
    `📦 *Configuración:* Set a Medida (${customTotals.totalItemsCount} ítems seleccionados)\n\n` +
    `*1. Hardware Físico (${customTotals.hardwareCount} equipos):*\n${hwText}\n` +
    `  ↳ Subtotal Hardware: ${formatMoney(customTotals.hardwareUSD, customTotals.hardwarePEN, currency)}\n\n` +
    `*2. Implementación de Software & Parental Dashboard:*\n${swText}\n` +
    (customTotals.softwareCount > 0 ? `  ↳ Subtotal Software: ${formatMoney(customTotals.softwareUSD, customTotals.softwarePEN, currency)}\n\n` : '\n') +
    `💰 *INVERSIÓN TOTAL DE LA OFERTA:* ${formatMoney(customTotals.totalUSD, customTotals.totalPEN, currency)}\n\n` +
    `_Generado desde el Personalizador de Sets en QZ-Hub Operativo_`;

  navigator.clipboard.writeText(text).then(() => {
    alert('✅ Propuesta de Set Personalizado copiada al portapapeles en formato WhatsApp.');
  }).catch(() => {
    prompt('Copia el texto manualmente:', text);
  });
}

/**
 * Renderiza el contenido de cada spread (doble página)
 */
function renderSpreadContent(spreadNum, family) {
  switch (spreadNum) {
    case 1:
      return renderSpread01Cover(family);
    case 2:
      return renderSpreadSet(family, 'essential', 3, 4);
    case 3:
      return renderSpreadSet(family, 'omni', 5, 6);
    case 4:
      return renderSpreadSet(family, 'integral', 7, 8);
    case 5:
      return renderSpreadSet(family, 'fullhouse', 9, 10);
    default:
      return renderSpread01Cover(family);
  }
}

/**
 * Spread 1: Portada & Diagnóstico de Implementación (Págs 01-02)
 */
function renderSpread01Cover(family) {
  return `
    <div class="spread-page spread-page-left cover-page-left">
      <div class="editorial-image-container">
        <img src="${family.coverImg || '/assets/repertorio/portada_nuclear_1h.png'}" alt="Zentry Product Architecture" class="editorial-img" onerror="this.src='/assets/repertorio/portada_nuclear_1h.png'"/>
        <div class="editorial-image-overlay">
          <div class="overlay-caption">
            <span class="caption-tag">EDICIÓN EJECUTIVA</span>
            <h4>ZENTRY HABITATS</h4>
            <p>Ecosistema tecnológico y parental para el hogar moderno.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="spread-page spread-page-right cover-page-right">
      <div class="magazine-content-col">
        <div class="page-number-top">PÁG. 02 // CONFIGURACIÓN: ${family.name.toUpperCase()}</div>
        
        <h1 class="magazine-main-title">ARQUITECTURA DE ECOSISTEMA EN EL HOGAR</h1>

        <div class="family-diagnosis-box">
          <div class="diagnosis-header">
            <span class="diagnosis-icon-svg" style="color: #533b87; display: flex; align-items: center;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </span>
            <div>
              <h4 style="margin: 0; color: #0f172a; font-size: 15px;">Diagnóstico de Implementación</h4>
              <span style="font-size: 12px; color: #533b87; font-weight: 700;">${family.name}</span>
            </div>
          </div>
          <div class="diagnosis-stats-row">
            <div class="stat-item">
              <span class="stat-num">${family.childrenCount === 1 ? '1' : '2'}</span>
              <span class="stat-lbl">Usuario(s) Principal(es)</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">${family.childrenCount * 2}</span>
              <span class="stat-lbl">Dispositivos a Implementar</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">2</span>
              <span class="stat-lbl">Vistas Parental Dashboard</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">100%</span>
              <span class="stat-lbl">Multidispositivo (Móvil/PC/Tab)</span>
            </div>
          </div>
        </div>

        <div class="magazine-cta-row">
          <button type="button" class="btn btn-primary btn-next-spread-action" data-target-spread="2">
            Explorar Sets de Hardware & Implementación ➔
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Spreads 2 a 5: Sets de Productos (Essential, OMNI, Integral, Full House)
 */
function renderSpreadSet(family, setKey, pageLeftNum, pageRightNum) {
  const totals = calculateSetTotals(family.id, setKey);
  const set = totals.set;
  const isSelectedTier = repertorioState.selectedSetTier === setKey;

  return `
    <div class="spread-page spread-page-left set-page-left">
      <!-- Paginación superior exacta -->
      <div class="page-number-top">PÁG. 0${pageLeftNum} // CATÁLOGO OFICIAL DE HARDWARE</div>

      <!-- Badge de Set -->
      <div class="set-badge-header">
        <span class="set-badge-tag">${set.tierName.toUpperCase()}</span>
      </div>

      <!-- Imagen Panorámica del Workspace / Setup de Hardware -->
      <div class="set-visual-showcase">
        <img src="${set.image}" alt="${set.name}" class="set-main-image" onerror="this.src='/assets/repertorio/set_essential.png'"/>
      </div>

      <!-- Desglose de Componentes Físicos -->
      <div class="set-items-breakdown">
        <div class="breakdown-header-row">
          <h4 class="breakdown-title">
            <span class="bullet-dot">●</span>
            Hardware Incluido en ${set.name}
          </h4>
          <span class="breakdown-devices-count">${totals.totalItemsCount} dispositivos</span>
        </div>

        <div class="product-cards-row items-count-${set.items.length}">
          ${set.items.map(item => {
            const prod = REPERTORIO_DATA.products[item.code];
            if (!prod) return '';
            const isCompact = set.items.length > 4;
            return `
              <div class="product-item-card ${isCompact ? 'compact-item' : ''}">
                <div class="prod-card-thumb-box">
                  <img src="${prod.image}" alt="${prod.name}" class="prod-card-img" onerror="this.src='/assets/repertorio/prod_smarttab.png'"/>
                  <span class="prod-qty-badge">x${item.qty}</span>
                </div>
                <div class="prod-card-details">
                  <span class="prod-card-name">${prod.name}</span>
                  <span class="prod-card-price">${formatMoney(prod.priceUSD * item.qty, prod.pricePEN * item.qty)}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>

      </div>
    </div>

    <div class="spread-page spread-page-right set-page-right">
      <div class="page-number-top">PÁG. 0${pageRightNum} // PROPUESTA DE VALOR A CLIENTES</div>

      <!-- Encabezado Editorial -->
      <div class="set-header-editorial">
        <span class="set-eyebrow">SET PARA ${family.name.toUpperCase()}</span>
        <h2 class="set-title-headline">${set.name}</h2>
        <p class="set-tagline-text">${set.tagline}</p>
      </div>

      <!-- Bloque Editorial de Valor Arquitectónico -->
      <div class="set-value-card">
        <div class="value-card-badge-row">
          <span class="value-card-badge">✨ PROPUESTA DE VALOR</span>
          <span class="value-card-highlight">${set.highlight}</span>
        </div>
        <p class="value-card-experience">${set.experience}</p>
      </div>

      <!-- Desglose de Costes Directo y Elegante -->
      <div class="costs-summary-card">
        <div class="cost-summary-item">
          <span class="cost-label">Hardware Físico:</span>
          <span class="cost-value">${formatMoney(totals.hardwareUSD, totals.hardwarePEN)}</span>
        </div>
        <div class="cost-summary-item highlight-item">
          <div>
            <span class="cost-label">${totals.implData.name}:</span>
            <small class="cost-sublabel">${family.childrenCount} hijo(s) • ${totals.implData.devicesIncluded} disp.</small>
          </div>
          <span class="cost-value">+${formatMoney(totals.implementationUSD, totals.implementationPEN)}</span>
        </div>
      </div>

      <!-- Tarjeta Prominente de Precio Total -->
      <div class="hero-total-price-card">
        <div class="total-caption-group">
          <span class="total-label-kicker">VALOR TOTAL DE LA OFERTA</span>
        </div>
        <div class="total-price-large">
          <span class="price-big-number">${formatMoney(totals.totalUSD, totals.totalPEN)}</span>
        </div>
      </div>

      <!-- Acciones Inferiores Pinned -->
      <div class="set-actions-toolbar">
        <button type="button" class="btn ${isSelectedTier ? 'btn-success' : 'btn-primary'} btn-choose-set" data-set-key="${setKey}">
          ✓ Set Seleccionado
        </button>
        <button type="button" class="btn btn-secondary btn-share-quote" data-set-key="${setKey}" style="display:inline-flex; align-items:center; gap:6px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
          Copiar Propuesta
        </button>
      </div>
    </div>
  `;
}


/**
 * Modal de Cotización y Cierre Comercial
 */
export function openQuoteModal(forceCustom = false) {
  const isCustom = forceCustom || repertorioState.viewMode === 'custom-builder';
  
  if (isCustom) {
    const customTotals = calculateCustomSetTotals();
    const family = customTotals.family;

    let modal = document.getElementById('repertorio-quote-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'repertorio-quote-modal';
      modal.className = 'modal-backdrop animate-fade-in';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-dialog-content quote-modal-card glass-panel animate-scale-up">
        <div class="quote-modal-header">
          <div>
            <span class="badge-pill">PROPUESTA COMERCIAL PERSONALIZADA</span>
            <h2 style="font-family: var(--font-family-title); font-size: 20px; color: #0f172a; margin: 4px 0 0 0;">
              Set a la Medida — ${family.name}
            </h2>
            <small style="color: #64748b;">${family.membersLabel} • ${customTotals.totalItemsCount} Dispositivos Físicos</small>
          </div>
          <button type="button" class="btn-close-modal" id="btn-close-quote-modal">✕</button>
        </div>

        <div class="quote-modal-body">
          
          <!-- Desglose de Hardware Configurado -->
          <div class="quote-section">
            <h4 class="quote-section-title">1. Dispositivos Físicos Seleccionados</h4>
            <div class="quote-items-grid">
              ${customTotals.items.map(item => `
                <div class="quote-item-chip">
                  <span class="item-chip-qty">x${item.qty}</span>
                  <span class="item-chip-name">${item.product.shortName}</span>
                  <span class="item-chip-subtotal">${formatMoney(item.product.priceUSD * item.qty, item.product.pricePEN * item.qty)}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Desglose de Software & Implementación -->
          <div class="quote-section">
            <h4 class="quote-section-title">2. Implementación de Software & Parental Dashboard</h4>
            <div class="quote-impl-card">
              <div class="impl-title-row">
                <strong>${customTotals.includeImplementation ? customTotals.implData.name : 'Implementación ZentryOS'}</strong>
                <span class="impl-price">${customTotals.includeImplementation ? formatMoney(customTotals.implementationUSD, customTotals.implementationPEN) : '$0 USD'}</span>
              </div>
              <p style="font-size: 12px; color: #475569; margin: 4px 0;">
                ${customTotals.includeImplementation 
                  ? customTotals.implData.description 
                  : 'Cotización en modalidad solo adquisición de hardware físico sin implementación de software ni Parental Dashboard.'}
              </p>
              ${customTotals.includeImplementation ? `
                <div class="impl-tags-row">
                  <span class="spec-tag">${customTotals.implData.devicesIncluded} dispositivos implementados</span>
                  <span class="spec-tag">${customTotals.implData.dashboardViews}</span>
                  <span class="spec-tag">Celular, Tablet, PC y Laptop</span>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Totalización -->
          <div class="quote-summary-box">
            <div class="summary-line">
              <span>Subtotal Hardware Físico:</span>
              <span>${formatMoney(customTotals.hardwareUSD, customTotals.hardwarePEN)}</span>
            </div>
            <div class="summary-line">
              <span>Software ZentryOS:</span>
              <span>${formatMoney(customTotals.softwareUSD, customTotals.softwarePEN)}</span>
            </div>
            <div class="summary-total-final">
              <div>
                <strong style="font-size: 16px; color: #0f172a;">INVERSIÓN TOTAL DE LA OFERTA</strong>
                <small style="display: block; color: #64748b; font-size: 11px;">Tipo de cambio referencial: 1 USD = S/ 3.40</small>
              </div>
              <div style="text-align: right;">
                <span class="quote-big-price">${formatMoney(customTotals.totalUSD, customTotals.totalPEN)}</span>
              </div>
            </div>
          </div>

        </div>

        <div class="quote-modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-copy-quote-whatsapp" style="display:inline-flex; align-items:center; gap:6px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            Copiar Formato WhatsApp
          </button>
          <button type="button" class="btn btn-primary" id="btn-confirm-quote-action" style="display:inline-flex; align-items:center; gap:6px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Agendar Cita de Implementación
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-close-quote-modal')?.addEventListener('click', () => {
      modal.remove();
    });

    document.getElementById('btn-copy-quote-whatsapp')?.addEventListener('click', () => {
      copyCustomQuoteToWhatsApp(customTotals);
    });

    document.getElementById('btn-confirm-quote-action')?.addEventListener('click', () => {
      modal.remove();
      window.location.hash = '#gestion-comercial';
    });
    return;
  }

  const currentFam = REPERTORIO_DATA.families[repertorioState.selectedFamily];
  const setKey = repertorioState.selectedSetTier;
  const totals = calculateSetTotals(currentFam.id, setKey);
  const set = totals.set;

  let modal = document.getElementById('repertorio-quote-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'repertorio-quote-modal';
    modal.className = 'modal-backdrop animate-fade-in';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-dialog-content quote-modal-card glass-panel animate-scale-up">
      <div class="quote-modal-header">
        <div>
          <span class="badge-pill">PROPUESTA COMERCIAL PERSONALIZADA</span>
          <h2 style="font-family: var(--font-family-title); font-size: 20px; color: #0f172a; margin: 4px 0 0 0;">
            ${set.name} — ${currentFam.name}
          </h2>
          <small style="color: #64748b;">${currentFam.membersLabel} • ${totals.totalItemsCount} Equipos Físicos</small>
        </div>
        <button type="button" class="btn-close-modal" id="btn-close-quote-modal">✕</button>
      </div>

      <div class="quote-modal-body">
        
        <!-- Desglose de Hardware -->
        <div class="quote-section">
          <h4 class="quote-section-title">1. Dispositivos Físicos Incluidos</h4>
          <div class="quote-items-grid">
            ${set.items.map(item => {
              const prod = REPERTORIO_DATA.products[item.code];
              return `
                <div class="quote-item-chip">
                  <span class="item-chip-qty">x${item.qty}</span>
                  <span class="item-chip-name">${prod.name}</span>
                  <span class="item-chip-subtotal">${formatMoney(prod.priceUSD * item.qty, prod.pricePEN * item.qty)}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Desglose de Software & Implementación -->
        <div class="quote-section">
          <h4 class="quote-section-title">2. Implementación de Software & Parental Dashboard</h4>
          <div class="quote-impl-card">
            <div class="impl-title-row">
              <strong>${totals.implData.name}</strong>
              <span class="impl-price">${formatMoney(totals.implementationUSD, totals.implementationPEN)}</span>
            </div>
            <p style="font-size: 12px; color: #475569; margin: 4px 0;">
              ${totals.implData.description}
            </p>
            <div class="impl-tags-row">
              <span class="spec-tag">${totals.implData.devicesIncluded} dispositivos implementados</span>
              <span class="spec-tag">${totals.implData.dashboardViews}</span>
              <span class="spec-tag">Celular, Tablet, PC y Laptop</span>
            </div>
          </div>
        </div>

        <!-- Totalización -->
        <div class="quote-summary-box">
          <div class="summary-line">
            <span>Subtotal Hardware Físico:</span>
            <span>${formatMoney(totals.hardwareUSD, totals.hardwarePEN)}</span>
          </div>
          <div class="summary-line">
            <span>Implementación ZentryOS:</span>
            <span>${formatMoney(totals.implementationUSD, totals.implementationPEN)}</span>
          </div>
          <div class="summary-total-final">
            <div>
              <strong style="font-size: 16px; color: #0f172a;">INVERSIÓN TOTAL DE LA OFERTA</strong>
              <small style="display: block; color: #64748b; font-size: 11px;">Tipo de cambio referencial: 1 USD = S/ 3.40</small>
            </div>
            <div style="text-align: right;">
              <span class="quote-big-price">${formatMoney(totals.totalUSD, totals.totalPEN)}</span>
            </div>
          </div>
        </div>

      </div>

      <div class="quote-modal-footer">
        <button type="button" class="btn btn-secondary" id="btn-copy-quote-whatsapp" style="display:inline-flex; align-items:center; gap:6px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          Copiar Formato WhatsApp
        </button>
        <button type="button" class="btn btn-primary" id="btn-confirm-quote-action" style="display:inline-flex; align-items:center; gap:6px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          Agendar Cita de Implementación
        </button>
      </div>
    </div>
  `;

  document.getElementById('btn-close-quote-modal')?.addEventListener('click', () => {
    modal.remove();
  });

  document.getElementById('btn-copy-quote-whatsapp')?.addEventListener('click', () => {
    copyQuoteToWhatsApp(totals);
  });

  document.getElementById('btn-confirm-quote-action')?.addEventListener('click', () => {
    modal.remove();
    window.location.hash = '#gestion-comercial';
  });
}

/**
 * Genera el guion formateado para copiar al portapapeles
 */
function copyQuoteToWhatsApp(totals) {
  const currency = repertorioState.currency;
  const itemsText = totals.set.items.map(i => `  • x${i.qty} ${REPERTORIO_DATA.products[i.code]?.name}`).join('\n');
  
  const text = `*PROPUESTA OFICIAL ZENTRYOS*\n` +
    `👨‍👩‍👧 *Familia:* ${totals.family.name} (${totals.family.membersLabel})\n` +
    `📦 *Set Seleccionado:* ${totals.set.name}\n\n` +
    `*1. Hardware Incluido (${totals.totalItemsCount} equipos):*\n${itemsText}\n\n` +
    `*2. Implementación de Software:*\n` +
    `  • ${totals.implData.name} (${totals.implData.devicesIncluded} dispositivos)\n` +
    `  • Parental Dashboard Multidispositivo (2 vistas: Padre y Madre en celular, tablet y PC)\n\n` +
    `💰 *Inversión Total:* ${formatMoney(totals.totalUSD, totals.totalPEN, currency)}\n` +
    `*(Hardware completo + Despliegue de software ZentryOS)*\n\n` +
    `_Generado desde QZ-Hub Operativo_`;

  navigator.clipboard.writeText(text).then(() => {
    alert('✅ Propuesta copiada al portapapeles en formato WhatsApp.');
  }).catch(() => {
    prompt('Copia el texto manualmente:', text);
  });
}

/**
 * Vinculación de Eventos Interactivas
 */
function attachRepertorioEvents() {
  const root = document.getElementById('repertorio-app-root');
  if (!root) return;

  // Switch de Moneda
  root.querySelectorAll('.currency-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      repertorioState.currency = e.currentTarget.dataset.currency;
      renderRepertorioView();
    });
  });

  // Switch de Modos Principales: Sets Prearmados vs Set a Medida
  document.getElementById('tab-mode-magazine')?.addEventListener('click', () => {
    repertorioState.viewMode = 'magazine';
    renderRepertorioView();
  });

  document.getElementById('tab-mode-custom')?.addEventListener('click', () => {
    repertorioState.viewMode = 'custom-builder';
    renderRepertorioView();
  });

  // Breadcrumb: Navegación a Repertorio (Redirección al selector de familias)
  document.getElementById('crumb-nav-repertorio')?.addEventListener('click', (e) => {
    e.preventDefault();
    repertorioState.viewMode = 'family-picker';
    renderRepertorioView();
  });

  // Breadcrumb: Navegación a Slides [SUFIJO]
  document.getElementById('crumb-link-slides')?.addEventListener('click', () => {
    if (repertorioState.viewMode === 'family-picker') {
      repertorioState.viewMode = 'magazine';
      repertorioState.currentSpread = 1;
      renderRepertorioView();
    } else {
      repertorioState.viewMode = 'family-picker';
      renderRepertorioView();
    }
  });

  // Toggle Selector de Familia / Catálogo
  document.getElementById('btn-toggle-family-picker')?.addEventListener('click', () => {
    repertorioState.viewMode = repertorioState.viewMode === 'family-picker' ? 'magazine' : 'family-picker';
    renderRepertorioView();
  });

  document.getElementById('btn-switch-family-modal')?.addEventListener('click', () => {
    repertorioState.viewMode = 'family-picker';
    renderRepertorioView();
  });

  // Selección de Familia en la tarjeta de onboarding
  root.querySelectorAll('.btn-select-family-action, .family-select-card').forEach(elem => {
    elem.addEventListener('click', (e) => {
      const famId = e.currentTarget.dataset.familyId;
      if (famId) {
        repertorioState.selectedFamily = famId;
        repertorioState.viewMode = 'magazine';
        repertorioState.currentSpread = 1;
        renderRepertorioView();
      }
    });
  });

  // Quicktabs de familia dentro del magazine
  root.querySelectorAll('.quicktab-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      repertorioState.selectedFamily = e.currentTarget.dataset.familyId;
      renderRepertorioView();
    });
  });

  // ==========================================
  // EVENTOS DEL PERSONALIZADOR DE SETS A MEDIDA
  // ==========================================
  if (repertorioState.viewMode === 'custom-builder') {
    // Cambio de Familia en el Builder
    root.querySelectorAll('[data-custom-family]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        repertorioState.selectedFamily = e.currentTarget.dataset.customFamily;
        renderRepertorioView();
      });
    });

    // Cargar Presets de Templates
    root.querySelectorAll('[data-load-template]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const templateKey = e.currentTarget.dataset.loadTemplate;
        const currentFam = REPERTORIO_DATA.families[repertorioState.selectedFamily] || REPERTORIO_DATA.families['nuclear_1h'];
        const setConfig = REPERTORIO_DATA.setsMatrix[currentFam.id]?.[templateKey];
        if (setConfig && setConfig.items) {
          const defaultSkuMap = {
            st: 'ZT-TAB11-BLK',
            sb: 'ZT-BAND-SIL-BLK',
            sr: 'ZT-RING-WHT',
            ss: 'ZT-SND-WHT',
            sw: 'ZT-WATCH-SIL-BLK',
            sp: 'ZT-PHN-BLK'
          };
          repertorioState.customSetItems = setConfig.items.map(i => ({
            sku: defaultSkuMap[i.code] || 'ZT-TAB11-BLK',
            qty: i.qty
          }));
          renderRepertorioView();
        }
      });
    });

    // Vaciar Set Personalizado
    document.getElementById('btn-clear-custom-set')?.addEventListener('click', () => {
      if (confirm('¿Deseas vaciar todos los dispositivos de tu set personalizado?')) {
        repertorioState.customSetItems = [];
        renderRepertorioView();
      }
    });

    // Filtro de Categorías
    root.querySelectorAll('.category-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        repertorioState.customBuilderCategory = e.currentTarget.dataset.catId;
        const gridEl = document.getElementById('custom-catalog-grid-container');
        if (gridEl) {
          root.querySelectorAll('.category-tab-btn').forEach(b => b.classList.remove('active'));
          e.currentTarget.classList.add('active');
          gridEl.innerHTML = renderProductCatalogGrid();
          attachCustomCardEvents(gridEl);
        }
      });
    });

    // Vincular eventos de tarjetas y resumen
    attachCustomCardEvents(root);
    attachCustomSummaryEvents();
  }

  function attachCustomCardEvents(container) {
    if (!container) return;

    // Selector de Ángulos
    container.querySelectorAll('[data-angle-sku]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sku = e.currentTarget.dataset.angleSku;
        const angle = e.currentTarget.dataset.angle;
        repertorioState.productAngles[sku] = angle;
        
        const card = e.currentTarget.closest('.custom-product-card');
        if (card) {
          card.querySelectorAll('[data-angle-sku]').forEach(b => b.classList.remove('active'));
          e.currentTarget.classList.add('active');

          const prod = getProductBySku(sku);
          if (prod) {
            const imgEl = card.querySelector(`#img-preview-${sku}`);
            if (imgEl) {
              imgEl.style.opacity = '0.3';
              setTimeout(() => {
                imgEl.src = prod.angles[angle] || prod.angles.front;
                imgEl.style.opacity = '1';
              }, 80);
            }
          }
        }
      });
    });

    // Cambiar de Variante de Color mediante los puntos de color
    container.querySelectorAll('[data-switch-to-sku]').forEach(dot => {
      dot.addEventListener('click', (e) => {
        const targetSku = e.currentTarget.dataset.switchToSku;
        if (targetSku) {
          // Cambiar categoría si fuera necesario o re-renderizar la tarjeta
          renderRepertorioView();
        }
      });
    });

    // Botón Agregar al Set
    container.querySelectorAll('[data-add-sku]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sku = e.currentTarget.dataset.addSku;
        const existing = repertorioState.customSetItems.find(i => i.sku === sku);
        if (existing) {
          existing.qty += 1;
        } else {
          repertorioState.customSetItems.push({ sku, qty: 1 });
        }
        renderRepertorioView();
      });
    });

    // Steppers de Cantidad en la Tarjeta
    container.querySelectorAll('.custom-item-stepper [data-stepper-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.stepperAction;
        const sku = e.currentTarget.dataset.sku;
        handleCustomItemQty(sku, action);
      });
    });
  }

  function attachCustomSummaryEvents() {
    const summaryPanel = document.getElementById('custom-summary-panel');
    if (!summaryPanel) return;

    // Steppers en el resumen
    summaryPanel.querySelectorAll('.summary-item-actions [data-stepper-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.stepperAction;
        const sku = e.currentTarget.dataset.sku;
        handleCustomItemQty(sku, action);
      });
    });

    // Copiar WhatsApp
    document.getElementById('btn-copy-custom-whatsapp')?.addEventListener('click', () => {
      copyCustomQuoteToWhatsApp(calculateCustomSetTotals());
    });

    // Ver Propuesta Formal
    document.getElementById('btn-view-custom-quote')?.addEventListener('click', () => {
      openQuoteModal(true);
    });
  }

  function handleCustomItemQty(sku, action) {
    const itemIndex = repertorioState.customSetItems.findIndex(i => i.sku === sku);
    if (itemIndex > -1) {
      if (action === 'inc') {
        repertorioState.customSetItems[itemIndex].qty += 1;
      } else if (action === 'dec') {
        repertorioState.customSetItems[itemIndex].qty -= 1;
        if (repertorioState.customSetItems[itemIndex].qty <= 0) {
          repertorioState.customSetItems.splice(itemIndex, 1);
        }
      }
      renderRepertorioView();
    }
  }

  // ==========================================
  // EVENTOS DEL MAGAZINE / FLIPBOOK
  // ==========================================
  function navigateToSpread(targetSpread) {
    if (targetSpread < 1 || targetSpread > 5) return;
    repertorioState.currentSpread = targetSpread;

    const currentFam = REPERTORIO_DATA.families[repertorioState.selectedFamily];
    const activeSpreadEl = document.getElementById('magazine-active-spread');
    if (activeSpreadEl) {
      activeSpreadEl.style.opacity = '0';
      activeSpreadEl.style.transform = 'translateY(4px)';
      setTimeout(() => {
        activeSpreadEl.innerHTML = renderSpreadContent(targetSpread, currentFam);
        activeSpreadEl.style.opacity = '1';
        activeSpreadEl.style.transform = 'translateY(0)';
        attachSpreadInnerEvents(activeSpreadEl);
      }, 90);
    } else {
      renderRepertorioView();
      return;
    }

    // Actualizar indicador de página en el footer
    const counterNumbersEl = root.querySelector('.magazine-page-counter .counter-numbers');
    if (counterNumbersEl) {
      counterNumbersEl.innerHTML = `<strong>0${targetSpread}</strong> / 05`;
    }

    // Actualizar thumbnails activos en el footer
    root.querySelectorAll('.magazine-thumb-btn').forEach(btn => {
      const num = parseInt(btn.dataset.spreadNum, 10);
      if (num === targetSpread) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function attachSpreadInnerEvents(container) {
    if (!container) return;

    // Botones de acción directa para avanzar de spread (ej. en la portada)
    container.querySelectorAll('.btn-next-spread-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = parseInt(e.currentTarget.dataset.targetSpread, 10);
        if (target) navigateToSpread(target);
      });
    });

    // Elegir Set para Cotización
    container.querySelectorAll('.btn-choose-set').forEach(btn => {
      btn.addEventListener('click', (e) => {
        repertorioState.selectedSetTier = e.currentTarget.dataset.setKey;
        openQuoteModal();
      });
    });

    // Compartir Propuesta rápida
    container.querySelectorAll('.btn-share-quote').forEach(btn => {
      btn.addEventListener('click', (e) => {
        repertorioState.selectedSetTier = e.currentTarget.dataset.setKey;
        const totals = calculateSetTotals(repertorioState.selectedFamily, repertorioState.selectedSetTier);
        copyQuoteToWhatsApp(totals);
      });
    });
  }

  // Vincular eventos internos del spread inicial
  const activeSpreadEl = document.getElementById('magazine-active-spread');
  if (activeSpreadEl) {
    attachSpreadInnerEvents(activeSpreadEl);
  }

  // Thumbnails de spreads usan navigateToSpread
  root.querySelectorAll('.magazine-thumb-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = parseInt(e.currentTarget.dataset.spreadNum, 10);
      if (target) navigateToSpread(target);
    });
  });

  // Navegación por teclado en PC (Flechas Izquierda / Derecha / Arriba / Abajo)
  if (!window._repertorioKeyHandlerAttached) {
    window.addEventListener('keydown', (e) => {
      if (repertorioState.viewMode !== 'magazine') return;
      if (document.getElementById('repertorio-quote-modal')) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        navigateToSpread(repertorioState.currentSpread + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        navigateToSpread(repertorioState.currentSpread - 1);
      }
    });
    window._repertorioKeyHandlerAttached = true;
  }

  // Gestos de Deslizar (Swipe) para Tablets y Smartphones
  const viewport = document.getElementById('magazine-viewport');
  if (viewport) {
    let touchStartX = 0;
    let touchStartY = 0;

    viewport.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      if (!touchStartX || !e.changedTouches || e.changedTouches.length === 0) return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      // Umbral mínimo de 40px y predominancia horizontal
      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
          // Deslizar hacia la izquierda -> avanzar spread siguiente
          navigateToSpread(repertorioState.currentSpread + 1);
        } else {
          // Deslizar hacia la derecha -> volver al spread anterior
          navigateToSpread(repertorioState.currentSpread - 1);
        }
      }
      touchStartX = 0;
      touchStartY = 0;
    }, { passive: true });
  }

  // Botón Abrir Modal Cotización
  document.getElementById('btn-open-quote-modal')?.addEventListener('click', () => {
    openQuoteModal();
  });

  // Mapa general
  document.getElementById('btn-quick-overview')?.addEventListener('click', () => {
    repertorioState.viewMode = 'family-picker';
    renderRepertorioView();
  });
}
