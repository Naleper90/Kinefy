# 8. Despliegue de la Aplicación y CI/CD

> [!IMPORTANT]
> **Nota para el Tribunal Evaluador (Módulo Despliegue):**
> La documentación técnica específica exigida para la rúbrica del módulo de Despliegue de Aplicaciones Web (Justificación de herramientas, Criterio 7 sobre artefactos y ficheros, y Criterio 8 sobre verificación de red) ha sido extraída a un documento anexo para facilitar su corrección. 
> **Por favor, diríjase a: [08-despliegue-eval.md](08-despliegue-eval.md)**

---

## 8.1. Estrategia de Control de Versiones

El proyecto Kinefy ha utilizado **Git** como sistema de control de versiones, alojando el código fuente en la plataforma GitHub. 

Para garantizar un historial limpio y coherente (Criterio C5), se ha adoptado una estrategia basada en Ramas de Funcionalidad (*Feature Branches*). La rama `main` se ha protegido para asegurar que siempre contiene una versión funcional del producto, mientras que el desarrollo activo se ha realizado en ramas separadas (ej. `feature/blob-buttons`, `fix/responsive-nav`) que posteriormente se integraban mediante Pull Requests.

---

## 8.2. Flujo de Integración y Despliegue Continuo (CI/CD)

### Entorno de Desarrollo Local (Docker)
Como se detalla en el documento de Instalación, la fase de *Delivery* local se fundamenta en la contenedorización completa mediante Docker Compose. Esto ha permitido uniformizar el entorno de desarrollo, eliminando el clásico problema de "en mi máquina sí funciona".

### Despliegue en Producción (Render)
Para el paso a producción (Live Environment), se tomó la decisión arquitectónica de utilizar **Render** (Plataforma como Servicio - PaaS) en lugar de un VPS manual con contenedores Docker, por las siguientes razones:

1.  **Reducción de la carga operativa:** Render permite conectar directamente el repositorio de GitHub y realizar un despliegue automático con cada *push* a la rama `main`, ofreciendo una tubería CI/CD *Out-of-the-box* sin necesidad de escribir flujos complejos de GitHub Actions.
2.  **Gestión de Certificados:** Render proporciona URLs seguras (HTTPS) de forma automática para el Frontend y el Backend, delegando la gestión de certificados TLS/SSL a la plataforma.
3.  **Frontend y Backend Desacoplados:** Se crearon dos Web Services distintos dentro de la plataforma (uno para Node/Express y otro como Static Site para Vite/React), permitiendo escalar ambos servicios de forma independiente en un futuro.

La base de datos de producción no se aloja en Render por motivos de persistencia y escalabilidad, sino que se delega al servicio gestionado **MongoDB Atlas**, el cual recibe las conexiones a través de un URI seguro configurado mediante variables de entorno secretas en el panel de Render.
