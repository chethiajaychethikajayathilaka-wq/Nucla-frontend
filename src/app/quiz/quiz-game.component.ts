import {
  Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule }    from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
  QuizGameService,
  QuizQuestion,
  QUESTIONS,
  LEVEL_DIALOGUES,
  LevelDialogue,
  SubmitQuizResponse
} from './quiz-game.service';
import { Subscription, interval } from 'rxjs';

export type GamePhase = 'landing' | 'playing' | 'results';

export interface HostConfig {
  id: 'uranium235' | 'neutron';
  name: string;
  title: string;
  symbol: string;
  charge: string;
  tagline: string;
  color: string;
  accentColor: string;
}

export const HOSTS: Record<string, HostConfig> = {
  uranium235: {
    id: 'uranium235', name: 'Uranium-235', title: 'The Fissile One',
    symbol: 'U²³⁵', charge: '⚛', tagline: "I split atoms and power cities!",
    color: '#4ade80', accentColor: '#86efac'
  },
  neutron: {
    id: 'neutron', name: 'Neutron', title: 'The Chain Starter',
    symbol: 'n⁰', charge: '0', tagline: "I trigger the reaction — let's go!",
    color: '#a8b8d8', accentColor: '#d0ddf0'
  }
};

@Component({
  selector: 'app-quiz-game',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './quiz-game.component.html',
  styleUrls: ['./quiz-game.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class QuizGameComponent implements OnInit, OnDestroy {

  // ── State ──────────────────────────────────────────────────────
  phase: GamePhase = 'landing';

  currentLevelIndex   = 0;   // 0–9
  currentQuestionIdx  = 0;   // index within QUESTIONS (0–49)
  completedLevelIndex = 0;   // captured before increment, used in levelSummary

  answers: number[]  = new Array(50).fill(-1);   // -1 = unanswered; answered = 1,2,3,4
  levelTimes: number[] = [];                      // seconds per level
  selectedOption: number | null = null;
  isAnswerLocked = false;

  // Timer
  levelTimer = 0;
  private timerSub?: Subscription;

  // API state
  isLoading       = false;
  loadingMessage  = '';
  quizResult: SubmitQuizResponse | null = null;
  errorMessage    = '';

  // Cosmetic
  hostEntrance = false;
  questionReveal = false;
  levelIntro     = false;
  particleEffect = false;

  readonly HOSTS = HOSTS;
  readonly QUESTIONS = QUESTIONS;
  readonly LEVEL_DIALOGUES = LEVEL_DIALOGUES;
  readonly LEVELS = Array.from({ length: 10 }, (_, i) => i + 1);

  constructor(
    private quizService: QuizGameService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}
  ngOnDestroy(): void { this.stopTimer(); }

  // ── Computed getters ───────────────────────────────────────────
  get currentLevel(): number  { return this.currentLevelIndex + 1; }

  get questionsForCurrentLevel(): QuizQuestion[] {
    return QUESTIONS.filter(q => q.level === this.currentLevel);
  }

  get currentQuestionInLevel(): number {
    return this.currentQuestionIdx - (this.currentLevelIndex * 5);
  }

  get currentQuestion(): QuizQuestion {
    return QUESTIONS[this.currentQuestionIdx];
  }

  get currentHost(): HostConfig {
    return HOSTS[this.currentQuestion.host];
  }

  get currentDialogue(): LevelDialogue {
    return LEVEL_DIALOGUES[this.currentLevelIndex];
  }

  get overallProgress(): number {
    return Math.round(((this.currentQuestionIdx) / 50) * 100);
  }

  get levelProgress(): number {
    return Math.round(((this.currentQuestionInLevel) / 5) * 100);
  }

  get answeredCount(): number {
    return this.answers.filter(a => a !== -1).length;
  }

  get formattedTimer(): string {
    const m = Math.floor(this.levelTimer / 60).toString().padStart(2, '0');
    const s = (this.levelTimer % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // ── Start game ────────────────────────────────────────────────
  startGame(): void {
    this.isLoading = true;
    this.loadingMessage = 'Entering the Nuclear Arena…';

    this.quizService.incrementAttempt().subscribe({
      next: (res) => {
        console.log('Attempt recorded:', res);
        this.isLoading = false;
        this.phase = 'playing';
        this.triggerLevelIntro(); // startTimer() is called inside triggerHostEntrance()
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to record attempt:', err);
        // Proceed anyway — don't block the user on a backend error
        this.isLoading = false;
        this.phase = 'playing';
        this.triggerLevelIntro(); // startTimer() is called inside triggerHostEntrance()
        this.cdr.detectChanges();
      }
    });
  }

  // ── Answer handling ───────────────────────────────────────────
  selectOption(optionIdx: number): void {
    if (this.isAnswerLocked) return;
    this.selectedOption = optionIdx;                          // UI state stays 0-indexed (A=0)
    this.isAnswerLocked = true;
    this.answers[this.currentQuestionIdx] = optionIdx + 1;   // Bug 5: store 1-indexed (A=1)

    setTimeout(() => this.advanceQuestion(), 1000);
  }

  private advanceQuestion(): void {
    const isLastInLevel  = this.currentQuestionInLevel === 4;
    const isLastQuestion = this.currentQuestionIdx === 49;

    if (isLastQuestion) {
      // All 50 questions done — record final level time and submit automatically
      this.stopTimer();
      this.levelTimes.push(this.levelTimer);
      this.completedLevelIndex = this.currentLevelIndex;
      this.submitQuiz();
    } else if (isLastInLevel) {
      // End of a level — record time, advance, jump straight to next question
      this.stopTimer();
      this.levelTimes.push(this.levelTimer);
      this.completedLevelIndex = this.currentLevelIndex;
      this.currentQuestionIdx++;
      this.currentLevelIndex++;
      this.selectedOption  = null;
      this.isAnswerLocked  = false;
      this.levelTimer      = 0;
      this.triggerLevelIntro(); // shows the level intro + starts timer inside triggerHostEntrance()
    } else {
      this.currentQuestionIdx++;
      this.selectedOption = null;
      this.isAnswerLocked = false;
      this.triggerQuestionReveal();
    }
    this.cdr.detectChanges();
  }


  // ── Submit ────────────────────────────────────────────────────
  submitQuiz(): void {
    this.isLoading = true;
    this.loadingMessage = 'The particles are calculating your score…';

    const payload = {
      answers: this.answers,
      levelTimes: this.levelTimes
    };

    console.log('📤 Submitting quiz payload:', payload);

    this.quizService.submitQuiz(payload).subscribe({
      next: (result) => {
        this.quizResult  = result;
        this.isLoading   = false;
        this.phase       = 'results';
        this.triggerParticles();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Submission error:', err);
        this.errorMessage = 'Could not reach the server. Please try again.';
        this.isLoading    = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Timer ─────────────────────────────────────────────────────
  private startTimer(): void {
    this.stopTimer();
    this.levelTimer = 0;
    this.timerSub   = interval(1000).subscribe(() => {
      this.levelTimer++;
      this.cdr.detectChanges();
    });
  }

  private stopTimer(): void {
    this.timerSub?.unsubscribe();
    this.timerSub = undefined;
  }

  // ── Visual helpers ────────────────────────────────────────────
  private triggerLevelIntro(): void {
    this.levelIntro = true;
    setTimeout(() => {
      this.levelIntro = false;
      this.triggerHostEntrance();
    }, 800);
  }

  private triggerHostEntrance(): void {
    this.hostEntrance = false;
    setTimeout(() => {
      this.hostEntrance = true;
      this.startTimer(); // Bug 4: start timer AFTER intro animation, not before
      this.triggerQuestionReveal();
    }, 50);
  }

  private triggerQuestionReveal(): void {
    this.questionReveal = false;
    setTimeout(() => { this.questionReveal = true; this.cdr.detectChanges(); }, 50);
  }

  private triggerParticles(): void {
    this.particleEffect = true;
    setTimeout(() => { this.particleEffect = false; }, 3000);
  }

  restartGame(): void {
    this.phase               = 'landing';
    this.currentLevelIndex   = 0;
    this.currentQuestionIdx  = 0;
    this.completedLevelIndex = 0;
    this.answers             = new Array(50).fill(-1);
    this.levelTimes          = [];
    this.selectedOption      = null;
    this.isAnswerLocked      = false;
    this.levelTimer          = 0;
    this.quizResult          = null;
    this.errorMessage        = '';
    this.stopTimer();
    this.cdr.detectChanges();
  }

  trackByIndex(index: number): number { return index; }

  getOptionClass(idx: number): string {
    if (!this.isAnswerLocked) {
      return this.selectedOption === idx ? 'option-selected' : '';
    }
    if (idx === this.currentQuestion.correctIndex) return 'option-correct';
    if (idx === this.selectedOption && idx !== this.currentQuestion.correctIndex) return 'option-wrong';
    return 'option-dimmed';
  }

  getLevelStatus(level: number): 'completed' | 'current' | 'upcoming' {
    if (level < this.currentLevel) return 'completed';
    if (level === this.currentLevel) return 'current';
    return 'upcoming';
  }

  getLevelTime(level: number): string {
    const t = this.levelTimes[level - 1];
    if (t === undefined) return '--:--';
    const m = Math.floor(t / 60).toString().padStart(2, '0');
    const s = (t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  getLevelScore(levelNum: number): number {
    const start = (levelNum - 1) * 5;
    const levelQs = QUESTIONS.slice(start, start + 5);
    // Bug 5: answers are now 1-indexed, correctIndex is 0-indexed, so compare with +1
    return levelQs.filter((q, i) => this.answers[start + i] === q.correctIndex + 1).length;
  }
}
