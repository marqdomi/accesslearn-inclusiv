# 🚀 Empieza AHORA con NVIDIA NIMs y Brev

**Tiempo estimado:** 30-60 minutos para tu primer deployment

---

## ⚡ Paso 1: Cuenta en Brev (5 minutos)

1. Ve a: https://brev.nvidia.com
2. Haz clic en "Sign Up" / "Get Started"
3. Usa tu cuenta de NVIDIA o crea una
4. Completa el registro

---

## ⚡ Paso 2: Instalar CLI (5 minutos)

```bash
# macOS
brew install brevdev/brev/brev

# Verificar instalación
brev --version

# Login
brev login
```

---

## ⚡ Paso 3: Provisionar A100 (10 minutos)

```bash
# Ver instancias disponibles
brev ls

# Crear instancia con A100
brev create kaido-nim --gpu a100 --os ubuntu22

# Esperar a que esté lista (2-5 minutos)
brev status kaido-nim

# SSH a la instancia
brev ssh kaido-nim
```

---

## ⚡ Paso 4: Desplegar NIM (15 minutos)

Una vez dentro de la instancia A100:

```bash
# 1. Obtener NGC API Key
# Ve a: https://ngc.nvidia.com/setup/api-key
# Genera una API Key y guárdala

# 2. Login a NGC
docker login nvcr.io
# Username: $oauthtoken
# Password: <tu NGC API Key>

# 3. Exportar API Key
export NGC_API_KEY="tu-api-key-aqui"

# 4. Pull NIM container (esto toma unos minutos)
docker pull nvcr.io/nim/meta/llama-3.1-8b-instruct:latest

# 5. Run NIM
docker run -d \
  --name kaido-nim \
  --gpus all \
  -p 8000:8000 \
  -e NGC_API_KEY=$NGC_API_KEY \
  nvcr.io/nim/meta/llama-3.1-8b-instruct:latest

# 6. Verificar que está corriendo
docker logs -f kaido-nim

# 7. Esperar mensaje: "Application startup complete"
```

---

## ⚡ Paso 5: Probar NIM (5 minutos)

```bash
# Desde la instancia Brev o desde tu local
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "meta/llama-3.1-8b-instruct",
    "messages": [
      {"role": "system", "content": "You are an AI tutor for Kaido educational platform."},
      {"role": "user", "content": "Explain machine learning in simple terms."}
    ],
    "max_tokens": 256,
    "temperature": 0.7
  }'
```

**Respuesta esperada:**
```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "Machine learning is like teaching a computer to learn from examples..."
    }
  }]
}
```

---

## 🎯 Integración con Kaido

### Crear Servicio NIM en el Backend

