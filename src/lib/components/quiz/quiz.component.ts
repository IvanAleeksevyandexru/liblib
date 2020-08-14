import { Component, ViewChild, HostListener, Input, Output, EventEmitter, NgModuleRef,
  AfterViewInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Quiz, QuizBlock, QuizQuestion, QuizAnswer, QuizResult, QuestionType } from '../../models/quiz';
import { Modal } from '../../models/modal-container';
import { ModalService } from '../../services/modal/modal.service';
import { HelperService } from '../../services/helper/helper.service';
import { Translation } from '../../models/common-enums';

const MS_IN_SEC = 1000;
const QUIZ_STD_SHOW_DELAY = 2;

interface QuizAnswerViewModel extends QuizAnswer {
  selected: boolean; // for multiple checkboxes
  highlighted: boolean;
}

interface QuizQuestionViewModel extends QuizQuestion {
  // выбранный ответ / признак наличия выбранного ответа
  selectedAnswer: QuizAnswer | string | boolean;
  extendedAnswer: string;
  answers: Array<QuizAnswerViewModel>;
}

interface QuizBlockViewModel extends QuizBlock {
  questions: Array<QuizQuestionViewModel>;
}

interface QuizViewModel extends Quiz {
  blocks: Array<QuizBlockViewModel>;
}

// набор обработчиков событий в процессе заполнения Quiz,
// интерфейс расширяем, допустимо работать с внутренним состоянием
export interface QuizEventHandlers {
  answerSelected: (answer: QuizAnswerViewModel, question: QuizQuestionViewModel, control: QuizComponent) => void;
}

@Modal()
@Component({
  selector: 'lib-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
})
export class QuizComponent implements AfterViewInit, OnChanges {

  constructor(private moduleRef: NgModuleRef<any>, private modalService: ModalService, private changeDetection: ChangeDetectorRef) {}

  @Input() public quiz: Quiz;
  // определяет показывать ли контрол инлайн или ожидать внешнего вызова showAsDialog для показа в диалоге
  @Input() public asDialog = false;
  // определяет содержит ли Quiz интернациализируемые строки или нет
  @Input() public translation: Translation | string = Translation.APP;
  // определяет показывать ли хтмл в строках Quiz-а как хтмл или ескейпить
  @Input() public escapeHtml = true;
  @Input() public newLines = false;
  @Input() public handlers: QuizEventHandlers;

  public Translation = Translation;
  public QuestionType = QuestionType;
  public quizInternal: QuizViewModel;
  public submitAllowed = false;
  public openedDialog = null;
  public isDialogContent = false;

  @Output() public quizSubmitted = new EventEmitter<QuizResult>();
  @Output() public quizCancelled = new EventEmitter<QuizResult>();
  @Output() public destroyed = new EventEmitter<void>();

  public ngAfterViewInit() {
    this.rebuildViewModel();
  }

  public ngOnChanges(changes: SimpleChanges) {
    this.rebuildViewModel();
  }

  // inits view-model correspondent to Quiz model
  public rebuildViewModel() {
    this.quizInternal = HelperService.deepCopy(this.quiz) as QuizViewModel;
    if (this.quizInternal && this.quizInternal.blocks && this.quizInternal.blocks.length) {
      this.quizInternal.blocks.forEach((blockInternal) => {
        if (blockInternal && blockInternal.questions && blockInternal.questions.length) {
          blockInternal.questions.forEach((questionInternal) => {
            questionInternal.selectedAnswer = null;
            questionInternal.extendedAnswer = '';
            if (questionInternal.answers && questionInternal.answers.length) {
              questionInternal.answers.forEach((answerInternal) => {
                answerInternal.selected = false;
                answerInternal.highlighted = false;
              });
            }
          });
        }
      });
    }
    this.checkSubmitAllowed();
    this.changeDetection.detectChanges();
  }

  public scheduleShowAsDialog(delay?: number) {
    setTimeout(() => {
      this.showAsDialog();
    }, (delay === undefined ? QUIZ_STD_SHOW_DELAY : delay) * MS_IN_SEC);
  }

