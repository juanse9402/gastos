export const INITIAL_COMPANIES = [
  {
    id: 'comp-paperia',
    name: 'La Papería',
    emoji: '🍟',
    industry: 'Comidas Rápidas',
    createdAt: '2026-09-01'
  },
  {
    id: 'comp-cafe',
    name: 'Café Central & Bakery',
    emoji: '☕',
    industry: 'Cafetería / Bar',
    createdAt: '2026-09-10'
  }
];

export const INITIAL_USERS = [
  // La Papería Users
  {
    id: 'usr-admin-paperia',
    email: 'admin@lapaperia.com',
    password: '1234',
    name: 'Juan Sebastián (Gerente)',
    role: 'admin',
    companyId: 'comp-paperia'
  },
  {
    id: 'usr-cajero-paperia',
    email: 'cajero@lapaperia.com',
    password: '1234',
    name: 'Cajero Turno Principal',
    role: 'cajero',
    companyId: 'comp-paperia'
  },

  // Café Central Users (Segunda Empresa Registrada)
  {
    id: 'usr-admin-cafe',
    email: 'gerencia@cafecentral.com',
    password: '1234',
    name: 'Marcela (Administradora)',
    role: 'admin',
    companyId: 'comp-cafe'
  },
  {
    id: 'usr-cajero-cafe',
    email: 'caja@cafecentral.com',
    password: '1234',
    name: 'Barista / Caja Turno',
    role: 'cajero',
    companyId: 'comp-cafe'
  }
];

export const getDefaultCategoriesForIndustry = (industry) => {
  if (industry === 'Cafetería / Bar') {
    return [
      { id: 'cat-ing-1', name: 'Ventas Barra', type: 'Ingreso', color: '#10b981' },
      { id: 'cat-ing-2', name: 'Ventas Mesas', type: 'Ingreso', color: '#3b82f6' },
      { id: 'cat-ing-3', name: 'Plataformas / Domicilios', type: 'Ingreso', color: '#f59e0b' },
      { id: 'cat-gst-1', name: 'Café e Insumos', type: 'Gasto', color: '#eab308' },
      { id: 'cat-gst-2', name: 'Licores y Cervezas', type: 'Gasto', color: '#ef4444' },
      { id: 'cat-gst-3', name: 'Panadería y Snacks', type: 'Gasto', color: '#f97316' },
      { id: 'cat-gst-4', name: 'Sueldos / Nómina', type: 'Gasto', color: '#8b5cf6' },
      { id: 'cat-gst-5', name: 'Arriendo', type: 'Gasto', color: '#ec4899' },
      { id: 'cat-gst-6', name: 'Servicios Públicos', type: 'Gasto', color: '#14b8a6' },
      { id: 'cat-gst-7', name: 'Desechables y Empaques', type: 'Gasto', color: '#64748b' }
    ];
  }
  if (industry === 'Comercio / Tienda') {
    return [
      { id: 'cat-ing-1', name: 'Ventas Mostrador', type: 'Ingreso', color: '#10b981' },
      { id: 'cat-ing-2', name: 'Ventas por Redes / Envíos', type: 'Ingreso', color: '#3b82f6' },
      { id: 'cat-gst-1', name: 'Compra de Mercancía', type: 'Gasto', color: '#eab308' },
      { id: 'cat-gst-2', name: 'Fletes y Envíos', type: 'Gasto', color: '#f97316' },
      { id: 'cat-gst-3', name: 'Empaques y Bolsas', type: 'Gasto', color: '#64748b' },
      { id: 'cat-gst-4', name: 'Sueldos / Nómina', type: 'Gasto', color: '#8b5cf6' },
      { id: 'cat-gst-5', name: 'Arriendo Local', type: 'Gasto', color: '#ec4899' },
      { id: 'cat-gst-6', name: 'Servicios', type: 'Gasto', color: '#14b8a6' },
      { id: 'cat-gst-7', name: 'Publicidad y Redes', type: 'Gasto', color: '#a855f7' }
    ];
  }
  if (industry === 'Servicios') {
    return [
      { id: 'cat-ing-1', name: 'Honorarios / Servicios', type: 'Ingreso', color: '#10b981' },
      { id: 'cat-ing-2', name: 'Contratos Mensuales', type: 'Ingreso', color: '#3b82f6' },
      { id: 'cat-gst-1', name: 'Nómina / Colaboradores', type: 'Gasto', color: '#8b5cf6' },
      { id: 'cat-gst-2', name: 'Alquiler Oficina', type: 'Gasto', color: '#ec4899' },
      { id: 'cat-gst-3', name: 'Software y Herramientas', type: 'Gasto', color: '#06b6d4' },
      { id: 'cat-gst-4', name: 'Publicidad', type: 'Gasto', color: '#a855f7' },
      { id: 'cat-gst-5', name: 'Servicios', type: 'Gasto', color: '#14b8a6' }
    ];
  }
  // Default: Comidas Rápidas (like La Papería)
  return INITIAL_CATEGORIES;
};

