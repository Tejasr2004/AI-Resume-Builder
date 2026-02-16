// ─── AI Resume Builder — Build Track ───
// Route Rail + Gating System (No resume features)

// ─── Step Definitions ───
const STEPS = [
    { num: 1, key: '01-problem',     title: 'Problem Statement',   subtitle: 'Define the core problem your AI Resume Builder will solve.',
      prompt: 'Create a problem statement for an AI Resume Builder.\n\nInclude:\n- Who is the target user?\n- What pain point does this solve?\n- Why do existing solutions fail?\n- What is the desired outcome?\n\nPaste this into Lovable and generate a landing page that communicates this problem clearly.' },

    { num: 2, key: '02-market',      title: 'Market Research',     subtitle: 'Research the competitive landscape and identify your unique angle.',
      prompt: 'Research the AI Resume Builder market.\n\nInclude:\n- 3 existing competitors (name, URL, pricing)\n- Feature comparison table\n- Gap analysis — what they miss\n- Your unique differentiator\n\nPaste this into Lovable and generate a competitive analysis dashboard.' },

    { num: 3, key: '03-architecture', title: 'Architecture',        subtitle: 'Define the system architecture and data flow.',
      prompt: 'Design the system architecture for an AI Resume Builder.\n\nInclude:\n- Component diagram (Frontend, API, AI Engine, Storage)\n- Data flow from user input → AI processing → resume output\n- Tech stack choices and rationale\n- Key API endpoints\n\nPaste this into Lovable and generate an architecture visualization page.' },

    { num: 4, key: '04-hld',         title: 'High-Level Design',   subtitle: 'Map out the screens, user flows, and feature set.',
      prompt: 'Create a high-level design for the AI Resume Builder.\n\nInclude:\n- User flow (onboarding → input → generation → export)\n- Screen inventory (list every page/modal)\n- Feature priority matrix (P0, P1, P2)\n- Navigation structure\n\nPaste this into Lovable and generate a wireframe/sitemap page.' },

    { num: 5, key: '05-lld',         title: 'Low-Level Design',    subtitle: 'Detail the data models, state management, and component specs.',
      prompt: 'Create a low-level design for the AI Resume Builder.\n\nInclude:\n- Data models (User, Resume, Section, Template)\n- State management approach\n- Component hierarchy with props/state\n- Validation rules\n- Error handling strategy\n\nPaste this into Lovable and generate a technical spec page.' },

    { num: 6, key: '06-build',       title: 'Build',               subtitle: 'Implement the core features in Lovable.',
      prompt: 'Build the AI Resume Builder MVP in Lovable.\n\nCore features to implement:\n- Resume input form (personal info, experience, education, skills)\n- AI-powered content suggestions (simulated)\n- Template selection (at least 2 templates)\n- Live preview panel\n- PDF/text export\n\nBuild this step by step in Lovable.' },

    { num: 7, key: '07-test',        title: 'Test',                subtitle: 'Verify all features work correctly before shipping.',
      prompt: 'Test your AI Resume Builder thoroughly.\n\nTest checklist:\n- [ ] Form validation works (required fields)\n- [ ] AI suggestions generate correctly\n- [ ] Template switching works\n- [ ] Preview updates in real-time\n- [ ] Export produces valid output\n- [ ] Mobile responsive\n- [ ] No console errors\n- [ ] Data persists after refresh\n\nScreenshot each test passing.' },

    { num: 8, key: '08-ship',        title: 'Ship',                subtitle: 'Deploy your project and prepare for submission.',
      prompt: 'Ship your AI Resume Builder.\n\nDeployment checklist:\n- [ ] Push code to GitHub\n- [ ] Deploy to Netlify/Vercel\n- [ ] Test deployed URL\n- [ ] Add README with setup instructions\n- [ ] Take final screenshots\n\nPaste your deployed URL and GitHub link.' },
];

const PROOF_ROUTE = 'proof';
const STORAGE_PREFIX = 'rb_step_';
const PROOF_LINKS_KEY = 'rb_proof_links';

// ─── DOM References ───
const appContent = document.getElementById('app-content');
const navContainer = document.getElementById('navbar');
const progressIndicator = document.getElementById('progress-indicator');
const statusBadge = document.getElementById('status-badge');
const footerIndicators = document.getElementById('footer-indicators');

