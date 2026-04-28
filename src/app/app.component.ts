import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type Profile = {
  name: string;
  title: string;
  summary: string;
  about: string;
};

type Contact = {
  email: string;
  phone?: string;
  linkedin?: string;
  whatsapp?: string;
};

type Experience = {
  role: string;
  company: string;
  location: string;
  period: string;
  technologies?: string[];
  highlights: string[];
};

type Skill = {
  name: string;
  years: number;
  note: string;
  x: number;
  y: number;
  connectsTo: string[];
};

type PortfolioData = {
  profile: Profile;
  contact: Contact;
  experiences: Experience[];
  skills: Skill[];
};

type SkillDetails = {
  projectCount: number;
  projects: string[];
  related: string[];
};

type CalculatorTaskKey = 'frontend' | 'backend' | 'testing' | 'maintenance' | 'dataAnalysis' | 'automation' | 'etlScraping' | 'reporting';
type TimelineUnit = 'days' | 'weeks' | 'months';
type LanguageCode = 'en' | 'es';
type CalculatorTask = {
  key: CalculatorTaskKey;
  label: string;
  description: string;
  category: string;
  isData?: boolean;
};

type SiteContent = {
  language: { code: string; flag: string; label: string; switchTo: string };
  nav: Record<'about' | 'experience' | 'skills' | 'calculator' | 'team', string>;
  contact: Record<'button' | 'aria' | 'title' | 'email' | 'linkedin' | 'linkedinCta' | 'whatsapp', string>;
  hero: { title: string; primaryCta: string; secondaryCta: string; support: string; supportCta: string; services: { label: string; description: string }[] };
  about: { eyebrow: string; title: string; body: string };
  experience: { eyebrow: string; title: string; skillsLabel: string; resultsLabel: string; items?: Experience[]; translations?: Record<string, Partial<Experience>> };
  skills: Record<'eyebrow' | 'title' | 'rotateHint' | 'hoverHint' | 'technicalTitle' | 'technicalDescription' | 'deliveryTitle' | 'deliveryDescription' | 'upcomingTitle' | 'upcomingDescription' | 'upcomingStatus' | 'upcomingBody' | 'yearsUsed' | 'matchedExperience' | 'connectedTo' | 'coreCapability', string> & { items?: Skill[]; notes?: Record<string, string> };
  calculator: {
    eyebrow: string;
    title: string;
    budgetLabel: string;
    budgetNote: string;
    scopeTitle: string;
    guidanceTitle: string;
    guidanceBody: string;
    guidanceCta: string;
    timelineTitle: string;
    decreaseTimeline: string;
    increaseTimeline: string;
    timelineAmount: string;
    timelineUnit: string;
    footnote: string;
    summaryLabel: string;
    availableBudget: string;
    selectedWorkstreams: string;
    requestedTimeline: string;
    budgetFit: string;
    startConversation: string;
    units: Record<TimelineUnit, string>;
    singularUnits: Record<TimelineUnit, string>;
    status: Record<'comfortable' | 'focused' | 'adjust', string>;
    recommendations: Record<'large' | 'medium' | 'small', string>;
    budgetGap: Record<'above' | 'under', string>;
    tasks: Record<CalculatorTaskKey, Omit<CalculatorTask, 'key' | 'isData'>>;
  };
  team: Record<'eyebrow' | 'title' | 'founderRole' | 'founderName' | 'founderBio' | 'engineerRole' | 'engineerName' | 'engineerBio', string>;
};

