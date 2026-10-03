---
name: fxsecurity
description: Auditoría de seguridad de un proyecto completo antes de hacerlo público o desplegarlo (repo, demo de un video, app en producción). Busca secretos filtrados, autorización rota, falta de rate limiting y límites de gasto, entradas sin validar, infraestructura expuesta, dependencias vulnerables y riesgos propios de mostrar el proyecto en un video. Usar cuando el usuario pida "audita la seguridad", "es seguro publicar esto", "security audit", "revisa vulnerabilidades" o invoque /fxsecurity.
---

# fxsecurity

Auditoría de seguridad de **todo el proyecto**, pensada para código que va a ser público: un repo abierto, una demo desplegada, un proyecto que se muestra en un video. No es un review de diff (para eso está `fxreview`): mira el estado completo y asume que alguien hostil va a leer el código y probar la app desde afuera.

## Alcance

1. Determina qué auditar: la ruta o repo que pase el usuario, o el directorio actual. Si es un monorepo, audita cada paquete desplegable.
2. Identifica el stack antes de opinar (lenguaje, framework, base de datos, proveedor de auth, dónde se despliega, si llama APIs de IA o de pago). Lee `package.json`, `go.mod`, `requirements.txt`, `Dockerfile`, `docker-compose*.yml`, `.github/workflows/`, migraciones y la configuración del servidor.
3. No modifiques código ni rotes nada. El resultado es un informe. Solo aplica arreglos si el usuario lo pide después.
4. Solo análisis pasivo sobre el proyecto del usuario. No ataques, escanees puertos ni hagas fuzzing contra hosts, aunque sean de producción. Si hay una URL desplegada, como mucho revisa cabeceras con una petición normal y solo si el usuario lo pide.

## Método

Corre esto antes de leer a mano; cada comando que no exista se omite y se dice en el informe.

```bash
git ls-files | grep -i -E '(^|/)\.env($|\.)|\.pem$|\.key$|id_rsa|credentials|\.p12$|\.sqlite$|\.db$'   # archivos sensibles versionados
gitleaks detect --no-banner --redact 2>/dev/null || trufflehog git file://. --only-verified 2>/dev/null   # secretos en el historial
git log --all --oneline -G'sk_live|AKIA[0-9A-Z]{12}|BEGIN (RSA |EC )?PRIVATE KEY' 2>/dev/null | head -50   # fallback sin herramientas
npm audit --omit=dev 2>/dev/null || pnpm audit --prod 2>/dev/null || pip-audit 2>/dev/null || govulncheck ./... 2>/dev/null
```

Luego busca con Grep los patrones de riesgo: `origin: '*'`, `dangerouslySetInnerHTML`, `innerHTML`, `eval(`, `exec(` / `child_process` con input del usuario, concatenación de SQL, `rejectUnauthorized: false`, `0.0.0.0` en puertos de bases de datos.

## Checklist (revisar SIEMPRE, en este orden de prioridad)

### 1. Secretos
- Claves, tokens o contraseñas en el código, en el historial de git, en `docker-compose.yml`, en workflows o en capturas y logs del repo.
- `.env` fuera de `.gitignore`; existe `.env.example` solo con nombres y valores falsos.
- Claves de servidor expuestas al navegador (`NEXT_PUBLIC_*`, `VITE_*`, `service_role` de Supabase en el cliente).
- Si un secreto estuvo en el historial, se reporta como **comprometido**: hay que rotarlo, no basta con borrar el commit.
- **Videos:** cualquier clave que aparezca en pantalla se considera filtrada (los espectadores pausan, y hay bots que leen transcripciones). Recomienda claves de prueba con límite de gasto y revocarlas al terminar de grabar.

### 2. Autenticación y autorización
- Cada endpoint comprueba que el usuario puede tocar **ese** recurso, no solo que está logueado (IDOR: cambiar `/pedido/12` por `/pedido/13`).
- Rutas de administración protegidas en el servidor, no solo escondidas en el frontend.
- Auth propia: contraseñas con argon2 o bcrypt, sesiones o JWT con expiración, rotación del refresh token, sin enumeración de usuarios en login y recuperación.
- Supabase: RLS activado en **todas** las tablas expuestas, y políticas que filtren por usuario. Una tabla sin RLS es pública con la clave anon.
- Principio de mínimo privilegio en roles de base de datos y en tokens de terceros.

### 3. Abuso y costos
- Rate limiting en login, registro, recuperación de contraseña y cualquier endpoint caro.
- Captcha o Turnstile en formularios públicos.
- Endpoints que llaman a APIs de IA o de pago: ¿hay límite por usuario y **límite de gasto** en el proveedor? Un endpoint público sin tope es una factura abierta.
- Paginación y límites de tamaño en listados, subidas y cuerpos de petición.

