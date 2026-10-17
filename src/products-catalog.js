/**
 * MATRIZ DE CATÁLOGO OFICIAL DE PRODUCTOS & SKUS — ZENTRYOS / QUARZ
 * Base de Datos Centralizada de Hardware, Variantes, Imágenes Multiángulo y Precios
 */

export const CATALOG_CATEGORIES = [
  { id: 'all', name: 'Todos los Productos', icon: '⚡' },
  { id: 'implementations', name: 'ZentryOS Software', icon: '🛡️' },
  { id: 'tablets', name: 'Smart Tabs', icon: '📱' },
  { id: 'smartphones', name: 'Smart Phones', icon: '📲' },
  { id: 'biometrics', name: 'Smart Rings', icon: '💍' },
  { id: 'smartwatches', name: 'Smart Watches', icon: '🧭' },
  { id: 'smartbands', name: 'Smart Bands', icon: '⌚' },
  { id: 'audio', name: 'Smart Sound', icon: '🔊' }
];

export const PRODUCTS_CATALOG = [
  // ==========================================
  // SMART TABS
  // ==========================================
  {
    sku: 'ZT-TAB11-BLK',
    category: 'tablets',
    familyCode: 'st',
    familyName: 'Smart Tab',
    modelName: 'Smart Tab 11" OLED',
    fullName: 'Zentry Smart Tab 11" — Space Black Graphite',
    shortName: 'Smart Tab 11" Black',
    color: {
      name: 'Space Black Graphite',
      hex: '#1f2428',
      type: 'dark'
    },
    material: 'Chasis de Titanio Grafito & Vidrio Laminado',
    priceUSD: 1300,
    pricePEN: 4420,
    badge: 'Hardware Central',
    tagline: 'Pantalla de alta resolución calibrada para estudio, foco y creatividad.',
    specs: [
      'Pantalla 11" OLED 2.8K 120Hz sin parpadeo (Eye-Care)',
      'Chipset de alto rendimiento con arquitectura térmica pasiva',
      'Cámara trasera con micro-bisel CNC y flash LED circular',
      'Blindaje nativo ZentryOS contra algoritmos adictivos'
    ],
    angles: {
      front: '/assets/products/smarttabs/smarttab_negro_frontal.png',
      back: '/assets/products/smarttabs/smarttab_negro_trasero.png',
    }
  },
  {
    sku: 'ZT-TAB11-WHT',
    category: 'tablets',
    familyCode: 'st',
    familyName: 'Smart Tab',
    modelName: 'Smart Tab 11" OLED',
    fullName: 'Zentry Smart Tab 11" — Silver White',
    shortName: 'Smart Tab 11" White',
    color: {
      name: 'Silver White',
      hex: '#e2e8f0',
      type: 'light'
    },
    material: 'Chasis de Titanio Plateado & Cristal Esmerilado',
    priceUSD: 1300,
    pricePEN: 4420,
    badge: 'Hardware Central',
    tagline: 'Pantalla de alta resolución calibrada para estudio, foco y creatividad.',
    specs: [
      'Pantalla 11" OLED 2.8K 120Hz sin parpadeo (Eye-Care)',
      'Chipset de alto rendimiento con arquitectura térmica pasiva',
      'Cámara trasera con micro-bisel CNC y flash LED circular',
      'Blindaje nativo ZentryOS contra algoritmos adictivos'
    ],
    angles: {
      front: '/assets/products/smarttabs/smarttab_blanco_frontal.png',
      back: '/assets/products/smarttabs/smarttab_blanco_trasero.png',
    }
  },

  // ==========================================
  // SMARTPHONES
  // ==========================================
  {
    sku: 'ZT-PHN-BLK',
    category: 'smartphones',
    familyCode: 'sp',
    familyName: 'Smart Phone',
    modelName: 'Zentry Phone Pro 6.7"',
    fullName: 'Zentry Phone Pro — Space Black Titanium',
    shortName: 'Phone Pro Black',
    color: {
      name: 'Space Black Titanium',
      hex: '#18181b',
      type: 'dark'
    },
    material: 'Canto Plano Titanio Grado 5 & Vidrio Satinado',
    priceUSD: 1200,
    pricePEN: 4080,
    badge: 'Ecosistema Total',
    tagline: 'Terminal móvil con núcleo ZentryOS blindado contra redes adictivas.',
    specs: [
      'Chasis de titanio plano con bisel CNC ultra-preciso',
      'Módulo icónico vertical en píldora con 2 lentes ópticos grandes',
      'Autonomía de 48 horas en modo enfoque parental',
      'Sistema ZentryOS integrado de fábrica'
    ],
    angles: {
      front: '/assets/products/smartphones/smartphone_negro_frontal.png',
      back: '/assets/products/smartphones/smartphone_negro_trasero.png'
    }
  },
  {
    sku: 'ZT-PHN-WHT',
    category: 'smartphones',
    familyCode: 'sp',
    familyName: 'Smart Phone',
    modelName: 'Zentry Phone Pro 6.7"',
    fullName: 'Zentry Phone Pro — Pure White Silver',
    shortName: 'Phone Pro White',
    color: {
      name: 'Pure White Silver',
      hex: '#f4f4f5',
      type: 'light'
    },
    material: 'Titanio Plata Satinado & Vidrio Mate',
    priceUSD: 1200,
    pricePEN: 4080,
    badge: 'Ecosistema Total',
    tagline: 'Terminal móvil con núcleo ZentryOS blindado contra redes adictivas.',
    specs: [
      'Chasis de titanio plano con bisel CNC ultra-preciso',
      'Módulo icónico vertical en píldora con 2 lentes ópticos grandes',
      'Autonomía de 48 horas en modo enfoque parental',
      'Sistema ZentryOS integrado de fábrica'
    ],
    angles: {
      front: '/assets/products/smartphones/smartphone_blanco_frontal.png',
      back: '/assets/products/smartphones/smartphone_blanco_trasero.png'
    }
  },

  // ==========================================
  // SMART RINGS
  // ==========================================
  {
    sku: 'ZT-RING-WHT',
    category: 'biometrics',
    familyCode: 'sr',
    familyName: 'Smart Ring',
    modelName: 'Zentry Ring Gen-2',
    fullName: 'Zentry Smart Ring — White Ceramic & Silver',
    shortName: 'Smart Ring White',
    color: {
      name: 'White Ceramic & Silver',
      hex: '#ffffff',
      type: 'light'
    },
    material: 'Cerámica Zirconia Pulida Espejo & Resina Médica',
    priceUSD: 450,
    pricePEN: 1530,
    badge: 'Biometría Invisible',
    tagline: 'Anillo biométrico para monitoreo no intrusivo de salud y temperatura.',
    specs: [
      'Cuerpo ultraligero de 20mm con interior biocompatible',
      'Sensores PPG ópticos de pulso, VFC y temperatura dérmica',
      'Batería para 7 días continuos y sumergible a 50m (5ATM)',
      'Sincronización silenciosa directa al Parental Dashboard'
    ],
    angles: {
      front: '/assets/products/smartrings/smartring_blanco_frontal.png',
      back: '/assets/products/smartrings/smartring_blanco_trasero.png'
    }
  },
  {
    sku: 'ZT-RING-BLK',
    category: 'biometrics',
    familyCode: 'sr',
    familyName: 'Smart Ring',
    modelName: 'Zentry Ring Gen-2',
    fullName: 'Zentry Smart Ring — Black Ceramic & Titanium',
    shortName: 'Smart Ring Black',
    color: {
      name: 'Black Ceramic & Titanium',
      hex: '#09090b',
      type: 'dark'
    },
    material: 'Cerámica Negra Ébano & Titanio Cepillado',
    priceUSD: 450,
    pricePEN: 1530,
    badge: 'Biometría Invisible',
    tagline: 'Anillo biométrico para monitoreo no intrusivo de salud y temperatura.',
    specs: [
      'Cuerpo ultraligero de 20mm con interior biocompatible',
      'Sensores PPG ópticos de pulso, VFC y temperatura dérmica',
      'Batería para 7 días continuos y sumergible a 50m (5ATM)',
      'Sincronización silenciosa directa al Parental Dashboard'
    ],
    angles: {
      front: '/assets/products/smartrings/smartring_negro_frontal.png',
      back: '/assets/products/smartrings/smartring_negro_trasero.png'
    }
  },

  // ==========================================
  // SMARTWATCHES
  // ==========================================
  {
    sku: 'ZT-WATCH-SIL-BLK',
    category: 'smartwatches',
    familyCode: 'sw',
    familyName: 'Smart Watch',
    modelName: 'Zentry Watch 44mm Silicona',
    fullName: 'Zentry Watch 44mm — Titanio Negro / Grafito',
    shortName: 'Watch Silicona Black',
    color: {
      name: 'Titanio Negro Grafito',
      hex: '#1e293b',
      type: 'dark'
    },
    material: 'Caja Circular de Titanio 44mm & Correa Silicona',
    priceUSD: 650,
    pricePEN: 2210,
    badge: 'Conectividad Directa',
    tagline: 'Reloj inteligente de pulso con enlace prioritario y notificaciones seguras.',
    specs: [
      'Caja circular en titanio de 44mm con doble pulsador táctil lateral',
      'Cristal de zafiro frontal con sensor PPG de grado clínico',
      'Geolocalización segura por satélite cifrada de extremo a extremo',
      'Botón SOS prioritario para enlace parental inmediato'
    ],
    angles: {
      front: '/assets/products/smartwatches/smartwatch_negro_frontal.png',
      back: '/assets/products/smartwatches/smartwatch_negro_trasero.png',
    }
  },
  {
    sku: 'ZT-WATCH-SIL-WHT',
    category: 'smartwatches',
    familyCode: 'sw',
    familyName: 'Smart Watch',
    modelName: 'Zentry Watch 44mm Silicona',
    fullName: 'Zentry Watch 44mm — Titanio Plata / Blanco',
    shortName: 'Watch Silicona White',
    color: {
      name: 'Titanio Plata / Blanco',
      hex: '#f8fafc',
      type: 'light'
    },
    material: 'Caja Circular de Titanio Plata & Correa Silicona Nieve',
    priceUSD: 650,
    pricePEN: 2210,
    badge: 'Conectividad Directa',
    tagline: 'Reloj inteligente de pulso con enlace prioritario y notificaciones seguras.',
    specs: [
      'Caja circular en titanio de 44mm con doble pulsador táctil lateral',
      'Cristal de zafiro frontal con sensor PPG de grado clínico',
      'Geolocalización segura por satélite cifrada de extremo a extremo',
      'Botón SOS prioritario para enlace parental inmediato'
    ],
    angles: {
      front: '/assets/products/smartwatches/smartwatch_blanco_frontal.png',
      back: '/assets/products/smartwatches/smartwatch_blanco_trasero.png',
    }
  },
  {
    sku: 'ZT-WATCH-FAB-WHT',
    category: 'smartwatches',
    familyCode: 'sw',
    familyName: 'Smart Watch',
    modelName: 'Zentry Watch 44mm SuperKnit',
    fullName: 'Zentry Watch 44mm — Titanio Plata / Arctic White',
    shortName: 'Watch Tejido White',
    color: {
      name: 'Titanio Plata / Arctic White',
      hex: '#cbd5e1',
      type: 'light'
    },
    material: 'Caja Circular Titanio Plata & Correa Textil SuperKnit',
    priceUSD: 650,
    pricePEN: 2210,
    badge: 'Conectividad Directa',
    tagline: 'Reloj inteligente de pulso con correa textil ultra-transpirable.',
    specs: [
      'Tejido elástico SuperKnit lavable antimicrobiano',
      'Caja circular en titanio de 44mm con micro-bisel pulido',
      'Sincronización de llamadas prioritarias sin acceso a redes sociales',
      'Resistencia a golpes y agua IP68'
    ],
    angles: {
      front: '/assets/products/smartwatches/smartwatch_tela_blanco_frontal.png',
      back: '/assets/products/smartwatches/smartwatch_tela_blanco_trasero.png',
    }
  },
  {
    sku: 'ZT-WATCH-FAB-BLK',
    category: 'smartwatches',
    familyCode: 'sw',
    familyName: 'Smart Watch',
    modelName: 'Zentry Watch 44mm SuperKnit',
    fullName: 'Zentry Watch 44mm — Titanio Negro / Dark Charcoal',
    shortName: 'Watch Tejido Black',
    color: {
      name: 'Titanio Negro / Charcoal',
      hex: '#334155',
      type: 'dark'
    },
    material: 'Caja Circular Titanio Negro & Correa Textil SuperKnit',
    priceUSD: 650,
    pricePEN: 2210,
    badge: 'Conectividad Directa',
    tagline: 'Reloj inteligente de pulso con correa textil ultra-transpirable.',
    specs: [
      'Tejido elástico SuperKnit lavable antimicrobiano',
      'Caja circular en titanio de 44mm con micro-bisel pulido',
      'Sincronización de llamadas prioritarias sin acceso a redes sociales',
      'Resistencia a golpes y agua IP68'
    ],
    angles: {
      front: '/assets/products/smartwatches/smartwatch_negro_frontal.png',
      back: '/assets/products/smartwatches/smartwatch_tela_negro_trasero.png',
    }
  },

  // ==========================================
  // SMARTBANDS (100% Screenless)
  // ==========================================
  {
    sku: 'ZT-BAND-SIL-BLK',
    category: 'smartbands',
    familyCode: 'sb',
    familyName: 'Smart Band',
    modelName: 'Zentry Band Screenless Sport',
    fullName: 'Zentry Band Silicona — Stealth Black',
    shortName: 'Band Silicona Black',
    color: {
      name: 'Stealth Black',
      hex: '#18181b',
      type: 'dark'
    },
    material: 'Sensor Continuo Sin Pantalla & Silicona Ergonómica',
    priceUSD: 350,
    pricePEN: 1190,
    badge: '100% Screenless',
    tagline: 'Monitoreo discreto de actividad física, sueño y biorritmo infantil.',
    specs: [
      '100% Sin Pantalla: cero distracciones visuales o lumínicas',
      'Seguimiento autónomo del descanso profundo y sueño REM',
      'Sensor con batería de 14 días y recarga inalámbrica',
      'Cápsula de policarbonato reforzado sumergible'
    ],
    angles: {
      front: '/assets/products/smartbands/smartband_plastico_negro_frontal.png',
      back: '/assets/products/smartbands/smartband_plastico_negro_trasero.png',
    }
  },
  {
    sku: 'ZT-BAND-SIL-WHT',
    category: 'smartbands',
    familyCode: 'sb',
    familyName: 'Smart Band',
    modelName: 'Zentry Band Screenless Sport',
    fullName: 'Zentry Band Silicona — Chalk White',
    shortName: 'Band Silicona White',
    color: {
      name: 'Chalk White',
      hex: '#f4f4f5',
      type: 'light'
    },
    material: 'Sensor Continuo Sin Pantalla & Silicona Nieve',
    priceUSD: 350,
    pricePEN: 1190,
    badge: '100% Screenless',
    tagline: 'Monitoreo discreto de actividad física, sueño y biorritmo infantil.',
    specs: [
      '100% Sin Pantalla: cero distracciones visuales o lumínicas',
      'Seguimiento autónomo del descanso profundo y sueño REM',
      'Sensor con batería de 14 días y recarga inalámbrica',
      'Cápsula de policarbonato reforzado sumergible'
    ],
    angles: {
      front: '/assets/products/smartbands/smartband_plastico_blanco_frontal.png',
      back: '/assets/products/smartbands/smartband_plastico_blanco_trasero.png',
    }
  },
  {
    sku: 'ZT-BAND-FAB-BLK',
    category: 'smartbands',
    familyCode: 'sb',
    familyName: 'Smart Band',
    modelName: 'Zentry Band Screenless Textile',
    fullName: 'Zentry Band SuperKnit — Dark Charcoal',
    shortName: 'Band Tejido Black',
    color: {
      name: 'Dark Charcoal',
      hex: '#27272a',
      type: 'dark'
    },
    material: 'Tejido Elástico Transpirable & Micro-Cápsula Invisible',
    priceUSD: 350,
    pricePEN: 1190,
    badge: '100% Screenless',
    tagline: 'Pulsera ultraligera de tela para monitoreo circadiano sin molestias.',
    specs: [
      'Diseño Whoop-style sin pantalla integrado en banda de tejido elástico',
      'Ajuste milimétrico con hebilla deslizante de aluminio anodizado',
      'Lectura de temperatura de la piel, pulso y recuperación neuromuscular',
      'Ideal para uso ininterrumpido 24/7'
    ],
    angles: {
      front: '/assets/products/smartbands/smartband_tela_negro_frontal.png',
      back: '/assets/products/smartbands/smartband_tela_negro_trasero.png',
    }
  },
  {
    sku: 'ZT-BAND-FAB-WHT',
    category: 'smartbands',
    familyCode: 'sb',
    familyName: 'Smart Band',
    modelName: 'Zentry Band Screenless Textile',
    fullName: 'Zentry Band SuperKnit — Arctic White',
    shortName: 'Band Tejido White',
    color: {
      name: 'Arctic White',
      hex: '#e4e4e7',
      type: 'light'
    },
    material: 'Tejido Elástico Transpirable & Micro-Cápsula Invisible',
    priceUSD: 350,
    pricePEN: 1190,
    badge: '100% Screenless',
    tagline: 'Pulsera ultraligera de tela para monitoreo circadiano sin molestias.',
    specs: [
      'Diseño Whoop-style sin pantalla integrado en banda de tejido elástico',
      'Ajuste milimétrico con hebilla deslizante de aluminio anodizado',
      'Lectura de temperatura de la piel, pulso y recuperación neuromuscular',
      'Ideal para uso ininterrumpido 24/7'
    ],
    angles: {
      front: '/assets/products/smartbands/smartband_tela_blanco_frontal.png',
      back: '/assets/products/smartbands/smartband_tela_blanco_trasero.png',
    }
  },

  // ==========================================
  // SMART SOUND
  // ==========================================
  {
    sku: 'ZT-SND-WHT',
    category: 'audio',
    familyCode: 'ss',
    familyName: 'Smart Sound',
    modelName: 'Zentry Sound Spatial Studio',
    fullName: 'Zentry Smart Sound — Arctic White Studio',
    shortName: 'Smart Sound White',
    color: {
      name: 'Arctic White Studio',
      hex: '#f8fafc',
      type: 'light'
    },
    material: 'Tela Acústica Tejida Clara & Anillo de Aluminio CNC',
    priceUSD: 650,
    pricePEN: 2210,
    badge: 'Acústica & Foco',
    tagline: 'Audio espacial multiroom sin pantalla para rutinas matutinas y estudio.',
    specs: [
      'Arquitectura cilíndrica con proyección acústica de 360 grados',
      'Anillo superior de control táctil en aluminio mecanizado',
      'Sonido blanco, música binaural para foco y alarmas circadianas',
      'Cero pantallas emisoras de luz azul en el dormitorio o sala'
    ],
    angles: {
      front: '/assets/products/smartsound/smartsound_blanco_frontal.png',
      back: '/assets/products/smartsound/smartsound_blanco_frontal.png',
    }
  },
  {
    sku: 'ZT-SND-BLK',
    category: 'audio',
    familyCode: 'ss',
    familyName: 'Smart Sound',
    modelName: 'Zentry Sound Spatial Studio',
    fullName: 'Zentry Smart Sound — Space Black Studio',
    shortName: 'Smart Sound Black',
    color: {
      name: 'Space Black Studio',
      hex: '#0f172a',
      type: 'dark'
    },
    material: 'Tela Acústica Grafito Oscuro & Anillo de Aluminio Negro',
    priceUSD: 650,
    pricePEN: 2210,
    badge: 'Acústica & Foco',
    tagline: 'Audio espacial multiroom sin pantalla para rutinas matutinas y estudio.',
    specs: [
      'Arquitectura cilíndrica con proyección acústica de 360 grados',
      'Anillo superior de control táctil en aluminio mecanizado',
      'Sonido blanco, música binaural para foco y alarmas circadianas',
      'Cero pantallas emisoras de luz azul en el dormitorio o sala'
    ],
    angles: {
      front: '/assets/products/smartsound/smartsound_negro_frontal.png',
      back: '/assets/products/smartsound/smartsound_negro_frontal.png',
    }
  },

  // ==========================================
  // IMPLEMENTACIONES DE SOFTWARE ZENTRYOS
  // (Para dispositivos propios de la familia)
  // ==========================================
  {
    sku: 'ZT-IMPL-IND',
    category: 'implementations',
    familyCode: 'zo',
    familyName: 'ZentryOS Software',
    modelName: 'Implementación Individual',
    fullName: 'ZentryOS — Implementación Individual (1 Hijo / 2 Disp.)',
    shortName: 'Implementación Individual',
    color: {
      name: 'Zentry Purple Core',
      hex: '#533b87',
      type: 'dark'
    },
    material: 'Despliegue Digital & Configuración Parental 1 a 1',
    priceUSD: 995,
    pricePEN: 3385,
    badge: 'Software Nativo',
    tagline: 'Despliegue e instalación de ZentryOS en 2 dispositivos propios del hijo más Parental Dashboard.',
    specs: [
      '1 Hijo / 2 dispositivos implementados (celular, tablet, PC o laptop)',
      'Parental Dashboard multidispositivo para ambos padres (2 vistas)',
      'Blindaje contra algoritmos adictivos y rutinas circadianas',
      'Incluye 3 Clases de Inteligencia Artificial para Padres'
    ],
    angles: {
      front: '/assets/repertorio/portada_zentry_magazine.png',
      back: '/assets/repertorio/portada_zentry_magazine.png'
    }
  },
  {
    sku: 'ZT-IMPL-DUAL',
    category: 'implementations',
    familyCode: 'zo',
    familyName: 'ZentryOS Software',
    modelName: 'Implementación Dual',
    fullName: 'ZentryOS — Implementación Dual (2 Hijos / 4 Disp.)',
    shortName: 'Implementación Dual',
    color: {
      name: 'Zentry Lavender Accent',
      hex: '#7c3aed',
      type: 'dark'
    },
    material: 'Despliegue Digital & Configuración Parental Dual',
    priceUSD: 1690,
    pricePEN: 5740,
    badge: 'Ahorro 30% 2do Hijo',
    tagline: 'Despliegue para 2 hijos con hasta 4 dispositivos en total y perfiles pedagógicos independientes.',
    specs: [
      '2 Hijos / 4 dispositivos implementados en total',
      'Ahorro del 30% en el segundo hijo ya incluido',
      'Parental Dashboard consolidado con perfiles y límites autónomos',
      'Incluye 3 Clases de Inteligencia Artificial para Padres'
    ],
    angles: {
      front: '/assets/repertorio/family_nuclear_2h.png',
      back: '/assets/repertorio/family_nuclear_2h.png'
    }
  },
  {
    sku: 'ZT-IMPL-ADD',
    category: 'implementations',
    familyCode: 'zo',
    familyName: 'ZentryOS Software',
    modelName: 'Hijo Adicional',
    fullName: 'ZentryOS — Licencia Hijo Adicional (2 Disp.)',
    shortName: 'Hijo Adicional (+2 Disp.)',
    color: {
      name: 'Emerald Health',
      hex: '#059669',
      type: 'dark'
    },
    material: 'Despliegue Adicional Sincronizado',
    priceUSD: 500,
    pricePEN: 1700,
    badge: 'Expansión Familiar',
    tagline: 'Agrega un hijo adicional con 2 dispositivos implementados y sincronizados al Parental Dashboard.',
    specs: [
      '1 Hijo adicional con 2 dispositivos propios configurados',
      'Sincronización directa al Parental Dashboard familiar',
      'Mismo blindaje cognitivo y acompañamiento técnico'
    ],
    angles: {
      front: '/assets/repertorio/family_extensa_1h.png',
      back: '/assets/repertorio/family_extensa_1h.png'
    }
  }
];

/**
 * Retorna todos los productos del catálogo
 */
export function getAllCatalogProducts() {
  return PRODUCTS_CATALOG;
}

/**
 * Retorna productos filtrados por categoría
 */
export function getProductsByCategory(categoryKey) {
  if (!categoryKey || categoryKey === 'all') {
    return PRODUCTS_CATALOG;
  }
  return PRODUCTS_CATALOG.filter(p => p.category === categoryKey);
}

/**
 * Busca un producto por su SKU exacto
 */
export function getProductBySku(sku) {
  return PRODUCTS_CATALOG.find(p => p.sku === sku) || null;
}

/**
 * Busca productos pertenecientes a una familia de producto (st, sp, sr, sw, sb, ss)
 */
export function getProductsByFamilyCode(familyCode) {
  return PRODUCTS_CATALOG.filter(p => p.familyCode === familyCode);
}