// ─── localStorage Helpers ───
function getArtifact(stepNum) {
    try {
        const raw = localStorage.getItem(STORAGE_PREFIX + stepNum + '_artifact');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch { return null; }
}

function saveArtifact(stepNum, data) {
    localStorage.setItem(STORAGE_PREFIX + stepNum + '_artifact', JSON.stringify(data));
}

function getProofLinks() {
    try {
        const raw = localStorage.getItem(PROOF_LINKS_KEY);
        if (!raw) return { lovable: '', github: '', deploy: '' };
        return JSON.parse(raw);
    } catch { return { lovable: '', github: '', deploy: '' }; }
}

function saveProofLinks(links) {
    localStorage.setItem(PROOF_LINKS_KEY, JSON.stringify(links));
}

function isValidUrl(s) {
    if (!s || !s.trim()) return false;
    try { const u = new URL(s.trim()); return u.protocol === 'http:' || u.protocol === 'https:'; }
    catch { return false; }
}

// ─── Gating Logic ───
function isStepUnlocked(stepNum) {
    if (stepNum === 1) return true;
    return getArtifact(stepNum - 1) !== null;
}

function getHighestUnlockedStep() {
    for (let i = STEPS.length; i >= 1; i--) {
        if (isStepUnlocked(i)) return i;
    }
    return 1;
}

function getCompletedCount() {
    let count = 0;
    for (let i = 1; i <= 8; i++) {
        if (getArtifact(i)) count++;
    }
    return count;
}

function getProjectStatus() {
    const completed = getCompletedCount();
    if (completed === 0) return 'Not Started';
    const links = getProofLinks();
    if (completed === 8 && isValidUrl(links.lovable) && isValidUrl(links.github) && isValidUrl(links.deploy)) return 'Shipped';
    return 'In Progress';
}

// ─── Router ───
function getCurrentRoute() {
    const hash = window.location.hash.slice(1) || '';
    // Remove leading / if present
    return hash.replace(/^\//, '');
}

function navigateTo(route) {
    window.location.hash = '/' + route;
}

function getStepFromRoute(route) {
    return STEPS.find(s => 'rb/' + s.key === route);
}

// ─── Render Helpers ───
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'kn-toast';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }, 50);
}

// ─── Navigation Rendering ───
function renderNav(currentRoute) {
    let html = '';
    STEPS.forEach(step => {
        const route = 'rb/' + step.key;
        const isActive = currentRoute === route;
        const unlocked = isStepUnlocked(step.num);
        const completed = getArtifact(step.num) !== null;

        let cls = 'kn-nav-link';
        if (isActive) cls += ' active';
        if (!unlocked) cls += ' locked';
        if (completed) cls += ' completed';

        const stepNumCls = 'step-num';
        html += `<a class="${cls}" data-route="${route}"><span class="${stepNumCls}">${completed ? '✓' : step.num}</span>${step.title}</a>`;
    });
    // Proof link
    const isProof = currentRoute === 'rb/proof';
    html += `<a class="kn-nav-link${isProof ? ' active' : ''}" data-route="rb/proof"><span class="step-num">⚑</span>Proof</a>`;
    navContainer.innerHTML = html;

    // Attach click handlers
    navContainer.querySelectorAll('.kn-nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const route = link.getAttribute('data-route');
            const step = getStepFromRoute(route);
            if (step && !isStepUnlocked(step.num)) {
                showToast('Complete Step ' + (step.num - 1) + ' first');
                return;
            }
            navigateTo(route);
        });
    });
}

// ─── Footer Rendering ───
function renderFooter() {
    let dots = '';
    const currentStep = getStepFromRoute(getCurrentRoute());
    for (let i = 1; i <= 8; i++) {
        const completed = getArtifact(i) !== null;
        const isCurrent = currentStep && currentStep.num === i;
        let cls = 'step-dot';
        if (completed) cls += ' completed';
        if (isCurrent) cls += ' current';
        dots += `<span class="${cls}" title="Step ${i}"></span>`;
    }
    footerIndicators.innerHTML = dots;
}

