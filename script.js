// ─── AI Resume Builder — Premium Webapp ───
// Features: Auto-save, Live Preview, ATS Scoring v1 (deterministic)

// ─── Resume Data Model ───
let resumeData = {
    personal: { name: '', email: '', phone: '', location: '' },
    summary: '',
    education: [],
    experience: [],
    projects: [],
    skills: { technical: [], soft: [], tools: [] },
    links: { github: '', linkedin: '' }
};

const STORAGE_KEY = 'resumeBuilderData';
const TEMPLATE_KEY = 'rb_template';
const TEMPLATES = ['classic', 'modern', 'minimal'];

function getTemplate() {
    return localStorage.getItem(TEMPLATE_KEY) || 'classic';
}

function setTemplate(name) {
    localStorage.setItem(TEMPLATE_KEY, name);
}

function loadResumeData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            resumeData = parsed;
            // Migrate old string skills to new format
            if (typeof resumeData.skills === 'string') {
                const arr = resumeData.skills.split(',').map(s => s.trim()).filter(Boolean);
                resumeData.skills = { technical: arr, soft: [], tools: [] };
            }
            if (!resumeData.skills || typeof resumeData.skills !== 'object' || Array.isArray(resumeData.skills)) {
                resumeData.skills = { technical: [], soft: [], tools: [] };
            }
            if (!resumeData.skills.technical) resumeData.skills.technical = [];
            if (!resumeData.skills.soft) resumeData.skills.soft = [];
            if (!resumeData.skills.tools) resumeData.skills.tools = [];
            // Migrate old project format
            resumeData.projects = (resumeData.projects || []).map(p => ({
                name: p.name || '',
                description: p.description || '',
                techStack: p.techStack || (p.tech ? p.tech.split(',').map(s => s.trim()).filter(Boolean) : []),
                liveUrl: p.liveUrl || '',
                githubUrl: p.githubUrl || ''
            }));
        }
    } catch { /* ignore */ }
}

function saveResumeData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumeData));
}

function getAllSkills() {
    const s = resumeData.skills;
    return [...(s.technical || []), ...(s.soft || []), ...(s.tools || [])];
}

function getAllSkillsFrom(d) {
    const s = d.skills || {};
    if (typeof s === 'string') return s.split(',').map(x => x.trim()).filter(Boolean);
    return [...(s.technical || []), ...(s.soft || []), ...(s.tools || [])];
}

// ─── Sample Data ───
const SAMPLE_DATA = {
    personal: {
        name: 'Arjun Mehta',
        email: 'arjun.mehta@email.com',
        phone: '+91 98765 43210',
        location: 'Bangalore, India'
    },
    summary: 'Results-driven Full Stack Developer with 2+ years of experience building scalable web applications. Proficient in React, Node.js, and cloud technologies. Passionate about clean code architecture and delivering user-centric products that solve real-world problems.',
    education: [
        { institution: 'Indian Institute of Technology, Bangalore', degree: 'B.Tech in Computer Science', startDate: '2019', endDate: '2023', description: 'CGPA: 8.7/10. Coursework: Data Structures, Algorithms, Database Systems, Machine Learning.' },
        { institution: 'Delhi Public School, R.K. Puram', degree: 'Class XII — CBSE', startDate: '2017', endDate: '2019', description: 'Percentage: 95.4%. School topper in Computer Science.' }
    ],
    experience: [
        { company: 'Flipkart', role: 'Software Development Engineer', startDate: 'Jul 2023', endDate: 'Present', description: 'Built high-performance product catalog microservices handling 50K+ RPM. Led migration from monolithic architecture to event-driven microservices. Reduced API latency by 40% through caching strategies and query optimization.' },
        { company: 'Microsoft (Intern)', role: 'Software Engineering Intern', startDate: 'Jan 2023', endDate: 'Jun 2023', description: 'Developed internal dashboard using React and Azure Functions. Implemented CI/CD pipeline reducing deployment time by 60%. Collaborated with a team of 8 engineers across 3 time zones.' }
    ],
    projects: [
        { name: 'CodeCollab — Real-time Code Editor', description: 'Built a collaborative code editor supporting 10+ concurrent users with real-time sync. Implemented operational transformation for conflict resolution.', techStack: ['React', 'WebSocket', 'Monaco Editor'], liveUrl: 'https://codecollab.demo.app', githubUrl: 'https://github.com/arjunmehta/codecollab' },
        { name: 'HealthTrack — Fitness Analytics', description: 'Developed a fitness tracking app with AI-powered workout suggestions. Integrated Google Fit API for automated data collection.', techStack: ['Next.js', 'PostgreSQL', 'Chart.js'], liveUrl: '', githubUrl: 'https://github.com/arjunmehta/healthtrack' }
    ],
    skills: {
        technical: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'GraphQL'],
        soft: ['Team Leadership', 'Problem Solving', 'Communication'],
        tools: ['AWS', 'Docker', 'Git', 'Redis', 'CI/CD']
    },
    links: { github: 'https://github.com/arjunmehta', linkedin: 'https://linkedin.com/in/arjunmehta' }
};

// ─── Router ───
function getRoute() {
    const hash = window.location.hash.slice(1) || '/';
    return hash;
}

function navigateTo(route) {
    window.location.hash = route;
}

// ─── Toast ───
function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'kn-toast';
    t.innerText = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.classList.add('show'); setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2000); }, 50);
}

// ─── Nav Rendering ───
function renderNav(route) {
    const links = [
        { path: '/builder', label: 'Builder' },
        { path: '/preview', label: 'Preview' },
        { path: '/proof', label: 'Proof' }
    ];
    const nav = document.getElementById('main-nav');
    nav.innerHTML = links.map(l =>
        `<a class="nav-link${route === l.path ? ' active' : ''}" data-route="${l.path}">${l.label}</a>`
    ).join('');

    nav.querySelectorAll('.nav-link').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            navigateTo(a.getAttribute('data-route'));
        });
    });
}

