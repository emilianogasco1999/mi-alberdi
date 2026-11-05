import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { PrismaClient, Prisma, CodigoPlan, TipoPublicacion } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seed de Mi Alberdi...');

  // 1. Configuración inicial del sistema (singleton id = 1)
  await prisma.configuracionSistema.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      modoMantenimiento: false,
      mensajeMantenimiento:
        'Estamos realizando mejoras en Mi Alberdi. Volvemos en unos minutos.',
      semillaRotacionRanking: 1,
      versionMinimaPwa: '1.0.0',
    },
  });
  console.log('✅ 1/5 Configuración del sistema inicializada.');

  // 2. Catálogo de Planes (Gratis $0, Plata $1.500, Oro $2.500)
  const planes: Array<{
    codigo: CodigoPlan;
    nombre: string;
    precioMensualArs: number;
    maxPublicaciones: number;
    maxFotosPorPublicacion: number;
    cuposDestacados: number;
    maxSucursales: number;
    maxReelsActivos: number;
    prioridadBase: number;
    permiteEstadisticas: boolean;
    permitePinDestacado: boolean;
    permiteBanner: boolean;
    permiteAsistenteIa: boolean;
    caracteristicasBase: Prisma.InputJsonObject;
  }> = [
    {
      codigo: 'gratis',
      nombre: 'Plan Vecino Gratis',
      precioMensualArs: 0,
      maxPublicaciones: 2,
      maxFotosPorPublicacion: 3,
      cuposDestacados: 0,
      maxSucursales: 1,
      maxReelsActivos: 0,
      prioridadBase: 0,
      permiteEstadisticas: false,
      permitePinDestacado: false,
      permiteBanner: false,
      permiteAsistenteIa: false,
      caracteristicasBase: {
        whatsapp_directo: true,
        mapa_buscador: true,
        qr_vidriera: true,
        sucursales_extra: false,
      },
    },
    {
      codigo: 'plata',
      nombre: 'Plan Comercio Plata',
      precioMensualArs: 1500,
      maxPublicaciones: 10,
      maxFotosPorPublicacion: 6,
      cuposDestacados: 1,
      maxSucursales: 3,
      maxReelsActivos: 1,
      prioridadBase: 10,
      permiteEstadisticas: true,
      permitePinDestacado: true,
      permiteBanner: false,
      permiteAsistenteIa: false,
      caracteristicasBase: {
        whatsapp_directo: true,
        mapa_buscador: true,
        qr_vidriera: true,
        badge_verificado: true,
        pin_destacado: true,
        estadisticas: true,
        reel_24h: true,
        sucursales_extra: true,
      },
    },
    {
      codigo: 'oro',
      nombre: 'Plan Impulso Oro',
      precioMensualArs: 2500,
      maxPublicaciones: 999,
      maxFotosPorPublicacion: 10,
      cuposDestacados: 3,
      maxSucursales: 10,
      maxReelsActivos: 3,
      prioridadBase: 20,
      permiteEstadisticas: true,
      permitePinDestacado: true,
      permiteBanner: true,
      permiteAsistenteIa: true,
      caracteristicasBase: {
        whatsapp_directo: true,
        mapa_buscador: true,
        qr_vidriera: true,
        badge_verificado: true,
        pin_destacado: true,
        estadisticas: true,
        reel_24h: true,
        banner_portada: true,
        whatsapp_animado: true,
        asistente_ia: true,
        sucursales_extra: true,
      },
    },
  ];

  for (const plan of planes) {
    await prisma.planCatalogo.upsert({
      where: { codigo: plan.codigo },
      update: {
        nombre: plan.nombre,
        precioMensualArs: plan.precioMensualArs,
        maxPublicaciones: plan.maxPublicaciones,
        maxFotosPorPublicacion: plan.maxFotosPorPublicacion,
        cuposDestacados: plan.cuposDestacados,
        maxSucursales: plan.maxSucursales,
        maxReelsActivos: plan.maxReelsActivos,
        prioridadBase: plan.prioridadBase,
        permiteEstadisticas: plan.permiteEstadisticas,
        permitePinDestacado: plan.permitePinDestacado,
        permiteBanner: plan.permiteBanner,
        permiteAsistenteIa: plan.permiteAsistenteIa,
        caracteristicasBase: plan.caracteristicasBase,
        activo: true,
      },
      create: {
        ...plan,
        activo: true,
      },
    });
  }
  console.log('✅ 2/5 Planes de suscripción (Gratis, Plata, Oro) sincronizados.');

  // 3. Catálogo de Métodos de Pago
  const metodosPago = [
    { codigo: 'efectivo', nombre: 'Efectivo', icono: 'banknote' },
    { codigo: 'transferencia', nombre: 'Transferencia / Alias', icono: 'arrow-left-right' },
    { codigo: 'mercadopago', nombre: 'Mercado Pago / QR', icono: 'qr-code' },
    { codigo: 'tarjeta_debito', nombre: 'Tarjeta de Débito', icono: 'credit-card' },
    { codigo: 'tarjeta_credito', nombre: 'Tarjeta de Crédito', icono: 'credit-card' },
    { codigo: 'modo_billetera', nombre: 'MODO / Billeteras Bancarias', icono: 'smartphone' },
    { codigo: 'cuenta_corriente', nombre: 'Cuenta Corriente / Fiado Local', icono: 'book-open' },
  ];

  for (const mp of metodosPago) {
    await prisma.metodoPagoCatalogo.upsert({
      where: { codigo: mp.codigo },
      update: { nombre: mp.nombre, icono: mp.icono, activo: true },
      create: { ...mp, activo: true },
    });
  }
  console.log('✅ 3/5 Métodos de pago sincronizados.');

  // 4. Rubros / Grupos y Categorías iniciales de Juan Bautista Alberdi
  const rubrosData: Array<{
    slug: string;
    nombre: string;
    icono: string;
    colorHex: string;
    destacadoPortada: boolean;
    orden: number;
    categorias: Array<{
      slug: string;
      nombre: string;
      tipoPermitido: TipoPublicacion | null;
    }>;
  }> = [
    {
      slug: 'gastronomia',
      nombre: 'Gastronomía y Comidas',
      icono: 'utensils',
      colorHex: '#EA580C',
      destacadoPortada: true,
      orden: 1,
      categorias: [
        { slug: 'pizzerias-y-sandwicherias', nombre: 'Pizzerías y Sandwicherías', tipoPermitido: null },
        { slug: 'panaderias-y-confiterias', nombre: 'Panaderías y Confiterías', tipoPermitido: 'producto' },
        { slug: 'rotiserias-y-viandas', nombre: 'Rotiserías y Viandas Diarias', tipoPermitido: 'producto' },
        { slug: 'heladerias', nombre: 'Heladerías', tipoPermitido: 'producto' },
        { slug: 'pasteleria-y-reposteria', nombre: 'Pastelería y Repostería Artesanal', tipoPermitido: 'producto' },
      ],
    },
    {
      slug: 'hogar-y-construccion',
      nombre: 'Hogar, Oficios y Construcción',
      icono: 'hammer',
      colorHex: '#2563EB',
      destacadoPortada: true,
      orden: 2,
      categorias: [
        { slug: 'plomeria-y-gas', nombre: 'Plomería y Gasistas', tipoPermitido: 'servicio' },
        { slug: 'electricidad', nombre: 'Electricistas', tipoPermitido: 'servicio' },
        { slug: 'aires-acondicionados-y-refrigeracion', nombre: 'Aires Acondicionados y Refrigeración', tipoPermitido: 'servicio' },
        { slug: 'albanileria-y-pintura', nombre: 'Albañilería, Durlock y Pintura', tipoPermitido: 'servicio' },
        { slug: 'ferreterias-y-corralones', nombre: 'Ferreterías y Corralones', tipoPermitido: 'producto' },
      ],
    },
    {
      slug: 'comercios-y-tiendas',
      nombre: 'Comercios y Tiendas',
      icono: 'store',
      colorHex: '#059669',
      destacadoPortada: true,
      orden: 3,
      categorias: [
        { slug: 'supermercados-y-despensas', nombre: 'Supermercados y Despensas', tipoPermitido: 'producto' },
        { slug: 'carnicerias-y-verduleria', nombre: 'Carnicerías y Verdulerías', tipoPermitido: 'producto' },
        { slug: 'indumentaria-y-calzado', nombre: 'Indumentaria y Calzado', tipoPermitido: 'producto' },
        { slug: 'kioscos-y-drugstores', nombre: 'Kioscos y Drugstores 24hs', tipoPermitido: 'producto' },
        { slug: 'librerias-y-papeleria', nombre: 'Librerías, Fotocopias y Regalería', tipoPermitido: null },
      ],
    },
    {
      slug: 'salud-y-bienestar',
      nombre: 'Salud y Farmacias',
      icono: 'heart-pulse',
      colorHex: '#DC2626',
      destacadoPortada: true,
      orden: 4,
      categorias: [
        { slug: 'farmacias', nombre: 'Farmacias', tipoPermitido: 'producto' },
        { slug: 'consultorios-medicos-y-odontologia', nombre: 'Consultorios Médicos y Odontología', tipoPermitido: 'servicio' },
        { slug: 'kinesiologia-y-enfermeria', nombre: 'Kinesiología y Enfermería a Domicilio', tipoPermitido: 'servicio' },
        { slug: 'opticas', nombre: 'Ópticas', tipoPermitido: null },
      ],
    },
    {
      slug: 'profesionales-y-educacion',
      nombre: 'Profesionales y Educación',
      icono: 'graduation-cap',
      colorHex: '#7C3AED',
      destacadoPortada: true,
      orden: 5,
      categorias: [
        { slug: 'abogados-y-escribanias', nombre: 'Abogados y Escribanías', tipoPermitido: 'servicio' },
        { slug: 'contadores-y-gestoria', nombre: 'Contadores y Gestoría', tipoPermitido: 'servicio' },
        { slug: 'clases-particulares-y-apoyo', nombre: 'Clases Particulares y Apoyo Escolar', tipoPermitido: 'servicio' },
        { slug: 'servicio-tecnico-pc-celulares', nombre: 'Servicio Técnico PC y Celulares', tipoPermitido: 'servicio' },
      ],
    },
    {
      slug: 'belleza-y-estetica',
      nombre: 'Belleza y Estética',
      icono: 'sparkles',
      colorHex: '#DB2777',
      destacadoPortada: true,
      orden: 6,
      categorias: [
        { slug: 'peluquerias-y-barberias', nombre: 'Peluquerías y Barberías', tipoPermitido: 'servicio' },
        { slug: 'manicuria-y-estetica', nombre: 'Manicuría, Depilación y Estética', tipoPermitido: 'servicio' },
      ],
    },
    {
      slug: 'transporte-y-automotor',
      nombre: 'Transporte, Fletes y Automotor',
      icono: 'truck',
      colorHex: '#0284C7',
      destacadoPortada: true,
      orden: 7,
      categorias: [
        { slug: 'fletes-y-mudanzas', nombre: 'Fletes, Mudanzas y Cadetería', tipoPermitido: 'servicio' },
        { slug: 'remises-y-traslados', nombre: 'Remises y Comisiones', tipoPermitido: 'servicio' },
        { slug: 'talleres-mecanicos-y-gomerias', nombre: 'Talleres Mecánicos, Gomerías y Repuestos', tipoPermitido: null },
      ],
    },
    {
      slug: 'eventos-y-entretenimiento',
      nombre: 'Eventos y Festejos',
      icono: 'party-popper',
      colorHex: '#D97706',
      destacadoPortada: true,
      orden: 8,
      categorias: [
        { slug: 'salones-y-quintas', nombre: 'Salones infantiles y Quintas', tipoPermitido: 'servicio' },
        { slug: 'catering-sonido-y-fotografia', nombre: 'Catering, DJ, Sonido y Fotografía', tipoPermitido: 'servicio' },
      ],
    },
  ];

  for (const rubro of rubrosData) {
    const savedRubro = await prisma.rubroGrupo.upsert({
      where: { slug: rubro.slug },
      update: {
        nombre: rubro.nombre,
        icono: rubro.icono,
        colorHex: rubro.colorHex,
        destacadoPortada: rubro.destacadoPortada,
        orden: rubro.orden,
        activo: true,
      },
      create: {
        slug: rubro.slug,
        nombre: rubro.nombre,
        icono: rubro.icono,
        colorHex: rubro.colorHex,
        destacadoPortada: rubro.destacadoPortada,
        orden: rubro.orden,
        activo: true,
      },
    });

    for (const [idx, cat] of rubro.categorias.entries()) {
      await prisma.categoria.upsert({
        where: { slug: cat.slug },
        update: {
          grupoId: savedRubro.id,
          nombre: cat.nombre,
          tipoPermitido: cat.tipoPermitido,
          orden: idx + 1,
          activa: true,
        },
        create: {
          grupoId: savedRubro.id,
          slug: cat.slug,
          nombre: cat.nombre,
          tipoPermitido: cat.tipoPermitido,
          orden: idx + 1,
          activa: true,
        },
      });
    }
  }
  console.log('✅ 4/5 Rubros y categorías de Juan Bautista Alberdi sincronizados.');

  // 5. Usuario Administrador inicial + Comercio y Oficio de demostración
  const adminPasswordHash = await bcrypt.hash('AdminAlberdi2026!', 10);

  const adminUser = await prisma.perfilUsuario.upsert({
    where: { email: 'admin@mialberdi.com.ar' },
    update: {
      rol: 'admin',
      estado: 'activo',
    },
    create: {
      nombre: 'Administrador',
      apellido: 'Mi Alberdi',
      email: 'admin@mialberdi.com.ar',
      telefono: '+5493865000000',
      passwordHash: adminPasswordHash,
      rol: 'admin',
      estado: 'activo',
      puedeProbarPremium: true,
    },
  });
  console.log(`✅ 5/5 Usuario Admin listo: ${adminUser.email} (Password: AdminAlberdi2026!)`);

  console.log('🎉 ¡Seed de Mi Alberdi finalizado con éxito!');
}

main()
  .catch((err) => {
    console.error('❌ Error ejecutando el seed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

