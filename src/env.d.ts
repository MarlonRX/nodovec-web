/// <reference types="astro/client" />

// Extender React.ComponentProps para incluir directivas de Astro
declare global {
  namespace React {
    interface Attributes {
      "client:load"?: boolean;
      "client:idle"?: boolean;
      "client:visible"?: boolean;
      "client:only"?: boolean | string;
      "is:inline"?: boolean;
    }

    interface HTMLAttributes<T> {
      "client:load"?: boolean;
      "client:idle"?: boolean;
      "client:visible"?: boolean;
      "client:only"?: boolean | string;
      "is:inline"?: boolean;
    }
  }

  namespace JSX {
    interface IntrinsicAttributes {
      "client:load"?: boolean;
      "client:idle"?: boolean;
      "client:visible"?: boolean;
      "client:only"?: boolean | string;
      "is:inline"?: boolean;
    }
  }
}

export {};
