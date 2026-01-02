# 🖥️ Guía Práctica de Slurm para Kaido

**Objetivo:** Aprender Slurm hands-on con aplicaciones reales para Kaido

---

## 📚 ¿Qué es Slurm?

**Slurm** (Simple Linux Utility for Resource Management) es el job scheduler más usado en HPC. Lo usa:
- 60% de los supercomputadores TOP500
- NVIDIA internamente
- Los clusters de AI más grandes del mundo

**Analogía:** Es como un "traffic controller" para GPUs. Gestiona:
- Quién usa qué GPU y cuándo
- Cola de trabajos pendientes
- Asignación óptima de recursos
- Monitoreo y logging

---

## 🛠️ Setup Local de Slurm (Docker)

### Opción 1: Slurm Docker Cluster (Recomendado)

```bash
# Crear directorio para Slurm
mkdir -p ~/kaido-slurm && cd ~/kaido-slurm

# Clonar repositorio de Slurm en Docker
git clone https://github.com/giovtorres/slurm-docker-cluster.git
cd slurm-docker-cluster

# Levantar cluster (3 nodos + controller)
docker-compose up -d

# Verificar que está corriendo
docker-compose ps

# Acceder al nodo controlador
docker exec -it slurmctld bash

# Verificar cluster
sinfo
```

**Estructura del cluster:**
```
┌─────────────────────────────────────────────┐
│              SLURM DOCKER CLUSTER           │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────┐   ┌─────────────────────┐  │
│  │  slurmctld  │   │    MySQL Database   │  │
│  │ (Controller)│   │    (slurm_acct_db)  │  │
│  └──────┬──────┘   └─────────────────────┘  │
│         │                                    │
│    ┌────┴────┬────────────┐                 │
│    │         │            │                 │
│    ▼         ▼            ▼                 │
│ ┌──────┐ ┌──────┐    ┌──────┐              │
│ │  c1  │ │  c2  │    │  c3  │              │
│ │(node)│ │(node)│    │(node)│              │
│ └──────┘ └──────┘    └──────┘              │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 📝 Comandos Básicos de Slurm

### Ver Estado del Cluster

```bash
# Ver nodos disponibles
sinfo

# Output ejemplo:
# PARTITION AVAIL TIMELIMIT NODES STATE NODELIST
# normal*   up    infinite  3     idle  c[1-3]

# Ver detalles de nodos
sinfo -N -l

# Ver nodos con GPUs (en cluster real)
sinfo -o "%n %G %C %m"
```

### Gestión de Jobs

```bash
# Ver cola de trabajos
squeue

# Ver mis trabajos
squeue -u $USER

# Ver trabajos de todos los usuarios
squeue -a

# Ver detalles de un job
scontrol show job <JOB_ID>

# Cancelar un job
scancel <JOB_ID>

# Cancelar todos mis jobs
scancel -u $USER
```

### Submeter Jobs

```bash
# Submeter script de batch
sbatch my_job.sh

# Job interactivo
srun --pty bash

# Ejecutar comando directo
srun hostname

# Job con GPU (en cluster real)
srun --gres=gpu:1 nvidia-smi
```

---

## 📄 Scripts de Slurm para Kaido

### Script 1: Generación de Curso Simple

```bash
#!/bin/bash
#SBATCH --job-name=kaido_course_gen
#SBATCH --output=logs/course_%j.out
#SBATCH --error=logs/course_%j.err
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=4
#SBATCH --mem=16G
#SBATCH --time=01:00:00
#SBATCH --partition=normal

# Variables de entorno
export COURSE_NAME="Introduction to Python"
export OUTPUT_DIR="/data/courses"

# Crear directorio de output
mkdir -p $OUTPUT_DIR

echo "===================="
echo "Job ID: $SLURM_JOB_ID"
echo "Running on: $(hostname)"
echo "Started at: $(date)"
echo "===================="

# Simular generación de curso
echo "Generating course: $COURSE_NAME"
sleep 10  # Simular trabajo

# Crear output
cat > $OUTPUT_DIR/course_${SLURM_JOB_ID}.json << EOF
{
  "title": "$COURSE_NAME",
  "generated_by": "kaido-slurm",
  "job_id": "$SLURM_JOB_ID",
  "node": "$(hostname)",
  "timestamp": "$(date -Iseconds)"
}
EOF

echo "Course generated: $OUTPUT_DIR/course_${SLURM_JOB_ID}.json"
echo "Finished at: $(date)"
```

**Uso:**
```bash
# Guardar como: slurm/course_gen.sh
sbatch slurm/course_gen.sh