const DEFAULT_CONTENT: SiteContent = {
  language: { code: 'EN', flag: 'US', label: 'English', switchTo: 'Switch to Spanish' },
  nav: { about: 'About', experience: 'Experience', skills: 'Skill Maps', calculator: 'Calculator', team: 'Core Team' },
  contact: { button: 'Contact', aria: 'Contact information', title: "Let's talk about your project", email: 'Email', linkedin: 'LinkedIn', linkedinCta: 'View profile', whatsapp: 'WhatsApp' },
  hero: {
    title: 'Software, SaaS platforms and data workflows built for teams that need momentum.',
    primaryCta: 'View capabilities',
    secondaryCta: 'Estimate a project',
    support: 'Nev Research designs, builds and supports practical digital products for founders, agencies and operations teams.',
    supportCta: 'How we work',
    services: [
      { label: 'Frontend engineering', description: 'The visible part of your product: pages, dashboards, forms and interfaces your clients use.' },
      { label: 'Backend systems', description: 'The logic behind the product: APIs, authentication, data handling and integrations.' },
      { label: 'Data analysis', description: 'Turning raw information into useful insights, reports and decisions for the business.' },
      { label: 'QA automation', description: 'Automated checks that help catch bugs before your users or clients find them.' },
      { label: 'Maintenance', description: 'Ongoing improvements, fixes and technical support after launch.' }
    ]
  },
  about: {
    eyebrow: 'About',
    title: 'Practical SaaS delivery for teams that need reliable software.',
    body: 'Nev Research partners with clients to design, build and maintain software that supports real operations: product interfaces, backend workflows, data analysis, QA automation, reporting routines and long-term maintenance. We focus on clear scope, dependable delivery and systems that remain understandable after launch.'
  },
  experience: { eyebrow: 'Client results', title: 'Delivery proof across product, data and software teams.', skillsLabel: 'Skills used', resultsLabel: 'Results and delivery', items: [] },
  skills: {
    eyebrow: 'Capabilities',
    title: 'Connected skills maps',
    rotateHint: 'Drag to rotate',
    hoverHint: 'Hover skills for details',
    technicalTitle: 'Technical network',
    technicalDescription: 'Frontend, backend, platform and tooling capabilities.',
    deliveryTitle: 'Delivery network',
    deliveryDescription: 'Collaboration, ownership and cross-functional execution skills.',
    upcomingTitle: 'Investing technologies',
    upcomingDescription: 'Upcoming capability map for future R&D and product investments.',
    upcomingStatus: 'Roadmap in progress',
    upcomingBody: 'This map will activate in the next release.',
    yearsUsed: 'years used',
    matchedExperience: 'Matched experience',
    connectedTo: 'Connected to',
    coreCapability: 'Core capability'
  },
  calculator: {
    eyebrow: 'Calculator',
    title: 'Plan your product scope and delivery.',
    budgetLabel: 'Client budget',
    budgetNote: 'Set a working investment range to understand how much scope we can comfortably cover.',
    scopeTitle: 'Which tasks are in scope?',
    guidanceTitle: 'Not sure what to request yet?',
    guidanceBody: 'Tell us what you want to improve, launch, automate or understand. Nev Research can help shape the scope, recommend the right technical path, prioritize the first version and guide your project from idea to working software.',
    guidanceCta: 'Request project guidance',
    timelineTitle: 'What timeline are we targeting?',
    decreaseTimeline: 'Decrease timeline',
    increaseTimeline: 'Increase timeline',
    timelineAmount: 'Timeline amount',
    timelineUnit: 'Timeline unit',
    footnote: 'This estimate is directional and useful for scope conversations. Final pricing depends on product depth, integrations, revisions, and handoff expectations.',
    summaryLabel: 'Estimated project range',
    availableBudget: 'Available budget',
    selectedWorkstreams: 'Selected workstreams',
    requestedTimeline: 'Requested timeline',
    budgetFit: 'Budget fit',
    startConversation: 'Start the conversation',
    units: { days: 'Days', weeks: 'Weeks', months: 'Months' },
    singularUnits: { days: 'day', weeks: 'week', months: 'month' },
    status: { comfortable: 'Comfortable budget range', focused: 'Feasible with focused scope', adjust: 'Scope or timeline should be adjusted' },
    recommendations: { large: '10-14 weeks recommended', medium: '6-10 weeks recommended', small: '3-6 weeks recommended' },
    budgetGap: { above: '{amount} available above estimate', under: '{amount} under the suggested range' },
    tasks: {
      frontend: { label: 'Frontend delivery', category: 'Product UI', description: 'Interfaces, landing flows, dashboards, responsive UI and Angular or React product screens.' },
      backend: { label: 'Backend or APIs', category: 'Systems', description: 'Node.js services, REST endpoints, integrations, authentication-ready flows and data contracts.' },
      testing: { label: 'Testing and QA', category: 'Quality', description: 'Validation plans, Playwright or Selenium coverage, regression checks and release confidence.' },
      maintenance: { label: 'Maintenance support', category: 'Support', description: 'Bug fixes, small improvements, monitoring routines, documentation and product continuity.' },
      dataAnalysis: { label: 'Data analysis', category: 'Data', description: 'SQL exploration, dataset cleanup, business questions, KPI review and practical insight delivery.' },
      automation: { label: 'Automation', category: 'Data ops', description: 'Python workflows, repetitive task removal, operational scripts and browser automation support.' },
      etlScraping: { label: 'ETL and web scraping', category: 'Pipelines', description: 'Extraction pipelines, transformations, structured datasets and reliable collection routines.' },
      reporting: { label: 'Reporting workflows', category: 'Insights', description: 'Dashboards, spreadsheet models, quality checks and recurring delivery-ready summaries.' }
    }
  },
  team: {
    eyebrow: 'Core team',
    title: 'People behind Nev Research delivery.',
    founderRole: 'Founder',
    founderName: 'Leonardo Diaz',
    founderBio: 'Founder of Nev Research, focused on product architecture, frontend systems, client delivery, AI-assisted workflows, and long-term software quality.',
    engineerRole: 'Data Engineer',
    engineerName: 'Jorge Pestana',
    engineerBio: 'Supports data analysis, Python automation, SQL workflows, QA validation, ETL routines, web scraping, and technical operations for SaaS clients.'
  }
};

