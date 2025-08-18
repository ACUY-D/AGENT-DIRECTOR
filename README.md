# MCP Role Director

Un servidor MCP (Model Context Protocol) que proporciona dirección de roles y guía metodológica BMAD para agentes de IA como Cursor, Copilot y otros.

## 🎯 Propósito

MCP Role Director **NO es un sistema de orquestación autónoma**. Es un servidor que proporciona:

- **Guía de Roles**: Define comportamientos específicos para cada rol (Arquitecto, Developer, Tester, etc.)
- **Metodología BMAD**: Estructura proyectos en fases BUILD → MEASURE → ANALYZE → DEPLOY
- **Transiciones Inteligentes**: Sugiere cuándo y cómo cambiar entre roles
- **Checklists y Best Practices**: Proporciona guías paso a paso para cada rol

## 🚀 Diferencia Clave

### ❌ Lo que NO hace:
- No ejecuta código autónomamente
- No llama a APIs externas
- No configura modelos de IA (GPT-4, Claude, etc.)
- No coordina múltiples agentes

### ✅ Lo que SÍ hace:
- Proporciona instrucciones sobre qué rol adoptar
- Define metodología estructurada de trabajo
- Sugiere transiciones entre roles según el contexto
- Ofrece checklists y guías para cada fase

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/yourusername/mcp-role-director.git
cd mcp-role-director

# Instalar dependencias
npm install

# Compilar TypeScript
npm run build

# Ejecutar el servidor
npm start
```

## 🛠️ Herramientas Disponibles

### 1. `role.getCurrentInstructions`
Obtiene instrucciones específicas para un rol en una fase BMAD.

**Parámetros:**
- `role`: El rol actual (architect, developer, tester, etc.)
- `phase`: La fase BMAD actual (BUILD, MEASURE, ANALYZE, DEPLOY)
- `context`: Contexto opcional del proyecto

**Ejemplo de uso:**
```json
{
  "role": "developer",
  "phase": "BUILD",
  "context": "Implementando API REST"
}
```

### 2. `role.transition`
Sugiere transiciones a otros roles basándose en el contexto actual.

**Parámetros:**
- `currentRole`: Rol actual
- `currentPhase`: Fase BMAD actual
- `completedTasks`: Lista de tareas completadas
- `issues`: Problemas encontrados (opcional)

**Ejemplo de uso:**
```json
{
  "currentRole": "developer",
  "currentPhase": "BUILD",
  "completedTasks": ["API implementada", "Tests unitarios escritos"],
  "issues": []
}
```

### 3. `workflow.startProject`
Inicia un nuevo proyecto con metodología BMAD.

**Parámetros:**
- `projectName`: Nombre del proyecto
- `projectType`: Tipo de proyecto (web, api, mobile, etc.)
- `description`: Descripción del proyecto
- `initialRequirements`: Requisitos iniciales

**Ejemplo de uso:**
```json
{
  "projectName": "E-commerce Platform",
  "projectType": "web",
  "description": "Plataforma de comercio electrónico",
  "initialRequirements": ["Carrito de compras", "Sistema de pagos"]
}
```

### 4. `bmad.getPhaseGuidance`
Obtiene guía específica para una fase BMAD.

**Parámetros:**
- `phase`: Fase BMAD (BUILD, MEASURE, ANALYZE, DEPLOY)
- `projectContext`: Contexto del proyecto

## 🎭 Roles Disponibles

### 1. **Architect** (Arquitecto)
- **Fase Principal**: BUILD
- **Responsabilidades**: Diseño de arquitectura, patrones, componentes
- **Transiciones**: → Developer, Tester

### 2. **Developer** (Desarrollador)
- **Fase Principal**: BUILD
- **Responsabilidades**: Implementación, código limpio, tests unitarios
- **Transiciones**: → Tester, Debugger, Architect

### 3. **Tester** (Probador)
- **Fase Principal**: MEASURE
- **Responsabilidades**: Validación, pruebas, métricas de calidad
- **Transiciones**: → Debugger, Developer, DevOps

### 4. **Debugger** (Depurador)
- **Fase Principal**: ANALYZE
- **Responsabilidades**: Diagnóstico, resolución de problemas, análisis
- **Transiciones**: → Developer, Tester, Architect

### 5. **DevOps** (Operaciones)
- **Fase Principal**: DEPLOY
- **Responsabilidades**: CI/CD, infraestructura, monitoreo
- **Transiciones**: → Developer, Tester, Analyst

### 6. **Analyst** (Analista)
- **Fase Principal**: ANALYZE
- **Responsabilidades**: Métricas, insights, decisiones basadas en datos
- **Transiciones**: → Architect, Developer, DevOps

## 🔄 Metodología BMAD

### BUILD (Construir)
- Diseño inicial
- Implementación de funcionalidades
- Desarrollo de código

### MEASURE (Medir)
- Ejecución de pruebas
- Recolección de métricas
- Evaluación de calidad

### ANALYZE (Analizar)
- Identificación de problemas
- Análisis de rendimiento
- Generación de insights

### DEPLOY (Desplegar)
- Preparación para producción
- Ejecución de deployment
- Monitoreo post-deployment

## 💡 Ejemplo de Uso con Cursor/Copilot

1. **Iniciar un proyecto:**
```typescript
// El agente solicita al MCP iniciar un proyecto
const result = await mcp.call('workflow.startProject', {
  projectName: 'Mi API',
  projectType: 'api',
  description: 'API REST para gestión de usuarios'
});
```

2. **Obtener instrucciones para rol actual:**
```typescript
// El agente pide guía para su rol actual
const instructions = await mcp.call('role.getCurrentInstructions', {
  role: 'architect',
  phase: 'BUILD',
  context: 'Diseñando arquitectura de microservicios'
});
```

3. **Solicitar transición de rol:**
```typescript
// El agente consulta si debe cambiar de rol
const transition = await mcp.call('role.transition', {
  currentRole: 'developer',
  currentPhase: 'BUILD',
  completedTasks: ['API implementada'],
  issues: ['Tests fallando']
});
// Respuesta: Transición sugerida a rol 'tester' o 'debugger'
```

## 🏗️ Arquitectura

```
mcp-role-director/
├── src/
│   ├── index.ts              # Servidor MCP principal
│   ├── tools/                # Herramientas MCP
│   │   ├── role.director.ts  # Director de roles
│   │   ├── role.transition.ts # Transiciones entre roles
│   │   ├── bmad.workflow.ts  # Flujo de trabajo BMAD
│   │   └── index.ts          # Registro de herramientas
│   ├── resources/
│   │   └── roles/            # Definiciones JSON de roles
│   │       ├── architect.json
│   │       ├── developer.json
│   │       ├── tester.json
│   │       ├── debugger.json
│   │       ├── devops.json
│   │       └── analyst.json
│   └── utils/
│       └── logger.ts         # Sistema de logging
```

## 🔧 Configuración

Variables de entorno opcionales:

```bash
LOG_LEVEL=info  # debug, info, warn, error
NODE_ENV=development  # development, production
```

## 📝 Licencia

MIT

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Para preguntas y soporte, abre un issue en GitHub.

---

**Nota**: Este es un servidor MCP de guía y metodología. No ejecuta código ni gestiona infraestructura directamente. Su propósito es proporcionar dirección estructurada a agentes de IA que sí tienen esas capacidades.