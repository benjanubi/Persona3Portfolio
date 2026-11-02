# Persona3Portfolio

Portafolio personal de Benjamín Valenzuela con la estética del menú de **Persona 3 Reload**. Es un sitio estático: HTML, CSS y JavaScript sin frameworks ni dependencias de ejecución.

## Abrir el sitio

Abre `index.html` con el navegador o levanta un servidor local:

```bash
python3 -m http.server 8000
```

Y visita `http://localhost:8000/`.

> Los videos se cargan mejor desde un servidor local que abriendo el archivo con `file://`.

## Controles

| Tecla | Acción |
| --- | --- |
| `↑` `↓` / `←` `→` | Mover la selección del menú |
| `Enter` / `Espacio` | Confirmar |
| `Backspace` / `Esc` | Volver desde "Sobre mí" |
| `↑` `↓` en "Sobre mí" | Desplazar el contenido si no cabe en pantalla |

También se puede usar el ratón: al pasar por encima se selecciona y al hacer clic se confirma. El botón de sonido activa el audio de los videos y los efectos de navegación.

## Estructura

- `index.html`: pantalla principal, pantalla "Sobre mí" y controles.
- `css/styles.css`: sistema visual, tipografías, transición circular y responsive.
- `js/app.js`: navegación por teclado, transición, fecha/edad dinámicas, sonido y enlaces.
- `assets/video/mainscreen.mp4`: fondo del menú principal.
- `assets/video/subscreen1.mp4`: fondo de "Sobre mí".
- `assets/video/*-poster.jpg`: primer fotograma para carga inmediata.
- `assets/fonts/`: Anton, Barlow y Barlow Condensed en local.
- `assets/pfp.jpg`: avatar usado en la fila de perfil.
- `assets/favicon.svg`: icono del sitio.

## Editar contenido

- Los textos de "Sobre mí" están en `index.html`, dentro de `.about-rows` y `.about-copy`.
- La edad se calcula desde `data-birthdate` en `<body>`.
- La fecha del HUD se genera con JavaScript.
- El enlace de GitHub está en `js/app.js` (`GITHUB_URL`).
- "Redes" y "Proyectos" están visibles pero deshabilitados con `aria-disabled="true"`; al confirmarlos no ocurre nada.
- Los videos se pueden reemplazar manteniendo los nombres o actualizando las rutas en `index.html`.

## Notas

- El fondo principal se reproduce en bucle, silenciado por defecto.
- La transición es un `clip-path: circle()` animado por JavaScript; el anillo cian acompaña el borde del círculo.
- `prefers-reduced-motion` desactiva la animación de la transición y pausa los videos por defecto.
- La pantalla "Sobre mí" se puede abrir directamente con `#sobre-mi`.