export const INITIAL_CATEGORIES = [
  { id: 'cat-ing-1', name: 'Ventas Local', type: 'Ingreso', icon: 'Store', color: '#10b981' },
  { id: 'cat-ing-2', name: 'Didi', type: 'Ingreso', icon: 'Bike', color: '#f59e0b' },
  { id: 'cat-ing-3', name: 'Rappi / Domicilios', type: 'Ingreso', icon: 'ShoppingBag', color: '#06b6d4' },
  { id: 'cat-ing-4', name: 'Otros Ingresos', type: 'Ingreso', icon: 'PlusCircle', color: '#3b82f6' },

  { id: 'cat-gst-1', name: 'Papa Casteblanco', type: 'Gasto', icon: 'Box', color: '#eab308' },
  { id: 'cat-gst-2', name: 'Carniceria', type: 'Gasto', icon: 'Utensils', color: '#ef4444' },
  { id: 'cat-gst-3', name: 'Revuelteria', type: 'Gasto', icon: 'Carrot', color: '#22c55e' },
  { id: 'cat-gst-4', name: 'Gaseosa', type: 'Gasto', icon: 'CupSoda', color: '#f97316' },
  { id: 'cat-gst-5', name: 'Sueldos / Nómina', type: 'Gasto', icon: 'Users', color: '#8b5cf6' },
  { id: 'cat-gst-6', name: 'Arriendo', type: 'Gasto', icon: 'Home', color: '#ec4899' },
  { id: 'cat-gst-7', name: 'Servicios', type: 'Gasto', icon: 'Zap', color: '#14b8a6' },
  { id: 'cat-gst-8', name: 'Transporte Papa', type: 'Gasto', icon: 'Truck', color: '#64748b' },
  { id: 'cat-gst-9', name: 'Publicidad', type: 'Gasto', icon: 'Megaphone', color: '#a855f7' },
  { id: 'cat-gst-10', name: 'Compras Diarias', type: 'Gasto', icon: 'ShoppingCart', color: '#0284c7' },
  { id: 'cat-gst-11', name: 'Bombones y Tortas', type: 'Gasto', icon: 'Cake', color: '#d946ef' },
  { id: 'cat-gst-12', name: 'Surtiven', type: 'Gasto', icon: 'Package', color: '#84cc16' },
  { id: 'cat-gst-13', name: 'Ajustes Diarios', type: 'Gasto', icon: 'Sliders', color: '#6b7280' },
  { id: 'cat-gst-14', name: 'Todo en Uno Caldas', type: 'Gasto', icon: 'Layers', color: '#059669' },
  { id: 'cat-gst-15', name: 'Banco', type: 'Gasto', icon: 'Landmark', color: '#475569' },
  { id: 'cat-gst-16', name: 'Parafiscales', type: 'Gasto', icon: 'FileText', color: '#9333ea' },
  { id: 'cat-gst-17', name: 'Pramont', type: 'Gasto', icon: 'Briefcase', color: '#0d9488' },
  { id: 'cat-gst-18', name: 'Tenedores y Desechables', type: 'Gasto', icon: 'UtensilsCrossed', color: '#78716c' },
  { id: 'cat-gst-19', name: 'Otros', type: 'Gasto', icon: 'HelpCircle', color: '#94a3b8' }
];

