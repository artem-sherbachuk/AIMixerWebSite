(() => {
  const main = document.querySelector('.legal-main');
  const contentEl = document.getElementById('legal-content');
  const tocWrap = document.querySelector('.legal-toc');
  const tocList = document.querySelector('.legal-toc ul');
  const updatedEl = document.querySelector('.legal-updated');

  if (!main || !contentEl) return;

  const src = main.getAttribute('data-src');
  if (!src) return;

  const slugify = (text) => text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  const setUpdated = (line) => {
    if (!updatedEl || !line) return;
    updatedEl.textContent = line.trim();
    updatedEl.hidden = false;
  };

  const parseLines = (raw) => {
    const lines = raw.replace(/\r\n/g, '\n').split('\n');
    let lastUpdatedLine = '';

    for (let i = 0; i < Math.min(lines.length, 6); i += 1) {
      if (/^last updated\b/i.test(lines[i].trim())) {
        lastUpdatedLine = lines[i].trim();
        lines.splice(i, 1);
        break;
      }
    }

    if (lastUpdatedLine) setUpdated(lastUpdatedLine);

    const fragment = document.createDocumentFragment();
    let paragraph = [];
    let listEl = null;
    let h2Count = 0;

    const flushParagraph = () => {
      if (paragraph.length === 0) return;
      const p = document.createElement('p');
      p.textContent = paragraph.join(' ');
      fragment.appendChild(p);
      paragraph = [];
    };

    const closeList = () => {
      if (listEl) {
        fragment.appendChild(listEl);
        listEl = null;
      }
    };

    const addSeparator = () => {
      const hr = document.createElement('hr');
      hr.className = 'legal-sep';
      fragment.appendChild(hr);
    };

    lines.forEach((line) => {
      const trimmed = line.trim();

      if (!trimmed) {
        flushParagraph();
        closeList();
        return;
      }

      if (trimmed.startsWith('## ')) {
        flushParagraph();
        closeList();
        if (h2Count > 0) addSeparator();
        const title = trimmed.replace(/^##\s+/, '').trim();
        const id = slugify(title) || `section-${h2Count + 1}`;
        const h2 = document.createElement('h2');
        h2.id = id;
        h2.textContent = title;

        const anchor = document.createElement('a');
        anchor.className = 'anchor-link';
        anchor.href = `#${id}`;
        anchor.setAttribute('aria-label', `Copy link to ${title}`);
        anchor.textContent = '#';
        h2.appendChild(anchor);

        fragment.appendChild(h2);
        h2Count += 1;

        if (tocList) {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = `#${id}`;
          a.textContent = title;
          li.appendChild(a);
          tocList.appendChild(li);
        }
        return;
      }

      if (trimmed.startsWith('# ')) {
        flushParagraph();
        closeList();
        const title = trimmed.replace(/^#\s+/, '').trim();
        const h1 = document.createElement('h1');
        h1.className = 'legal-inline-title';
        h1.textContent = title;
        fragment.appendChild(h1);
        return;
      }

      if (trimmed.startsWith('- ')) {
        flushParagraph();
        if (!listEl) {
          listEl = document.createElement('ul');
        }
        const li = document.createElement('li');
        li.textContent = trimmed.replace(/^-\s+/, '');
        listEl.appendChild(li);
        return;
      }

      if (listEl) {
        closeList();
      }

      paragraph.push(trimmed);
    });

    flushParagraph();
    closeList();

    if (tocWrap) {
      tocWrap.hidden = h2Count === 0;
    }

    return fragment;
  };

  const attachCopyHandlers = () => {
    document.querySelectorAll('.anchor-link').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const targetId = link.getAttribute('href');
        if (!targetId) return;

        const url = `${window.location.origin}${window.location.pathname}${targetId}`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).catch(() => {});
        }
        window.history.replaceState(null, '', targetId);

        const original = link.textContent;
        link.textContent = 'Copied';
        link.classList.add('copied');
        window.setTimeout(() => {
          link.textContent = original;
          link.classList.remove('copied');
        }, 1200);
      });
    });
  };

  fetch(encodeURI(src))
    .then((res) => {
      if (!res.ok) throw new Error('Failed to load content');
      return res.text();
    })
    .then((text) => {
      const fragment = parseLines(text);
      if (!fragment) return;
      contentEl.innerHTML = '';
      contentEl.appendChild(fragment);
      attachCopyHandlers();
    })
    .catch(() => {
      contentEl.innerHTML = '<p>Unable to load this document right now.</p>';
    });
})();
