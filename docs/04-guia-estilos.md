# 4. Guía de Estilos y Prototipado

El diseño de Kinefy no es un mero adorno estético; es una decisión funcional crítica. Al tratar con usuarios (pacientes) que se encuentran en un proceso de recuperación física y, muy probablemente, experimentando dolor o estrés, la interfaz de usuario debe transmitir calma, accesibilidad y claridad.

Por este motivo, se descartó el uso de librerías genéricas de componentes (como Material UI, Bootstrap o Tailwind en su configuración por defecto) para apostar por un diseño a medida bajo la filosofía del **"Organic Minimalism"**.

---

## 4.1. Concepto: Organic Minimalism

El minimalismo orgánico busca romper con las interfaces rígidas, cuadriculadas e "industriales" típicas del software médico (SaaS B2B). En su lugar, utiliza elementos visuales que imitan la naturaleza para reducir la carga cognitiva.

### 4.1.1. Los "Blobs" y Bordes Asimétricos
El elemento identitario más fuerte de Kinefy son sus botones y contenedores interactivos. En lugar de utilizar un `border-radius` perfecto (ej. rectángulos redondeados clásicos), se ha implementado un sistema de **botones-mancha (blobs)**.

*   **Implementación técnica:** Se logra mediante el uso de valores múltiples y complejos en la propiedad `border-radius` de CSS puro (ejemplo: `border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%`).
*   **Interacción:** Al realizar la acción de `:hover` (pasar el ratón), el *blob* muta orgánicamente hacia otra forma asimétrica, dando la sensación de que la interfaz "está viva" y respira.

### 4.1.2. Paleta de Colores
La paleta se aleja del blanco hospitalario o del azul corporativo agresivo. Se han seleccionado colores bajo la métrica HSL para garantizar el confort visual:
*   **Color Brand (Menta/Verde Kinefy):** `#55A98A` - Transmite salud, sanación y crecimiento. Se usa para las acciones principales.
*   **Fondo (Cream/Off-white):** `#F9FBFB` - Un blanco roto cálido que reduce la fatiga visual en comparación con el blanco puro `#FFFFFF`.
*   **Texto Principal:** `#1A2E35` - Un tono gris carbón azulado, mucho más suave para la lectura que el negro puro `#000000`.
*   **Acentos (Danger/Error):** Se evitan rojos chillones, optando por tonos salmón (`#E57373`) para reducir la sensación de "castigo" o alerta crítica en el paciente.

### 4.1.3. Tipografía
Se ha implementado una jerarquía tipográfica moderna con dos familias tipográficas cargadas desde Google Fonts:

*   **Fraunces** (serif): Utilizada en encabezados (H1, H2, H3). Es una tipografía óptica variable de carácter orgánico y expresivo, coherente con la filosofía *Organic Minimalism* del proyecto. Su peso alto aporta contundencia y anclaje visual en los títulos.
*   **Outfit** (sans-serif): Utilizada en el cuerpo de texto, botones y etiquetas. Su geometría limpia y moderna garantiza una legibilidad óptima en pantallas pequeñas. Se ha aumentado el interlineado (`line-height: 1.6`) para facilitar la lectura a personas con problemas de visión o presbicia.

La combinación serif/sans-serif crea una jerarquía visual clara: Fraunces ancla y da personalidad, Outfit comunica con claridad.

---

## 4.2. Arquitectura CSS (Metodología BEM)

Todo el estilizado de la aplicación se ha construido mediante **CSS Puro (Vanilla CSS)**. Para mantener la escalabilidad y evitar la colisión de estilos (el gran problema del CSS sin encapsular), se ha adoptado de forma estricta la nomenclatura **BEM (Block, Element, Modifier)**.

*   **Block:** Representa el componente principal e independiente (ej. `.dashboard-card`).
*   **Element:** Una parte del bloque que no tiene sentido por sí sola (ej. `.dashboard-card__header`).
*   **Modifier:** Una bandera que cambia la apariencia o el estado del bloque o elemento (ej. `.dashboard-card--dark`).

Esta decisión arquitectónica permite que el proyecto no dependa de abstracciones de terceros, garantizando que el desarrollador tiene el control absoluto sobre cada píxel de la pantalla. Además, el CSS puro garantiza tiempos de carga (*First Contentful Paint*) extremadamente bajos.

---

## 4.3. Accesibilidad (A11Y) y Diseño Mobile-First

### 4.3.1. Enfoque Mobile-First
Kinefy asume que el 90% de la interacción del *Paciente* será a través de un teléfono móvil mientras está en la colchoneta de ejercicios. 
*   **Diseño:** Todas las vistas (como la lista de ejercicios o el selector de dolor) se diseñaron primero para resoluciones de 320px-400px.
*   **Zonas táctiles:** Los botones y áreas interactivas tienen un tamaño mínimo de 44x44 píxeles, siguiendo las Human Interface Guidelines de Apple y las Material Design Guidelines de Google para facilitar el pulsado con el pulgar o con manos temblorosas.
*   **Navegación Móvil:** Se ha sustituido la barra lateral (Sidebar) del escritorio por una barra de navegación inferior (Bottom Navigation Bar), accesible fácilmente con una sola mano.

### 4.3.2. Criterios WCAG AA
La guía de estilos asegura el cumplimiento de las normativas de accesibilidad:
*   **Contraste:** Los colores de texto principales (gris oscuro) contra el fondo menta o crema superan el ratio de contraste 4.5:1 exigido para textos normales.
*   **Estados de foco:** Todos los elementos interactivos mantienen un estado `:focus-visible` para permitir la navegación por teclado (vital en la vista del fisioterapeuta).
*   **Ausencia de dependencias del color:** La información crítica (como el estado "Pendiente" o "Completado" de un ejercicio) no depende únicamente del color, sino que se acompaña de iconos y etiquetas textuales.

---

## 4.4. Prototipo del Diseño en Figma

El diseño visual, la interactividad de las pantallas y los prototipos interactivos iniciales se desarrollaron íntegramente en Figma. Este prototipo sirvió de base para la maquetación final en CSS puro, manteniendo la coherencia de estilos, tipografías y el flujo de navegación de la aplicación:

*   **Enlace al Proyecto de Figma:** [Proyecto Kinefy en Figma](https://www.figma.com/design/UWZvBTcBHwRixnVFzIuAJy/Proyecto-final-Kinefy?node-id=1-1376&t=qolTzxqMGEtjhyUZ-1)