// Septiembre 2026 data from the user's Excel screenshot ($26.230.400 Ingresos / $22.640.986 Gastos)
export const INITIAL_TRANSACTIONS = [
  // Ingresos Septiembre 2026 ($26.230.400)
  {
    id: 'tx-ing-1',
    fecha: '2026-09-15',
    descripcion: 'Ventas mostrador en Efectivo Quincena 1',
    tipo: 'Ingreso',
    categoria: 'Ventas Local',
    monto: 6000000,
    metodo: 'Efectivo'
  },
  {
    id: 'tx-ing-2',
    fecha: '2026-09-15',
    descripcion: 'Ventas mostrador en Transferencia / Tarjeta Quincena 1',
    tipo: 'Ingreso',
    categoria: 'Ventas Local',
    monto: 3370200,
    metodo: 'Banco'
  },
  {
    id: 'tx-ing-3',
    fecha: '2026-09-30',
    descripcion: 'Ventas mostrador en Efectivo Quincena 2',
    tipo: 'Ingreso',
    categoria: 'Ventas Local',
    monto: 7000000,
    metodo: 'Efectivo'
  },
  {
    id: 'tx-ing-4',
    fecha: '2026-09-30',
    descripcion: 'Ventas mostrador en Transferencia / Tarjeta Quincena 2',
    tipo: 'Ingreso',
    categoria: 'Ventas Local',
    monto: 8013500,
    metodo: 'Banco'
  },
  {
    id: 'tx-ing-5',
    fecha: '2026-09-28',
    descripcion: 'Liquidación Didi Food Mes',
    tipo: 'Ingreso',
    categoria: 'Didi',
    monto: 1846700,
    metodo: 'Banco'
  },

  // Gastos Septiembre 2026 ($22.640.986)
  {
    id: 'tx-gst-1',
    fecha: '2026-09-05',
    descripcion: 'Compra bultos Papa Casteblanco',
    tipo: 'Gasto',
    categoria: 'Papa Casteblanco',
    monto: 8289664,
    metodo: 'Banco'
  },
  {
    id: 'tx-gst-2',
    fecha: '2026-09-10',
    descripcion: 'Suministro Carnicería semanal',
    tipo: 'Gasto',
    categoria: 'Carniceria',
    monto: 5894122,
    metodo: 'Banco'
  },
  {
    id: 'tx-gst-3',
    fecha: '2026-09-30',
    descripcion: 'Nómina quincenal empleados',
    tipo: 'Gasto',
    categoria: 'Sueldos / Nómina',
    monto: 3500000,
    metodo: 'Banco'
  },
  {
    id: 'tx-gst-4',
    fecha: '2026-09-02',
    descripcion: 'Arriendo local mensual',
    tipo: 'Gasto',
    categoria: 'Arriendo',
    monto: 2284100,
    metodo: 'Banco'
  },
  {
    id: 'tx-gst-5',
    fecha: '2026-09-12',
    descripcion: 'Pago Servicios públicos (Luz, Agua, Gas)',
    tipo: 'Gasto',
    categoria: 'Servicios',
    monto: 1007600,
    metodo: 'Banco'
  },
  {
    id: 'tx-gst-6',
    fecha: '2026-09-18',
    descripcion: 'Postobón y Coca-Cola pedido grande',
    tipo: 'Gasto',
    categoria: 'Gaseosa',
    monto: 943550,
    metodo: 'Efectivo'
  },
  {
    id: 'tx-gst-7',
    fecha: '2026-09-20',
    descripcion: 'Verduras, maduro, lechuga revueltería',
    tipo: 'Gasto',
    categoria: 'Revuelteria',
    monto: 164300,
    metodo: 'Efectivo'
  },
  {
    id: 'tx-gst-8',
    fecha: '2026-09-14',
    descripcion: 'Acarreo y flete de Papa',
    tipo: 'Gasto',
    categoria: 'Transporte Papa',
    monto: 120000,
    metodo: 'Efectivo'
  },
  {
    id: 'tx-gst-9',
    fecha: '2026-09-08',
    descripcion: 'Campaña redes sociales y publicidad',
    tipo: 'Gasto',
    categoria: 'Publicidad',
    monto: 67000,
    metodo: 'Banco'
  },
  {
    id: 'tx-gst-10',
    fecha: '2026-09-22',
    descripcion: 'Insumos varios (platos, uniformes, porta salsas, rollo factura)',
    tipo: 'Gasto',
    categoria: 'Otros',
    monto: 370650,
    metodo: 'Efectivo'
  }
];

