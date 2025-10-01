# GEMINI Project Analysis: PUNKIEZ Landing Page

## Project Overview

This project is a mobile-first landing page for "PUNKIEZ," built with Next.js 15 and styled with Tailwind CSS. The application features a distinctive "glass morphism" design for its central UI card and uses a custom orange brand color. The layout is fully responsive and designed to work well on all screen sizes.

**Key Technologies:**

*   **Framework:** Next.js 15 (with App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS v4
*   **Package Manager:** pnpm

**Architecture:**

*   The application is a single-page site, with the main content rendered from `app/page.tsx`.
*   Global styles and Tailwind CSS configurations are defined in `app/globals.css`.
*   The root layout in `app/layout.tsx` sets up the basic HTML structure and page metadata.
*   Static assets like logos are served from the `/public` directory.

## Building and Running

The following commands are used for development and production:

*   **Start the development server:**
    ```bash
    pnpm dev
    ```
    *(Runs on `http://localhost:3000` by default)*

*   **Create a production build:**
    ```bash
    pnpm build
    ```

*   **Start the production server:**
    ```bash
    pnpm start
    ```

*   **Run the linter:**
    ```bash
    pnpm lint
    ```

## Development Conventions

*   **Styling:** The project uses Tailwind CSS for all styling. Custom styles are defined in `app/globals.css`, including a `glass` class for the main card and `menu-btn` for button styling.
*   **Components:** The UI is built with React components within the Next.js App Router paradigm.
*   **Assets:** Logos and other static images should be placed in the `/public` directory. The page is pre-configured to use `punkiez-logo.png` and `p-icon.png`.
*   **Responsiveness:** The layout is mobile-first, with responsive breakpoints (`sm`, `md`, `lg`) used to adapt the main card's width for larger screens.
