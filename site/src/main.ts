import './style.css';

const params = new URLSearchParams(window.location.search);
if (window.location.pathname === '/' && params.get('demo') === '1') {
  window.location.replace('/demo/');
}

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
  enterprise: { host: 'github.corp.example', owner: 'field-team', directory: '~/src/client/mobile', rule: 'Client enterprise · rule 3', account: 'consultant@client.example' },
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

const resetDemo = () => {
  if (picker && trace) {
    picker.value = 'work';
    picker.dispatchEvent(new Event('change'));
  }
  document.querySelector<HTMLElement>('[data-recording]')?.classList.remove('replaying');
  if (replay) replay.textContent = 'Replay recording';
  if (replayTimer) window.clearTimeout(replayTimer);
  const demoStatus = document.querySelector<HTMLElement>('[data-demo-status]');
  if (demoStatus) demoStatus.textContent = 'Reset restored the starting sample.';
  document.querySelector<HTMLElement>('.demo-intro h1')?.focus();
};
document.querySelector<HTMLButtonElement>('[data-demo-reset]')?.addEventListener('click', resetDemo);

const replay = document.querySelector<HTMLButtonElement>('[data-demo-replay]');
const recording = document.querySelector<HTMLElement>('[data-recording]');
let replayTimer: number | undefined;
replay?.addEventListener('click', () => {
  if (!recording) return;
  recording.classList.remove('replaying');
  void recording.offsetWidth;
  recording.classList.add('replaying');
  replay.textContent = 'Recording replayed';
  replayTimer = window.setTimeout(() => { replay.textContent = 'Replay recording'; }, 1800);
});

const status = document.querySelector<HTMLElement>('[data-copy-status]');
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-copy]')) {
  button.addEventListener('click', async () => {
    const value = button.parentElement?.querySelector<HTMLElement>('[data-copy-value]')?.dataset.copyValue;
    if (!value || !status) return;
    try {
      await navigator.clipboard.writeText(value);
      status.textContent = 'Command copied to clipboard.';
      const original = button.textContent;
      button.textContent = 'Copied';
      window.setTimeout(() => { button.textContent = original; }, 1800);
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

const focusRouteHeading = () => window.requestAnimationFrame(() => document.querySelector<HTMLElement>('main h1')?.focus());
try {
  const referrer = document.referrer ? new URL(document.referrer) : undefined;
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if ((referrer?.origin === window.location.origin && referrer.pathname !== window.location.pathname) || navigation?.type === 'back_forward') {
    focusRouteHeading();
  }
  window.addEventListener('pageshow', event => {
    if (event.persisted) focusRouteHeading();
  });
} catch {
  // A malformed referrer must never block the page.
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  let reloading = false;
  let updateNotice: HTMLElement | undefined;
  const pageWasControlled = Boolean(navigator.serviceWorker.controller);

  const promptForUpdate = (registration: ServiceWorkerRegistration) => {
    if (!registration.waiting || updateNotice) return;
    updateNotice = document.createElement('section');
    updateNotice.className = 'update-notice';
    updateNotice.setAttribute('role', 'status');
    updateNotice.innerHTML = '<p>An update is ready. Refresh to use it.</p><button type="button">Refresh</button>';
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
    if (pageWasControlled && !reloading) {
      reloading = true;
      window.location.reload();
    }
  });
}
