/**
 * Seed script for default accessibility profiles
 * 
 * Creates default accessibility profiles for each tenant
 */

import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env file in project root
// This ensures the script works whether run from root or backend directory
const envPath = path.resolve(__dirname, '../../../.env')
dotenv.config({ path: envPath })

import { initializeCosmos } from '../services/cosmosdb.service'
import {
  getAccessibilityProfiles,
  createAccessibilityProfile,
} from '../functions/AccessibilityProfileFunctions'
import { AdvancedPreferences } from '../models/AccessibilityProfile'

const defaultProfiles: Array<{
  name: string
  description: string
  icon: string
  enabled: boolean
  settings: AdvancedPreferences
  metadata: {
    useCase: string
    objective: string
    benefits: string[]
    recommendedSettings?: string
    targetAudience: string
  }
}> = [
  {
    name: 'Discalexia',
    description: 'Fuente especializada y espaciado mejorado',
    icon: 'Type',
    enabled: true,
    settings: {
      fontFamily: 'dyslexia' as const,
      lineHeight: 'relaxed' as const,
      letterSpacing: 'wide' as const,
      wordSpacing: 'wide' as const,
      textSize: 'large' as const,
      customTextSize: 100,
      highContrast: false,
      contrastScheme: 'default' as const,
      colorBlindness: 'none' as const,
      invertColors: false,
      pageZoom: 100,
      captionsEnabled: true,
      captionSize: 'medium' as const,
      captionBackground: '#000000',
      captionTextColor: '#ffffff',
      captionPosition: 'bottom' as const,
      soundEffects: false,
      audioDescription: false,
      playbackSpeed: 1,
      reduceMotion: false,
      simplifiedNavigation: false,
      autoPause: false,
      pauseDuration: 5,
      readingMode: 'normal' as const,
      showTooltips: true,
      noTimeLimits: false,
    },
    metadata: {
      useCase: 'Para usuarios con dificultades para leer texto debido a la forma de las letras. La dislexia afecta la capacidad de procesar y reconocer palabras escritas.',
      objective: 'Mejorar la legibilidad del texto mediante fuente especializada (OpenDyslexic), espaciado aumentado entre letras y palabras, y tamaño de texto más grande para reducir la confusión visual.',
      benefits: [
        'Reduce la confusión entre letras similares (b/d, p/q)',
        'Mejora la velocidad de lectura',
        'Disminuye la fatiga visual',
        'Aumenta la comprensión del texto',
        'Facilita el seguimiento de líneas al leer',
      ],
      recommendedSettings: 'Se recomienda usar con texto grande (125%) y espaciado relajado. Funciona mejor en modo claro con alto contraste.',
      targetAudience: 'Usuarios con dislexia, dificultades de lectura o procesamiento visual, y personas que tienen problemas para distinguir letras similares.',
    },
  },
  {
    name: 'Baja Visión',
    description: 'Alto contraste y texto grande',
    icon: 'Eye',
    enabled: true,
    settings: {
      fontFamily: 'default' as const,
      lineHeight: 'normal' as const,
      letterSpacing: 'normal' as const,
      wordSpacing: 'normal' as const,
      textSize: 'x-large' as const,
      customTextSize: 100,
      highContrast: true,
      contrastScheme: 'yellow-on-black' as const,
      colorBlindness: 'none' as const,
      invertColors: false,
      pageZoom: 150,
      captionsEnabled: true,
      captionSize: 'large' as const,
      captionBackground: '#000000',
      captionTextColor: '#ffff00',
      captionPosition: 'bottom' as const,
      soundEffects: false,
      audioDescription: false,
      playbackSpeed: 1,
      reduceMotion: false,
      simplifiedNavigation: false,
      autoPause: false,
      pauseDuration: 5,
      readingMode: 'normal' as const,
      showTooltips: true,
      noTimeLimits: false,
    },
    metadata: {
      useCase: 'Para usuarios con visión reducida que necesitan texto más grande, mayor contraste y zoom aumentado para poder leer el contenido cómodamente.',
      objective: 'Maximizar la legibilidad mediante esquema de colores de alto contraste (amarillo sobre negro), texto aumentado al 150%, y zoom de página al 150%.',
      benefits: [
        'Texto más grande facilita la lectura sin esfuerzo',
        'Alto contraste mejora la visibilidad de todos los elementos',
        'Zoom aumentado permite ver mejor los detalles',
        'Esquema yellow-on-black es uno de los más legibles',
        'Reduce la fatiga visual durante sesiones largas',
      ],
      recommendedSettings: 'Funciona mejor en pantallas grandes. El esquema yellow-on-black es especialmente efectivo para usuarios con visión reducida.',
      targetAudience: 'Usuarios con baja visión, visión parcial, degeneración macular, glaucoma, o cualquier condición que reduzca la agudeza visual.',
    },
  },
  {
    name: 'Daltonismo',
    description: 'Filtros de color y alto contraste',
    icon: 'Palette',
    enabled: true,
    settings: {
      fontFamily: 'default' as const,
      lineHeight: 'normal' as const,
      letterSpacing: 'normal' as const,
      wordSpacing: 'normal' as const,
      textSize: 'normal' as const,
      customTextSize: 100,
      highContrast: true,
      contrastScheme: 'default' as const,
      colorBlindness: 'protanopia' as const,
      invertColors: false,
      pageZoom: 100,
      captionsEnabled: true,
      captionSize: 'medium' as const,
      captionBackground: '#000000',
      captionTextColor: '#ffffff',
      captionPosition: 'bottom' as const,
      soundEffects: false,
      audioDescription: false,
      playbackSpeed: 1,
      reduceMotion: false,
      simplifiedNavigation: false,
      autoPause: false,
      pauseDuration: 5,
      readingMode: 'normal' as const,
      showTooltips: true,
      noTimeLimits: false,
    },
    metadata: {
      useCase: 'Para usuarios con daltonismo (deficiencia en la percepción de colores) que tienen dificultades para distinguir ciertos colores, especialmente rojo-verde o azul-amarillo.',
      objective: 'Aplicar filtros de color que simulan diferentes tipos de daltonismo y agregar indicadores visuales adicionales (iconos, patrones, texto) para elementos que dependen del color.',
      benefits: [
        'Filtros de color ayudan a identificar problemas de accesibilidad',
        'Indicadores visuales adicionales más allá del color',
        'Alto contraste mejora la distinción de elementos',
        'Iconos y patrones hacen que los estados sean distinguibles',
        'Cumple con WCAG 2.1 AA para contraste de color',
      ],
      recommendedSettings: 'Selecciona el tipo de daltonismo específico (protanopia, deuteranopia, tritanopia) según las necesidades del usuario.',
      targetAudience: 'Usuarios con daltonismo (protanopia, deuteranopia, tritanopia), deficiencia de visión al color, o dificultades para distinguir colores similares.',
    },
  },
  {
    name: 'Auditiva',
    description: 'Subtítulos grandes y notificaciones visuales',
    icon: 'Volume2',
    enabled: true,
    settings: {
      fontFamily: 'default' as const,
      lineHeight: 'normal' as const,
      letterSpacing: 'normal' as const,
      wordSpacing: 'normal' as const,
      textSize: 'normal' as const,
      customTextSize: 100,
      highContrast: false,
      contrastScheme: 'default' as const,
      colorBlindness: 'none' as const,
      invertColors: false,
      pageZoom: 100,
      captionsEnabled: true,
      captionSize: 'x-large' as const,
      captionBackground: '#000000',
      captionTextColor: '#ffffff',
      captionPosition: 'bottom' as const,
      soundEffects: false,
      audioDescription: true,
      playbackSpeed: 1,
      reduceMotion: false,
      simplifiedNavigation: false,
      autoPause: false,
      pauseDuration: 5,
      readingMode: 'normal' as const,
      showTooltips: true,
      noTimeLimits: false,
    },
    metadata: {
      useCase: 'Para usuarios con pérdida auditiva o sordera que necesitan alternativas visuales para contenido de audio y notificaciones que normalmente se comunican mediante sonido.',
      objective: 'Proporcionar subtítulos grandes y visibles, transcripciones prominentes, notificaciones visuales para eventos de audio, y descripción de audio para contenido multimedia.',
      benefits: [
        'Subtítulos grandes y visibles facilitan la lectura',
        'Transcripciones siempre disponibles para contenido de audio',
        'Notificaciones visuales para eventos que normalmente son sonoros',
        'Descripción de audio para contenido multimedia',
        'Indicadores visuales claros de estado de reproducción',
      ],
      recommendedSettings: 'Los subtítulos se muestran en tamaño x-large con fondo negro y texto blanco para máxima legibilidad.',
      targetAudience: 'Usuarios con pérdida auditiva, sordera, o que prefieren contenido visual sobre audio. También útil en entornos silenciosos.',
    },
  },
  {
    name: 'Motora',
    description: 'Navegación simplificada y sin límites de tiempo',
    icon: 'MousePointerClick',
    enabled: true,
    settings: {
      fontFamily: 'default' as const,
      lineHeight: 'normal' as const,
      letterSpacing: 'normal' as const,
      wordSpacing: 'normal' as const,
      textSize: 'normal' as const,
      customTextSize: 100,
      highContrast: false,
      contrastScheme: 'default' as const,
      colorBlindness: 'none' as const,
      invertColors: false,
      pageZoom: 100,
      captionsEnabled: true,
      captionSize: 'medium' as const,
      captionBackground: '#000000',
      captionTextColor: '#ffffff',
      captionPosition: 'bottom' as const,
      soundEffects: false,
      audioDescription: false,
      playbackSpeed: 1,
      reduceMotion: false,
      simplifiedNavigation: true,
      autoPause: true,
      pauseDuration: 10,
      readingMode: 'normal' as const,
      showTooltips: true,
      noTimeLimits: true,
    },
    metadata: {
      useCase: 'Para usuarios con limitaciones motoras que tienen dificultades para usar el mouse, teclado, o realizar movimientos precisos. También para usuarios que necesitan más tiempo para completar actividades.',
      objective: 'Simplificar la navegación, aumentar el tamaño de áreas de toque (mínimo 56px), eliminar límites de tiempo, y agregar pausas automáticas para facilitar la interacción.',
      benefits: [
        'Áreas de toque más grandes (mínimo 56px) facilitan la interacción',
        'Navegación simplificada reduce la complejidad',
        'Sin límites de tiempo elimina la presión',
        'Pausas automáticas permiten descansos',
        'Espaciado aumentado entre elementos reduce errores',
      ],
      recommendedSettings: 'Las pausas automáticas están configuradas a 10 segundos. Los botones tienen un tamaño mínimo de 56x56px para cumplir con WCAG AAA.',
      targetAudience: 'Usuarios con limitaciones motoras, temblores, artritis, parálisis parcial, o dificultades para realizar movimientos precisos con mouse o teclado.',
    },
  },
  {
    name: 'Cognitiva',
    description: 'Lectura simplificada y ayudas contextuales',
    icon: 'Brain',
    enabled: true,
    settings: {
      fontFamily: 'default' as const,
      lineHeight: 'normal' as const,
      letterSpacing: 'normal' as const,
      wordSpacing: 'normal' as const,
      textSize: 'normal' as const,
      customTextSize: 100,
      highContrast: false,
      contrastScheme: 'default' as const,
      colorBlindness: 'none' as const,
      invertColors: false,
      pageZoom: 100,
      captionsEnabled: true,
      captionSize: 'medium' as const,
      captionBackground: '#000000',
      captionTextColor: '#ffffff',
      captionPosition: 'bottom' as const,
      soundEffects: false,
      audioDescription: false,
      playbackSpeed: 1,
      reduceMotion: false,
      simplifiedNavigation: false,
      autoPause: true,
      pauseDuration: 5,
      readingMode: 'simplified' as const,
      showTooltips: true,
      noTimeLimits: true,
    },
    metadata: {
      useCase: 'Para usuarios con dificultades cognitivas, problemas de atención, o que necesitan ayuda adicional para entender y navegar la interfaz. También útil para usuarios que aprenden mejor con información simplificada.',
      objective: 'Simplificar el lenguaje y estructura del contenido, mostrar ayudas contextuales siempre visibles, eliminar límites de tiempo, y agregar pausas automáticas para facilitar el procesamiento de información.',
      benefits: [
        'Lenguaje simplificado mejora la comprensión',
        'Ayudas contextuales siempre visibles',
        'Sin límites de tiempo reduce la ansiedad',
        'Pausas automáticas permiten procesar información',
        'Estructura clara facilita la navegación',
        'Mensajes claros y consistentes',
      ],
      recommendedSettings: 'El modo de lectura simplificada aumenta el tamaño de fuente y el espaciado. Los tooltips se muestran siempre visibles.',
      targetAudience: 'Usuarios con dificultades cognitivas, TDAH, autismo, problemas de memoria, o que necesitan información presentada de manera más simple y clara.',
    },
  },
]