// ─── Home Page ───
function renderHome() {
    return `
        <div class="hero">
            <h1>Build a Resume<br>That Gets <em>Read.</em></h1>
            <p class="tagline">Structured, intentional, and built for the roles you actually want. No templates. No fluff. Just clarity.</p>
            <button class="kn-btn kn-btn-primary" id="cta-start">Start Building →</button>
            <div class="hero-features">
                <div class="hero-feature">
                    <div class="icon">✎</div>
                    <h4>Structured Input</h4>
                    <p>Guided form sections for every resume component</p>
                </div>
                <div class="hero-feature">
                    <div class="icon">◉</div>
                    <h4>Live Preview</h4>
                    <p>See your resume update in real-time as you type</p>
                </div>
                <div class="hero-feature">
                    <div class="icon">▤</div>
                    <h4>Clean Output</h4>
                    <p>Premium black & white typography that recruiters respect</p>
                </div>
            </div>
        </div>
    `;
}

// ─── Builder Page ───
function renderBuilderForm() {
    const d = resumeData;

    const eduEntries = d.education.map((e, i) => `
        <div class="entry-card">
            <button class="remove-entry" data-type="education" data-index="${i}">×</button>
            <div class="form-row">
                <div class="form-group"><label>Institution</label><input class="form-input" data-field="education.${i}.institution" value="${esc(e.institution)}"></div>
                <div class="form-group"><label>Degree</label><input class="form-input" data-field="education.${i}.degree" value="${esc(e.degree)}"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Start</label><input class="form-input" data-field="education.${i}.startDate" value="${esc(e.startDate)}" placeholder="2019"></div>
                <div class="form-group"><label>End</label><input class="form-input" data-field="education.${i}.endDate" value="${esc(e.endDate)}" placeholder="2023"></div>
            </div>
            <div class="form-group"><label>Description</label><textarea class="form-input" data-field="education.${i}.description" rows="2">${esc(e.description)}</textarea></div>
        </div>
    `).join('');

    const expEntries = d.experience.map((e, i) => `
        <div class="entry-card">
            <button class="remove-entry" data-type="experience" data-index="${i}">×</button>
            <div class="form-row">
                <div class="form-group"><label>Company</label><input class="form-input" data-field="experience.${i}.company" value="${esc(e.company)}"></div>
                <div class="form-group"><label>Role</label><input class="form-input" data-field="experience.${i}.role" value="${esc(e.role)}"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Start</label><input class="form-input" data-field="experience.${i}.startDate" value="${esc(e.startDate)}" placeholder="Jul 2023"></div>
                <div class="form-group"><label>End</label><input class="form-input" data-field="experience.${i}.endDate" value="${esc(e.endDate)}" placeholder="Present"></div>
            </div>
            <div class="form-group"><label>Description</label><textarea class="form-input" data-field="experience.${i}.description" rows="3">${esc(e.description)}</textarea>${renderBulletHints(e.description)}</div>
        </div>
    `).join('');

    const projEntries = d.projects.map((e, i) => {
        const title = e.name || 'Untitled Project';
        const charCount = (e.description || '').length;
        const techTags = (e.techStack || []).map((t, ti) => `<span class="skill-pill" data-project-tech="${i}" data-tech-index="${ti}">${esc(t)} <button class="pill-remove" data-action="remove-proj-tech" data-proj="${i}" data-tidx="${ti}">&times;</button></span>`).join('');
        return `
        <div class="project-entry ${e._collapsed ? 'collapsed' : ''}" data-proj-index="${i}">
            <div class="project-header" data-toggle-proj="${i}">
                <span class="project-header-title">${esc(title)}</span>
                <div class="project-header-actions">
                    <button class="collapse-toggle" data-toggle-proj="${i}">${e._collapsed ? '▸' : '▾'}</button>
                    <button class="remove-entry" data-type="projects" data-index="${i}">×</button>
                </div>
            </div>
            <div class="project-body">
                <div class="form-group"><label>Project Title</label><input class="form-input" data-field="projects.${i}.name" value="${esc(e.name)}" placeholder="My Awesome Project"></div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea class="form-input" data-field="projects.${i}.description" rows="3" maxlength="200" placeholder="Describe what you built...">${esc(e.description)}</textarea>
                    <div class="char-counter">${charCount}/200</div>
                    ${renderBulletHints(e.description)}
                </div>
                <div class="form-group">
                    <label>Tech Stack</label>
                    <div class="tag-container" data-proj-tech="${i}">
                        ${techTags}
                        <input class="tag-input" data-proj-tech-input="${i}" placeholder="Add tech… press Enter">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>Live URL <span style="color:var(--color-muted); font-weight:400;">(optional)</span></label><input class="form-input" data-field="projects.${i}.liveUrl" value="${esc(e.liveUrl || '')}" placeholder="https://myapp.com"></div>
                    <div class="form-group"><label>GitHub URL <span style="color:var(--color-muted); font-weight:400;">(optional)</span></label><input class="form-input" data-field="projects.${i}.githubUrl" value="${esc(e.githubUrl || '')}" placeholder="https://github.com/..."></div>
                </div>
            </div>
        </div>
    `;
    }).join('');

    // Skills form with 3 categories
    const SKILL_CATS = [
        { key: 'technical', label: 'Technical Skills' },
        { key: 'soft', label: 'Soft Skills' },
        { key: 'tools', label: 'Tools & Technologies' }
    ];
    const skillsHtml = SKILL_CATS.map(cat => {
        const items = d.skills[cat.key] || [];
        const tags = items.map((s, si) => `<span class="skill-pill"><span>${esc(s)}</span> <button class="pill-remove" data-action="remove-skill" data-cat="${cat.key}" data-sidx="${si}">&times;</button></span>`).join('');
        return `
            <div class="skill-category">
                <div class="skill-category-label">${cat.label} (${items.length})</div>
                <div class="tag-container" data-skill-cat="${cat.key}">
                    ${tags}
                    <input class="tag-input" data-skill-input="${cat.key}" placeholder="Type and press Enter">
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="form-header">
            <h2>Resume Builder</h2>
            <button class="kn-btn kn-btn-secondary kn-btn-sm" id="btn-load-sample">Load Sample Data</button>
        </div>

        <!-- Personal Info -->
        <div class="form-section">
            <div class="form-section-title">Personal Information</div>
            <div class="form-row">
                <div class="form-group"><label>Full Name</label><input class="form-input" data-field="personal.name" value="${esc(d.personal.name)}" placeholder="Arjun Mehta"></div>
                <div class="form-group"><label>Email</label><input class="form-input" data-field="personal.email" value="${esc(d.personal.email)}" placeholder="arjun@email.com"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Phone</label><input class="form-input" data-field="personal.phone" value="${esc(d.personal.phone)}" placeholder="+91 98765 43210"></div>
                <div class="form-group"><label>Location</label><input class="form-input" data-field="personal.location" value="${esc(d.personal.location)}" placeholder="Bangalore, India"></div>
            </div>
        </div>

        <!-- Summary -->
        <div class="form-section">
            <div class="form-section-title">Professional Summary</div>
            <div class="form-group"><textarea class="form-input" data-field="summary" rows="3" placeholder="A brief 2-3 sentence summary of your experience and goals...">${esc(d.summary)}</textarea></div>
        </div>

        <!-- Education -->
        <div class="form-section">
            <div class="form-section-title">Education <button class="kn-btn-ghost" id="btn-add-edu">+ Add Entry</button></div>
            <div id="edu-entries">${eduEntries}</div>
        </div>

        <!-- Experience -->
        <div class="form-section">
            <div class="form-section-title">Experience <button class="kn-btn-ghost" id="btn-add-exp">+ Add Entry</button></div>
            <div id="exp-entries">${expEntries}</div>
        </div>

        <!-- Projects -->
        <div class="form-section">
            <div class="form-section-title">Projects <button class="kn-btn-ghost" id="btn-add-proj">+ Add Project</button></div>
            <div id="proj-entries">${projEntries}</div>
        </div>

        <!-- Skills -->
        <div class="form-section">
            <div class="form-section-title">Skills <button class="kn-btn-ghost" id="btn-suggest-skills">✨ Suggest Skills</button></div>
            ${skillsHtml}
        </div>

        <!-- Links -->
        <div class="form-section">
            <div class="form-section-title">Links</div>
            <div class="form-row">
                <div class="form-group"><label>GitHub</label><input class="form-input" data-field="links.github" value="${esc(d.links.github)}" placeholder="https://github.com/username"></div>
                <div class="form-group"><label>LinkedIn</label><input class="form-input" data-field="links.linkedin" value="${esc(d.links.linkedin)}" placeholder="https://linkedin.com/in/username"></div>
            </div>
        </div>
    `;
}

// ─── Resume Preview Renderer ───
function renderResumePreview(data) {
    const d = data || resumeData;
    const allSkills = getAllSkillsFrom(d);
    const hasContent = d.personal.name || d.summary || d.education.length || d.experience.length || d.projects.length || allSkills.length;

    if (!hasContent) {
        return `
            <div class="preview-paper">
                <div class="empty-preview">
                    <div class="icon">📄</div>
                    <h3>Your resume will appear here</h3>
                    <p>Start filling in the form on the left, or load sample data to see a preview.</p>
                </div>
            </div>
        `;
    }

    const contact = [d.personal.email, d.personal.phone, d.personal.location].filter(Boolean).join('  •  ');
    const linksLine = [
        d.links.github ? `<a href="${esc(d.links.github)}">${esc(d.links.github.replace('https://', ''))}</a>` : '',
        d.links.linkedin ? `<a href="${esc(d.links.linkedin)}">${esc(d.links.linkedin.replace('https://', ''))}</a>` : ''
    ].filter(Boolean).join('  •  ');

    const summaryHtml = d.summary ? `
        <div class="resume-section">
            <div class="resume-section-title">Summary</div>
            <div class="resume-summary">${esc(d.summary)}</div>
        </div>
    ` : '';

    const eduHtml = d.education.length ? `
        <div class="resume-section">
            <div class="resume-section-title">Education</div>
            ${d.education.map(e => `
                <div class="resume-entry">
                    <div class="resume-entry-header">
                        <span class="title">${esc(e.institution)}</span>
                        <span class="date">${esc(e.startDate)}${e.endDate ? ' – ' + esc(e.endDate) : ''}</span>
                    </div>
                    ${e.degree ? `<div class="subtitle">${esc(e.degree)}</div>` : ''}
                    ${e.description ? `<div class="description">${esc(e.description)}</div>` : ''}
                </div>
            `).join('')}
        </div>
    ` : '';

    const expHtml = d.experience.length ? `
        <div class="resume-section">
            <div class="resume-section-title">Experience</div>
            ${d.experience.map(e => `
                <div class="resume-entry">
                    <div class="resume-entry-header">
                        <span class="title">${esc(e.company)}${e.role ? ' — ' + esc(e.role) : ''}</span>
                        <span class="date">${esc(e.startDate)}${e.endDate ? ' – ' + esc(e.endDate) : ''}</span>
                    </div>
                    ${e.description ? `<div class="description">${esc(e.description)}</div>` : ''}
                </div>
            `).join('')}
        </div>
    ` : '';

    const projHtml = d.projects.length ? `
        <div class="resume-section">
            <div class="resume-section-title">Projects</div>
            ${d.projects.map(e => {
        const techTags = (e.techStack || []).map(t => `<span class="resume-skill-tag">${esc(t)}</span>`).join('');
        const linkIcons = [
            e.liveUrl ? `<a href="${esc(e.liveUrl)}" class="resume-link-icon" title="Live">&#x2197;</a>` : '',
            e.githubUrl ? `<a href="${esc(e.githubUrl)}" class="resume-link-icon" title="GitHub">&#x2693;</a>` : ''
        ].filter(Boolean).join(' ');
        return `
                <div class="resume-entry resume-project-card">
                    <div class="resume-entry-header">
                        <span class="title">${esc(e.name)}${linkIcons ? ' ' + linkIcons : ''}</span>
                    </div>
                    ${e.description ? `<div class="description">${esc(e.description)}</div>` : ''}
                    ${techTags ? `<div class="resume-skills" style="margin-top:6px;">${techTags}</div>` : ''}
                </div>
            `;
    }).join('')}
        </div>
    ` : '';

    // Skills: grouped by category
    const previewSkills = getAllSkillsFrom(d);
    const hasSkills = previewSkills.length > 0;
    let skillsHtml = '';
    if (hasSkills) {
        const cats = [
            { key: 'technical', label: 'Technical' },
            { key: 'soft', label: 'Soft Skills' },
            { key: 'tools', label: 'Tools' }
        ];
        const groups = cats.map(cat => {
            const items = d.skills[cat.key] || [];
            if (!items.length) return '';
            return `
                <div class="resume-skill-group">
                    <span class="resume-skill-group-label">${cat.label}:</span>
                    ${items.map(s => `<span class="resume-skill-tag">${esc(s)}</span>`).join('')}
                </div>
            `;
        }).filter(Boolean).join('');
        skillsHtml = `
            <div class="resume-section">
                <div class="resume-section-title">Skills</div>
                ${groups}
            </div>
        `;
    }

    const linksHtml = linksLine ? `
        <div class="resume-section">
            <div class="resume-section-title">Links</div>
            <div class="resume-links">${linksLine}</div>
        </div>
    ` : '';

    const tpl = getTemplate();
    return `
        <div class="preview-paper tpl-${tpl}">
            <div class="resume-name">${esc(d.personal.name) || 'Your Name'}</div>
            ${contact ? `<div class="resume-contact">${contact}</div>` : ''}
            ${summaryHtml}
            ${expHtml}
            ${eduHtml}
            ${projHtml}
            ${skillsHtml}
            ${linksHtml}
        </div>
    `;
}

// ─── Preview Page ───
function renderPreviewPage() {
    const warnings = getExportWarnings();
    const warningHtml = warnings.length ? `
        <div class="export-warning">
            <span class="export-warning-icon">⚠</span>
            <span>${warnings.join(' ')}</span>
        </div>
    ` : '';

    return `
        <div class="preview-page">
            <div class="preview-toolbar no-print">
                ${renderTemplateTabs()}
                <div class="export-actions">
                    <button class="kn-btn kn-btn-secondary kn-btn-sm" id="btn-copy-text">⎘ Copy Resume as Text</button>
                    <button class="kn-btn kn-btn-primary kn-btn-sm" id="btn-print">⎙ Print / Save as PDF</button>
                </div>
            </div>
            ${warningHtml}
            <div id="preview-paper-wrapper">${renderResumePreview()}</div>
        </div>
    `;
}

// ─── Export: Plain-text Resume Generator ───
function generatePlainText() {
    const d = resumeData;
    const lines = [];

    // Name
    if (d.personal.name) lines.push(d.personal.name.toUpperCase(), '');

    // Contact
    const contact = [d.personal.email, d.personal.phone, d.personal.location].filter(Boolean);
    if (contact.length) lines.push(contact.join('  |  '), '');

    // Summary
    if (d.summary && d.summary.trim()) {
        lines.push('SUMMARY', '-'.repeat(40));
        lines.push(d.summary.trim(), '');
    }

    // Education
    if (d.education.length) {
        lines.push('EDUCATION', '-'.repeat(40));
        d.education.forEach(e => {
            const dateStr = [e.startDate, e.endDate].filter(Boolean).join(' – ');
            if (e.institution) lines.push(`${e.institution}${dateStr ? '  (' + dateStr + ')' : ''}`);
            if (e.degree) lines.push(`  ${e.degree}`);
            if (e.description) lines.push(`  ${e.description}`);
            lines.push('');
        });
    }

    // Experience
    if (d.experience.length) {
        lines.push('EXPERIENCE', '-'.repeat(40));
        d.experience.forEach(e => {
            const dateStr = [e.startDate, e.endDate].filter(Boolean).join(' – ');
            const header = [e.company, e.role].filter(Boolean).join(' — ');
            if (header) lines.push(`${header}${dateStr ? '  (' + dateStr + ')' : ''}`);
            if (e.description) {
                e.description.split(/[.\n]/).map(b => b.trim()).filter(Boolean).forEach(b => {
                    lines.push(`  • ${b}`);
                });
            }
            lines.push('');
        });
    }

    // Projects
    if (d.projects.length) {
        lines.push('PROJECTS', '-'.repeat(40));
        d.projects.forEach(e => {
            const techStr = (e.techStack || []).join(', ');
            if (e.name) lines.push(`${e.name}${techStr ? '  [' + techStr + ']' : ''}`);
            if (e.description) {
                e.description.split(/[.\n]/).map(b => b.trim()).filter(Boolean).forEach(b => {
                    lines.push(`  • ${b}`);
                });
            }
            if (e.liveUrl) lines.push(`  Live: ${e.liveUrl}`);
            if (e.githubUrl) lines.push(`  GitHub: ${e.githubUrl}`);
            lines.push('');
        });
    }

    // Skills
    const allSkillsText = getAllSkillsFrom(d);
    if (allSkillsText.length) {
        lines.push('SKILLS', '-'.repeat(40));
        const cats = [
            { key: 'technical', label: 'Technical' },
            { key: 'soft', label: 'Soft Skills' },
            { key: 'tools', label: 'Tools' }
        ];
        cats.forEach(cat => {
            const items = (d.skills && d.skills[cat.key]) || [];
            if (items.length) lines.push(`${cat.label}: ${items.join(', ')}`);
        });
        lines.push('');
    }

    // Links
    const links = [d.links.github, d.links.linkedin].filter(Boolean);
    if (links.length) {
        lines.push('LINKS', '-'.repeat(40));
        links.forEach(l => lines.push(l));
        lines.push('');
    }

    return lines.join('\n');
}

// ─── Export Validation ───
function getExportWarnings() {
    const d = resumeData;
    const warnings = [];
    if (!d.personal.name || !d.personal.name.trim()) warnings.push('No name provided.');
    if (!d.experience.length && !d.projects.length) warnings.push('No experience or projects added.');
    if (warnings.length) return ['Your resume may look incomplete: ' + warnings.join(' ')];
    return [];
}

// ─── Preview Export Listeners ───
function attachPreviewListeners() {
    const printBtn = document.getElementById('btn-print');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }

    const copyBtn = document.getElementById('btn-copy-text');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const text = generatePlainText();
            navigator.clipboard.writeText(text).then(() => {
                showToast('Resume copied to clipboard');
            }).catch(() => {
                // Fallback for older browsers
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                showToast('Resume copied to clipboard');
            });
        });
    }
}
// ─── Proof Event Listeners ───
function attachProofListeners() {
    const container = document.querySelector('.proof-page');
    if (!container) return;

    // Checklist toggles
    container.querySelectorAll('.proof-check-input').forEach(chk => {
        chk.addEventListener('change', (e) => {
            const idx = parseInt(e.target.getAttribute('data-index'));
            proofData.checklist[idx] = e.target.checked;
            saveProofData();
            // Re-render to update status badge
            document.getElementById('app-content').innerHTML = renderProofPage();
            attachProofListeners();
        });
    });

    // Artifact inputs
    container.querySelectorAll('.proof-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const field = e.target.getAttribute('data-artifact');
            proofData.artifacts[field] = e.target.value.trim();
            saveProofData();
            // Check status on input (no full re-render needed, just badge maybe? simpler to re-render for consistency or just wait for reload. Let's re-render on blur or just update badge manually? To keep it snappy, let's just save. The user will see 'Shipped' when they complete the last item which is usually a checkbox or input.)
            // Actually, for immediate feedback on the badge, we need to check status.
            const isShipped = checkShippedStatus();
            const badge = container.querySelector('.proof-badge');
            if (badge) {
                if (isShipped) {
                    badge.className = 'proof-badge status-shipped';
                    badge.textContent = 'Shipped';
                    if (!container.querySelector('.proof-success-message')) {
                        const msg = document.createElement('div');
                        msg.className = 'proof-success-message';
                        msg.textContent = 'Project 3 Shipped Successfully.';
                        container.querySelector('.proof-header').after(msg);
                    }
                } else {
                    badge.className = 'proof-badge status-progress';
                    badge.textContent = 'In Progress';
                    const msg = container.querySelector('.proof-success-message');
                    if (msg) msg.remove();
                }
            }
        });
    });

    // Copy Final Submission
    const copyBtn = document.getElementById('btn-copy-submission');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const text = `