# Ver status
squeue -u $USER

# Ver output
cat logs/course_<job_id>.out
```

---

### Script 2: Array Job - Generación Paralela de Cursos

```bash
#!/bin/bash
#SBATCH --job-name=kaido_batch_gen
#SBATCH --output=logs/batch_%A_%a.out
#SBATCH --error=logs/batch_%A_%a.err
#SBATCH --array=1-10%5    # 10 jobs, máximo 5 concurrentes
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=2
#SBATCH --mem=8G
#SBATCH --time=00:30:00
#SBATCH --partition=normal

# Cada tarea del array procesa un curso diferente
COURSE_ID=$SLURM_ARRAY_TASK_ID
TOTAL_COURSES=$SLURM_ARRAY_TASK_COUNT

echo "===================="
echo "Array Job: $SLURM_ARRAY_JOB_ID"
echo "Task ID: $COURSE_ID of $TOTAL_COURSES"
echo "Running on: $(hostname)"
echo "===================="

# Lista de temas de cursos
TOPICS=(
  "Python Basics"
  "Machine Learning 101"
  "Data Visualization"
  "SQL Fundamentals"
  "Web Development"
  "Cloud Computing"
  "Cybersecurity Intro"
  "DevOps Essentials"
  "AI Ethics"
  "Project Management"
)

# Obtener tema para este task
TOPIC=${TOPICS[$((COURSE_ID-1))]}

echo "Generating course: $TOPIC"

# Simular generación (reemplazar con tu lógica real)
OUTPUT_DIR="/data/courses/batch_${SLURM_ARRAY_JOB_ID}"
mkdir -p $OUTPUT_DIR

# Simular trabajo variable
SLEEP_TIME=$((RANDOM % 10 + 5))
echo "Processing time: ${SLEEP_TIME}s"
sleep $SLEEP_TIME

# Crear output
cat > $OUTPUT_DIR/course_${COURSE_ID}.json << EOF
{
  "id": $COURSE_ID,
  "title": "$TOPIC",
  "status": "completed",
  "array_job_id": "$SLURM_ARRAY_JOB_ID",
  "task_id": "$SLURM_ARRAY_TASK_ID",
  "node": "$(hostname)",
  "processing_time_seconds": $SLEEP_TIME,
  "timestamp": "$(date -Iseconds)"
}
EOF

echo "Completed: $OUTPUT_DIR/course_${COURSE_ID}.json"
```

**Uso:**
```bash
# Guardar como: slurm/batch_courses.sh
sbatch slurm/batch_courses.sh

# Ver progreso del array
squeue -u $USER

# Output:
#  JOBID PARTITION     NAME     USER ST TIME NODES NODELIST
#  101_1 normal  batch    user  R  0:05 1     c1
#  101_2 normal  batch    user  R  0:05 1     c2
#  101_3 normal  batch    user  PD 0:00 1     (Resources)
```

---

### Script 3: Job con GPU (Para Cluster Real)

```bash
#!/bin/bash
#SBATCH --job-name=kaido_inference
#SBATCH --output=logs/inference_%j.out
#SBATCH --error=logs/inference_%j.err
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --gres=gpu:a100:1     # Request 1 A100 GPU
#SBATCH --cpus-per-task=8
#SBATCH --mem=64G
#SBATCH --time=02:00:00
#SBATCH --partition=gpu

# Load modules (en cluster real)
module load cuda/12.2
module load python/3.11

# Activate virtual environment
source /path/to/kaido-env/bin/activate

echo "===================="
echo "Job ID: $SLURM_JOB_ID"
echo "Node: $(hostname)"
echo "GPU Info:"
nvidia-smi --query-gpu=name,memory.total,memory.free --format=csv
echo "===================="

# Set CUDA device
export CUDA_VISIBLE_DEVICES=0

# Run inference
python - << 'PYTHON_SCRIPT'
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

print(f"CUDA available: {torch.cuda.is_available()}")
print(f"Device: {torch.cuda.get_device_name(0)}")

# Load model
model_name = "meta-llama/Llama-3.1-8B-Instruct"
print(f"Loading model: {model_name}")

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.bfloat16,
    device_map="auto"
)

# Generate
prompt = "Explain machine learning to a beginner in 3 sentences."
inputs = tokenizer(prompt, return_tensors="pt").to("cuda")

with torch.no_grad():
    outputs = model.generate(**inputs, max_new_tokens=100)
    
