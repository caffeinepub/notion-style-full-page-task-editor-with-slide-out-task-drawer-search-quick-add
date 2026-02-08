import { ViewMode } from '../App';
import DayView from './views/DayView';
import WeekView from './views/WeekView';
import MonthView from './views/MonthView';

interface MainContentProps {
  viewMode: ViewMode;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  setViewMode: (mode: ViewMode) => void;
  onTaskSelect?: (taskId: bigint) => void;
}

export default function MainContent({ viewMode, selectedDate, setSelectedDate, setViewMode, onTaskSelect }: MainContentProps) {
  return (
    <main className="flex-1 overflow-hidden">
      {viewMode === 'day' && <DayView selectedDate={selectedDate} onTaskSelect={onTaskSelect} />}
      {viewMode === 'week' && <WeekView selectedDate={selectedDate} setSelectedDate={setSelectedDate} onTaskSelect={onTaskSelect} />}
      {viewMode === 'month' && (
        <MonthView selectedDate={selectedDate} setSelectedDate={setSelectedDate} setViewMode={setViewMode} onTaskSelect={onTaskSelect} />
      )}
    </main>
  );
}