------------------------------------------
AI Resume Builder — Final Submission

Lovable Project: ${proofData.artifacts.lovable || '[Missing]'}
GitHub Repository: ${proofData.artifacts.github || '[Missing]'}
Live Deployment: ${proofData.artifacts.deployed || '[Missing]'}

Core Capabilities:
- Structured resume builder
- Deterministic ATS scoring
- Template switching
- PDF export with clean formatting
- Persistence + validation checklist
------------------------------------------
`.trim();
            navigator.clipboard.writeText(text).then(() => {
                showToast('Submission copied to clipboard');
            });
        });
    }
}

// ─── Proof State ───
const PROOF_KEY = 'rb_final_submission';
let proofData = {
    checklist: Array(10).fill(false),
    artifacts: { lovable: '', github: '', deployed: '' }
};

function loadProofData() {
    try {
        const raw = localStorage.getItem(PROOF_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.checklist && Array.isArray(parsed.checklist)) proofData.checklist = parsed.checklist;
            if (parsed.artifacts) proofData.artifacts = { ...proofData.artifacts, ...parsed.artifacts };
        }
    } catch { /* ignore */ }
}

function saveProofData() {
    localStorage.setItem(PROOF_KEY, JSON.stringify(proofData));
}

function checkShippedStatus() {
    const allChecklist = proofData.checklist.every(Boolean);
    const allArtifacts = proofData.artifacts.lovable && proofData.artifacts.github && proofData.artifacts.deployed;
    return allChecklist && allArtifacts;
}

// ─── Proof Page ───
function renderProofPage() {
    loadProofData();
    const isShipped = checkShippedStatus();

    // 1. Step Completion (8 steps hardcoded as done for this build)
    const BUILD_STEPS = [
        'Core Layout & Routes', 'Builder Form Integration', 'Live Preview Engine',
        'ATS Scoring System', 'Template Engine', 'Export System (PDF/Text)',
        'Skills & Projects Upgrade', 'Final Polish & Validation'
    ];

    // 2. Verification Checklist (10 items)
    const CHECKLIST_ITEMS = [
        'Routes navigation works (Home/Builder/Preview)',
        'Auto-save persists data on reload',
        'ATS Score calculates correctly (0-100)',
        'Three templates (Classic/Modern/Minimal) switch correctly',
        'Builder form updates preview in real-time',
        'Export to PDF works (print layout clean)',
        'Copy as Text produces structured output',
        'Validation warnings appear for missing data',
        'Skills accordion adds/removes tags correctly',
        'Projects accordion expands/collapses correctly'
    ];

    const stepList = BUILD_STEPS.map((s, i) => `
        <div class="proof-step-item completed">
            <span class="step-icon">✓</span>
            <span class="step-label">Step ${i + 1}: ${s}</span>
        </div>
    `).join('');

    const checklistHtml = CHECKLIST_ITEMS.map((item, i) => `
        <label class="proof-checklist-item">
            <input type="checkbox" class="proof-check-input" data-index="${i}" ${proofData.checklist[i] ? 'checked' : ''}>
            <span class="proof-check-label">${item}</span>
        </label>
    `).join('');

    const statusBadge = isShipped
        ? `<span class="proof-badge status-shipped">Shipped</span>`
        : `<span class="proof-badge status-progress">In Progress</span>`;

    const successMessage = isShipped
        ? `<div class="proof-success-message">Project 3 Shipped Successfully.</div>`
        : '';

    return `
        <div class="proof-page">
            <div class="proof-header">
                <h1 style="margin-bottom:4px;">Proof & Artifacts</h1>
                <p style="color:var(--color-muted); font-size:15px;">Finalize and submit your build.</p>
                ${statusBadge}
            </div>

            ${successMessage}

            <div class="proof-grid">
                <!-- Col 1: Steps & Checklist -->
                <div class="proof-col">
                    <div class="proof-card">
                        <div class="proof-card-title">Build Steps</div>
                        <div class="proof-steps-list">${stepList}</div>
                    </div>

                    <div class="proof-card">
                        <div class="proof-card-title">Verification Checklist</div>
                        <div class="proof-checklist">${checklistHtml}</div>
                    </div>
                </div>

                <!-- Col 2: Artifacts -->
                <div class="proof-col">
                    <div class="proof-card">
                        <div class="proof-card-title">Artifact Collection</div>
                        <div class="proof-form-group">
                            <label>Lovable Project Link</label>
                            <input class="form-input proof-input" data-artifact="lovable" value="${esc(proofData.artifacts.lovable)}" placeholder="https://lovable.dev/...">
                        </div>
                        <div class="proof-form-group">
                            <label>GitHub Repository</label>
                            <input class="form-input proof-input" data-artifact="github" value="${esc(proofData.artifacts.github)}" placeholder="https://github.com/...">
                        </div>
                        <div class="proof-form-group">
                            <label>Deployed URL</label>
                            <input class="form-input proof-input" data-artifact="deployed" value="${esc(proofData.artifacts.deployed)}" placeholder="https://...">
                        </div>
                    </div>

                    <div class="proof-card">
                        <div class="proof-card-title">Final Submission</div>
                        <p style="font-size:13px; color:var(--color-muted); margin-bottom:var(--space-2); line-height:1.5;">
                            Ensure all checklist items are passed and all links are provided above.
                        </p>
                        <button class="kn-btn kn-btn-primary" id="btn-copy-submission" style="width:100%; justify-content:center;">Copy Final Submission</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ─── Utilities ───