export async function seedAccessibilityProfiles(tenantId: string): Promise<void> {
  try {
    // Ensure Cosmos DB is initialized (in case it's called directly)
    try {
      await initializeCosmos()
    } catch (error: any) {
      // If already initialized, ignore the error
      if (error?.message && !error.message.includes('already')) {
        throw error
      }
    }

    console.log(`[Seed] Starting accessibility profiles seed for tenant: ${tenantId}`)

    // Check if profiles already exist
    const existingProfiles = await getAccessibilityProfiles(tenantId)
    const existingNames = new Set(existingProfiles.map(p => p.name.toLowerCase()))

    let created = 0
    let skipped = 0

    for (const profileData of defaultProfiles) {
      // Skip if profile with this name already exists
      if (existingNames.has(profileData.name.toLowerCase())) {
        console.log(`[Seed] Profile "${profileData.name}" already exists, skipping`)
        skipped++
        continue
      }

      try {
        await createAccessibilityProfile({
          tenantId,
          name: profileData.name,
          description: profileData.description,
          icon: profileData.icon,
          enabled: profileData.enabled,
          isDefault: true,
          settings: profileData.settings,
          metadata: profileData.metadata,
        })
        console.log(`[Seed] Created profile: ${profileData.name}`)
        created++
      } catch (error: any) {
        console.error(`[Seed] Error creating profile "${profileData.name}":`, error.message)
      }
    }

    console.log(`[Seed] Accessibility profiles seed completed: ${created} created, ${skipped} skipped`)
  } catch (error: any) {
    console.error('[Seed] Error seeding accessibility profiles:', error)
    throw error
  }
}

// Run seed if called directly
if (require.main === module) {
  const tenantId = process.argv[2]
  if (!tenantId) {
    console.error('Usage: ts-node seed-accessibility-profiles.ts <tenantId>')
    process.exit(1)
  }

  initializeCosmos()
    .then(() => seedAccessibilityProfiles(tenantId))
    .then(() => {
      console.log('Seed completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seed failed:', error)
      process.exit(1)
    })
}

