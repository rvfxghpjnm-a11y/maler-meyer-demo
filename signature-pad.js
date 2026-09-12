(function () {
  'use strict';

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function hashContent(value) {
    const input = JSON.stringify(value);
    let hash = 0x811c9dc5;
    for (let i = 0; i < input.length; i += 1) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return `DEMO-${(hash >>> 0).toString(16).toUpperCase().padStart(8, '0')}`;
  }

  function openSignature(options = {}) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'signature-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', options.title || 'Bestätigung mit gezeichneter Unterschrift');
      overlay.innerHTML = `
        <section class="signature-dialog">
          <header class="signature-head">
            <div><span class="eyebrow">OPTIONALE DEMO-UNTERSCHRIFT</span><h2>${options.title || 'Bestätigung mit gezeichneter Unterschrift'}</h2></div>
            <button class="icon-button" type="button" data-signature-cancel aria-label="Schließen">×</button>
          </header>
          <p>${options.description || 'Bitte mit Finger, Apple Pencil oder Maus im Feld zeichnen.'}</p>
          <button class="signature-enable" type="button" data-signature-enable>Unterschriftsfeld aktivieren</button>
          <div class="signature-canvas-wrap">
            <canvas class="signature-canvas" width="720" height="240" aria-label="Unterschriftsfeld" aria-disabled="true"></canvas>
            <span class="signature-line-label">Unterschrift</span>
          </div>
          <p class="signature-hint">Solange das Feld nicht aktiviert ist, kann darüber normal gescrollt werden. Erst nach dem bewussten Aktivieren wird eine Bewegung im Feld als Zeichnung erfasst.</p>
          <p class="legal-note">Diese Demo-Bestätigung ist keine qualifizierte elektronische Signatur und behauptet keine Rechtsverbindlichkeit.</p>
          <div class="signature-actions">
            <button class="secondary-button" type="button" data-signature-clear>Löschen / neu zeichnen</button>
            ${options.allowWithoutSignature === false ? '' : '<button class="secondary-button" type="button" data-signature-without>Ohne Unterschrift bestätigen</button>'}
            <button class="primary-button" type="button" data-signature-save>Bestätigung speichern</button>
          </div>
          <p class="form-error" data-signature-error hidden>Bitte unterschreiben oder „Ohne Unterschrift bestätigen“ wählen.</p>
        </section>`;
      document.body.appendChild(overlay);

      const canvas = overlay.querySelector('canvas');
      const context = canvas.getContext('2d');
      let drawing = false;
      let hasInk = false;
      let enabled = false;
      let activePointerId = null;

      function configureCanvas() {
        const cssWidth = Math.max(280, canvas.getBoundingClientRect().width || 720);
        const cssHeight = Math.max(170, canvas.getBoundingClientRect().height || 240);
        const ratio = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
        canvas.width = Math.round(cssWidth * ratio);
        canvas.height = Math.round(cssHeight * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.lineWidth = 2.4;
        context.strokeStyle = '#17263a';
      }

      function point(event) {
        const rect = canvas.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
      }

      function start(event) {
        if (!enabled) return;
        if (event.button !== undefined && event.button !== 0) return;
        event.preventDefault();
        drawing = true;
        activePointerId = event.pointerId;
        try { canvas.setPointerCapture?.(event.pointerId); } catch (_) {}
        const p = point(event);
        context.beginPath();
        context.moveTo(p.x, p.y);
      }

      function move(event) {
        if (!drawing || event.pointerId !== activePointerId) return;
        event.preventDefault();
        const p = point(event);
        context.lineTo(p.x, p.y);
        context.stroke();
        hasInk = true;
      }

      function stop(event) {
        if (!drawing || event.pointerId !== activePointerId) return;
        event.preventDefault();
        drawing = false;
        try { canvas.releasePointerCapture?.(event.pointerId); } catch (_) {}
        activePointerId = null;
      }

      function finish(result) {
        overlay.remove();
        resolve(result);
      }

      configureCanvas();
      overlay.querySelector('[data-signature-enable]').addEventListener('click', (event) => {
        enabled = true;
        canvas.classList.add('active');
        canvas.setAttribute('aria-disabled', 'false');
        event.currentTarget.textContent = 'Unterschriftsfeld aktiv – jetzt zeichnen';
        event.currentTarget.classList.add('active');
      });
      canvas.addEventListener('pointerdown', start);
      canvas.addEventListener('pointermove', move);
      canvas.addEventListener('pointerup', stop);
      canvas.addEventListener('pointercancel', stop);
      overlay.querySelector('[data-signature-clear]').addEventListener('click', () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        hasInk = false;
        overlay.querySelector('[data-signature-error]').hidden = true;
      });
      overlay.querySelector('[data-signature-save]').addEventListener('click', () => {
        if (!hasInk) {
          overlay.querySelector('[data-signature-error]').hidden = false;
          return;
        }
        finish({ signed: true, signatureDataUrl: canvas.toDataURL('image/png') });
      });
      overlay.querySelector('[data-signature-without]')?.addEventListener('click', () => finish({ signed: false, signatureDataUrl: null }));
      overlay.querySelectorAll('[data-signature-cancel]').forEach((button) => button.addEventListener('click', () => finish(null)));
    });
  }

  window.MMWorkflow = { clone, hashContent };
  window.MobileSignature = { open: openSignature };
}());