function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function wordCount(str) {
    if (!str || !str.trim()) return 0;
    return str.trim().split(/\s+/).length;
}

function hasQuantifiableMetric(text) {
    if (!text) return false;
    return /\d+[%xXkK]?|\b\d+\b/.test(text);
}

// ─── Bullet Guidance ───
const ACTION_VERBS = ['built', 'developed', 'designed', 'implemented', 'led', 'improved', 'created', 'optimized', 'automated', 'managed', 'launched', 'reduced', 'increased', 'architected', 'deployed', 'integrated', 'migrated', 'refactored', 'established', 'collaborated'];

function startsWithActionVerb(text) {
    if (!text || !text.trim()) return true; // empty is fine, no nagging
    const firstWord = text.trim().split(/[\s,.:;]/)[0].toLowerCase();
    return ACTION_VERBS.includes(firstWord);
}

function getBulletGuidance(text) {
    if (!text || !text.trim()) return [];
    const hints = [];
    // Check each sentence/bullet (split by period or newline)
    const bullets = text.split(/[.\n]/).map(b => b.trim()).filter(Boolean);
    let needsVerb = false;
    let needsNumber = false;
    for (const b of bullets) {
        if (!startsWithActionVerb(b)) needsVerb = true;
        if (!hasQuantifiableMetric(b)) needsNumber = true;
    }
    if (needsVerb) hints.push('Start with a strong action verb.');
    if (needsNumber) hints.push('Add measurable impact (numbers).');
    return hints;
}

