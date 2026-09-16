---
name: fxreview
description: Code review completo de los cambios actuales (diff, rama, PR o carpeta). Revisa correccion, seguridad, datos, API, mantenibilidad, tests, operacion e higiene del PR. Usar cuando el usuario pida "review", "revisa el codigo", "code review", "revisa el PR" o invoque /fxreview.
---

# fxreview

Revision de codigo con checklist fijo. No es un linter: busca bugs reales, riesgos de seguridad y deuda que cueste caro despues.

## Alcance

1. Determina que revisar, en este orden:
    - Si el usuario pasa un argumento (numero de PR, rama, ruta), usa eso.
    - Si no, usa `git diff` (staged + unstaged). Si esta vacio, usa `git diff main...HEAD` (o la rama base del proyecto).
    - Si tampoco hay nada, pregunta que revisar.
2. Lee el diff completo antes de opinar. Para cada archivo tocado, abre tambien el contexto necesario (quien llama a la funcion, el esquema, el tipo) para no reportar falsos positivos.
3. No modifiques codigo. El resultado es un informe. Solo aplica cambios si el usuario lo pide explicitamente despues.

## Checklist (revisar SIEMPRE, en este orden de prioridad)

### 1. Correccion
- Logica y casos borde: nulos, listas vacias, off-by-one, condiciones invertidas, estados intermedios.
- Manejo de errores: catch vacios, excepciones tragadas, promesas sin `await`, errores que responden 200.
- Concurrencia: doble submit, operaciones no atomicas, race conditions, transacciones incompletas.
- Cambios de contrato: endpoints, tipos, esquemas o eventos que cambian sin actualizar a quienes los consumen.

### 2. Seguridad
- Validacion de entrada en el servidor (no solo en el frontend).
- Autorizacion por recurso: que el usuario pueda tocar ESE recurso, no solo estar logueado (IDOR).
- Secretos y datos sensibles: claves hardcodeadas, logs con tokens o contrasenas, respuestas que exponen campos de mas.
- Inyeccion: SQL sin parametrizar, HTML sin escapar, comandos de shell con input del usuario.

### 3. Datos y persistencia
- Migraciones: reversibles, sin perdida de datos, compatibles con el codigo en produccion durante el deploy.
- Consultas: N+1, falta de indices, queries sin limite ni paginacion.
- Integridad: operaciones que deberian ir en transaccion y no lo estan.

### 4. Diseno de la API
- Verbos HTTP correctos, codigos de estado coherentes, rutas y nombres consistentes con el resto del proyecto.
- Forma de las respuestas igual a las demas del proyecto (envoltorio, errores, paginacion).
- Idempotencia en PUT y DELETE.

### 5. Mantenibilidad
- Codigo huerfano: funciones, imports, variables, feature flags, rutas y archivos que nadie usa. Verifica con grep antes de reportar.
- Duplicacion: logica copiada que ya existia en otro sitio del proyecto.
- Nombres que digan lo que hacen.
- Complejidad: funciones muy largas, anidamiento profundo, abstracciones prematuras.
- Consistencia con los patrones ya establecidos en el proyecto.

### 6. Tests
- Existen para lo nuevo y cubren el caso feliz y al menos un fallo.
- Prueban comportamiento, no implementacion (un test que solo verifica mocks no vale).
- Los tests existentes no fueron desactivados ni modificados para que pasen.

### 7. Operacion
- Logs suficientes para depurar, sin ruido ni datos sensibles.
- Performance: trabajo pesado en loops, cargas grandes en memoria, llamadas externas sin timeout ni reintento.
- Configuracion: nada hardcodeado que dependa del entorno.

### 8. Higiene del PR
- Alcance: un PR hace una cosa. Mezclar refactor con feature se reporta.
- Restos: `console.log`, codigo comentado, TODOs sin ticket, archivos de debug, `.env` o binarios subidos.
- Dependencias nuevas: justificadas, mantenidas, sin vulnerabilidades conocidas.

## Formato del informe

Ordena los hallazgos por severidad, no por archivo. Cada hallazgo lleva:

- **Severidad**: `BLOQUEANTE` (rompe, expone datos o pierde datos), `IMPORTANTE` (bug probable o riesgo real), `MENOR` (calidad, estilo, deuda).
- **Ubicacion**: `ruta/archivo.ts:linea`.
- **Que pasa**: una frase con el defecto.
- **Como falla**: input o estado concreto que lo dispara.
- **Sugerencia**: el cambio minimo que lo arregla.

Al final, un veredicto en una linea: `Aprobado`, `Aprobado con cambios menores` o `Necesita cambios`, seguido de las tres cosas que mas importan.

## Reglas

- Cada hallazgo debe ser verificable. Si no puedes senalar la linea y el caso que falla, no lo reportes.
- No rellenes: si una categoria del checklist esta limpia, di "sin hallazgos" y sigue.
- Si solo hay tiempo para tres categorias, revisa correccion, seguridad y migraciones.
- Responde en espanol, con los identificadores de codigo en su forma original.
