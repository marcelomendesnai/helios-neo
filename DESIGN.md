# Helios Neo — Visual System

## Direction
Um terminal patrimonial privado com acabamento editorial: escuro, silencioso e preciso. A assinatura visual vem do contraste entre superfícies minerais, tipografia limpa e um único acento solar.

## Color
- Canvas: `#0B0D0C`
- Surface: `#121513`
- Raised: `#181C19`
- Strong surface: `#202520`
- Primary text: `#F2F1EB`
- Secondary text: `#B7BAB2`
- Muted text: `#7F857D`
- Solar accent: `#E8C66A`
- Positive: `#52C98A`
- Negative: `#F17474`
- Information: `#75A7F7`

O acento solar sinaliza navegação, foco e ação. Verde nunca é usado como cor genérica de marca.

## Typography
- Interface: Manrope, com fallbacks de sistema.
- Valores e percentuais: IBM Plex Mono, com numerais tabulares.
- Títulos: peso 650–700, sem letter-spacing exagerado.
- Rótulos: 11–12px, contraste AA e capitalização natural.

## Shape and spacing
- Raios: 8, 12 e 16px. Pílulas somente para filtros e estados.
- Escala espacial: 4, 8, 12, 16, 24 e 32px.
- Uma borda sutil separa superfícies; sombras ficam reservadas para modais.

## Components
- Hero: superfície forte, valor dominante e decomposição imediatamente abaixo.
- Cards: uma camada por contexto; evitar card dentro de card.
- Navigation: persistente no desktop e inferior no celular, com estado ativo solar.
- Controls: alvo mínimo de 44px e foco visível de 2px.
- Charts: rótulos e valores acompanham as cores; cor isolada nunca explica estado.

## Motion
Transições entre 120–220ms, apenas para mudança de estado. Respeitar `prefers-reduced-motion`.

## Accessibility
- WCAG 2.1 AA como mínimo.
- Zoom do navegador permitido.
- Botões de ícone sempre têm nome acessível.
- Modal com semântica de diálogo e fechamento por teclado.
- Estados de carregamento e erro anunciados por região viva.