function renderBulletHints(text) {
    const hints = getBulletGuidance(text);
    if (!hints.length) return '';
    return `<div class="bullet-hints">${hints.map(h => `<span class="bullet-hint">↳ ${esc(h)}</span>`).join('')}</div>`;
}

// ─── Template Tabs Renderer ───
function renderTemplateTabs() {
    const current = getTemplate();
    return `
        <div class="template-tabs">
            ${TEMPLATES.map(t => `<button class="template-tab${current === t ? ' active' : ''}" data-template="${t}">${t.charAt(0).toUpperCase() + t.slice(1)}</button>`).join('')}
        </div>
    `;
}

// ─── Top 3 Improvements ───
function getImprovements(data) {
    const d = data || resumeData;
    const improvements = [];
    if (d.projects.length < 2) improvements.push('Add more projects to showcase your abilities.');
    const allBullets = [...d.experience.map(e => e.description), ...d.projects.map(p => p.description)];
    if (!allBullets.some(b => hasQuantifiableMetric(b))) improvements.push('Use numbers and metrics to show measurable impact.');
    const wc = wordCount(d.summary);
    if (wc < 40) improvements.push('Expand your professional summary (aim for 40–120 words).');
    const skillsArr3 = getAllSkillsFrom(d);
    if (skillsArr3.length < 8) improvements.push('List more skills (target 8+ relevant skills).');
    if (d.experience.length < 1) improvements.push('Add internship or project experience.');
    return improvements.slice(0, 3);
}

