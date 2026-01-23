# 🎙️ PersonaPlex Integration Plan - AccessLearn

**Fecha:** 23 de enero de 2026  
**Objetivo:** Integrar conversaciones por voz en tiempo real para mejorar el aprendizaje

---

## 📋 Resumen Ejecutivo

**PersonaPlex** es un modelo de IA conversacional full-duplex de NVIDIA que permite conversaciones naturales por voz en tiempo real. Su integración en AccessLearn creará experiencias de aprendizaje inmersivas y accesibles.

### Beneficios Clave
- 🎯 **Tutorías personalizadas** - Estudiantes pueden preguntar y recibir explicaciones naturales
- 🗣️ **Accesibilidad mejorada** - Ideal para usuarios con dislexia, discapacidad motora
- 🎭 **Simulaciones realistas** - Práctica de habilidades blandas (ventas, atención al cliente)
- 🌍 **Multi-idioma** - Soporte para español e inglés
- 📊 **Analíticas conversacionales** - Track engagement y comprensión

---

## 🏗️ Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────────────┐
│                    ACCESSLEARN FRONTEND                      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Course Viewer│  │ Voice Chat   │  │ Practice Lab │      │
│  │              │  │ Component    │  │ (Simulations)│      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             │ WebSocket Audio Stream
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                  BACKEND (Node.js/Express)                    │
│                            │                                  │
│  ┌────────────────────────▼──────────────────────┐          │
│  │     PersonaPlex Integration Service            │          │
│  │  - Session management                          │          │
│  │  - Context injection (course, user profile)    │          │
│  │  - Audio streaming proxy                       │          │
│  │  - Conversation logging                        │          │
│  └────────────────────┬───────────────────────────┘          │
│                       │                                       │
└───────────────────────┼───────────────────────────────────────┘
                        │
                        │ HTTP/WebSocket
                        │
┌───────────────────────┼───────────────────────────────────────┐
│              PERSONAPLEX SERVER (Python)                      │
│                       │                                        │
│  ┌───────────────────▼────────────────────────┐              │
│  │        PersonaPlex Model (GPU Required)     │              │
│  │  - Moshi LM (7B parameters)                │              │
│  │  - Mimi audio codec                         │              │
│  │  - Voice personas (13 voices)              │              │
│  │  - Text tokenizer                           │              │
│  └────────────────────────────────────────────┘              │
│                                                                │
│  Requirements:                                                │
│  - NVIDIA GPU (A100/H100 recommended)                        │
│  - CUDA 12.4+                                                │
│  - 16GB+ VRAM                                                │
│  - Azure VM: Standard_NC24ads_A100_v4                        │
└────────────────────────────────────────────────────────────────┘
```

---

## 📅 Roadmap de Implementación

### **Fase 1: Proof of Concept (2-3 semanas)** ✅ PRIORIDAD

#### Objetivos:
1. Desplegar PersonaPlex en Azure VM con GPU
2. Crear componente React de voz simple
3. Implementar proxy en backend Node.js
4. Demo funcional: "Tutor Virtual" para un curso

#### Tareas Técnicas:

**Backend (Node.js):**
```typescript
// backend/src/services/personaplex.service.ts

import WebSocket from 'ws';

export class PersonaPlexService {
  private personaplexUrl: string;
  
  constructor() {
    // Azure VM con PersonaPlex
    this.personaplexUrl = process.env.PERSONAPLEX_WS_URL || 'wss://personaplex.accesslearn.com';
  }

  /**
   * Create a voice tutoring session
   */
  async createVoiceTutorSession(
    userId: string,
    courseId: string,
    lessonId: string,
    userProfile: AccessibilityProfile
  ) {
    // 1. Get course content for context
    const lesson = await this.getLessonContent(courseId, lessonId);
    
    // 2. Build system prompt
    const prompt = this.buildTutorPrompt({
      courseName: lesson.courseName,
      lessonTitle: lesson.title,
      lessonContent: lesson.content,
      userName: userProfile.name,
      learningStyle: userProfile.learningPreferences,
    });
    
    // 3. Select voice based on user preferences
    const voice = this.selectVoice(userProfile);
    
    return {
      sessionId: generateUUID(),
      wsUrl: this.buildWsUrl(prompt, voice),
      context: lesson,
    };
  }

