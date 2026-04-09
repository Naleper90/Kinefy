# Guía de Estilos y Diseño

El sistema visual de Kinefy, denominado **"Organic Minimalism"**, busca un equilibrio entre la profesionalidad clínica y la calma necesaria para un paciente en rehabilitación. El objetivo principal es reducir la carga cognitiva mediante una interfaz despejada y tonos suaves.

## Arquitectura CSS: Metodología BEM

He optado por una arquitectura de CSS puro bajo metodología BEM (Block Element Modifier). Al evitar frameworks como Tailwind o Bootstrap, mantengo un control total sobre el renderizado y aseguro que el código sea ligero y escalable. Cada componente es independiente, lo que facilita el mantenimiento y la consistencia visual sin dependencias externas.

## Identidad Cromática

La paleta se divide en tonos funcionales y decorativos:
- **Verde Menta (`#98D2C1`)**: Es el color principal de marca y se reserva para acciones primarias y branding.
- **Azul Cielo (`#B4E1FF`)**: Utilizado en elementos decorativos para aportar profundidad orgánica.
- **Azul Petróleo (`#1A2E35`)**: Color para tipografía y elementos de alto contraste, sustituyendo al negro puro para suavizar la lectura.
- **Hueso (`#FDFEFE`)**: Fondo neutro de alta gama que actúa como lienzo.

## Tipografía y Accesibilidad

Se combinan dos familias tipográficas: **Fraunces** para titulares (aportando un carácter editorial) e **Inter** para la interfaz (priorizando la legibilidad en datos técnicos). 

Respecto a la accesibilidad (WCAG AA), he verificado que los ratios de contraste superen siempre el 4.5:1. Además, el uso de etiquetas semánticas de HTML5 asegura que la plataforma sea interpretable por tecnologías asistidas sin necesidad de soluciones "parche".