// ─── ATS Scoring Engine (Deterministic, 0–100) ───
function computeATSScore(data) {
    const d = data || resumeData;
    let score = 0;

    // +15 if summary length is 40–120 words
    const wc = wordCount(d.summary);
    if (wc >= 40 && wc <= 120) score += 15;

    // +10 if at least 2 projects
    if (d.projects.length >= 2) score += 10;

    // +10 if at least 1 experience entry
    if (d.experience.length >= 1) score += 10;

    // +10 if skills list has >= 8 items
    const skillsArr = getAllSkillsFrom(d);
    if (skillsArr.length >= 8) score += 10;

    // +10 if GitHub or LinkedIn link exists
    if ((d.links.github && d.links.github.trim()) || (d.links.linkedin && d.links.linkedin.trim())) score += 10;

    // +15 if any experience/project description contains a number
    const allBullets = [...d.experience.map(e => e.description), ...d.projects.map(p => p.description)];
    if (allBullets.some(b => hasQuantifiableMetric(b))) score += 15;

    // +10 if education section has complete fields (at least one entry with institution + degree filled)
    const completeEdu = d.education.some(e => e.institution && e.institution.trim() && e.degree && e.degree.trim());
    if (completeEdu) score += 10;

    // +20 bonus: distribute remaining to reach 100 possibility
    // Name + email + phone + location all filled
    if (d.personal.name && d.personal.email && d.personal.phone && d.personal.location) score += 10;
    // At least 1 education entry
    if (d.education.length >= 1) score += 10;

    return Math.min(score, 100);
}