response = tokenizer.decode(outputs[0], skip_special_tokens=True)
print(f"\nPrompt: {prompt}")
print(f"Response: {response}")
PYTHON_SCRIPT

echo "===================="
echo "Job completed at: $(date)"
```

---

### Script 4: Multi-Node Distributed Training

```bash
#!/bin/bash
#SBATCH --job-name=kaido_distributed
#SBATCH --output=logs/distributed_%j.out
#SBATCH --error=logs/distributed_%j.err
#SBATCH --nodes=2                    # 2 nodes
#SBATCH --ntasks-per-node=4          # 4 GPUs per node
#SBATCH --gres=gpu:a100:4            # Request 4 A100s per node
#SBATCH --cpus-per-task=12
#SBATCH --mem=0                      # Use all available memory
#SBATCH --time=24:00:00
#SBATCH --partition=gpu-large

# Load modules
module load cuda/12.2
module load nccl/2.18

# Setup distributed environment
export MASTER_ADDR=$(scontrol show hostnames $SLURM_JOB_NODELIST | head -n 1)
export MASTER_PORT=29500
export WORLD_SIZE=$((SLURM_NNODES * SLURM_NTASKS_PER_NODE))

echo "===================="
echo "Distributed Training Setup"
echo "Master: $MASTER_ADDR:$MASTER_PORT"
echo "World Size: $WORLD_SIZE"
echo "Nodes: $SLURM_NNODES"
echo "GPUs per node: $SLURM_NTASKS_PER_NODE"
echo "===================="

# Run distributed training
srun python -m torch.distributed.launch \
    --nproc_per_node=$SLURM_NTASKS_PER_NODE \
    --nnodes=$SLURM_NNODES \
    --node_rank=$SLURM_NODEID \
    --master_addr=$MASTER_ADDR \
    --master_port=$MASTER_PORT \
    training/distributed_train.py \
        --model meta-llama/Llama-3.1-8B-Instruct \
        --dataset /data/kaido_education \
        --output-dir /models/kaido-v1 \
        --epochs 3 \
        --batch-size-per-gpu 4 \
        --gradient-accumulation-steps 4
```

---

## 📊 Monitoreo de Jobs

### Script de Monitoreo

```bash
#!/bin/bash
# monitor_jobs.sh - Monitor Slurm jobs in real-time

watch -n 2 '
echo "=== SLURM JOB MONITOR ==="
echo ""
echo "Cluster Status:"
sinfo -o "%P %a %l %D %t %N"
echo ""
echo "Queue Status:"
squeue -o "%.10i %.15j %.8u %.2t %.10M %.6D %R"
echo ""
echo "GPU Usage (if available):"
squeue -o "%.10i %.8u %.6D %.10b %.10M" | head -10
'
```

### Ver Uso de Recursos

```bash
# Ver historial de jobs
sacct -u $USER --format=JobID,JobName,Start,End,State,ExitCode,Elapsed,AllocCPUS,MaxRSS

# Ver eficiencia de un job
seff <JOB_ID>

# Ver uso de GPU de un job corriendo
srun --jobid=<JOB_ID> nvidia-smi
```

---

## 🔄 Integración con Backend de Kaido

### Job Submission Service

```typescript
// backend/src/services/slurm.service.ts

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface SlurmJobConfig {
  jobName: string;
  script: string;
  partition?: string;
  nodes?: number;
  gpus?: number;
  memory?: string;
  time?: string;
  arrayTasks?: number;
  maxConcurrent?: number;
}

interface SlurmJobStatus {
  jobId: string;
  state: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  node?: string;
  startTime?: string;
  endTime?: string;
}

export class SlurmService {
  private sshHost: string;

  constructor() {
    this.sshHost = process.env.SLURM_CLUSTER_HOST || 'slurm-head-node';
  }

  // Submit a job to Slurm
  async submitJob(config: SlurmJobConfig): Promise<string> {
    const slurmDirectives = this.buildDirectives(config);
    const scriptContent = `#!/bin/bash\n${slurmDirectives}\n${config.script}`;
    
    // Write script to temp file and submit
    const tempFile = `/tmp/kaido_job_${Date.now()}.sh`;
    const { stdout } = await execAsync(
      `ssh ${this.sshHost} 'cat > ${tempFile} && sbatch ${tempFile}'`,
      { input: scriptContent }
    );
    
    // Extract job ID from "Submitted batch job 12345"
    const jobId = stdout.match(/Submitted batch job (\d+)/)?.[1];
    if (!jobId) throw new Error('Failed to submit job');
    
    return jobId;
  }

