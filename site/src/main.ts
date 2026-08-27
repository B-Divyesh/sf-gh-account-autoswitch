import './style.css';

type Scenario = {
  host: string;
  owner: string;
  directory: string;
  rule: string;
  account: string;
  unmatched?: boolean;
};

const scenarios: Record<string, Scenario> = {
  work: { host: 'github.com', owner: 'acme-corp', directory: '~/src/work/payments', rule: 'Acme work · rule 1', account: 'dev@acme.example' },
  personal: { host: 'github.com', owner: 'octocat', directory: '~/src/personal/dotfiles', rule: 'Personal · rule 2', account: 'octocat' },
  unmatched: { host: 'github.com', owner: 'unknown-org', directory: '~/src/scratch/prototype', rule: 'No rule matched · exit 3', account: 'No command was run', unmatched: true }
};

const picker = document.querySelector<HTMLSelectElement>('[data-scenario]');
const trace = document.querySelector<HTMLElement>('[data-trace]');
picker?.addEventListener('change', () => {
  const scenario = scenarios[picker.value];
  if (!scenario || !trace) return;
  for (const [key, value] of Object.entries(scenario)) {
    if (key === 'unmatched') continue;
    const target = trace.querySelector<HTMLElement>(`[data-${key}]`);
    if (target) target.textContent = String(value);
  }
  trace.classList.toggle('is-unmatched', Boolean(scenario.unmatched));
});

const status = document.querySelector<HTMLElement>('[data-copy-status]');
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-copy]')) {
  button.addEventListener('click', async () => {
    const value = button.parentElement?.querySelector<HTMLElement>('[data-copy-value]')?.dataset.copyValue;
    if (!value || !status) return;
    try {
      await navigator.clipboard.writeText(value);
      status.textContent = 'Command copied to clipboard.';
      button.textContent = 'Copied';
      window.setTimeout(() => { button.textContent = 'Copy'; }, 1800);
    } catch {
      status.textContent = 'Copy was blocked. Select the command text and copy it manually.';
    }
  });
}

const offline = document.querySelector<HTMLElement>('[data-offline]');
const updateConnection = () => {
  if (offline) offline.hidden = navigator.onLine;
};
window.addEventListener('online', updateConnection);
window.addEventListener('offline', updateConnection);
updateConnection();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  let reloading = false;
  let updateNotice: HTMLElement | undefined;

  const promptForUpdate = (registration: ServiceWorkerRegistration) => {
    if (!registration.waiting || updateNotice) return;
    updateNotice = document.createElement('section');
    updateNotice.className = 'update-notice';
    updateNotice.setAttribute('role', 'status');
    updateNotice.innerHTML = '<p>A documentation update is ready.</p><button type="button">Refresh</button>';
    updateNotice.querySelector('button')?.addEventListener('click', () => {
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
    });
    document.body.append(updateNotice);
  };

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(registration => {
      const activateOrPrompt = () => {
        if (!registration.waiting) return;
        // A first install has no existing shell to protect, so activate it now.
        if (!navigator.serviceWorker.controller) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        } else {
          promptForUpdate(registration);
        }
      };
      activateOrPrompt();
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed') activateOrPrompt();
        });
      });
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data?.type === 'UPDATE_READY') activateOrPrompt();
      });
    }).catch(() => undefined);
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!reloading) {
      reloading = true;
      window.location.reload();
    }
  });
}