// ─── Suggestions (max 3) ───
function getSuggestions(data) {
    const d = data || resumeData;
    const suggestions = [];

    const wc = wordCount(d.summary);
    if (wc < 40) suggestions.push('Write a stronger summary (target 40–120 words).');
    else if (wc > 120) suggestions.push('Shorten your summary to 120 words or fewer.');

    if (d.projects.length < 2) suggestions.push('Add at least 2 projects.');

    const skillsArr2 = getAllSkillsFrom(d);
    if (skillsArr2.length < 8) suggestions.push('Add more skills (target 8+).');

    const allBullets = [...d.experience.map(e => e.description), ...d.projects.map(p => p.description)];
    if (!allBullets.some(b => hasQuantifiableMetric(b))) suggestions.push('Add measurable impact (numbers, %, etc.) in your bullets.');

    if (d.experience.length < 1) suggestions.push('Add at least 1 experience entry.');

    if (!d.links.github && !d.links.linkedin) suggestions.push('Add a GitHub or LinkedIn link.');

    const completeEdu = d.education.some(e => e.institution && e.institution.trim() && e.degree && e.degree.trim());
    if (!completeEdu) suggestions.push('Complete your education section (institution + degree).');

    return suggestions.slice(0, 3);
}

// ─── ATS Score Panel Renderer ───
function renderATSPanel(data) {
    const d = data || resumeData;
    const score = computeATSScore(d);
    const suggestions = getSuggestions(d);

    let meterColor = '#C0392B';
    let label = 'Needs Work';
    if (score >= 70) { meterColor = '#4A6E46'; label = 'Strong'; }
    else if (score >= 40) { meterColor = '#B48B3E'; label = 'Fair'; }

    const suggestionsHtml = suggestions.length ? `
        <div class="ats-suggestions">
            <div class="ats-suggestions-title">Suggestions</div>
            ${suggestions.map(s => `<div class="ats-suggestion-item">→ ${esc(s)}</div>`).join('')}
        </div>
    ` : `<div class="ats-suggestions"><div class="ats-suggestion-item" style="color:var(--color-success);">✓ Looking great — all key areas covered.</div></div>`;

    const improvements = getImprovements(d);
    const improvementsHtml = improvements.length ? `
        <div class="ats-improvements">
            <div class="ats-suggestions-title">Top 3 Improvements</div>
            ${improvements.map((imp, i) => `<div class="ats-improvement-item"><span class="imp-num">${i + 1}.</span> ${esc(imp)}</div>`).join('')}
        </div>
    ` : '';

    return `
        ${renderTemplateTabs()}
        <div class="ats-panel">
            <div class="ats-header">
                <div class="ats-label">ATS Readiness Score</div>
                <div class="ats-score-value" style="color:${meterColor};">${score}<span class="ats-score-max">/100</span></div>
            </div>
            <div class="ats-meter-track">
                <div class="ats-meter-fill" style="width:${score}%; background-color:${meterColor};"></div>
            </div>
            <div class="ats-score-label" style="color:${meterColor};">${label}</div>
            ${suggestionsHtml}
            ${improvementsHtml}
        </div>
    `;
}

// ─── Deep-set a dotted field path into resumeData ───
function setField(path, value) {
    const parts = path.split('.');
    let target = resumeData;
    for (let i = 0; i < parts.length - 1; i++) {
        const key = isNaN(parts[i]) ? parts[i] : parseInt(parts[i]);
        target = target[key];
    }
    const last = isNaN(parts[parts.length - 1]) ? parts[parts.length - 1] : parseInt(parts[parts.length - 1]);
    target[last] = value;
}

// ─── Main Render ───
function render() {
    const route = getRoute();
    loadResumeData();
    renderNav(route);

    const app = document.getElementById('app-content');

    if (route === '/' || route === '') {
        app.innerHTML = renderHome();
        // CTA listener
        const cta = document.getElementById('cta-start');
        if (cta) cta.addEventListener('click', () => navigateTo('/builder'));
        return;
    }

    if (route === '/builder') {
        app.innerHTML = `
            <div class="builder-layout">
                <div class="builder-form" id="builder-form">${renderBuilderForm()}</div>
                <div class="builder-preview" id="builder-preview">
                    ${renderATSPanel()}
                    ${renderResumePreview()}
                </div>
            </div>
        `;
        attachBuilderListeners();
        return;
    }

    if (route === '/preview') {
        app.innerHTML = renderPreviewPage();
        attachTemplateTabs(document.querySelector('.preview-page'));
        attachPreviewListeners();
        return;
    }

    if (route === '/proof') {
        app.innerHTML = renderProofPage();
        attachProofListeners();
        return;
    }

    // Fallback
    navigateTo('/');
}

// ─── Template Tab Event Binding ───
function attachTemplateTabs(container) {
    if (!container) return;
    container.querySelectorAll('.template-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tpl = tab.getAttribute('data-template');
            setTemplate(tpl);
            // Update active state
            container.querySelectorAll('.template-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            // Re-render preview paper only
            const paperWrapper = container.querySelector('#preview-paper-wrapper') || container;
            const paper = paperWrapper.querySelector('.preview-paper');
            if (paper) {
                paper.className = 'preview-paper tpl-' + tpl;
            }
        });
    });
}

// ─── Builder Event Listeners ───
function attachBuilderListeners() {
    const formContainer = document.getElementById('builder-form');
    const previewContainer = document.getElementById('builder-preview');

    // Live input binding with auto-save
    formContainer.addEventListener('input', (e) => {
        const field = e.target.getAttribute('data-field');
        if (!field) return;
        setField(field, e.target.value);
        saveResumeData();
        // Update preview + ATS score (not the form — to keep cursor position)
        previewContainer.innerHTML = renderATSPanel() + renderResumePreview();
        attachTemplateTabs(previewContainer);
        // Also update bullet hints for the edited field
        if (field.includes('.description')) {
            const parts = field.split('.');
            const type = parts[0];
            const idx = parseInt(parts[1]);
            const entry = resumeData[type][idx];
            if (entry) {
                const textarea = e.target;
                const hintContainer = textarea.parentElement.querySelector('.bullet-hints');
                const newHints = renderBulletHints(entry.description);
                if (hintContainer) {
                    hintContainer.outerHTML = newHints;
                } else if (newHints) {
                    textarea.insertAdjacentHTML('afterend', newHints);
                }
            }
        }
    });

    // Load Sample Data
    const sampleBtn = document.getElementById('btn-load-sample');
    if (sampleBtn) {
        sampleBtn.addEventListener('click', () => {
            resumeData = JSON.parse(JSON.stringify(SAMPLE_DATA));
            saveResumeData();
            showToast('Sample data loaded');
            // Re-render entire builder
            formContainer.innerHTML = renderBuilderForm();
            previewContainer.innerHTML = renderATSPanel() + renderResumePreview();
            attachBuilderButtons(formContainer, previewContainer);
            attachTemplateTabs(previewContainer);
        });
    }

    attachBuilderButtons(formContainer, previewContainer);
    attachTemplateTabs(previewContainer);
}

