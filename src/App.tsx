import { Navbar } from './components/Navbar';
import { TaskStats } from './components/TaskStats';
import { TaskFilters } from './components/TaskFilters';
import { TaskList } from './components/TaskList';
import { TaskModal } from './components/TaskModal';

export function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
      {/* 1. Header with direct Zustand actions */}
      <Navbar />

      {/* 2. Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Real-time stats */}
        <TaskStats />

        {/* Search, Filter, Sort Controls */}
        <TaskFilters />

        {/* Task cards list */}
        <TaskList />
      </main>

      {/* 3. Global Modal */}
      <TaskModal />
    </div>
  );
}

export default App;