// ─── Status Badge Rendering ───
function renderStatusBadge() {
    const status = getProjectStatus();
    statusBadge.innerText = status;
    statusBadge.className = 'kn-badge';
    if (status === 'Not Started') statusBadge.classList.add('kn-badge-not-started');
    else if (status === 'In Progress') statusBadge.classList.add('kn-badge-in-progress');
    else statusBadge.classList.add('kn-badge-shipped');
}

// ─── Progress Indicator ───
function renderProgressIndicator(step) {
    if (step) {
        progressIndicator.innerText = 'Project 3 — Step ' + step.num + ' of 8';
    } else {
        progressIndicator.innerText = 'Project 3 — Proof & Submission';
    }
}

// ─── Build Panel ───
function renderBuildPanel(step) {
    if (!step) return '<div style="padding:24px; text-align:center; color:#666; font-size:14px;">Build panel is available on step pages.</div>';

    const artifact = getArtifact(step.num);
    const feedbackStatus = artifact ? artifact.status : null;

    return `
        <div class="panel-section">
            <div class="panel-label">Copy This Into Lovable</div>
            <textarea class="panel-textarea" id="lovable-prompt" readonly>${step.prompt}</textarea>
        </div>

        <div class="panel-actions">
            <button class="kn-btn kn-btn-secondary kn-btn-sm" id="btn-copy-prompt">📋 Copy</button>
            <a href="https://lovable.dev" target="_blank" class="kn-btn kn-btn-primary kn-btn-sm">🔗 Build in Lovable</a>
        </div>

        <div class="panel-divider"></div>

        <div class="panel-section">
            <div class="panel-label">Feedback</div>
            <div class="feedback-group">
                <button class="kn-btn kn-btn-success kn-btn-sm${feedbackStatus === 'worked' ? ' selected' : ''}" id="btn-worked">✓ It Worked</button>
                <button class="kn-btn kn-btn-error kn-btn-sm${feedbackStatus === 'error' ? ' selected' : ''}" id="btn-error">✗ Error</button>
            </div>
        </div>

        <div class="panel-divider"></div>

        <div class="panel-section">
            <div class="panel-label">Artifact</div>
            <button class="kn-btn kn-btn-secondary kn-btn-sm" id="btn-screenshot" style="width:100%;">
                📸 Add Screenshot
            </button>
            <input type="file" id="artifact-file-input" accept="image/*" style="display:none;">
            ${artifact ? `<div style="margin-top:8px; font-size:12px; color:var(--color-success); font-weight:500;">✓ ${artifact.filename || 'Artifact uploaded'}</div>` : '<div style="margin-top:8px; font-size:12px; color:var(--color-muted);">Upload required to proceed</div>'}
        </div>
    `;
}

// ─── Step Page ───
function renderStepPage(step) {
    const artifact = getArtifact(step.num);
    const isLastStep = step.num === 8;
    const canGoNext = artifact !== null;
    const canGoPrev = step.num > 1;

    return `
        <div class="step-title">${step.title}</div>
        <div class="step-subtitle">${step.subtitle}</div>

        <div class="step-instruction">
            <h3>What to do in this step</h3>
            <p>${step.prompt.replace(/\n/g, '<br>')}</p>
        </div>

        <div class="artifact-area${artifact ? ' uploaded' : ''}" id="artifact-drop-zone">
            <div class="icon">${artifact ? '✓' : '📁'}</div>
            <div class="label">${artifact ? 'Artifact Uploaded: ' + (artifact.filename || 'screenshot') : 'Click to upload artifact (screenshot)'}</div>
            <div class="hint">${artifact ? 'Uploaded ' + new Date(artifact.timestamp).toLocaleString() : 'PNG, JPG, or any image file'}</div>
        </div>
        <input type="file" id="workspace-file-input" accept="image/*" style="display:none;">

        <div class="step-nav-buttons">
            ${canGoPrev ? `<button class="kn-btn kn-btn-secondary" id="btn-prev">← Previous</button>` : '<div></div>'}
            ${isLastStep
                ? `<button class="kn-btn kn-btn-primary" id="btn-goto-proof" ${!canGoNext ? 'disabled' : ''}>Go to Proof →</button>`
                : `<button class="kn-btn kn-btn-primary" id="btn-next" ${!canGoNext ? 'disabled' : ''}>Next Step →</button>`
            }
        </div>
    `;
}