function attachBuilderButtons(formContainer, previewContainer) {
    // Helper to re-render both panels
    function reRender() {
        formContainer.innerHTML = renderBuilderForm();
        previewContainer.innerHTML = renderATSPanel() + renderResumePreview();
        attachBuilderButtons(formContainer, previewContainer);
        attachTemplateTabs(previewContainer);
    }

    // Add Education
    const addEdu = document.getElementById('btn-add-edu');
    if (addEdu) {
        addEdu.addEventListener('click', () => {
            resumeData.education.push({ institution: '', degree: '', startDate: '', endDate: '', description: '' });
            saveResumeData();
            formContainer.innerHTML = renderBuilderForm();
            previewContainer.innerHTML = renderATSPanel() + renderResumePreview();
            attachBuilderButtons(formContainer, previewContainer);
            attachTemplateTabs(previewContainer);
        });
    }

    // Add Experience
    const addExp = document.getElementById('btn-add-exp');
    if (addExp) {
        addExp.addEventListener('click', () => {
            resumeData.experience.push({ company: '', role: '', startDate: '', endDate: '', description: '' });
            saveResumeData();
            formContainer.innerHTML = renderBuilderForm();
            previewContainer.innerHTML = renderATSPanel() + renderResumePreview();
            attachBuilderButtons(formContainer, previewContainer);
        });
    }

    // Add Project (new format)
    const addProj = document.getElementById('btn-add-proj');
    if (addProj) {
        addProj.addEventListener('click', () => {
            resumeData.projects.push({ name: '', description: '', techStack: [], liveUrl: '', githubUrl: '' });
            saveResumeData();
            reRender();
        });
    }

    // Remove entry buttons
    formContainer.querySelectorAll('.remove-entry').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-type');
            const index = parseInt(btn.getAttribute('data-index'));
            resumeData[type].splice(index, 1);
            saveResumeData();
            reRender();
        });
    });

    // Collapsible project entries
    formContainer.querySelectorAll('[data-toggle-proj]').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-entry')) return;
            const idx = parseInt(el.getAttribute('data-toggle-proj'));
            resumeData.projects[idx]._collapsed = !resumeData.projects[idx]._collapsed;
            reRender();
        });
    });

    // Skill tag inputs (Enter to add)
    formContainer.querySelectorAll('[data-skill-input]').forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const cat = input.getAttribute('data-skill-input');
                const val = input.value.trim();
                if (val && !resumeData.skills[cat].includes(val)) {
                    resumeData.skills[cat].push(val);
                    saveResumeData();
                    reRender();
                }
            }
        });
    });

    // Remove skill pills
    formContainer.querySelectorAll('[data-action="remove-skill"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.getAttribute('data-cat');
            const idx = parseInt(btn.getAttribute('data-sidx'));
            resumeData.skills[cat].splice(idx, 1);
            saveResumeData();
            reRender();
        });
    });

    // Project tech stack tag inputs
    formContainer.querySelectorAll('[data-proj-tech-input]').forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const projIdx = parseInt(input.getAttribute('data-proj-tech-input'));
                const val = input.value.trim();
                if (val && !resumeData.projects[projIdx].techStack.includes(val)) {
                    resumeData.projects[projIdx].techStack.push(val);
                    saveResumeData();
                    reRender();
                }
            }
        });
    });

    // Remove project tech pills
    formContainer.querySelectorAll('[data-action="remove-proj-tech"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const projIdx = parseInt(btn.getAttribute('data-proj'));
            const techIdx = parseInt(btn.getAttribute('data-tidx'));
            resumeData.projects[projIdx].techStack.splice(techIdx, 1);
            saveResumeData();
            reRender();
        });
    });

    // Suggest Skills button
    const suggestBtn = document.getElementById('btn-suggest-skills');
    if (suggestBtn) {
        suggestBtn.addEventListener('click', () => {
            suggestBtn.textContent = 'Adding…';
            suggestBtn.disabled = true;
            setTimeout(() => {
                const suggestions = {
                    technical: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'GraphQL'],
                    soft: ['Team Leadership', 'Problem Solving'],
                    tools: ['Git', 'Docker', 'AWS']
                };
                ['technical', 'soft', 'tools'].forEach(cat => {
                    suggestions[cat].forEach(skill => {
                        if (!resumeData.skills[cat].includes(skill)) {
                            resumeData.skills[cat].push(skill);
                        }
                    });
                });
                saveResumeData();
                showToast('Skills suggested and added');
                reRender();
            }, 1000);
        });
    }

    // Character counter for project descriptions
    formContainer.querySelectorAll('textarea[data-field*="projects."][data-field*=".description"]').forEach(ta => {
        const counter = ta.parentElement.querySelector('.char-counter');
        if (counter) {
            ta.addEventListener('input', () => {
                counter.textContent = `${ta.value.length}/200`;
            });
        }
    });

    // Re-bind sample data button after re-render
    const sampleBtn = document.getElementById('btn-load-sample');
    if (sampleBtn) {
        sampleBtn.addEventListener('click', () => {
            resumeData = JSON.parse(JSON.stringify(SAMPLE_DATA));
            saveResumeData();
            showToast('Sample data loaded');
            reRender();
        });
    }
}



// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
    loadResumeData();
    loadResumeData();
    try {
        render();
    } catch (e) {
        console.error(e);
        document.body.innerHTML += `<div style="color:red; padding:20px;">Error: ${e.message}</div>`;
    }
    window.addEventListener('hashchange', render);
});