type GlobeKind = 'technical' | 'delivery';
type GlobeTheme = {
  shell: number;
  node: number;
  emissive: number;
  link: number;
  labelFill: string;
  labelStroke: string;
  labelText: string;
  hint: number;
};

type GlobeRefs = {
  canvas?: ElementRef<HTMLCanvasElement>;
  frame?: ElementRef<HTMLElement>;
};

type GlobeRuntime = {
  scene?: THREE.Scene;
  camera?: THREE.PerspectiveCamera;
  renderer?: THREE.WebGLRenderer;
  controls?: OrbitControls;
  group?: THREE.Group;
  resizeObserver?: ResizeObserver;
  nodeMeshes: THREE.Mesh[];
  labelSprites: THREE.Sprite[];
  raycaster: THREE.Raycaster;
  frameId: number;
};

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('technicalGlobeCanvas') private technicalGlobeCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('technicalGlobeFrame') private technicalGlobeFrame?: ElementRef<HTMLElement>;
  @ViewChild('deliveryGlobeCanvas') private deliveryGlobeCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('deliveryGlobeFrame') private deliveryGlobeFrame?: ElementRef<HTMLElement>;

  profile: Profile = {
    name: 'Your Name',
    title: 'Frontend / Full-Stack Capabilities',
    summary: 'Direct, client-focused web development for clean interfaces, reliable applications, and maintainable delivery.',
    about: 'I help clients turn business needs into practical web products with clear communication, thoughtful UX, and code that can keep growing after launch.'
  };

  contact: Contact = {
    email: 'hello@example.com'
  };

  experiences: Experience[] = [];
  skills: Skill[] = [];
  technicalSkills: Skill[] = [];
  deliverySkills: Skill[] = [];
  private baseExperiences: Experience[] = [];
  private baseSkills: Skill[] = [];

  hoveredSkill: Skill | null = null;
  hoveredSkillDetails: SkillDetails | null = null;
  skillPopoverStyle: Record<string, string> = {};
  hoveredGlobe: GlobeKind = 'technical';

  contactOpen = false;
  contactClosing = false;
  navOpen = false;
  currentLanguage: LanguageCode = 'en';
  regionCode = 'US';
  content: SiteContent = DEFAULT_CONTENT;

  calculator = {
    budget: 4500,
    frontend: true,
    backend: false,
    testing: true,
    maintenance: false,
    dataAnalysis: false,
    automation: false,
    etlScraping: false,
    reporting: false,
    timelineValue: 6,
    timelineUnit: 'weeks' as TimelineUnit
  };

  private readonly calculatorTaskConfig: Pick<CalculatorTask, 'key' | 'isData'>[] = [
    { key: 'frontend' },
    { key: 'backend' },
    { key: 'testing' },
    { key: 'maintenance' },
    { key: 'dataAnalysis', isData: true },
    { key: 'automation', isData: true },
    { key: 'etlScraping', isData: true },
    { key: 'reporting', isData: true }
  ];
  readonly timelineUnits: TimelineUnit[] = ['days', 'weeks', 'months'];
  calculatorTasks: CalculatorTask[] = this.createCalculatorTasks(DEFAULT_CONTENT);

  private contactCloseTimeout?: number;
  private globeRefs: Record<GlobeKind, GlobeRefs> = {
    technical: {},
    delivery: {}
  };
  private globeState: Record<GlobeKind, GlobeRuntime> = {
    technical: { nodeMeshes: [], labelSprites: [], raycaster: new THREE.Raycaster(), frameId: 0 },
    delivery: { nodeMeshes: [], labelSprites: [], raycaster: new THREE.Raycaster(), frameId: 0 }
  };

  constructor(private readonly zone: NgZone) {}

  get budgetPercent(): number {
    return ((this.calculator.budget - 2000) / 5000) * 100;
  }

  get budgetTone(): string {
    if (this.calculator.budget < 3750) return 'low';
    if (this.calculator.budget > 5250) return 'high';
    return 'mid';
  }

  get budgetSliderStyle(): Record<string, string> {
    const progress = `${this.budgetPercent}%`;
    const color = this.budgetTone === 'low' ? '#84ffb0' : this.budgetTone === 'high' ? '#b84eff' : '#48f5ff';
    const glow = this.budgetTone === 'low' ? 'rgba(132, 255, 176, 0.36)' : this.budgetTone === 'high' ? 'rgba(184, 78, 255, 0.34)' : 'rgba(72, 245, 255, 0.34)';
    return {
      '--budget-progress': progress,
      '--budget-color': color,
      '--budget-glow': glow
    };
  }

  get selectedTaskCount(): number {
    return [
      this.calculator.frontend,
      this.calculator.backend,
      this.calculator.testing,
      this.calculator.maintenance,
      this.calculator.dataAnalysis,
      this.calculator.automation,
      this.calculator.etlScraping,
      this.calculator.reporting
    ].filter(Boolean).length;
  }

  get selectedTaskLabels(): string[] {
    return this.selectedCalculatorTasks.map((task) => task.label);
  }

  get selectedCalculatorTasks(): CalculatorTask[] {
    return this.calculatorTasks.filter((task) => this.calculator[task.key]);
  }

  get timelineInWeeks(): number {
    switch (this.calculator.timelineUnit) {
      case 'days': return this.calculator.timelineValue / 5;
      case 'months': return this.calculator.timelineValue * 4;
      default: return this.calculator.timelineValue;
    }
  }

  get estimatedProjectInvestment(): number {
    const base = 700;
    const taskCost =
      (this.calculator.frontend ? 1200 : 0) +
      (this.calculator.backend ? 1400 : 0) +
      (this.calculator.testing ? 550 : 0) +
      (this.calculator.maintenance ? 420 : 0) +
      (this.calculator.dataAnalysis ? 780 : 0) +
      (this.calculator.automation ? 720 : 0) +
      (this.calculator.etlScraping ? 860 : 0) +
      (this.calculator.reporting ? 620 : 0);
    const complexityBuffer = Math.max(this.selectedTaskCount - 2, 0) * 180;
    const timelineCost = Math.max(this.timelineInWeeks - 4, 0) * 95;
    const rushMultiplier = this.timelineInWeeks <= 1 ? 1.45 : this.timelineInWeeks <= 2 ? 1.3 : this.timelineInWeeks <= 4 ? 1.12 : 1;
    return Math.round((base + taskCost + complexityBuffer + timelineCost) * rushMultiplier);
  }

  get estimateRange(): string {
    const low = Math.round(this.estimatedProjectInvestment * 0.92 / 100) * 100;
    const high = Math.round(this.estimatedProjectInvestment * 1.14 / 100) * 100;
    return `$${low.toLocaleString()} - $${high.toLocaleString()}`;
  }

  get budgetStatus(): string {
    const difference = this.calculator.budget - this.estimatedProjectInvestment;
    if (difference >= 2500) return this.content.calculator.status.comfortable;
    if (difference >= 0) return this.content.calculator.status.focused;
    return this.content.calculator.status.adjust;
  }

  get suggestedTimeline(): string {
    if (this.selectedTaskCount >= 4) return this.content.calculator.recommendations.large;
    if (this.selectedTaskCount === 3) return this.content.calculator.recommendations.medium;
    return this.content.calculator.recommendations.small;
  }

  get budgetGap(): string {
    const delta = this.calculator.budget - this.estimatedProjectInvestment;
    const amount = `$${Math.abs(delta).toLocaleString()}`;
    const template = delta >= 0 ? this.content.calculator.budgetGap.above : this.content.calculator.budgetGap.under;
    return template.replace('{amount}', amount);
  }

  get formattedBudget(): string {
    return `$${this.calculator.budget.toLocaleString()}`;
  }

  get formattedTimeline(): string {
    const unit = this.calculator.timelineValue === 1 ? this.content.calculator.singularUnits[this.calculator.timelineUnit] : this.content.calculator.units[this.calculator.timelineUnit].toLowerCase();
    return `${this.calculator.timelineValue} ${unit}`;
  }

  get whatsappLink(): string | null {
    const rawPhone = this.contact.whatsapp ?? this.contact.phone;
    if (!rawPhone) return null;
    const cleanPhone = rawPhone.replace(/\D/g, '');
    return cleanPhone ? `https://wa.me/${cleanPhone}` : null;
  }

  async ngOnInit(): Promise<void> {
    const visitorRegion = this.detectVisitorRegion();
    this.regionCode = visitorRegion.regionCode;
    await this.loadLanguage(visitorRegion.language);

    try {
      const response = await fetch('/data/portfolio.json');
      const data = await response.json() as PortfolioData;
      this.profile = data.profile;
      this.contact = data.contact;
      this.baseExperiences = data.experiences;
      this.baseSkills = data.skills;
      this.applyTranslatedData();
    } catch {
      this.baseExperiences = this.fallbackExperiences();
      this.baseSkills = this.fallbackSkills();
      this.applyTranslatedData();
    }

    this.splitSkillGroups();
    // Data arrives asynchronously, so rebuild both globes once skills are ready.
    this.buildGlobe('technical');
    this.buildGlobe('delivery');
  }

  ngAfterViewInit(): void {
    this.globeRefs.technical = { canvas: this.technicalGlobeCanvas, frame: this.technicalGlobeFrame };
    this.globeRefs.delivery = { canvas: this.deliveryGlobeCanvas, frame: this.deliveryGlobeFrame };
    this.initializeGlobe('technical');
    this.initializeGlobe('delivery');
    this.buildGlobe('technical');
    this.buildGlobe('delivery');
  }

  ngOnDestroy(): void {
    if (this.contactCloseTimeout) window.clearTimeout(this.contactCloseTimeout);
    this.disposeGlobe('technical');
    this.disposeGlobe('delivery');
  }

  toggleContact(): void {
    if (this.contactOpen && !this.contactClosing) {
      this.contactClosing = true;
      this.contactCloseTimeout = window.setTimeout(() => {
        this.contactOpen = false;
        this.contactClosing = false;
      }, 650);
      return;
    }

    if (this.contactCloseTimeout) window.clearTimeout(this.contactCloseTimeout);
    this.contactClosing = false;
    this.contactOpen = true;
  }

  toggleNav(): void {
    this.navOpen = !this.navOpen;
  }

  closeNav(): void {
    this.navOpen = false;
  }

  async switchLanguage(): Promise<void> {
    await this.loadLanguage(this.currentLanguage === 'en' ? 'es' : 'en');
  }

  adjustTimeline(delta: number): void {
    const nextValue = this.calculator.timelineValue + delta;
    this.calculator.timelineValue = Math.min(Math.max(nextValue, 1), 24);
  }

  private detectPreferredLanguage(): LanguageCode {
    return this.detectVisitorRegion().language;
  }

  private detectVisitorRegion(): { language: LanguageCode; regionCode: string } {
    const localeSignals = [
      ...(navigator.languages ?? []),
      navigator.language
    ].filter(Boolean);
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const regionFromLocale = localeSignals
      .map((locale) => locale.match(/[-_]([a-z]{2})\b/i)?.[1]?.toUpperCase())
      .find(Boolean);
    const regionFromTimezone = this.regionFromTimezone(timeZone);
    const regionCode = regionFromTimezone ?? regionFromLocale ?? 'US';
    const language = this.spanishRegions.has(regionCode) || localeSignals.some((locale) => locale.toLowerCase().startsWith('es')) ? 'es' : 'en';
    return { language, regionCode };
  }

  private readonly spanishRegions = new Set(['AR', 'BO', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'ES', 'GT', 'HN', 'MX', 'NI', 'PA', 'PE', 'PR', 'PY', 'SV', 'UY', 'VE']);

  private regionFromTimezone(timeZone: string): string | null {
    const timezoneRegions: Record<string, string> = {
      'America/Argentina': 'AR',
      'America/Bogota': 'CO',
      'America/Caracas': 'VE',
      'America/Guatemala': 'GT',
      'America/Lima': 'PE',
      'America/Mexico_City': 'MX',
      'America/Montevideo': 'UY',
      'America/Panama': 'PA',
      'America/Puerto_Rico': 'PR',
      'America/Santiago': 'CL',
      'America/Asuncion': 'PY',
      'America/El_Salvador': 'SV',
      'America/La_Paz': 'BO',
      'America/Managua': 'NI',
      'America/Santo_Domingo': 'DO',
      'America/Tegucigalpa': 'HN',
      'Europe/Madrid': 'ES'
    };
    return Object.entries(timezoneRegions).find(([zone]) => timeZone.startsWith(zone))?.[1] ?? null;
  }

  private async loadLanguage(language: LanguageCode): Promise<void> {
    try {
      const response = await fetch(`/i18n/${language}.json`);
      if (!response.ok) throw new Error(`Missing language file: ${language}`);
      this.content = await response.json() as SiteContent;
      this.currentLanguage = language;
    } catch {
      this.content = DEFAULT_CONTENT;
      this.currentLanguage = 'en';
    }
    this.applyTranslatedData();
    this.calculatorTasks = this.createCalculatorTasks(this.content);
    this.splitSkillGroups();
    this.buildGlobe('technical');
    this.buildGlobe('delivery');
  }

  private applyTranslatedData(): void {
    const experienceTranslations = this.content.experience.translations ?? {};
    const skillNotes = this.content.skills.notes ?? {};

    this.experiences = this.content.experience.items?.length
      ? this.content.experience.items
      : this.baseExperiences.map((experience) => ({
        ...experience,
        ...(experienceTranslations[this.experienceTranslationKey(experience)] ?? experienceTranslations[experience.company] ?? {})
      }));

    this.skills = this.content.skills.items?.length
      ? this.content.skills.items
      : this.baseSkills.map((skill) => ({
        ...skill,
        note: skillNotes[skill.name] ?? skill.note
      }));
  }

  private experienceTranslationKey(experience: Experience): string {
    return `${experience.company}|${experience.role}`;
  }

  private createCalculatorTasks(content: SiteContent): CalculatorTask[] {
    return this.calculatorTaskConfig.map((task) => ({
      ...task,
      ...content.calculator.tasks[task.key]
    }));
  }

  private splitSkillGroups(): void {
    const deliveryKeywords = new Set([
      'communication',
      'ownership',
      'collaboration',
      'continuouslearning',
      'responsive',
      'datascientist',
      'qaengineer',
      'sql',
      'selenium',
      'etl',
      'automation',
      'webscraping',
      'playwright',
      'python'
    ]);
    this.technicalSkills = this.skills.filter((item) => !deliveryKeywords.has(this.normalizeSkillName(item.name)));
    this.deliverySkills = this.skills.filter((item) => deliveryKeywords.has(this.normalizeSkillName(item.name)));
  }

  private globeTheme(kind: GlobeKind): GlobeTheme {
    if (kind === 'delivery') {
      return {
        shell: 0x84ffb0,
        node: 0x84ffb0,
        emissive: 0x2ecf73,
        link: 0x84ffb0,
        labelFill: 'rgba(132, 255, 176, 0.18)',
        labelStroke: 'rgba(132, 255, 176, 0.6)',
        labelText: '#84ffb0',
        hint: 0x84ffb0
      };
    }

    return {
      shell: 0x48f5ff,
      node: 0x48f5ff,
      emissive: 0x009eaa,
      link: 0x48f5ff,
      labelFill: 'rgba(0, 211, 198, 0.16)',
      labelStroke: 'rgba(72, 245, 255, 0.46)',
      labelText: '#48f5ff',
      hint: 0x48f5ff
    };
  }

  private initializeGlobe(kind: GlobeKind): void {
    const refs = this.globeRefs[kind];
    const state = this.globeState[kind];
    const canvas = refs.canvas?.nativeElement;
    const frame = refs.frame?.nativeElement;
    if (!canvas || !frame || state.renderer) return;

    const theme = this.globeTheme(kind);
    state.scene = new THREE.Scene();
    state.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    state.camera.position.set(0, 0, 15);
    state.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas });
    state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    state.controls = new OrbitControls(state.camera, canvas);
    state.controls.enableDamping = true;
    state.controls.enablePan = false;
    state.controls.minDistance = 12.5;
    state.controls.maxDistance = 24;
    state.controls.rotateSpeed = 0.55;
    canvas.style.touchAction = 'pan-y';

    state.scene.add(new THREE.AmbientLight(theme.hint, 1.2));
    const keyLight = new THREE.PointLight(theme.hint, 20, 30);
    keyLight.position.set(6, 4, 8);
    state.scene.add(keyLight);
    const greenLight = new THREE.PointLight(0x84ffb0, 12, 24);
    greenLight.position.set(-6, -4, 7);
    state.scene.add(greenLight);

    canvas.addEventListener('pointermove', this.makePointerMoveHandler(kind));
    canvas.addEventListener('pointerleave', this.handleSkillPointerLeave);

    state.resizeObserver = new ResizeObserver(() => this.resizeGlobe(kind));
    state.resizeObserver.observe(frame);
    this.resizeGlobe(kind);
    this.zone.runOutsideAngular(() => this.animateGlobe(kind));
  }

  private buildGlobe(kind: GlobeKind): void {
    const state = this.globeState[kind];
    const theme = this.globeTheme(kind);
    const source = kind === 'technical' ? this.technicalSkills : this.deliverySkills;
    if (!state.scene || !source.length) return;

    this.disposeGlobeObjects(kind);
    state.group = new THREE.Group();
    state.scene.add(state.group);

    const radius = 3.95;
    const skillPositions = new Map<string, THREE.Vector3>();
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 64, 64),
      new THREE.MeshBasicMaterial({ color: theme.shell, opacity: 0.045, transparent: true, wireframe: true })
    );
    state.group.add(shell);

    for (const skill of source) {
      const position = this.skillPosition(skill, radius);
      skillPositions.set(skill.name, position);
      const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.17, 24, 24),
        new THREE.MeshStandardMaterial({ color: theme.node, emissive: theme.emissive, emissiveIntensity: 0.9, roughness: 0.45, metalness: 0.1 })
      );
      node.position.copy(position);
      node.userData = { skillName: skill.name };
      state.nodeMeshes.push(node);
      state.group.add(node);
      const label = this.createSkillLabel(skill.name, kind);
      label.position.copy(position.clone().multiplyScalar(1.1));
      state.labelSprites.push(label);
      state.group.add(label);
    }

    for (const skill of source) {
      const from = skillPositions.get(skill.name);
      if (!from) continue;
      for (const targetName of skill.connectsTo) {
        const to = skillPositions.get(targetName);
        if (to) state.group.add(this.createSkillConnection(from, to, kind));
      }
    }
  }

  private animateGlobe(kind: GlobeKind): void {
    const state = this.globeState[kind];
    if (!state.renderer || !state.scene || !state.camera) return;

    state.controls?.update();
    const cameraNormal = state.camera.position.clone().normalize();
    state.labelSprites.forEach((sprite) => {
      const worldPosition = new THREE.Vector3();
      sprite.getWorldPosition(worldPosition);
      const isFacingCamera = worldPosition.normalize().dot(cameraNormal) > -0.06;
      const material = sprite.material as THREE.SpriteMaterial;
      material.opacity = isFacingCamera ? 0.95 : 0.08;
      sprite.quaternion.copy(state.camera!.quaternion);
    });

    state.renderer.render(state.scene, state.camera);
    state.frameId = requestAnimationFrame(() => this.animateGlobe(kind));
  }

  private resizeGlobe(kind: GlobeKind): void {
    const refs = this.globeRefs[kind];
    const state = this.globeState[kind];
    const frame = refs.frame?.nativeElement;
    if (!frame || !state.renderer || !state.camera) return;

    const width = frame.clientWidth;
    const height = frame.clientHeight;
    state.camera.aspect = width / height;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(width, height, false);
  }

  private makePointerMoveHandler(kind: GlobeKind): (event: PointerEvent) => void {
    return (event: PointerEvent): void => {
      const state = this.globeState[kind];
      const canvas = this.globeRefs[kind].canvas?.nativeElement;
      if (!state.camera || !canvas) return;

      const bounds = canvas.getBoundingClientRect();
      const pointer = new THREE.Vector2(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -(((event.clientY - bounds.top) / bounds.height) * 2 - 1));
      state.raycaster.setFromCamera(pointer, state.camera);

      const [hit] = state.raycaster.intersectObjects(state.nodeMeshes, false);
      const skillName = hit?.object.userData['skillName'] as string | undefined;
      const source = kind === 'technical' ? this.technicalSkills : this.deliverySkills;
      const skill = skillName ? source.find((item) => item.name === skillName) ?? null : null;

      this.zone.run(() => {
        this.hoveredGlobe = kind;
        this.hoveredSkill = skill;
        this.hoveredSkillDetails = skill ? this.createSkillDetails(skill) : null;
        const left = Math.min(Math.max(event.clientX - bounds.left, 160), bounds.width - 160);
        const top = Math.min(Math.max(event.clientY - bounds.top, 110), bounds.height - 18);
        this.skillPopoverStyle = { left: `${left}px`, top: `${top}px` };
      });
    };
  }

  private readonly handleSkillPointerLeave = (): void => {
    this.zone.run(() => {
      this.hoveredSkill = null;
      this.hoveredSkillDetails = null;
    });
  };

  private skillPosition(skill: Skill, radius: number): THREE.Vector3 {
    const longitude = (skill.x / 100) * Math.PI * 2 - Math.PI;
    const latitude = (0.5 - skill.y / 100) * Math.PI;
    return new THREE.Vector3(
      radius * Math.cos(latitude) * Math.cos(longitude),
      radius * Math.sin(latitude),
      radius * Math.cos(latitude) * Math.sin(longitude)
    );
  }

  private createSkillConnection(from: THREE.Vector3, to: THREE.Vector3, kind: GlobeKind): THREE.Line {
    const theme = this.globeTheme(kind);
    const midpoint = from.clone().add(to).normalize().multiplyScalar(4.55);
    const curve = new THREE.QuadraticBezierCurve3(from, midpoint, to);
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(28));
    const material = new THREE.LineBasicMaterial({ color: theme.link, opacity: 0.22, transparent: true });
    return new THREE.Line(geometry, material);
  }

  private createSkillLabel(name: string, kind: GlobeKind): THREE.Sprite {
    const theme = this.globeTheme(kind);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const width = Math.max(142, name.length * 14);
    const height = 54;
    canvas.width = width;
    canvas.height = height;
    if (context) {
      context.clearRect(0, 0, width, height);
      context.fillStyle = theme.labelFill;
      this.roundRect(context, 2, 9, width - 4, 36, 18);
      context.fill();
      context.strokeStyle = theme.labelStroke;
      context.lineWidth = 2;
      this.roundRect(context, 2, 9, width - 4, 36, 18);
      context.stroke();
      context.fillStyle = theme.labelText;
      context.font = 'bold 17px Inter, Arial, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(name, width / 2, 27);
    }
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(width / 118, height / 118, 1);
    return sprite;
  }

  private roundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.arcTo(x + width, y, x + width, y + height, radius);
    context.arcTo(x + width, y + height, x, y + height, radius);
    context.arcTo(x, y + height, x, y, radius);
    context.arcTo(x, y, x + width, y, radius);
    context.closePath();
  }

  private createSkillDetails(skill: Skill): SkillDetails {
    const aliases = this.skillAliases(skill.name);
    const projects = this.experiences
      .filter((experience) => this.experienceMatchesSkill(experience, aliases))
      .map((experience) => `${experience.company} - ${experience.role}`);
    const incomingConnections = this.skills
      .filter((candidate) => candidate.connectsTo.includes(skill.name))
      .map((candidate) => candidate.name);
    return { projectCount: projects.length, projects, related: Array.from(new Set([...skill.connectsTo, ...incomingConnections])) };
  }

  private experienceMatchesSkill(experience: Experience, aliases: string[]): boolean {
    const searchable = [...(experience.technologies ?? []), experience.company, experience.role, ...experience.highlights].map((value) => this.normalizeSkillName(value));
    return aliases.some((alias) => searchable.some((value) => value.includes(alias) || alias.includes(value)));
  }

  private skillAliases(skillName: string): string[] {
    const normalized = this.normalizeSkillName(skillName);
    const aliases: Record<string, string[]> = {
      angular: ['angular', 'angularjs', 'angularv8', 'angularv9', 'angularv14'],
      css3: ['css', 'css3'],
      html5: ['html', 'html5'],
      javascript: ['javascript', 'javascriptes6', 'es6'],
      restapis: ['restapi', 'restapis', 'restfulapi', 'restfulapidesign', 'api'],
      responsive: ['responsive', 'responsivedesign'],
      tailwind: ['tailwind', 'tailwindcss'],
      githubactions: ['githubactions'],
      cicd: ['cicd', 'vercel', 'githubactions']
    };
    return [normalized, ...(aliases[normalized] ?? [])];
  }

  private normalizeSkillName(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  private disposeGlobe(kind: GlobeKind): void {
    const state = this.globeState[kind];
    cancelAnimationFrame(state.frameId);
    state.resizeObserver?.disconnect();
    state.controls?.dispose();
    state.renderer?.dispose();
    this.disposeGlobeObjects(kind);
  }

  private disposeGlobeObjects(kind: GlobeKind): void {
    const state = this.globeState[kind];
    if (state.group) {
      state.scene?.remove(state.group);
      state.group.traverse((object) => {
        const mesh = object as THREE.Mesh;
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        const geometry = mesh.geometry as THREE.BufferGeometry | undefined;
        geometry?.dispose();
        if (Array.isArray(material)) material.forEach((item) => item.dispose());
        else material?.dispose();
      });
    }
    state.group = undefined;
    state.labelSprites = [];
    state.nodeMeshes = [];
  }

  private fallbackExperiences(): Experience[] {
    return [{ role: 'Frontend Developer', company: 'Client Projects', location: 'Remote', period: '2022 - Present', technologies: ['Angular', 'REST APIs'], highlights: ['Angular interfaces', 'API integrations', 'Reusable component systems'] }];
  }

  private fallbackSkills(): Skill[] {
    return [
      { name: 'HTML5', years: 5, note: 'Semantic structure for accessible pages.', x: 22, y: 42, connectsTo: ['CSS3', 'JavaScript'] },
      { name: 'CSS3', years: 5, note: 'Responsive layouts and polished UI systems.', x: 38, y: 28, connectsTo: ['JavaScript'] },
      { name: 'JavaScript', years: 5, note: 'Interactive frontend behavior and application logic.', x: 52, y: 45, connectsTo: ['TypeScript'] },
      { name: 'TypeScript', years: 4, note: 'Typed application code for safer delivery.', x: 66, y: 32, connectsTo: ['Angular'] },
      { name: 'Angular', years: 4, note: 'SPA architecture, forms, services, and client workflows.', x: 76, y: 56, connectsTo: [] },
      { name: 'Client Communication', years: 4, note: 'Clear project updates and collaboration.', x: 56, y: 44, connectsTo: ['Ownership'] },
      { name: 'Ownership', years: 4, note: 'Ownership of delivery end-to-end.', x: 72, y: 25, connectsTo: [] }
    ];
  }
}