// Initial Daily Close from user screenshot Image 2
export const INITIAL_DAILY_CLOSES = [
  {
    id: 'close-2026-09-29-1',
    fecha: '2026-09-29',
    hora: '22:45',
    cajero: 'Cajero Turno Principal',
    turno: 'Noche',
    cajaEsperada: 1825700,
    efectivo: 752000,
    banco: 816000,
    gastos: 0,
    nomina: 270000,
    totalCalculado: 1838000,
    descuadre: 12300,
    estadoCuadre: 'Sobra', // 'Cuadrado' | 'Sobra' | 'Falta'
    estadoRevision: 'Aprobado', // 'Pendiente' | 'Aprobado' | 'Rechazado'
    notas: 'Turno sin novedades. Sobrante de $12.300 COP registrado en arqueo.',
    desgloseBilletes: {
      '100000': 3,
      '50000': 6,
      '20000': 5,
      '10000': 4,
      '5000': 2,
      '2000': 1,
      'monedas': 0
    },
    bancosDetalle: [
      { entidad: 'Nequi', monto: 450000 },
      { entidad: 'Daviplata', monto: 216000 },
      { entidad: 'Datáfono Redeban', monto: 150000 }
    ]
  }
];

export const INITIAL_CAFE_DATA = {
  categories: getDefaultCategoriesForIndustry('Cafetería / Bar'),
  transactions: [
    {
      id: 'tx-cafe-1',
      fecha: '2026-09-15',
      descripcion: 'Ventas café de especialidad y bebidas mostrador',
      tipo: 'Ingreso',
      categoria: 'Ventas Barra',
      monto: 3450000,
      metodo: 'Efectivo'
    },
    {
      id: 'tx-cafe-2',
      fecha: '2026-09-15',
      descripcion: 'Consumos en mesas pagados con Tarjeta / Datáfono',
      tipo: 'Ingreso',
      categoria: 'Ventas Mesas',
      monto: 4120000,
      metodo: 'Banco'
    },
    {
      id: 'tx-cafe-3',
      fecha: '2026-09-28',
      descripcion: 'Liquidación Domicilios Rappi Café',
      tipo: 'Ingreso',
      categoria: 'Plataformas / Domicilios',
      monto: 1250000,
      metodo: 'Banco'
    },
    {
      id: 'tx-cafe-gst-1',
      fecha: '2026-09-05',
      descripcion: 'Compra bultos Café Huila Especial',
      tipo: 'Gasto',
      categoria: 'Café e Insumos',
      monto: 1850000,
      metodo: 'Banco'
    },
    {
      id: 'tx-cafe-gst-2',
      fecha: '2026-09-12',
      descripcion: 'Suministro Repostería y Panadería Artesanal',
      tipo: 'Gasto',
      categoria: 'Panadería y Snacks',
      monto: 890000,
      metodo: 'Efectivo'
    },
    {
      id: 'tx-cafe-gst-3',
      fecha: '2026-09-30',
      descripcion: 'Nómina Quincenal Baristas',
      tipo: 'Gasto',
      categoria: 'Sueldos / Nómina',
      monto: 2400000,
      metodo: 'Banco'
    },
    {
      id: 'tx-cafe-gst-4',
      fecha: '2026-09-02',
      descripcion: 'Arriendo Local Café Central',
      tipo: 'Gasto',
      categoria: 'Arriendo',
      monto: 1500000,
      metodo: 'Banco'
    }
  ],
  dailyCloses: [
    {
      id: 'close-cafe-1',
      fecha: '2026-09-29',
      hora: '21:15',
      cajero: 'Barista / Turno Tarde',
      turno: 'Tarde',
      cajaEsperada: 680000,
      efectivo: 450000,
      banco: 230000,
      gastos: 0,
      nomina: 0,
      totalCalculado: 680000,
      descuadre: 0,
      estadoCuadre: 'Exacto',
      estadoRevision: 'Aprobado',
      notas: 'Cierre de turno cuadrado sin novedades.'
    }
  ]
};

