import type { EngineProps, Exercise } from '../domain/types';
import { ChoiceEngine } from './ChoiceEngine';
import { DragDropEngine } from './DragDropEngine';
import { MemoryEngine } from './MemoryEngine';
import { SequenceEngine } from './SequenceEngine';
import { TapTargetsEngine } from './TapTargetsEngine';
import { TraceEngine } from './TraceEngine';

/** Choisit le moteur qui sait afficher l'exercice. */
export function ExerciseView({ exercise, ...rest }: EngineProps<Exercise>) {
  switch (exercise.engine) {
    case 'choice':
      return <ChoiceEngine exercise={exercise} {...rest} />;
    case 'dragdrop':
      return <DragDropEngine exercise={exercise} {...rest} />;
    case 'trace':
      return <TraceEngine exercise={exercise} {...rest} />;
    case 'memory':
      return <MemoryEngine exercise={exercise} {...rest} />;
    case 'sequence':
      return <SequenceEngine exercise={exercise} {...rest} />;
    case 'taptargets':
      return <TapTargetsEngine exercise={exercise} {...rest} />;
  }
}