  private buildTutorPrompt(params: any): string {
    return `<system> You are a patient and encouraging tutor named Ana. 
    You are helping ${params.userName} understand the lesson: "${params.lessonTitle}" 
    from the course "${params.courseName}". 
    
    Lesson overview: ${params.lessonContent.substring(0, 500)}
    
    Your role:
    - Answer questions about the lesson clearly and concisely
    - If the learner is confused, provide simpler examples
    - Adapt your pace to the learner's understanding
    - Celebrate their progress
    - Keep explanations under 30 seconds
    - Ask if they need clarification
    
    Learning style: ${params.learningStyle}
    <system>`;
  }

  private selectVoice(profile: AccessibilityProfile): string {
    // Natural female voice by default
    let voice = 'NATF0.pt';
    
    // User preferences override
    if (profile.voicePreference) {
      voice = profile.voicePreference;
    }
    
    return voice;
  }

  private buildWsUrl(prompt: string, voice: string): string {
    const params = new URLSearchParams({
      text_prompt: prompt,
      voice_prompt: voice,
      text_temperature: '0.7',
      audio_temperature: '0.8',
    });
    
    return `${this.personaplexUrl}/api/chat?${params}`;
  }
}
```

**Frontend (React Component):**
```typescript
// src/components/VoiceTutor/VoiceTutor.tsx

import { useState, useRef, useEffect } from 'react';
import { Microphone, MicrophoneSlash, SpeakerHigh } from '@phosphor-icons/react';

interface VoiceTutorProps {
  courseId: string;
  lessonId: string;
  onClose: () => void;
}