  // Get job status
  async getJobStatus(jobId: string): Promise<SlurmJobStatus> {
    const { stdout } = await execAsync(
      `ssh ${this.sshHost} 'squeue -j ${jobId} -h -o "%i|%T|%N|%S"' 2>/dev/null || sacct -j ${jobId} -n -o "JobID,State,NodeList,Start,End" -P`
    );
    
    const parts = stdout.trim().split('|');
    return {
      jobId: parts[0],
      state: parts[1] as SlurmJobStatus['state'],
      node: parts[2],
      startTime: parts[3],
      endTime: parts[4]
    };
  }

  // Cancel a job
  async cancelJob(jobId: string): Promise<void> {
    await execAsync(`ssh ${this.sshHost} 'scancel ${jobId}'`);
  }

  // Submit course generation batch
  async submitCourseGeneration(courses: Array<{
    id: string;
    topic: string;
    config: object;
  }>): Promise<string[]> {
    const jobIds: string[] = [];
    
    // Create config files for each course
    for (const course of courses) {
      const configPath = `/data/configs/course_${course.id}.json`;
      await execAsync(
        `ssh ${this.sshHost} 'echo ${JSON.stringify(course.config)} > ${configPath}'`
      );
    }
    
    // Submit array job
    const jobId = await this.submitJob({
      jobName: 'kaido_course_batch',
      arrayTasks: courses.length,
      maxConcurrent: 10,
      script: `
        COURSE_ID=\$SLURM_ARRAY_TASK_ID
        CONFIG_FILE="/data/configs/course_\${COURSE_ID}.json"
        
        python /app/generate_course.py \\
          --config \$CONFIG_FILE \\
          --output /data/courses/
      `
    });
    
    return [jobId];
  }

  private buildDirectives(config: SlurmJobConfig): string {
    const lines = [
      `#SBATCH --job-name=${config.jobName}`,
      `#SBATCH --output=logs/${config.jobName}_%j.out`,
      `#SBATCH --error=logs/${config.jobName}_%j.err`,
    ];
    
    if (config.partition) lines.push(`#SBATCH --partition=${config.partition}`);
    if (config.nodes) lines.push(`#SBATCH --nodes=${config.nodes}`);
    if (config.gpus) lines.push(`#SBATCH --gres=gpu:${config.gpus}`);
    if (config.memory) lines.push(`#SBATCH --mem=${config.memory}`);
    if (config.time) lines.push(`#SBATCH --time=${config.time}`);
    if (config.arrayTasks) {
      const arraySpec = config.maxConcurrent 
        ? `1-${config.arrayTasks}%${config.maxConcurrent}`
        : `1-${config.arrayTasks}`;
      lines.push(`#SBATCH --array=${arraySpec}`);
    }
    
    return lines.join('\n');
  }
}

export const slurmService = new SlurmService();
```

---

## 📈 Métricas para tu CV

Después de completar esta práctica, podrás decir:

```markdown
## HPC/Slurm Experience

- Designed and implemented Slurm job scheduling for ML batch processing
- Created array jobs to parallelize course generation, reducing time by 8x
- Managed GPU resource allocation across multi-node cluster
- Integrated Slurm with backend API for automated job submission
- Monitored cluster efficiency achieving 90%+ GPU utilization
```

---

## ✅ Checklist de Práctica

### Semana 1: Fundamentos
- [ ] Setup Slurm Docker cluster
- [ ] Aprender comandos básicos (sinfo, squeue, sbatch)
- [ ] Crear y ejecutar primer script batch
- [ ] Entender output y logs

### Semana 2: Jobs Avanzados
- [ ] Crear array jobs
- [ ] Implementar dependencias entre jobs
- [ ] Monitorear utilización de recursos
- [ ] Integrar con backend de Kaido

### Semana 3: Producción
- [ ] Conectar a cluster real (Brev u otro)
- [ ] Ejecutar jobs con GPU
- [ ] Optimizar configuración
- [ ] Documentar métricas

---

## 🔗 Recursos

- **Slurm Docs:** https://slurm.schedmd.com/documentation.html
- **Slurm Cheat Sheet:** https://slurm.schedmd.com/pdfs/summary.pdf
- **HPC Carpentry:** https://hpc-carpentry.github.io/hpc-shell/
- **NVIDIA DLI:** https://www.nvidia.com/en-us/training/

---

**Siguiente paso:** Combinar NIMs + Slurm en un pipeline completo para Kaido 🚀

