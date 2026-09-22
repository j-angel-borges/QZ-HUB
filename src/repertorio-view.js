/**
 * REPERTORIO - Catálogo Magazine & Presentación de Oferta ZentryOS
 * SSOT Oficial de Productos, Planes de Implementación, Beneficios y Economía de Referencias
 */

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
      priceUSD: 995,
      pricePEN: 3385,
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
      description: 'Sesiones personalizadas 1 a 1 para que los padres dominen herramientas de IA aplicada, automatización del hogar y supervisión ética de la tecnología.',
      icon: '🧠'
    },
    {
      id: 'studio_credits',
      title: '100 Créditos de Generación Studio',
      tag: 'Lanzamiento 15 de Noviembre',
      valuePEN: 200,
      valueUSD: 58.82,
      description: 'Créditos para el Studio Parental Dashboard: creación guiada de microaplicaciones educativas personalizadas, imágenes hiperrealistas y videos para los hijos.',
      icon: '✨'
    },
    {
      id: 'zentry_experience',
      title: 'Pase Gratis Familiar "Zentry Experience"',
      tag: 'Evento Presencial / Virtual',
      valuePEN: 200,
      valueUSD: 58.82,
      description: 'Jornada inmersiva para padres e hijos donde mentores asisten y calibran en vivo el uso armónico de Zentry, con dinámicas lúdicas de enfoque.',
      conversionNote: 'Si no asistes o no canjeas la entrada, los S/ 200 de valor se convierten automáticamente en 100 créditos adicionales de generación.',
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
      badge: 'Estructura Clásica',
      description: 'Enfocada en proteger y potenciar al único hijo en el hogar, con sincronización total entre ambos padres.',
      defaultImpl: 'individual',
      childrenCount: 1,
      parentsCount: 2,
      grandparentsCount: 0,
      coverImg: '/assets/repertorio/magazine_cover.png',
      lifestyleImg: '/assets/repertorio/lifestyle_lounge.png',
      story: 'El hijo centraliza la atención formativa del hogar. Sus dos dispositivos de uso cotidiano se integran de forma simbiótica, mientras que papá y mamá monitorean hábitos desde sus teléfonos y computadoras.'
    },
    extensa_1h: {
      id: 'extensa_1h',
      name: 'Familia Extensa',
      membersLabel: '2 Padres + 1 Hijo + 3 Abuelos',
      badge: 'Multigeneracional',
      description: 'Cuidado integral que une el desarrollo pedagógico del niño con el monitoreo de bienestar y salud de los abuelos.',
      defaultImpl: 'individual',
      childrenCount: 1,
      parentsCount: 2,
      grandparentsCount: 3,
      coverImg: '/assets/repertorio/magazine_cover.png',
      lifestyleImg: '/assets/repertorio/lifestyle_lounge.png',
      story: 'La coexistencia de tres generaciones en el hogar exige armonía acústica y cuidado médico silencioso. Los anillos y pulseras inteligentes velan por el descanso de los abuelos y la concentración del menor.'
    },
    nuclear_2h: {
      id: 'nuclear_2h',
      name: 'Familia Nuclear x2',
      membersLabel: '2 Padres + 2 Hijos',
      badge: 'Hermanos & Rutinas',
      description: 'Equilibrio de pantallas entre hermanos con límites y cronogramas pedagógicos personalizados para cada uno.',
      defaultImpl: 'dual',
      childrenCount: 2,
      parentsCount: 2,
      grandparentsCount: 0,
      coverImg: '/assets/repertorio/magazine_cover.png',
      lifestyleImg: '/assets/repertorio/lifestyle_lounge.png',
      story: 'Dos hijos representan mundos cognitivos diferentes. Cada uno dispone de su tablet y wearable calibrados individualmente, evitando disputas y garantizando que el tiempo de ocio no canibalice el estudio.'
    },
    extensa_2h: {
      id: 'extensa_2h',
      name: 'Familia Extensa x2',
      membersLabel: '2 Padres + 2 Hijos + 3 Abuelos',
      badge: 'Dinastía Integral',
      description: 'Máxima cobertura tecnológica y biométrica para una casa viva y activa con múltiples generaciones.',
      defaultImpl: 'dual',
      childrenCount: 2,
      parentsCount: 2,
      grandparentsCount: 3,
      coverImg: '/assets/repertorio/magazine_cover.png',
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
        image: '/assets/repertorio/set_essential.png',
        highlight: '1 Tab + 1 Band + 1 Ring',
        experience: 'El hijo cuenta con su Smart Tab para estudio activo y su Smart Band para el biorritmo del sueño. Se añade un Smart Ring para uno de los padres o monitoreo biométrico fino.'
      },
      omni: {
        id: 'omni',
        name: 'OMNI Set',
        tierName: 'Omnipresente',
        tagline: 'Sincronización biométrica para padre, madre e hijo.',
        items: [{ code: 'sb', qty: 1 }, { code: 'st', qty: 1 }, { code: 'sr', qty: 2 }],
        image: '/assets/repertorio/set_omni.png',
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
        image: '/assets/repertorio/set_integral.png',
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
        image: '/assets/repertorio/set_fullhouse.png',
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
        image: '/assets/repertorio/set_essential.png',
        highlight: '1 Tab + 1 Band + 2 Rings',
        experience: 'El Smart Tab y Smart Band atienden al niño, mientras dos Smart Rings salvaguardan los signos vitales clave de los abuelos.'
      },
      omni: {
        id: 'omni',
        name: 'OMNI Set',
        tierName: 'Omnipresente',
        tagline: 'Doble pantalla y doble anillo para el hogar extendido.',
        items: [{ code: 'sb', qty: 2 }, { code: 'st', qty: 2 }, { code: 'sr', qty: 2 }],
        image: '/assets/repertorio/set_omni.png',
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
        image: '/assets/repertorio/set_integral.png',
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
        image: '/assets/repertorio/set_fullhouse.png',
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
        image: '/assets/repertorio/set_essential.png',
        highlight: '2 Tabs + 2 Bands + 2 Rings',
        experience: 'Cada hijo recibe su Smart Tab y su Smart Band para erradicar comparaciones y disputas, respaldados por los Smart Rings para ambos padres.'
      },
      omni: {
        id: 'omni',
        name: 'OMNI Set',
        tierName: 'Omnipresente',
        tagline: 'Doble pantalla y doble pulsera de hábitos consolidados.',
        items: [{ code: 'sb', qty: 2 }, { code: 'st', qty: 2 }, { code: 'sr', qty: 2 }],
        image: '/assets/repertorio/set_omni.png',
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
        image: '/assets/repertorio/set_integral.png',
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
        image: '/assets/repertorio/set_fullhouse.png',
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
        image: '/assets/repertorio/set_essential.png',
        highlight: '2 Tabs + 2 Bands + 2 Rings',
        experience: 'Herramientas equitativas para ambos hermanos en edad escolar, con anillos para el monitoreo de los adultos mayores.'
      },
      omni: {
        id: 'omni',
        name: 'OMNI Set',
        tierName: 'Omnipresente',
        tagline: 'Armonía y paridad para todo el clan.',
        items: [{ code: 'sb', qty: 2 }, { code: 'st', qty: 2 }, { code: 'sr', qty: 2 }],
        image: '/assets/repertorio/set_omni.png',
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
        image: '/assets/repertorio/set_integral.png',
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
        image: '/assets/repertorio/set_fullhouse.png',
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
  viewMode: 'magazine' // 'family-picker' | 'magazine'
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
 * Renderizador Principal de la Vista Repertorio
 */
export function renderRepertorioView() {
  const workspace = document.querySelector('.workspace');
  if (workspace) {
    workspace.classList.add('minimal-view');
    workspace.classList.add('full-width-view');
    workspace.classList.add('repertorio-view-active');
  }

  document.getElementById('page-title').textContent = 'Repertorio & Presentación de Oferta';
  document.getElementById('page-icon').textContent = '🎭';
  const propBlock = document.getElementById('properties-block');
  if (propBlock) propBlock.style.display = 'none';

  const container = document.getElementById('workspace-content');
  if (!container) return;

  container.innerHTML = `
    <div class="repertorio-app-wrapper" id="repertorio-app-root">
      ${renderTopNavBar()}
      
      ${repertorioState.viewMode === 'family-picker' 
        ? renderFamilySelectorScreen() 
        : renderMagazineExperience()}
    </div>
  `;

  attachRepertorioEvents();
}

/**
 * Barra superior de navegación y controles de presentación
 */
function renderTopNavBar() {
  const currentFam = REPERTORIO_DATA.families[repertorioState.selectedFamily];

  return `
    <header class="repertorio-header-bar">
      <div class="repertorio-header-left">
        <div class="repertorio-breadcrumbs">
          <a href="#demobook" class="crumb-nav-link">Demobook</a>
          <span class="crumb-separator">/</span>
          <span class="crumb-brand">ZENTRYOS</span>
          <span class="crumb-separator">/</span>
          <span class="crumb-category">OFERTA COMERCIAL</span>
          <span class="crumb-separator">/</span>
          <button type="button" class="crumb-family-tag" id="btn-switch-family-modal" title="Cambiar Familia">
            <span>${currentFam.membersLabel} ${currentFam.name}</span>
            <span class="crumb-arrow-down">▾</span>
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
 * Pantalla 1: Selector Visual de Estructura Familiar (Onboarding)
 */
function renderFamilySelectorScreen() {
  return `
    <div class="repertorio-family-screen animate-fade-in">
      <div class="family-screen-hero">
        <span class="hero-kicker">FASE 1: DIAGNÓSTICO FAMILIAR</span>
        <h1 class="hero-headline">Selecciona la Estructura de tu Hogar</h1>
        <p class="hero-subtext">
          Cada arquitectura familiar requiere un balance preciso de dispositivos, control parental y cuidado biométrico. 
          Elige la composición para calibrar el catálogo de sets y la estrategia de implementación a la medida.
        </p>
      </div>

      <div class="family-cards-grid">
        ${Object.values(REPERTORIO_DATA.families).map(fam => {
          const isSelected = fam.id === repertorioState.selectedFamily;
          const totals = calculateSetTotals(fam.id, 'essential');
          return `
            <div class="family-select-card ${isSelected ? 'is-selected' : ''}" data-family-id="${fam.id}">
              <div class="family-card-badge">${fam.badge}</div>
              <div class="family-card-icon-row">
                <span class="family-icon-symbol">
                  ${fam.childrenCount === 1 ? '👨‍👩‍👧' : '👨‍👩‍👧‍👦'}
                </span>
                ${fam.grandparentsCount > 0 ? '<span class="family-subicon" title="Incluye 3 Abuelos">👴👵</span>' : ''}
              </div>
              <h3 class="family-card-name">${fam.name}</h3>
              <div class="family-card-members">${fam.membersLabel}</div>
              <p class="family-card-desc">${fam.description}</p>
              
              <div class="family-card-specs">
                <div class="spec-chip">
                  <strong>${fam.childrenCount} ${fam.childrenCount === 1 ? 'Hijo' : 'Hijos'}</strong>
                  <span>${fam.childrenCount * 2} Dispositivos</span>
                </div>
                <div class="spec-chip">
                  <strong>Parental Dashboard</strong>
                  <span>2 Vistas (Padre & Madre)</span>
                </div>
              </div>

              <div class="family-card-footer">
                <div class="footer-price-preview">
                  <span class="price-label">Desde (Essential):</span>
                  <span class="price-value">${formatMoney(totals.totalUSD, totals.totalPEN)}</span>
                </div>
                <button type="button" class="btn ${isSelected ? 'btn-primary' : 'btn-secondary'} btn-select-family-action" data-family-id="${fam.id}">
                  ${isSelected ? '✓ Seleccionada (Abrir Magazine)' : 'Seleccionar Esta Familia'}
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Tabla Comparativa Rápida de la Matriz -->
      <div class="family-matrix-glance glass-panel">
        <div class="matrix-glance-header">
          <h3>📋 Matriz Oficial de Sets por Familia</h3>
          <p>Visión consolidada de productos por nivel de set y composición del hogar:</p>
        </div>
        <div class="matrix-table-responsive">
          <table class="matrix-table">
            <thead>
              <tr>
                <th>Estructura Familiar</th>
                <th>Essential</th>
                <th>OMNI</th>
                <th>Integral</th>
                <th>Full House</th>
              </tr>
            </thead>
            <tbody>
              ${Object.values(REPERTORIO_DATA.families).map(fam => {
                const matrix = REPERTORIO_DATA.setsMatrix[fam.id];
                return `
                  <tr class="${fam.id === repertorioState.selectedFamily ? 'row-active' : ''}">
                    <td>
                      <strong>${fam.name}</strong><br>
                      <small style="color: #64748b;">${fam.membersLabel}</small>
                    </td>
                    <td>${matrix.essential.highlight}</td>
                    <td>${matrix.omni.highlight}</td>
                    <td>${matrix.integral.highlight}</td>
                    <td><span class="badge-gold">${matrix.fullhouse.highlight}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
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
        
        <!-- Flecha Navegación Izquierda -->
        <button type="button" class="magazine-nav-arrow arrow-left" id="btn-spread-prev" ${activeSpread <= 1 ? 'disabled' : ''} aria-label="Página anterior">
          ‹
        </button>

        <!-- El Spread Activo -->
        <div class="magazine-spread" id="magazine-active-spread">
          ${renderSpreadContent(activeSpread, currentFam)}
        </div>

        <!-- Flecha Navegación Derecha -->
        <button type="button" class="magazine-nav-arrow arrow-right" id="btn-spread-next" ${activeSpread >= 6 ? 'disabled' : ''} aria-label="Página siguiente">
          ›
        </button>
      </div>

      <!-- Barra Inferior de Navegación & Thumbnails del Magazine -->
      <div class="magazine-footer-controls">
        <div class="magazine-page-counter">
          <span class="counter-label">SPREAD EDITORIAL</span>
          <span class="counter-numbers"><strong>0${activeSpread}</strong> / 06</span>
        </div>

        <div class="magazine-thumbnails-strip">
          ${[
            { num: 1, title: 'Portada & Filosofía', icon: '📖' },
            { num: 2, title: 'Essential Set', icon: '🥉' },
            { num: 3, title: 'OVNI Set', icon: '🥈' },
            { num: 4, title: 'Integral Set', icon: '🥇' },
            { num: 5, title: 'Full House Set', icon: '👑' },
            { num: 6, title: 'Beneficios & Créditos', icon: '🎁' }
          ].map(thumb => `
            <button type="button" class="magazine-thumb-btn ${thumb.num === activeSpread ? 'active' : ''}" data-spread-num="${thumb.num}">
              <span class="thumb-icon">${thumb.icon}</span>
              <span class="thumb-text">${thumb.num}. ${thumb.title}</span>
            </button>
          `).join('')}
        </div>

        <div class="magazine-footer-actions">
          <button type="button" class="btn btn-secondary btn-sm" id="btn-quick-overview">
            🗺️ Mapa General
          </button>
        </div>
      </div>

    </div>
  `;
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
    case 6:
      return renderSpread06BenefitsAndCredits(family, 11, 12);
    default:
      return renderSpread01Cover(family);
  }
}

/**
 * Spread 1: Portada & Manifiesto Familiar (Págs 01-02)
 */
function renderSpread01Cover(family) {
  return `
    <div class="spread-page spread-page-left cover-page-left">
      <div class="editorial-image-container">
        <img src="${family.coverImg}" alt="Zentry Home Lifestyle" class="editorial-img" onerror="this.src='/assets/repertorio/magazine_cover.png'"/>
        <div class="editorial-image-overlay">
          <div class="overlay-caption">
            <span class="caption-tag">ARQUITECTURA DE HOGAR</span>
            <h4>ZENTRY HABITATS • VOL. 2026</h4>
            <p>Espacios libres de fricción algorítmica para la evolución del clan.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="spread-page spread-page-right cover-page-right">
      <div class="magazine-content-col">
        <div class="page-number-top">PÁG. 02 // CASO FAMILIAR: ${family.badge.toUpperCase()}</div>
        
        <span class="magazine-kicker">MANIFIESTO EDITORIAL</span>
        <h1 class="magazine-main-title">EL VALOR SAGRADO DEL TIEMPO EN FAMILIA</h1>
        
        <div class="magazine-lead-paragraph">
          "No compramos tecnología para entretener el silencio de nuestros hijos; diseñamos un entorno donde su atención neuronal y su curiosidad creadora sigan siendo soberanas."
        </div>

        <div class="family-diagnosis-box">
          <div class="diagnosis-header">
            <span class="diagnosis-icon">🧬</span>
            <div>
              <h4 style="margin: 0; color: #0f172a; font-size: 15px;">Diagnóstico: ${family.name}</h4>
              <span style="font-size: 12px; color: #533b87; font-weight: 600;">${family.membersLabel}</span>
            </div>
          </div>
          <p class="diagnosis-body">${family.story}</p>
          <div class="diagnosis-stats-row">
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

        <div class="magazine-quote-footer">
          <em>«Quien recupera el control del tiempo en su hogar, recupera el destino de sus hijos.»</em>
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

      <!-- Desglose de Componentes Físicos en 3 columnas -->
      <div class="set-items-breakdown">
        <div class="breakdown-header-row">
          <h4 class="breakdown-title">
            <span class="bullet-dot">●</span>
            Hardware Incluido en ${set.name}
          </h4>
          <span class="breakdown-devices-count">${totals.totalItemsCount} dispositivos</span>
        </div>

        <div class="product-cards-row">
          ${set.items.map(item => {
            const prod = REPERTORIO_DATA.products[item.code];
            if (!prod) return '';
            return `
              <div class="product-item-card">
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

        ${set.inheritedFrom ? `
          <div class="set-inheritance-notice">
            <span class="notice-icon">✨</span>
            <div>
              <strong>Evolución de Ecosistema:</strong> Incluye todo lo de <em>${set.inheritedFrom.toUpperCase()}</em> más ${set.addedItems.map(ai => `<strong>x${ai.qty} ${REPERTORIO_DATA.products[ai.code]?.name}</strong>`).join(', ')}.
            </div>
          </div>
        ` : ''}
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

      <!-- Tarjeta Destacada Superior (Contexto/Destino en este hogar) -->
      <div class="set-destacado-card">
        <div class="destacado-icon-circle">🏠</div>
        <div class="destacado-body">
          <h4 class="destacado-title">Destino en este hogar</h4>
          <p class="destacado-desc">${set.experience}</p>
        </div>
      </div>

      <!-- Grilla 2 Columnas de Beneficios y Bloque de Precios -->
      <div class="set-value-pricing-grid">
        <!-- Grid de Beneficios (2x2) -->
        <div class="benefits-mini-grid">
          <div class="benefit-mini-card">
            <div class="mini-card-icon">🛡️</div>
            <div class="mini-card-info">
              <strong>Support Share</strong>
              <small>Parental Dashboard 24/7</small>
            </div>
          </div>

          <div class="benefit-mini-card">
            <div class="mini-card-icon">⚡</div>
            <div class="mini-card-info">
              <strong>Zentry Credits</strong>
              <small>100 Créditos Studio</small>
            </div>
          </div>

          <div class="benefit-mini-card">
            <div class="mini-card-icon">🎁</div>
            <div class="mini-card-info">
              <strong>Beneficio & Regalos</strong>
              <small>Soporte continuo</small>
            </div>
          </div>

          <div class="benefit-mini-card">
            <div class="mini-card-icon">🎁</div>
            <div class="mini-card-info">
              <strong>Beneficio & Regalos</strong>
              <small>Créditos incluidos</small>
            </div>
          </div>
        </div>

        <!-- Columna de Desglose de Costes -->
        <div class="costs-summary-column">
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
          <div class="cost-summary-item free-item">
            <span class="cost-label">Beneficios & Regalos:</span>
            <span class="cost-tag-free">GRATIS</span>
          </div>
        </div>
      </div>

      <!-- Tarjeta Prominente de Precio Total -->
      <div class="hero-total-price-card">
        <div class="total-caption-group">
          <span class="total-label-kicker">VALOR TOTAL DE LA OFERTA</span>
          <small class="total-sub-note">Hardware + Implementación OS + Paquete de Bienvenida</small>
        </div>
        <div class="total-price-large">
          <span class="price-big-number">${formatMoney(totals.totalUSD, totals.totalPEN)}</span>
        </div>
      </div>

      <!-- Acciones Inferiores -->
      <div class="set-actions-toolbar">
        <button type="button" class="btn ${isSelectedTier ? 'btn-success' : 'btn-primary'} btn-choose-set" data-set-key="${setKey}">
          ✓ Set Seleccionado
        </button>
        <button type="button" class="btn btn-secondary btn-share-quote" data-set-key="${setKey}">
          📋 Copiar Propuesta
        </button>
      </div>
    </div>
  `;
}

/**
 * Spread 6: Beneficios, Regalos y Economía de Referencias (Págs 11-12)
 */
function renderSpread06BenefitsAndCredits(family, pageLeftNum, pageRightNum) {
  const totals = calculateSetTotals(family.id, repertorioState.selectedSetTier);

  return `
    <div class="spread-page spread-page-left benefits-page-left">
      <div class="page-number-top">PÁG. ${pageLeftNum} // BENEFICIOS & REGALOS INCLUIDOS</div>

      <div class="magazine-content-col">
        <span class="magazine-kicker">PAQUETE DE BIENVENIDA FAMILIAR</span>
        <h2 class="magazine-main-title">VALOR AGREGADO SIN COSTO ADICIONAL</h2>
        <p style="font-size: 13.5px; color: #475569; line-height: 1.5; margin-bottom: 16px;">
          Cada despliegue de ZentryOS no termina en la instalación del software; incluye un ecosistema de capacitación parental y acompañamiento valorizado en <strong>${formatMoney(totals.benefitsValueUSD, totals.benefitsValuePEN)}</strong>.
        </p>

        <div class="benefits-vertical-list">
          ${REPERTORIO_DATA.benefits.map(b => `
            <div class="benefit-card-box glass-panel">
              <div class="benefit-icon-badge">${b.icon}</div>
              <div class="benefit-content">
                <div class="benefit-title-row">
                  <h4 class="benefit-title">${b.title}</h4>
                  <span class="benefit-worth">Valor: ${formatMoney(b.valueUSD, b.valuePEN)}</span>
                </div>
                <span class="benefit-tag-pill">${b.tag}</span>
                <p class="benefit-desc">${b.description}</p>
                ${b.conversionNote ? `
                  <div class="benefit-rule-alert">
                    <span class="rule-icon">🔄</span>
                    <span><strong>Flexibilidad Zentry:</strong> ${b.conversionNote}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="golden-rule-box">
          <div class="rule-header">
            <span>⚖️ Regla Canónica de Créditos:</span>
          </div>
          <p>
            Los <strong>Créditos de Generación</strong> (usados en clases, studio y videos) pertenecen al ámbito del software y la IA; <em>no son canjeables por productos físicos</em>. Los productos físicos de hardware se obtienen exclusivamente mediante el <strong>Programa de Referencias</strong>.
          </p>
        </div>

      </div>
    </div>

    <div class="spread-page spread-page-right credits-page-right">
      <div class="magazine-content-col">
        <div class="page-number-top">PÁG. ${pageRightNum} // ECONOMÍA CIRCULAR & REFERIDOS</div>

        <span class="magazine-kicker">PROGRAMA DE RECOMENDACIÓN</span>
        <h2 class="magazine-main-title">EL CÍRCULO VIRTUOSO DE CRÉDITOS</h2>
        <p style="font-size: 13px; color: #475569; line-height: 1.5; margin-bottom: 14px;">
          Nuestra mejor inversión publicitaria son los propios padres. Al ayudarnos a agendar citas con otras familias, acumulas créditos canjeables por hardware físico de alta gama.
        </p>

        <!-- Tabla de Recompensas por Referencias -->
        <div class="referrals-rewards-table-wrapper glass-panel">
          <table class="referrals-table">
            <thead>
              <tr>
                <th>Citas</th>
                <th>Créditos</th>
                <th>Recompensa Física</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              ${REPERTORIO_DATA.referralsProgram.map(ref => `
                <tr>
                  <td>
                    <div class="citas-badge">
                      <strong>${ref.citas}</strong>
                      <span>personas</span>
                    </div>
                  </td>
                  <td>
                    <strong style="color: #7c3aed; font-size: 14px;">+${ref.credits}</strong> cr
                  </td>
                  <td>
                    <div class="reward-prod-cell">
                      <span class="prod-icon">${ref.rewardIcon}</span>
                      <strong>${ref.rewardName}</strong>
                    </div>
                  </td>
                  <td>
                    <span class="reward-val">${formatMoney(ref.commercialValueUSD, ref.commercialValuePEN)}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Simulador Rápido de Referidos -->
        <div class="referrals-calculator-card glass-panel">
          <h4>🧮 Simulador de Retorno por Recomendación</h4>
          <p style="font-size: 12px; color: #64748b; margin-bottom: 10px;">
            Si recomiendas a <strong>10 familias amigas</strong> que nos reciban para una demo de 40 minutos:
          </p>
          <div class="sim-result-pill">
            <span class="sim-icon">🎁</span>
            <div class="sim-text">
              <strong>Te llevas 1 Smart Ring totalmente gratis</strong>
              <small>Equivalente a 650 créditos o ${formatMoney(450, 1530)} en ahorro directo.</small>
            </div>
          </div>
        </div>

        <div class="magazine-cta-row" style="margin-top: 14px;">
          <button type="button" class="btn btn-primary btn-block btn-quote-action">
            Finalizar & Generar Cotización Oficial 💎
          </button>
        </div>

      </div>
    </div>
  `;
}

/**
 * Modal de Cotización y Cierre Comercial
 */
export function openQuoteModal() {
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

        <!-- Beneficios de Regalo -->
        <div class="quote-section">
          <h4 class="quote-section-title">3. Beneficios & Regalos de Bienvenida (100% Bonificados)</h4>
          <div class="quote-benefits-list">
            ${REPERTORIO_DATA.benefits.map(b => `
              <div class="quote-benefit-row">
                <span>${b.icon} ${b.title}</span>
                <span class="worth-strike"><s>${formatMoney(b.valueUSD, b.valuePEN)}</s> <strong>GRATIS</strong></span>
              </div>
            `).join('')}
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
          <div class="summary-line" style="color: #059669;">
            <span>Valor Obsequios Zentry:</span>
            <span>+${formatMoney(totals.benefitsValueUSD, totals.benefitsValuePEN)} (INCLUIDO)</span>
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
        <button type="button" class="btn btn-secondary" id="btn-copy-quote-whatsapp">
          📲 Copiar Formato WhatsApp
        </button>
        <button type="button" class="btn btn-primary" id="btn-confirm-quote-action">
          🚀 Agendar Cita de Implementación
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
    `*3. Regalos y Beneficios Incluidos:*\n` +
    `  • 3 Clases de Inteligencia Artificial para Padres\n` +
    `  • 100 Créditos de Generación para Studio Parental Dashboard\n` +
    `  • Pase Gratis al evento familiar "Zentry Experience"\n\n` +
    `💰 *Inversión Total:* ${formatMoney(totals.totalUSD, totals.totalPEN, currency)}\n` +
    `*(Hardware completo + Despliegue de software + Ecosistema de beneficios)*\n\n` +
    `💡 *Programa de Referidos:* Con 7 a 20 familias referidas puedes obtener Smart Bands, Smart Rings o Smart Sound sin costo.\n\n` +
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

  // Toggle Selector de Familia / Catálogo
  document.getElementById('btn-toggle-family-picker')?.addEventListener('click', () => {
    repertorioState.viewMode = repertorioState.viewMode === 'family-picker' ? 'magazine' : 'family-picker';
    renderRepertorioView();
  });

  document.getElementById('btn-switch-family-modal')?.addEventListener('click', () => {
    repertorioState.viewMode = 'family-picker';
    renderRepertorioView();
  });

  // Selección de Familia en la tarjeta
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

  // Navegación de Spreads (Prev / Next)
  document.getElementById('btn-spread-prev')?.addEventListener('click', () => {
    if (repertorioState.currentSpread > 1) {
      repertorioState.currentSpread--;
      renderRepertorioView();
    }
  });

  document.getElementById('btn-spread-next')?.addEventListener('click', () => {
    if (repertorioState.currentSpread < 6) {
      repertorioState.currentSpread++;
      renderRepertorioView();
    }
  });

  // Botones de acción directa en spreads
  root.querySelectorAll('.btn-next-spread-action').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = parseInt(e.currentTarget.dataset.targetSpread, 10);
      if (target) {
        repertorioState.currentSpread = target;
        renderRepertorioView();
      }
    });
  });

  // Thumbnails de spreads
  root.querySelectorAll('.magazine-thumb-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      repertorioState.currentSpread = parseInt(e.currentTarget.dataset.spreadNum, 10);
      renderRepertorioView();
    });
  });

  // Elegir Set para Cotización
  root.querySelectorAll('.btn-choose-set').forEach(btn => {
    btn.addEventListener('click', (e) => {
      repertorioState.selectedSetTier = e.currentTarget.dataset.setKey;
      openQuoteModal();
    });
  });

  // Compartir Propuesta rápida
  root.querySelectorAll('.btn-share-quote').forEach(btn => {
    btn.addEventListener('click', (e) => {
      repertorioState.selectedSetTier = e.currentTarget.dataset.setKey;
      const totals = calculateSetTotals(repertorioState.selectedFamily, repertorioState.selectedSetTier);
      copyQuoteToWhatsApp(totals);
    });
  });

  // Enlace a créditos desde tips
  root.querySelectorAll('.link-to-credits').forEach(link => {
    link.addEventListener('click', () => {
      repertorioState.currentSpread = 6;
      renderRepertorioView();
    });
  });

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
