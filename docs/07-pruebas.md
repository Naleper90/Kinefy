# 7. Pruebas de Software y Calidad (QA)

Asegurar la estabilidad del sistema es fundamental en aplicaciones del sector salud. Las pruebas de Kinefy se han enfocado en la validación de la interfaz de usuario en entornos móviles, la robustez de los endpoints y el cumplimiento de las normativas de accesibilidad.

---

## 7.1. Pruebas Funcionales de API (Backend)

### 7.1.1. Pruebas Manuales (Postman y cURL)

Para verificar el correcto diseño de la API RESTful (Criterio C4), se han ejecutado baterías de pruebas unitarias sobre los endpoints críticos usando herramientas como Postman y comandos cURL. 

**Prueba de Autenticación y Autorización:**
Validación de que un token caducado o mal formado devuelve el código HTTP correcto, y de que un usuario con rol 'Paciente' no puede acceder a las rutas restringidas del 'Fisioterapeuta'.
*   *Endpoint:* `GET /api/patients`
*   *Header:* `Authorization: Bearer <token_invalido>`
*   *Salida esperada y obtenida:* `401 Unauthorized`

**Prueba de Inserción de Datos (EVA):**
Comprobación de que el modelo de Mongoose rechaza datos no válidos (por ejemplo, registrar un dolor EVA de 15 en una escala que solo admite de 1 a 10).
*   *Salida obtenida:* `400 Bad Request` con mensaje descriptivo del fallo de validación de Mongoose.

### 7.1.2. Pruebas Automatizadas de Integración (Jest & Supertest)

Para asegurar la robustez de la seguridad (Criterio 4 de DWES y calidad del software), se ha implementado una suite de pruebas automatizadas utilizando **Jest** como framework de pruebas y **Supertest** para realizar peticiones HTTP virtuales sin necesidad de arrancar el servidor en red o requerir una base de datos conectada.

*   **Fichero de prueba:** [kinefy-backend/src/tests/auth.test.js](file:///c:/Users/esana/Desktop/Kinefy/kinefy-backend/src/tests/auth.test.js)
*   **Comando de ejecución:**
    ```bash
    npm run test
    ```
*   **Pruebas unitarias incluidas:**
    1.  `should refuse access to /api/patients when no token is provided`: Realiza un `GET` a `/api/patients` sin cabeceras y comprueba que devuelve `401` y el código `AUTH_MISSING_TOKEN`.
    2.  `should refuse access to /api/patients when an invalid token is provided`: Realiza un `GET` con una cabecera `Authorization` con formato incorrecto y comprueba que devuelve `401` y el código `AUTH_INVALID_TOKEN`.

*   **Salida obtenida (Evidencia):**
    ```text
    PASS src/tests/auth.test.js
      Auth Middleware Integration Tests
        √ should refuse access to /api/patients when no token is provided (124 ms)
        √ should refuse access to /api/patients when an invalid token is provided (26 ms)

    Test Suites: 1 passed, 1 total
    Tests:       2 passed, 2 total
    Snapshots:   0 total
    Time:        2.233 s
    Ran all test suites.
    ```

---

## 7.2. Pruebas de Interfaz y UX (Frontend)

### 7.2.1. Pruebas de Diseño Responsivo (Mobile-First)
Todo el sistema de navegación y tarjetas de ejercicios se sometió a pruebas de estrés visual utilizando las DevTools de Google Chrome simulando los siguientes dispositivos:
*   **Pantallas Pequeñas (iPhone SE - 375px):** Verificación de que no existen desbordamientos horizontales (`overflow-x`) y que los textos no se montan sobre los "blob buttons".
*   **Pantallas Medias (Tablets):** Ajuste de la cuadrícula CSS Grid para pasar de 1 columna (móvil) a 2 columnas (tablet).
*   **Desktop:** Verificación de que la barra de navegación inferior (`.mobile-nav`) se oculta correctamente, dejando paso a la barra lateral clásica (`Sidebar`).

### 7.2.2. Pruebas de Rendimiento Visual
Al implementar los botones orgánicos complejos en CSS puro, existía riesgo de caída de fotogramas (FPS) en móviles antiguos durante el `:hover`. Se monitorizó el *Performance Tab* de Chrome comprobando que las transiciones de `border-radius` no desencadenaran *reflows* masivos en el DOM, manteniendo la aplicación fluida a 60fps.

---

## 7.3. Auditoría de Accesibilidad (A11Y)

Utilizando herramientas como *Lighthouse* y simuladores de déficit visual, se auditaron los colores del diseño "Organic Minimalism":
*   Se detectaron y corrigieron problemas de contraste en tonos secundarios (grises sobre fondo crema), elevando el color HEX hasta superar el umbral de contraste `4.5:1`.
*   Se verificó que los botones sin texto tuvieran sus correspondientes etiquetas semánticas (`aria-label`) para los lectores de pantalla (Screen Readers).

---

## Pruebas de rendimiento (carga ligera)

Para verificar el comportamiento del servidor de aplicaciones bajo condiciones de concurrencia y comprobar la robustez de los middlewares implantados, se ha diseñado una prueba de rendimiento ligera.

### Herramienta utilizada
*   **autocannon**: Generador de carga ligera basado en Node.js, muy rápido y eficiente.

### Comandos de ejecución
```bash
# Instalar de forma global (o ejecutar localmente)
npm install -g autocannon

# Levantar la infraestructura Docker
docker compose up -d

# Ejecutar test de carga contra la API de login
autocannon -c 50 -d 10 http://localhost/api/auth/login
```

### Objetivo de la prueba
El objetivo es verificar que la API responde correctamente bajo carga concurrente (50 conexiones concurrentes sostenidas durante 10 segundos) y confirmar que el middleware `express-rate-limit` actúa bloqueando las peticiones excesivas provenientes de una misma dirección IP una vez superado el límite configurado (máximo 20 peticiones por minuto para la ruta de login).

### Resultados esperados aproximados

| Métrica | Valor esperado |
| :--- | :--- |
| **Peticiones/segundo** | > 50 req/s |
| **Latencia media** | < 200ms |
| **Errores de red** | 0 |
| **Respuestas 429 (rate limit)** | Presentes tras 20 req/min |
