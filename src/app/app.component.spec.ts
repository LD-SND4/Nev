import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    spyOn(window, 'fetch').and.returnValue(Promise.reject(new Error('Use fallback data')));

    await TestBed.configureTestingModule({
      imports: [AppComponent]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    expect(app).toBeTruthy();
  });

  it('should render the portfolio introduction', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('SaaS, software and data systems');
    expect(compiled.textContent).toContain('Nev Research');
  });

  it('should calculate an estimate range', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.calculator = {
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
      timelineUnit: 'weeks'
    };

    expect(app.estimateRange).toBe('$3,000 - $3,700');
  });
});