### 4. Entradas y salidas
- Validación en el servidor (Zod o similar), no solo en el frontend.
- SQL parametrizado u ORM; sin concatenar input en consultas ni en comandos de shell.
- HTML escapado (XSS), CSRF en sesiones con cookies, CORS con orígenes concretos y nunca `*` con credenciales.
- Subida de archivos: tipo y tamaño validados, nombres no confiables, almacenamiento fuera del servidor web (S3 con URLs firmadas).
- Webhooks (Stripe y otros): firma verificada antes de procesar.
- SSRF: endpoints que descargan una URL que manda el usuario.

### 5. Infraestructura y despliegue
- Solo HTTPS; cookies con `Secure`, `HttpOnly` y `SameSite`.
- Cabeceras: CSP, HSTS, `X-Content-Type-Options`, `frame-ancestors`.
- Postgres, Redis, Mongo, paneles admin y puertos de depuración no expuestos a internet ni mapeados a `0.0.0.0` sin necesidad.
- Credenciales por defecto, `DEBUG=true`, stack traces o errores SQL visibles al usuario, endpoints de debug o de salud con información interna.
- Contenedores sin root, imágenes base fijadas, sin secretos en capas de la imagen.
- Backups y plan para restaurar.

### 6. Dependencias y cadena de suministro
- Lockfile versionado; vulnerabilidades de `audit` en dependencias de producción (separa dev de prod).
- Paquetes abandonados o con nombre casi igual a uno conocido (typosquatting); scripts `postinstall` sospechosos.
- GitHub Actions: permisos mínimos en `permissions:`, acciones de terceros fijadas por versión o SHA, secretos no expuestos a PRs de forks (`pull_request_target`).
- 2FA en GitHub, npm, dominio, hosting y las cuentas de la plataforma de video. Recomiéndalo aunque no se pueda verificar desde el código.

### 7. Apps con IA o agentes
- Prompt injection: todo texto externo (web, correos, documentos, input de usuarios) es no confiable.
- Herramientas del agente con permisos mínimos; acciones destructivas o de pago con confirmación humana.
- La salida del modelo no se ejecuta ni se renderiza sin sanear.
- Sin datos de otros usuarios mezclados en el contexto (RAG multi-tenant filtrado por usuario).

### 8. Privacidad y operación
- Datos personales: qué se guarda, por qué y cómo se borra. Nada de PII ni secretos en logs.
- Logs y alertas suficientes para enterarse de un abuso.
- Existe `SECURITY.md` o una forma de reportar vulnerabilidades si el repo es público.
- **Código de ejemplo de un video:** advierte en el README qué falta para producción (auth, límites, backups). Mucha gente desplegará la demo tal cual.

## Formato del informe

Ordena los hallazgos por severidad, no por archivo. Cada hallazgo lleva:

- **Severidad**: `CRÍTICO` (explotable ya, o secreto filtrado), `ALTO` (explotable con poco esfuerzo o con impacto en datos o dinero), `MEDIO` (requiere condiciones o reduce defensas), `BAJO` (endurecimiento).
- **Ubicación**: `ruta/archivo.ts:línea`, o el commit si es historial.
- **Qué pasa**: una frase con el defecto.
- **Cómo se explota**: el paso concreto que haría alguien desde afuera.
- **Arreglo**: el cambio mínimo que lo corrige.

Empieza el informe con una tabla de conteo por severidad y los comandos que se pudieron correr y los que no. Termina con un veredicto en una línea (`Listo para publicar`, `Publicable tras arreglar los ALTOS` o `No publicar todavía`) y las tres acciones que más reducen el riesgo.

## Reglas

- Cada hallazgo debe ser verificable. Si no puedes señalar la línea o el commit y el paso de explotación, no lo reportes. Haz grep antes de afirmar que algo falta.
- **Nunca imprimas el valor de un secreto.** Muestra el nombre, el archivo, la línea y los primeros 4 caracteres como máximo; usa `--redact` en las herramientas.
- No rellenes: si una categoría está limpia, di "sin hallazgos" y sigue.
- Distingue lo que ves del código de lo que depende de la configuración del proveedor (RLS en el panel, límites de gasto, 2FA); lo segundo va como "verificar a mano", no como hallazgo.
- Si solo hay tiempo para cuatro categorías: secretos, autorización, abuso y costos, y entradas.
- Responde en español, con los identificadores de código en su forma original.
