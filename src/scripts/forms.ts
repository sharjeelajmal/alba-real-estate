import { track } from '@/lib/track';

/**
 * Lead forms ([data-lead-form]): inline validation, phone formatting, UTM capture,
 * AJAX submit to Netlify Forms, Lead event, then redirect to the thank-you page.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UTM_STORAGE_KEY = 'alba_utm';
/** Set on submit, consumed on the thank-you page so Lead fires exactly once and survives the redirect. */
const LEAD_PENDING_KEY = 'alba_lead_pending';
const IS_LOCAL = ['localhost', '127.0.0.1'].includes(window.location.hostname);

type Validator = (input: HTMLInputElement) => boolean;

const digits = (value: string) => value.replace(/\D/g, '');

const VALIDATORS: Record<string, Validator> = {
  full_name: (i) => i.value.trim().split(/\s+/).filter(Boolean).length >= 2 || i.value.trim().length >= 3,
  phone: (i) => {
    const d = digits(i.value);
    return d.length === 10 || (d.length === 11 && d.startsWith('1'));
  },
  email: (i) => EMAIL_RE.test(i.value.trim()),
  consent: (i) => i.checked,
};

/** (555) 123-4567 as the visitor types */
function formatPhone(value: string): string {
  let d = digits(value);
  if (d.length === 11 && d.startsWith('1')) d = d.slice(1);
  d = d.slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** Keep the first-touch UTM parameters for the session so they survive navigation. */
function readUtm(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const fresh: Record<string, string> = {};
  params.forEach((value, key) => {
    if (key.startsWith('utm_') || key === 'fbclid') fresh[key] = value.slice(0, 200);
  });
  try {
    if (Object.keys(fresh).length) sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(fresh));
    return JSON.parse(sessionStorage.getItem(UTM_STORAGE_KEY) ?? '{}') as Record<string, string>;
  } catch {
    return fresh;
  }
}

function setInvalid(input: HTMLInputElement, invalid: boolean): void {
  const field = input.closest<HTMLElement>('[data-field]');
  field?.toggleAttribute('data-invalid', invalid);
  input.setAttribute('aria-invalid', String(invalid));
}

function validate(input: HTMLInputElement): boolean {
  const rule = VALIDATORS[input.name];
  if (!rule) return true;
  const ok = rule(input);
  setInvalid(input, !ok);
  return ok;
}

function initForm(form: HTMLFormElement): void {
  const inputs = Array.from(form.querySelectorAll<HTMLInputElement>('input[name]')).filter((i) => i.name in VALIDATORS);
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]');
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const successUrl = form.dataset.successUrl ?? '/';

  // Hidden context fields
  const utm = readUtm();
  form.querySelectorAll<HTMLInputElement>('[data-utm]').forEach((el) => (el.value = utm[el.dataset.utm ?? ''] ?? ''));
  const pageUrl = form.querySelector<HTMLInputElement>('[data-page-url]');
  if (pageUrl) pageUrl.value = window.location.href.split('#')[0] ?? '';

  for (const input of inputs) {
    if (input.name === 'phone') {
      input.addEventListener('input', () => {
        input.value = formatPhone(input.value);
      });
    }
    // Validate on leave; once a field has been flagged, re-check as the visitor fixes it
    input.addEventListener('blur', () => validate(input));
    input.addEventListener(input.type === 'checkbox' ? 'change' : 'input', () => {
      if (input.closest('[data-field]')?.hasAttribute('data-invalid')) validate(input);
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (status) status.textContent = '';

    const results = inputs.map(validate);
    if (results.includes(false)) {
      inputs[results.indexOf(false)]?.focus();
      return;
    }

    submit?.setAttribute('aria-busy', 'true');
    const body = new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString();

    try {
      if (!IS_LOCAL) {
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
        });
        if (!res.ok) throw new Error(`Form submit failed: ${res.status}`);
      } else {
        console.info('[form] local preview, submission skipped:', Object.fromEntries(new URLSearchParams(body)));
      }

      try {
        sessionStorage.setItem(
          LEAD_PENDING_KEY,
          JSON.stringify({ form: form.getAttribute('name'), source: form.dataset.leadSource, quiz: form.hasAttribute('data-quiz') }),
        );
      } catch {
        /* storage blocked: fall back to firing now */
        track('Lead', { content_name: form.getAttribute('name') ?? 'lead' });
        if (form.hasAttribute('data-quiz')) track('QuizComplete', { content_name: form.getAttribute('name') ?? 'quiz' });
      }
      window.location.assign(successUrl);
    } catch (error) {
      console.error(error);
      submit?.removeAttribute('aria-busy');
      if (status) status.textContent = "Your request didn't go through. Check your connection and try again.";
    }
  });
}

/** On a thank-you page ([data-lead-confirmation]), fire the Lead event once for a real submission. */
export function confirmLead(): void {
  if (!document.querySelector('[data-lead-confirmation]')) return;
  try {
    const pending = sessionStorage.getItem(LEAD_PENDING_KEY);
    if (!pending) return;
    sessionStorage.removeItem(LEAD_PENDING_KEY);
    const { form, source, quiz } = JSON.parse(pending) as { form?: string; source?: string; quiz?: boolean };
    track('Lead', { content_name: form ?? 'lead', lead_source: source });
    if (quiz) track('QuizComplete', { content_name: form ?? 'quiz' });
  } catch {
    /* ignore */
  }
}

export function initForms(): void {
  document.querySelectorAll<HTMLFormElement>('form[data-lead-form]').forEach(initForm);
}
