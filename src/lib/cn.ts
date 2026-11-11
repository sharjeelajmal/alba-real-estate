type ClassValue = string | false | null | undefined;

/** Join class names, skipping falsy values. Tiny replacement for clsx. */
export const cn = (...classes: ClassValue[]): string => classes.filter(Boolean).join(' ');