// ─── Proof Page ───
function renderProofPage() {
    const links = getProofLinks();
    const status = getProjectStatus();
    const isShipped = status === 'Shipped';

    let stepsHtml = '';
    STEPS.forEach(step => {
        const artifact = getArtifact(step.num);
        const done = artifact !== null;
        stepsHtml += `
            <div class="proof-step-row">
                <div class="step-info">
                    <div class="status-icon ${done ? 'done' : 'pending'}">${done ? '✓' : step.num}</div>
                    <span>${step.title}</span>
                </div>
                <span style="font-size:12px; font-weight:500; color:${done ? 'var(--color-success)' : 'var(--color-muted)'};">${done ? 'Completed' : 'Pending'}</span>
            </div>
        `;
    });

    return `
        <div class="proof-container">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-3);">
                <div>
                    <h1 style="margin-bottom:4px;">Proof & Submission</h1>
                    <p style="color:var(--color-muted); font-size:14px; margin:0;">Review your build progress and submit proof links.</p>
                </div>
                <span class="kn-badge ${isShipped ? 'kn-badge-shipped' : 'kn-badge-in-progress'}">${status}</span>
            </div>

            <div class="proof-card">
                <div class="proof-card-title">Step Completion (${getCompletedCount()} / 8)</div>
                ${stepsHtml}
            </div>

            <div class="proof-card">
                <div class="proof-card-title">Artifact Links</div>
                <p style="font-size:12px; color:var(--color-muted); margin-bottom:var(--space-2);">All 3 links are required for Shipped status.</p>

                <div class="proof-input-group">
                    <label>Lovable Project Link <span class="required">*</span></label>
                    <input type="url" class="proof-input${isValidUrl(links.lovable) ? ' valid' : ''}" id="proof-lovable" placeholder="https://lovable.dev/projects/..." value="${links.lovable}">
                </div>

                <div class="proof-input-group">
                    <label>GitHub Repository <span class="required">*</span></label>
                    <input type="url" class="proof-input${isValidUrl(links.github) ? ' valid' : ''}" id="proof-github" placeholder="https://github.com/username/repo" value="${links.github}">
                </div>

                <div class="proof-input-group">
                    <label>Deploy Link <span class="required">*</span></label>
                    <input type="url" class="proof-input${isValidUrl(links.deploy) ? ' valid' : ''}" id="proof-deploy" placeholder="https://your-app.netlify.app" value="${links.deploy}">
                </div>
            </div>

            <div class="proof-card" style="text-align:center;">
                <div class="proof-card-title">Final Submission</div>
                <button class="kn-btn kn-btn-primary" id="btn-copy-submission">📋 Copy Final Submission</button>
                ${isShipped ? '<div style="margin-top:12px; color:var(--color-success); font-weight:600; font-size:14px;">Project 3 — Shipped Successfully.</div>' : ''}
            </div>
        </div>
    `;
}

// ─── Main Render ───
function render() {
    const route = getCurrentRoute();
    const step = getStepFromRoute(route);

    // Default: if no route or root, go to first step
    if (!route || route === '' || route === 'rb') {
        navigateTo('rb/01-problem');
        return;
    }

    // Gate check
    if (step && !isStepUnlocked(step.num)) {
        const highest = getHighestUnlockedStep();
        showToast('Complete Step ' + (step.num - 1) + ' first');
        navigateTo('rb/' + STEPS[highest - 1].key);
        return;
    }

    renderNav(route);
    renderFooter();
    renderStatusBadge();
    renderProgressIndicator(step);

    const isProof = route === 'rb/proof' || route === 'rb/' + PROOF_ROUTE;

    if (isProof) {
        // Proof page: full-width workspace, no build panel
        document.getElementById('workspace').innerHTML = renderProofPage();
        document.getElementById('build-panel').innerHTML = renderBuildPanel(null);
    } else if (step) {
        document.getElementById('workspace').innerHTML = renderStepPage(step);
        document.getElementById('build-panel').innerHTML = renderBuildPanel(step);
    } else {
        // Unknown route → go to step 1
        navigateTo('rb/01-problem');
        return;
    }

    attachEventListeners(step);
}

