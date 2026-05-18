# Instrucciones Obligatorias del Profesor (Módulo Despliegue)

**Mensaje del foro:**
Consideraciones importantes sobre la evaluación del módulo de Despliegue de Aplicaciones Web.
El alumnado que tenga pendiente algún Resultado de Aprendizaje (RA) del módulo deberá prestar especial atención al criterio de evaluación del proyecto que esté asociado a dicho RA (Ver rúbirca). En estos casos, ese criterio deberá estar especialmente trabajado, explicado y evidenciado dentro del proyecto integrado.

Además, todo el alumnado deberá implementar y evidenciar obligatoriamente el **Criterio 7** y el **Criterio 8**, relacionados con la gestión básica de los artefactos del despliegue y la verificación básica de red del despliegue. Estos criterios son necesarios para completar correctamente la evaluación del RA4 y del RA5 del módulo.

## IMPORTANTE:
En la documentación del proyecto integrado deberá existir un apartado específico llamado **“Despliegue de la aplicación web”**. En este apartado se incluirá la información necesaria para explicar la parte de despliegue del proyecto que consideres necesario y, especialmente, se hará referencia expresa a:

1. Los criterios asociados a los RA (Criterio 1...Criterio 6) no superados, en caso de que el alumno o alumna tenga algún RA pendiente.
2. El **Criterio 7**, relacionado con el RA4 (Gestión básica de ficheros y artefactos).
3. El **Criterio 8**, relacionado con el RA5 (Verificación básica de red del despliegue).

En ese apartado se deberá explicar cómo se han aplicado estos criterios dentro del proyecto. Para ello, se deberán incluir evidencias claras y comprobables, como por ejemplo, para cada criterio explicado:

- Enlaces o referencias a ficheros de código, preferiblemente mediante snippets o fragmentos concretos.
- Enlaces o referencias a ficheros de configuración, preferiblemente mediante snippets.
- Comandos utilizados.
- Salidas obtenidas.
- Capturas de pantalla cuando sean necesarias.
- Explicación breve de qué se ha hecho, dónde está implementado y cómo se ha verificado su funcionamiento.

La explicación debe permitir comprobar de forma clara qué se ha realizado, dónde está implementado y cómo se ha validado que funciona correctamente.
**Lo que no esté documentado y evidenciado, no está hecho.**

## Notas extraídas de la rúbrica (Imagen)
Para alcanzar el "Excelente (4)":
- **C6 (RA6):** Documentación completa. README.md que explique qué hace, requisitos, cómo arrancar y enlace a la docs. Arquitectura descrita con esquema. API documentada con endpoints, parámetros, request/response, comandos curl de prueba. Deploy explicado paso a paso desde cero.
- **C5 (RA6):** Control de versiones ordenado. GitHub Actions workflow que realiza CI (build/test) y CD (deploy automático). Historial de commits limpio.
- **C1 (RA1):** Diseño de arquitectura claro, separado en servicios (web, backend, db) justificados. Diagrama visual.
- **C2 (RA1):** Buena implementación Docker. Dockerfile limpio, `docker-compose.yml` funcional, puertos bien mapeados, volúmenes de persistencia justificados, variables de entorno (.env.example).
- **C3 (RA2):** Servidor web frontend como reverse proxy al backend. Contextos/rutas (ej: /api) y servir estáticos.
- **C4 (RA3):** Servidor aplicaciones (backend) bien configurado, pruebas de rendimiento ligeras, justificación de pools/logs.
- **C7 (RA4):** Artefactos. Explicar qué ficheros son necesarios para el deploy, cuáles se generan, qué *no* subir al repo (.env), dónde se guardan variables.
- **C8 (RA5):** Verificación de red. URL, puertos publicados, comandos `curl` probando que el front habla con el proxy y este con el backend. Salidas de logs si es necesario.