// Initial Suppliers for La Papería
export const INITIAL_SUPPLIERS = [
  {
    id: 'supp-1',
    companyId: 'comp-paperia',
    name: 'Distribuidora Papas del Valle',
    categoria: 'Insumos / Papa',
    contacto: 'Don Hernán Gómez',
    telefono: '3124567890',
    nit: '900.456.789-1',
    ciudad: 'Popayán',
    saldoPendiente: 450000
  },
  {
    id: 'supp-2',
    companyId: 'comp-paperia',
    name: 'Postobón & Bebidas Popayán',
    categoria: 'Gaseosas & Bebidas',
    contacto: 'Carlos Ruiz (Vendedor)',
    telefono: '3109876543',
    nit: '890.123.456-7',
    ciudad: 'Popayán',
    saldoPendiente: 280000
  },
  {
    id: 'supp-3',
    companyId: 'comp-paperia',
    name: 'Carnes & Embutidos La Sabana',
    categoria: 'Carnes & Toppings',
    contacto: 'Doña Martha López',
    telefono: '3157891234',
    nit: '901.345.678-2',
    ciudad: 'Popayán',
    saldoPendiente: 0
  },
  {
    id: 'supp-4',
    companyId: 'comp-paperia',
    name: 'Empaques y Desechables del Sur',
    categoria: 'Empaques & Desechables',
    contacto: 'Lina Marcela',
    telefono: '3186543210',
    nit: '900.876.543-9',
    ciudad: 'Popayán',
    saldoPendiente: 120000
  }
];

// Initial Supplier Invoices
export const INITIAL_SUPPLIER_INVOICES = [
  {
    id: 'inv-1',
    companyId: 'comp-paperia',
    supplierId: 'supp-1',
    supplierName: 'Distribuidora Papas del Valle',
    numeroFactura: 'FAC-8921',
    fecha: '2026-09-22',
    fechaVencimiento: '2026-10-05',
    descripcion: '10 bultos de Papa Pastusa lavada para freír',
    total: 950000,
    saldoPendiente: 450000,
    estado: 'Parcial',
    pagos: [
      { id: 'pay-1', fecha: '2026-09-25', monto: 500000, metodo: 'Banco', notas: 'Transferencia Nequi anticipo' }
    ]
  },
  {
    id: 'inv-2',
    companyId: 'comp-paperia',
    supplierId: 'supp-2',
    supplierName: 'Postobón & Bebidas Popayán',
    numeroFactura: 'FAC-4402',
    fecha: '2026-09-26',
    fechaVencimiento: '2026-10-10',
    descripcion: 'Pedido semanal gaseosas pet 350ml y botellas vidrio',
    total: 280000,
    saldoPendiente: 280000,
    estado: 'Pendiente',
    pagos: []
  },
  {
    id: 'inv-3',
    companyId: 'comp-paperia',
    supplierId: 'supp-3',
    supplierName: 'Carnes & Embutidos La Sabana',
    numeroFactura: 'REM-1092',
    fecha: '2026-09-18',
    fechaVencimiento: '2026-09-25',
    descripcion: '25kg tocineta ahumada y carne especial hamburguesa',
    total: 620000,
    saldoPendiente: 0,
    estado: 'Pagado',
    pagos: [
      { id: 'pay-2', fecha: '2026-09-20', monto: 620000, metodo: 'Banco', notas: 'Transferencia Bancolombia saldo total' }
    ]
  },
  {
    id: 'inv-4',
    companyId: 'comp-paperia',
    supplierId: 'supp-4',
    supplierName: 'Empaques y Desechables del Sur',
    numeroFactura: 'FAC-3105',
    fecha: '2026-09-27',
    fechaVencimiento: '2026-10-12',
    descripcion: 'Cajas térmicas para papas, tenedores, servilletas impresas',
    total: 120000,
    saldoPendiente: 120000,
    estado: 'Pendiente',
    pagos: []
  }
];