export function VoiceTutor({ courseId, lessonId, onClose }: VoiceTutorProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);

  useEffect(() => {
    initializeVoiceSession();
    return () => cleanup();
  }, []);

  async function initializeVoiceSession() {
    try {
      // 1. Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 2. Initialize audio context
      audioContextRef.current = new AudioContext();
      
      // 3. Get session from backend
      const response = await fetch('/api/voice-tutor/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, lessonId }),
      });
      
      const { wsUrl, sessionId } = await response.json();
      
      // 4. Connect to PersonaPlex via WebSocket
      connectToPersonaPlex(wsUrl, stream);
      
    } catch (error) {
      console.error('Failed to initialize voice session:', error);
    }
  }

  function connectToPersonaPlex(wsUrl: string, stream: MediaStream) {
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      console.log('Connected to PersonaPlex');
      setIsConnected(true);
      setupAudioStreaming(stream);
    };
    
    wsRef.current.onmessage = (event) => {
      // Receive audio chunks from PersonaPlex
      const audioData = event.data;
      playAudio(audioData);
    };
    
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  function setupAudioStreaming(stream: MediaStream) {
    // Stream microphone to PersonaPlex
    const source = audioContextRef.current!.createMediaStreamSource(stream);
    
    // Encode and send audio chunks
    // (Implementation depends on audio format required by PersonaPlex)
  }

  function playAudio(audioData: ArrayBuffer) {
    // Decode and play audio from PersonaPlex
    // (Implementation depends on audio format)
  }

  function cleanup() {
    wsRef.current?.close();
    audioContextRef.current?.close();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">🎙️ Voice Tutor</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected - Say "Hi" to start!' : 'Connecting...'}
          </span>
        </div>

        {/* Transcript */}
        <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto mb-4">
          {transcript.map((text, idx) => (
            <div key={idx} className="mb-2">
              <p className="text-sm">{text}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full ${isMuted ? 'bg-red-500' : 'bg-blue-500'} text-white`}
          >
            {isMuted ? <MicrophoneSlash size={24} /> : <Microphone size={24} />}
          </button>
          
          <button className="p-4 rounded-full bg-gray-200">
            <SpeakerHigh size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Endpoints Backend:**
```typescript
// backend/src/routes/voice-tutor.routes.ts

import { Router } from 'express';
import { PersonaPlexService } from '../services/personaplex.service';

const router = Router();
const personaplexService = new PersonaPlexService();

/**
 * POST /api/voice-tutor/session
 * Create a new voice tutoring session
 */
router.post('/session', async (req, res) => {
  const { courseId, lessonId } = req.body;
  const userId = req.user!.id;
  const userProfile = await getUserProfile(userId);
  
  const session = await personaplexService.createVoiceTutorSession(
    userId,
    courseId,
    lessonId,
    userProfile
  );
  
  res.json(session);
});

/**
 * GET /api/voice-tutor/history/:sessionId
 * Get conversation transcript
 */
router.get('/history/:sessionId', async (req, res) => {
  // Return conversation history
});

export default router;
```

---

### **Fase 2: Integración Completa (4-6 semanas)**

#### Características:
1. **Botón "Ask Voice Tutor"** en Course Viewer
2. **Voice Practice Labs** - Simulaciones de role-playing
3. **Conversation Analytics** - Track tiempo, preguntas, engagement
4. **Multi-tenant voice prompts** - Personalizados por empresa
5. **Voice accessibility profiles** - Preferencias de voz por usuario

#### Nuevos Componentes:

**1. Voice Button en Course Viewer:**
```tsx
// Add to CourseViewer.tsx
<button 
  onClick={() => setShowVoiceTutor(true)}
  className="btn-secondary"
>
  <Microphone /> Ask Voice Tutor
</button>

{showVoiceTutor && (
  <VoiceTutor 
    courseId={courseId} 
    lessonId={currentLesson.id}
    onClose={() => setShowVoiceTutor(false)}
  />
)}
```

**2. Voice Practice Lab (Simulations):**
```typescript
// New feature: Practice Labs
const practiceScenarios = [
  {
    id: 'customer-service-1',
    title: 'Handle Angry Customer',
    description: 'Practice de-escalation techniques',
    prompt: '<system> You are an angry customer... <system>',
    voice: 'VARM1.pt',
    duration: '5-10 minutes',
  },
  {
    id: 'sales-pitch-1',
    title: 'Product Demo Call',
    description: 'Practice presenting product benefits',
    prompt: '<system> You are a potential client... <system>',
    voice: 'NATF2.pt',
    duration: '10-15 minutes',
  },
];
```

**3. Conversation Analytics:**
```typescript
interface VoiceSessionMetrics {
  sessionId: string;
  userId: string;
  courseId: string;
  duration: number; // seconds
  questionsAsked: number;
  clarificationsNeeded: number;
  comprehensionScore: number; // 0-100
  transcript: ConversationTurn[];
  feedback: string; // AI-generated feedback
}
```

---

### **Fase 3: Optimización & Scale (2-3 meses)**

#### Mejoras:
1. **GPU Scaling** - Azure VM Scale Sets para múltiples sesiones
2. **Voice Cloning** - Voces personalizadas por tenant
3. **Multilingual** - Soporte para más idiomas
4. **Offline Mode** - Download voice sessions
5. **Mobile App** - PWA con voice support

---

## 💰 Costos Estimados

### Infraestructura Azure:

| Recurso | Spec | Costo/mes | Notas |
|---------|------|-----------|-------|
| **VM GPU** | Standard_NC24ads_A100_v4 | $2,700 | 1x NVIDIA A100 (40GB) |
| **Alt: NC6s_v3** | Standard_NC6s_v3 | $900 | 1x NVIDIA V100 (16GB) |
| **Storage** | Premium SSD 256GB | $40 | Model weights |
| **Bandwidth** | 500GB/month | $40 | Audio streaming |
| **Total (A100)** | | **$2,780/mes** | Producción |
| **Total (V100)** | | **$980/mes** | POC/Testing |

### ROI Esperado:

```
Incremento en Completitud de Cursos: +25-35%
Reducción en Soporte Humano: -40%
Mejora en Satisfacción: +30%
Incremento en Retención: +20%

Valor anual estimado: $50,000 - $100,000
```

---

## 🚨 Consideraciones Técnicas

### 1. **Requisitos de GPU**
- **Mínimo:** NVIDIA V100 (16GB VRAM)
- **Recomendado:** NVIDIA A100 (40GB VRAM) o H100
- **Alternativa económica:** Azure ML Endpoints con escalado automático

### 2. **Latencia**
- **Target:** <500ms round-trip
- **Network:** WebSocket directo (evitar proxies innecesarios)
- **Audio codec:** Opus 24kHz

### 3. **Seguridad**
- ✅ HTTPS/WSS obligatorio
- ✅ Authentication tokens en WebSocket
- ✅ Rate limiting (prevenir abuso)
- ✅ Transcripts encriptados en DB

### 4. **Privacidad**
- ❌ NO enviar datos fuera de Azure
- ✅ Self-hosted PersonaPlex (no API pública)
- ✅ GDPR compliant
- ✅ Opción de delete conversations

### 5. **Escalabilidad**
```
Usuarios concurrentes por VM:
- A100 (40GB): ~10-15 sesiones
- V100 (16GB): ~5-8 sesiones
- H100 (80GB): ~20-30 sesiones

Para 100 usuarios simultáneos:
- Opción 1: 10x V100 ($9,000/mes)
- Opción 2: 5x A100 ($13,500/mes)
- Opción 3: Azure ML Serverless (variable)
```

---

## 📊 Métricas de Éxito

### KPIs Fase 1 (POC):
- [ ] Latencia promedio < 1 segundo
- [ ] 95% uptime
- [ ] 50+ conversaciones de prueba completadas
- [ ] Feedback positivo de 10 beta testers

### KPIs Fase 2 (Production):
- [ ] 500+ sesiones de voz/mes
- [ ] Incremento 20% en completitud de cursos
- [ ] NPS de voice feature > 8/10
- [ ] 0 incidents de seguridad

### KPIs Fase 3 (Scale):
- [ ] 5,000+ sesiones de voz/mes
- [ ] Disponible en 3+ idiomas
- [ ] Mobile app launch
- [ ] Voice cloning para 10 tenants

---

## 🎯 Próximos Pasos INMEDIATOS

### Esta Semana:
1. ✅ **Aprobar presupuesto** - $980/mes para VM V100 (POC)
2. ✅ **Crear Azure VM** - Standard_NC6s_v3 con GPU
3. ✅ **Instalar PersonaPlex** - Seguir guía oficial de NVIDIA
4. ✅ **Crear branch** - `feature/personaplex-integration`

### Próxima Semana:
1. Implementar `PersonaPlexService` en backend
2. Crear componente `<VoiceTutor />` en frontend
3. Deploy a Azure VM
4. Testing interno con equipo

### En 2 Semanas:
1. Beta testing con 10 usuarios piloto
2. Iterar basado en feedback
3. Preparar documentación
4. Planning para Fase 2

---

## 📚 Recursos

- [PersonaPlex GitHub](https://github.com/NVIDIA/personaplex)
- [PersonaPlex Paper](https://research.nvidia.com/labs/adlr/files/personaplex/personaplex_preprint.pdf)
- [Moshi Architecture](https://arxiv.org/abs/2410.00037)
- [Azure GPU VMs Pricing](https://azure.microsoft.com/pricing/details/virtual-machines/linux/)

---

## ❓ FAQ

**Q: ¿PersonaPlex es gratis?**  
A: Sí, el modelo está bajo MIT License. Solo pagas la infraestructura (GPU VM).

**Q: ¿Funciona en español?**  
A: Sí, el modelo base (Helium LLM) soporta español. Necesitas prompts en español.

**Q: ¿Se puede usar sin GPU?**  
A: No, PersonaPlex requiere GPU obligatoriamente. Mínimo NVIDIA V100.

**Q: ¿Cuántos usuarios simultáneos soporta?**  
A: ~5-8 en V100, ~10-15 en A100. Para más, necesitas múltiples VMs.

**Q: ¿Alternativas más económicas?**  
A: Azure OpenAI (GPT-4o Realtime API) pero sin full-duplex real y más caro por uso.

---

**Preparado por:** GitHub Copilot  
**Fecha:** 23 de enero de 2026  
**Estado:** ✅ Listo para Aprobación
