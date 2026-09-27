import type { EngineProps, Exercise } from '../domain/types';
import { ChoiceEngine } from './ChoiceEngine';
import { DragDropEngine } from './DragDropEngine';
import { TraceEngine } from './TraceEngine';

/** Choisit le moteur qui sait afficher l'exercice. */
export function ExerciseView({ exercise, ...handlers }: EngineProps<Exercise>) {
  switch (exercise.engine) {
    case 'choice':
      return <ChoiceEngine exercise={exercise} {...handlers} />;
    case 'dragdrop':
      return <DragDropEngine exercise={exercise} {...handlers} />;
    case 'trace':
      return <TraceEngine exercise={exercise} {...handlers} />;
  }
}
