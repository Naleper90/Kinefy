# 7. Pruebas de Software y Calidad (QA)

Asegurar la estabilidad del sistema es fundamental en aplicaciones del sector salud. Las pruebas de Kinefy se han enfocado en la validación de la interfaz de usuario en entornos móviles, la robustez de los endpoints y el cumplimiento de las normativas de accesibilidad.

---

## 7.1. Pruebas Funcionales de API (Backend)

Para verificar el correcto diseño de la API RESTful (Criterio C4), se han ejecutado baterías de pruebas unitarias sobre los endpoints críticos usando herramientas como Postman y comandos cURL. 

**Prueba de Autenticación y Autorización:**
Validación de que un token caducado o mal formado devuelve el código HTTP correcto, y de que un usuario con rol 'Paciente' no puede acceder a las rutas restringidas del 'Fisioterapeuta'.
*   *Endpoint:* `GET /api/patients`
*   *Header:* `Authorization: Bearer <token_invalido>`
*   *Salida esperada y obtenida:* `401 Unauthorized`

**Prueba de Inserción de Datos (EVA):**
Comprobación de que el modelo de Mongoose rechaza datos no válidos (por ejemplo, registrar un dolor EVA de 15 en una escala que solo admite de 1 a 10).
*   *Salida obtenida:* `400 Bad Request` con mensaje descriptivo del fallo de validación de Mongoose.

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
