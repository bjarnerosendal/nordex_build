# NordexFood Frontend

This is the frontend application for the NordexFood website, built with Vue 3, TypeScript, Bootstrap, and Vite.

## Project Setup

```sh
npm install
```

### Development

```sh
npm run dev
```

### Type-Check, Build and Minify for Production

```sh
npm run build
```

### Preview Production Build

```sh
npm run preview
```

### Lint and Fix Files

```sh
npm run lint
```

### Type-Check

```sh
npm run type-check
```

## Architecture

The frontend is built using:

- Vue 3 - Progressive JavaScript framework
- TypeScript - Typed superset of JavaScript
- Vue Router - Official router for Vue.js
- Bootstrap 5 - CSS framework
- Sass - CSS preprocessor
- Vite - Next generation frontend tooling
- ESLint - Linting utility

## Structure

- `src/assets` - Static assets like images
- `src/components` - Reusable Vue components
- `src/views` - Page components
- `src/router` - Vue Router configuration
- `src/services` - API services
- `src/styles` - Global SCSS styles

## Umbraco Integration

This frontend communicates with the Umbraco CMS backend via REST APIs. The API endpoints are configured in the `UmbracoService.ts` file.