  public showAsDialog() {
    if (this.asDialog && !this.openedDialog && this.quiz) {
      const self = this;
      this.openedDialog = this.modalService.popupInject(QuizComponent, this.moduleRef, {
        quiz: this.quiz,
        translation: this.translation,
        escapeHtml: this.escapeHtml,
        asDialog: false,
        isDialogContent: true,
        handlers: this.handlers
      }, true);
      const dialogQuiz = this.openedDialog.instance as QuizComponent;
      dialogQuiz.quizSubmitted.subscribe((result: QuizResult) => {
        this.quizSubmitted.emit(result);
        this.closeDialog();
      });
      dialogQuiz.quizCancelled.subscribe((result: QuizResult) => {
        this.quizCancelled.emit(result);
        this.closeDialog();
      });
    }
  }

  @HostListener('document:keydown', ['$event'])
  public onKeydown(event: KeyboardEvent): void {
    if (this.asDialog && this.openedDialog && event.key === 'Escape') {
      this.closeDialog();
      this.cancelQuiz();
    }
  }

  public closeDialog() {
    if (this.asDialog && this.openedDialog) {
      this.openedDialog.instance.destroy();
      this.openedDialog = null;
    }
  }

  public selectAnswer(question: QuizQuestionViewModel, selectedAnswer: QuizAnswerViewModel) {
    if (question.questionType === QuestionType.RADIO) {
      question.selectedAnswer = selectedAnswer;
    } else if (question.questionType === QuestionType.CHECKBOX) {
      selectedAnswer.selected = !selectedAnswer.selected;
      question.selectedAnswer = question.answers.some((answer) => answer.selected);
    } else if (question.questionType === QuestionType.RATING) {
      question.answers.forEach((answer) => {
        answer.selected = false;
      });
      for (const answer of question.answers) {
        answer.selected = true;
        if (answer === selectedAnswer) {
          break;
        }
      }
      question.selectedAnswer = selectedAnswer;
    }
    this.checkSubmitAllowed();
    if (this.handlers && this.handlers.answerSelected) {
      this.handlers.answerSelected(selectedAnswer, question, this);
    }
  }

  public highlightAnswer(question: QuizQuestionViewModel, highlightedAnswer: QuizAnswerViewModel) {
    this.dehighlightAnswers(question);
    if (question.questionType === QuestionType.RATING) {
      for (const answer of question.answers) {
        answer.highlighted = true;
        if (answer === highlightedAnswer) {
          break;
        }
      }
    } else {
      highlightedAnswer.highlighted = true;
    }
  }

  public dehighlightAnswers(question: QuizQuestionViewModel) {
    question.answers.forEach((answer) => {
      answer.highlighted = false;
    });
  }

  public checkSubmitAllowed() {
    return this.submitAllowed = ((this.quizInternal || {} as any).blocks || []).every((blockInternal) => {
      return ((blockInternal || {} as any).questions || []).every((questionInternal) => questionInternal.selectedAnswer);
    });
  }

  public viewModelToResults(useDefaultAnswers: boolean): QuizResult {
    const quizResults: QuizResult = {quiz: this.quiz, questions: []};
    ((this.quiz || {} as any).blocks || []).forEach((block, blockIndex) => {
      ((block || {} as any).questions || []).forEach((question, questionIndex) => {
        const questionInternal = this.quizInternal.blocks[blockIndex].questions[questionIndex];
        const questionResult = {
          question,
          answer: useDefaultAnswers ? question.defaultAnswer : null,
          answers: useDefaultAnswers ? [question.defaultAnswer] : [],
          extendedAnswer: questionInternal.extendedAnswer
        };
        if (!useDefaultAnswers) {
          if (question.questionType === QuestionType.CHECKBOX) {
            const selectedAnswers = [];
            (question.answers || []).forEach((answer, answerIndex) => {
              if (questionInternal.answers[answerIndex].selected) {
                selectedAnswers.push(answer);
              }
            });
            questionResult.answers = selectedAnswers;
          } else {
            questionResult.answer = questionInternal.selectedAnswer;
          }
        }
        quizResults.questions.push(questionResult);
      });
    });
    return quizResults;
  }

  public submitQuiz() {
    this.quizSubmitted.emit(this.viewModelToResults(false));
  }

  public cancelQuiz() {
    this.quizCancelled.emit(this.viewModelToResults(true));
  }
}