```typescript
// backend/src/services/nvidia-nim.service.ts

interface NIMConfig {
  endpoint: string;
  model: string;
  apiKey?: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface NIMResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class NVIDIANIMService {
  private config: NIMConfig;

  constructor() {
    this.config = {
      endpoint: process.env.NVIDIA_NIM_ENDPOINT || 'http://localhost:8000',
      model: process.env.NVIDIA_NIM_MODEL || 'meta/llama-3.1-8b-instruct',
      apiKey: process.env.NGC_API_KEY
    };
  }

  async chat(messages: ChatMessage[], options: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
  } = {}): Promise<string> {
    const response = await fetch(`${this.config.endpoint}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        max_tokens: options.maxTokens || 1024,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.9
      })
    });

    if (!response.ok) {
      throw new Error(`NIM API error: ${response.status} ${response.statusText}`);
    }

    const data: NIMResponse = await response.json();
    return data.choices[0].message.content;
  }

  // AI Tutor específico para Kaido
  async tutorResponse(
    studentQuery: string,
    courseContext: {
      courseName: string;
      currentModule: string;
      studentLevel: number;
    },
    ragContext?: string[]
  ): Promise<string> {
    const systemPrompt = `You are an AI tutor for "${courseContext.courseName}" on the Kaido educational platform.
Current module: ${courseContext.currentModule}
Student level: ${courseContext.studentLevel}/100

Guidelines:
- Be encouraging and supportive
- Explain concepts clearly at the student's level
- Use examples when helpful
- If the student seems confused, offer to break down the concept further
${ragContext ? `\nRelevant course materials:\n${ragContext.join('\n')}` : ''}`;

    return this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: studentQuery }
    ], { temperature: 0.7 });
  }

  // Generación de contenido de cursos
  async generateCourseContent(schema: {
    topic: string;
    targetAudience: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    modules: number;
  }): Promise<object> {
    const prompt = `Generate educational course content with the following structure:
Topic: ${schema.topic}
Target Audience: ${schema.targetAudience}
Difficulty: ${schema.difficulty}
Number of Modules: ${schema.modules}

Return a JSON object with:
{
  "title": "Course Title",
  "description": "Course description",
  "modules": [
    {
      "title": "Module Title",
      "lessons": [
        {
          "title": "Lesson Title",
          "content": "Lesson content",
          "quiz": {
            "questions": [...]
          }
        }
      ]
    }
  ]
}`;

    const response = await this.chat([
      { role: 'system', content: 'You are a curriculum designer. Always respond with valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.3, maxTokens: 4096 });

    return JSON.parse(response);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.endpoint}/v1/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Singleton export
export const nimService = new NVIDIANIMService();
```

### Variables de Entorno

```bash
# backend/.env

# NVIDIA NIM Configuration
NVIDIA_NIM_ENDPOINT=http://your-brev-instance-ip:8000
NVIDIA_NIM_MODEL=meta/llama-3.1-8b-instruct
NGC_API_KEY=your-ngc-api-key

# Toggle between local and NIM inference
USE_NVIDIA_NIM=true
```

### API Endpoint para AI Tutor

```typescript
// backend/src/functions/aiTutor.ts

import { Request, Response } from 'express';
import { nimService } from '../services/nvidia-nim.service';

export async function aiTutorHandler(req: Request, res: Response) {
  try {
    const { query, courseId, moduleId } = req.body;
    const userId = req.user?.id;

    // Get course context
    const course = await getCourse(courseId);
    const module = course.modules.find(m => m.id === moduleId);
    const userProgress = await getUserProgress(userId, courseId);

    // Get RAG context if available
    const ragContext = await getRelevantContent(query, courseId);

    // Call NIM service
    const response = await nimService.tutorResponse(
      query,
      {
        courseName: course.title,
        currentModule: module?.title || 'Introduction',
        studentLevel: userProgress?.level || 1
      },
      ragContext
    );

    // Log interaction for analytics
    await logTutorInteraction({
      userId,
      courseId,
      query,
      response,
      timestamp: new Date()
    });

    res.json({
      success: true,
      response,
      metadata: {
        model: 'nvidia-nim-llama-3.1-8b',
        tokensUsed: response.length // approximate
      }
    });

  } catch (error) {
    console.error('AI Tutor error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate response'
    });
  }
}
```

---

## 📊 Benchmark: RTX 3090 vs A100 NIM

Crea este script para comparar rendimiento:

```python
# benchmark/compare_inference.py

import time
import requests
import statistics

def benchmark_endpoint(url, num_requests=20):
    """Benchmark an inference endpoint"""
    latencies = []
    tokens_per_second = []
    
    payload = {
        "model": "meta/llama-3.1-8b-instruct",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Explain quantum computing in 100 words."}
        ],
        "max_tokens": 150
    }
    
    for i in range(num_requests):
        start = time.time()
        response = requests.post(f"{url}/v1/chat/completions", json=payload)
        end = time.time()
        
        latency = end - start
        latencies.append(latency)
        
        if response.ok:
            data = response.json()
            tokens = data.get('usage', {}).get('completion_tokens', 100)
            tokens_per_second.append(tokens / latency)
        
        print(f"Request {i+1}: {latency:.3f}s")
    
    return {
        "avg_latency": statistics.mean(latencies),
        "p50_latency": statistics.median(latencies),
        "p95_latency": sorted(latencies)[int(0.95 * len(latencies))],
        "avg_tokens_per_sec": statistics.mean(tokens_per_second) if tokens_per_second else 0
    }

if __name__ == "__main__":
    print("=" * 50)
    print("Benchmarking RTX 3090 (Local)")
    print("=" * 50)
    local_results = benchmark_endpoint("http://localhost:8080")  # Your local inference
    
    print("\n" + "=" * 50)
    print("Benchmarking A100 (NVIDIA NIM via Brev)")
    print("=" * 50)
    nim_results = benchmark_endpoint("http://your-brev-ip:8000")
    
    print("\n" + "=" * 50)
    print("COMPARISON RESULTS")
    print("=" * 50)
    print(f"\nRTX 3090 (Local):")
    print(f"  Avg Latency: {local_results['avg_latency']:.3f}s")
    print(f"  P50 Latency: {local_results['p50_latency']:.3f}s")
    print(f"  Tokens/sec: {local_results['avg_tokens_per_sec']:.1f}")
    
    print(f"\nA100 NIM (Brev):")
    print(f"  Avg Latency: {nim_results['avg_latency']:.3f}s")
    print(f"  P50 Latency: {nim_results['p50_latency']:.3f}s")
    print(f"  Tokens/sec: {nim_results['avg_tokens_per_sec']:.1f}")
    
    speedup = local_results['avg_latency'] / nim_results['avg_latency']
    print(f"\n📈 A100 is {speedup:.1f}x faster than RTX 3090")
```

---

## 💰 Costos Estimados en Brev

| Instancia | GPU | Precio/hora | Uso recomendado |
|-----------|-----|-------------|-----------------|
| A100 40GB | 1x A100 | ~$2.00 | Development, testing |
| A100 80GB | 1x A100 | ~$3.00 | Production, large models |
| H100 80GB | 1x H100 | ~$4.50 | Maximum performance |

**Presupuesto sugerido para aprendizaje:**
- 20 horas de A100 = ~$40
- Suficiente para completar el roadmap básico

---

## ✅ Checklist de Hoy

- [ ] Crear cuenta en brev.nvidia.com
- [ ] Instalar Brev CLI
- [ ] Crear instancia A100
- [ ] SSH a la instancia
- [ ] Pull NIM container
- [ ] Run NIM container
- [ ] Hacer primer request de prueba
- [ ] Guardar screenshots/logs para portfolio

---

## 📸 Capturas para tu Portfolio

Guarda screenshots de:
1. Dashboard de Brev con instancia A100
2. `nvidia-smi` mostrando la A100
3. Docker logs del NIM startup
4. Response de tu primer request
5. Benchmark results

---

## 🎯 Después de Completar

1. **Actualiza tu LinkedIn:**
   ```
   🚀 Just deployed my first NVIDIA NIM on A100 infrastructure!
   
   Building AI-powered tutoring for my EdTech platform Kaido using 
   enterprise-grade NVIDIA inference. 
   
   #NVIDIA #HPC #AI #MachineLearning
   ```

2. **Envía update a Mio:**
   - Screenshot del benchmark
   - Link a demo (si tienes)
   - Pregunta por feedback

3. **Siguiente paso:**
   - Aprender Slurm (ver NVIDIA_HPC_ROADMAP.md)

---

## ❓ Troubleshooting

### Error: "Container won't start"
```bash
# Verificar GPU
nvidia-smi

# Verificar Docker GPU support
docker run --gpus all nvidia/cuda:12.2-base nvidia-smi

# Verificar logs
docker logs kaido-nim
```

### Error: "NGC authentication failed"
```bash
# Re-login a NGC
docker logout nvcr.io
docker login nvcr.io
# Username: $oauthtoken
# Password: <NGC API Key>
```

### Error: "Out of memory"
```bash
# Usar modelo más pequeño
docker run -d \
  --name kaido-nim \
  --gpus all \
  -p 8000:8000 \
  -e NGC_API_KEY=$NGC_API_KEY \
  nvcr.io/nim/meta/llama-3.1-8b-instruct:latest  # 8B instead of 70B
```

---

## 🔗 Referencias

- **Brev Docs:** https://docs.brev.dev
- **NGC Catalog:** https://catalog.ngc.nvidia.com
- **NIM Documentation:** https://docs.nvidia.com/nim/
- **NIM API Reference:** https://docs.nvidia.com/nim/llm/latest/api-reference.html

---

**¡Comienza AHORA!** Cada hora de práctica te acerca más a NVIDIA 🚀