// ─── Event Listeners ───
function attachEventListeners(step) {
    const route = getCurrentRoute();
    const isProof = route === 'rb/proof';

    if (isProof) {
        // Proof page listeners
        const lovableInput = document.getElementById('proof-lovable');
        const githubInput = document.getElementById('proof-github');
        const deployInput = document.getElementById('proof-deploy');
        const copyBtn = document.getElementById('btn-copy-submission');

        [lovableInput, githubInput, deployInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    const links = {
                        lovable: document.getElementById('proof-lovable').value.trim(),
                        github: document.getElementById('proof-github').value.trim(),
                        deploy: document.getElementById('proof-deploy').value.trim()
                    };
                    saveProofLinks(links);
                    renderStatusBadge();
                    // Update input styling
                    input.classList.toggle('valid', isValidUrl(input.value));
                });
            }
        });

        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const links = getProofLinks();
                const completedSteps = STEPS.filter(s => getArtifact(s.num) !== null).map(s => '✓ ' + s.title).join('\n');
                const pendingSteps = STEPS.filter(s => getArtifact(s.num) === null).map(s => '○ ' + s.title).join('\n');
                const text = `──────────────────────────────────
AI Resume Builder — Final Submission

Lovable Project: ${links.lovable || '(not provided)'}
GitHub Repository: ${links.github || '(not provided)'}
Live Deployment: ${links.deploy || '(not provided)'}

Completed Steps:
${completedSteps || '(none)'}
${pendingSteps ? '\nPending Steps:\n' + pendingSteps : ''}
──────────────────────────────────`;
                navigator.clipboard.writeText(text).then(() => showToast('Submission copied to clipboard!'));
            });
        }
        return;
    }

    if (!step) return;

    // Copy prompt
    const copyBtn = document.getElementById('btn-copy-prompt');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const textarea = document.getElementById('lovable-prompt');
            navigator.clipboard.writeText(textarea.value).then(() => showToast('Prompt copied!'));
        });
    }

    // Feedback buttons
    const workedBtn = document.getElementById('btn-worked');
    const errorBtn = document.getElementById('btn-error');

    if (workedBtn) {
        workedBtn.addEventListener('click', () => {
            let artifact = getArtifact(step.num) || { filename: null, timestamp: Date.now() };
            artifact.status = 'worked';
            artifact.timestamp = Date.now();
            saveArtifact(step.num, artifact);
            render();
        });
    }

    if (errorBtn) {
        errorBtn.addEventListener('click', () => {
            let artifact = getArtifact(step.num) || { filename: null, timestamp: Date.now() };
            artifact.status = 'error';
            artifact.timestamp = Date.now();
            saveArtifact(step.num, artifact);
            render();
        });
    }

    // Screenshot upload (panel)
    const screenshotBtn = document.getElementById('btn-screenshot');
    const panelFileInput = document.getElementById('artifact-file-input');
    if (screenshotBtn && panelFileInput) {
        screenshotBtn.addEventListener('click', () => panelFileInput.click());
        panelFileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                saveArtifact(step.num, { filename: file.name, timestamp: Date.now(), status: 'uploaded' });
                showToast('Artifact uploaded: ' + file.name);
                render();
            }
        });
    }

    // Workspace drop zone / click upload
    const dropZone = document.getElementById('artifact-drop-zone');
    const workspaceFileInput = document.getElementById('workspace-file-input');
    if (dropZone && workspaceFileInput) {
        dropZone.addEventListener('click', () => workspaceFileInput.click());
        workspaceFileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                saveArtifact(step.num, { filename: file.name, timestamp: Date.now(), status: 'uploaded' });
                showToast('Artifact uploaded: ' + file.name);
                render();
            }
        });
    }

    // Navigation buttons
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    const proofBtn = document.getElementById('btn-goto-proof');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            navigateTo('rb/' + STEPS[step.num - 2].key);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (getArtifact(step.num)) {
                navigateTo('rb/' + STEPS[step.num].key);
            } else {
                showToast('Upload an artifact first');
            }
        });
    }

    if (proofBtn) {
        proofBtn.addEventListener('click', () => {
            if (getArtifact(step.num)) {
                navigateTo('rb/proof');
            } else {
                showToast('Upload an artifact first');
            }
        });
    }
}

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
    render();

    window.addEventListener('hashchange', () => {
        render();
    });
});
