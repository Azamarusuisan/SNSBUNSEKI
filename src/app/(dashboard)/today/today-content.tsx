'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input, Label, Select } from '@/components/ui/input';
import { cn, platformLabel, platformColor, statusLabel, statusColor, todayString, formatDate } from '@/lib/utils';
import { DEMO_TASKS } from '@/lib/demo';
import type { Workspace, DailyTask } from '@/lib/types';
import {
  CheckCircle2,
  Clock,
  SkipForward,
  CalendarPlus,
  PenTool,
  FileText,
  Plus,
  X,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SkeletonProgressBar, SkeletonList } from '@/components/ui/skeleton';
import { useToast } from '@/components/providers/toast-provider';

function useIsDemo() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return !url || url.includes('your-project');
}

export function TodayContent({ workspace }: { workspace: Workspace }) {
  const isDemo = useIsDemo();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPlatform, setNewPlatform] = useState('general');
  const [newType, setNewType] = useState('write_post');
  const [skipConfirmId, setSkipConfirmId] = useState<string | null>(null);
  const [showReportConfirm, setShowReportConfirm] = useState(false);
  const today = todayString();

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (isDemo) {
        setTasks([...DEMO_TASKS]);
      } else {
        const { generateTodayTasks } = await import('@/app/actions/tasks');
        const t = await generateTodayTasks(workspace.id, today);
        setTasks(t);
      }
      setLoading(false);
    }
    load();
  }, [workspace.id, today, isDemo]);

  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const handleStatus = async (taskId: string, status: DailyTask['status']) => {
    try {
      if (isDemo) {
        setTasks(prev => prev.map(t =>
          t.id === taskId
            ? { ...t, status, completed_at: status === 'done' ? new Date().toISOString() : null }
            : t
        ));
      } else {
        const { updateTaskStatus } = await import('@/app/actions/tasks');
        const updated = await updateTaskStatus(taskId, status);
        if (updated) {
          setTasks(prev => prev.map(t => (t.id === taskId ? updated : t)));
        }
      }
      if (status === 'done') toast({ type: 'success', message: 'タスクを完了しました' });
      else if (status === 'skipped') toast({ type: 'info', message: 'タスクをスキップしました' });
      else toast({ type: 'info', message: 'タスクを未完了に戻しました' });
    } catch {
      toast({ type: 'error', message: 'タスクの更新に失敗しました' });
    }
  };

  const handlePostpone = async (taskId: string) => {
    try {
      if (isDemo) {
        setTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, status: 'postponed' as const } : t
        ));
      } else {
        const { postponeTask } = await import('@/app/actions/tasks');
        const { addDays, format } = await import('date-fns');
        const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
        await postponeTask(taskId, tomorrow);
        setTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, status: 'postponed' as const } : t
        ));
      }
      toast({ type: 'info', message: '明日に延期しました' });
    } catch {
      toast({ type: 'error', message: 'タスクの延期に失敗しました' });
    }
  };

  const handleGenerateReport = async () => {
    setReportLoading(true);
    try {
    if (isDemo) {
      await new Promise(r => setTimeout(r, 800));
      setReport(`## 今日の振り返り\n\n今日のタスク達成率は${completionRate}%でした。\n\n### 良かった点\n- X投稿を予定通り作成・公開できました\n- タスクに着実に取り組む姿勢が良いです\n\n### 改善点\n- エンゲージメント活動の時間を確保しましょう\n\n### 明日の優先事項\n- Instagramのキャプション作成を優先\n- 参考投稿分析を1件実施\n\n### 一言\n「継続は力なり」— 毎日少しずつ進めることが最大の武器です。`);
    } else {
      const { generateDailyReport } = await import('@/app/actions/ai');
      const incompleteTasks = tasks.filter(t => t.status !== 'done').map(t => t.title);
      const r = await generateDailyReport(workspace.id, today, {
        completionRate, tasksCompleted: doneTasks, tasksTotal: totalTasks,
        postsCount: 0, incompleteTasks,
      });
      if (r) setReport(r.ai_insight || r.summary);
    }
    toast({ type: 'success', message: '日次レポートを生成しました' });
    } catch {
      toast({ type: 'error', message: 'レポートの生成に失敗しました' });
    }
    setReportLoading(false);
  };

  const handleAddTask = async () => {
    if (!newTitle.trim()) {
      toast({ type: 'warning', message: 'タスク名を入力してください' });
      return;
    }
    if (isDemo) {
      const newTask: DailyTask = {
        id: `dt-new-${Date.now()}`, workspace_id: workspace.id, task_date: today,
        platform: newPlatform as DailyTask['platform'], task_type: newType as DailyTask['task_type'],
        title: newTitle, description: '', scheduled_time: null, estimated_minutes: 15,
        priority: 2, status: 'todo', generated_by: 'user', source_reason: 'ユーザー追加',
        completed_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      };
      setTasks(prev => [...prev, newTask]);
    } else {
      const { addCustomTask } = await import('@/app/actions/tasks');
      const task = await addCustomTask(workspace.id, {
        task_date: today, platform: newPlatform as DailyTask['platform'],
        task_type: newType as DailyTask['task_type'], title: newTitle,
      });
      if (task) setTasks(prev => [...prev, task]);
    }
    setNewTitle('');
    setShowAddForm(false);
    toast({ type: 'success', message: 'タスクを追加しました' });
  };

  const totalMinutes = tasks
    .filter(t => t.status === 'todo')
    .reduce((sum, t) => sum + t.estimated_minutes, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="h-7 w-36 rounded bg-neutral-200 animate-pulse" />
            <div className="h-4 w-28 rounded bg-neutral-200 animate-pulse mt-2" />
          </div>
        </div>
        <SkeletonProgressBar />
        <SkeletonList count={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 lg:text-2xl">今日の運用</h1>
          <p className="text-sm text-neutral-500 mt-1">{formatDate(today)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4 mr-1" />
            タスク追加
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setShowReportConfirm(true)} disabled={reportLoading}>
            <FileText className="w-4 h-4 mr-1" />
            {reportLoading ? '生成中...' : '日次レポート'}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">進捗</p>
          <p className="text-sm text-neutral-500">
            {doneTasks}/{totalTasks} 完了 ({completionRate}%) | 残り約{totalMinutes}分
          </p>
        </div>
        <div className="w-full bg-brand-100 rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-brand-600 to-brand-400 h-2.5 rounded-full transition-all"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </Card>

      {/* Add Task Form */}
      {showAddForm && (
        <Card className="p-4 space-y-3 animate-slide-down" style={{ animationFillMode: 'both' }}>
          <div className="flex items-center justify-between">
            <CardTitle>タスクを追加</CardTitle>
            <button onClick={() => setShowAddForm(false)} className="text-neutral-400 hover:text-neutral-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label>タイトル</Label>
              <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="タスク名" />
            </div>
            <div>
              <Label>媒体</Label>
              <Select value={newPlatform} onChange={e => setNewPlatform(e.target.value)}>
                <option value="general">全般</option>
                <option value="x">X</option>
                <option value="instagram">Instagram</option>
                <option value="note">note</option>
              </Select>
            </div>
            <div>
              <Label>タイプ</Label>
              <Select value={newType} onChange={e => setNewType(e.target.value)}>
                <option value="write_post">投稿作成</option>
                <option value="publish_post">投稿公開</option>
                <option value="write_note">note執筆</option>
                <option value="analyze">分析</option>
                <option value="research">リサーチ</option>
                <option value="review">振り返り</option>
                <option value="engage">エンゲージメント</option>
                <option value="create_script">台本作成</option>
              </Select>
            </div>
          </div>
          <Button size="sm" onClick={handleAddTask}>追加</Button>
        </Card>
      )}

      {/* Task List */}
      {tasks.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 px-6">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-5">
            <circle cx="40" cy="40" r="30" stroke="#d4d4d4" strokeWidth="2" fill="none" strokeDasharray="4 4" />
            <rect x="28" y="30" width="24" height="4" rx="2" fill="#d4d4d4" />
            <rect x="28" y="38" width="18" height="4" rx="2" fill="#d4d4d4" />
            <rect x="28" y="46" width="20" height="4" rx="2" fill="#d4d4d4" />
            <path d="M54 26l4 4-10 10-4-4z" fill="#a3a3a3" />
            <path d="M58 22l4 4-4 4-4-4z" fill="#a3a3a3" />
          </svg>
          <p className="text-base font-medium text-neutral-700 mb-1">今日のタスクを生成して運用を始めましょう</p>
          <p className="text-sm text-neutral-400 mb-5 text-center">AIがあなたのSNS運用目標を分析し、<br />今日やるべきタスクを自動で生成します</p>
          <Button size="sm" onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-1" />
            タスクを追加する
          </Button>
        </Card>
      ) : (
      <div className="space-y-2">
        {tasks.map((task, index) => (
          <Card
            key={task.id}
            className={cn(
              'p-4 transition-all animate-fade-in-up',
              task.status === 'done' && 'opacity-60',
              task.status === 'postponed' && 'opacity-40',
              task.status === 'skipped' && 'opacity-40'
            )}
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => handleStatus(task.id, task.status === 'done' ? 'todo' : 'done')}
                className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200',
                  task.status === 'done'
                    ? 'border-green-500 bg-green-500'
                    : 'border-neutral-300 hover:border-neutral-500'
                )}
              >
                {task.status === 'done' && <CheckCircle2 className="w-4 h-4 text-white" />}
              </button>

              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm font-medium',
                  task.status === 'done' && 'line-through text-neutral-400'
                )}>
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-xs text-neutral-400 mt-0.5">{task.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <Badge className={cn('text-xs', platformColor(task.platform))}>
                    {platformLabel(task.platform)}
                  </Badge>
                  {task.scheduled_time && (
                    <span className="text-xs text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.scheduled_time.slice(0, 5)}
                    </span>
                  )}
                  <span className="text-xs text-neutral-400">{task.estimated_minutes}分</span>
                  <Badge className={cn('text-xs', statusColor(task.status))}>
                    {statusLabel(task.status)}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {task.status === 'todo' && (
                  <>
                    {(task.task_type === 'write_post' || task.task_type === 'write_note') && (
                      <Link href="/create">
                        <Button variant="ghost" size="sm" title="文案作成">
                          <PenTool className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handlePostpone(task.id)} title="明日に延期">
                      <CalendarPlus className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setSkipConfirmId(task.id)} title="スキップ">
                      <SkipForward className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
      )}

      {/* Daily Report */}
      {report && (
        <Card className="p-5 animate-fade-in" style={{ animationFillMode: 'both' }}>
          <CardTitle className="mb-3">日次レポート</CardTitle>
          <div className="prose prose-sm prose-neutral max-w-none whitespace-pre-wrap text-sm text-neutral-700">
            {report}
          </div>
        </Card>
      )}

      {/* Confirm: Skip task */}
      <ConfirmDialog
        isOpen={skipConfirmId !== null}
        title="タスクをスキップ"
        message="このタスクをスキップしますか？"
        confirmLabel="スキップ"
        variant="warning"
        onConfirm={() => {
          if (skipConfirmId) handleStatus(skipConfirmId, 'skipped');
          setSkipConfirmId(null);
        }}
        onCancel={() => setSkipConfirmId(null)}
      />

      {/* Confirm: Generate report */}
      <ConfirmDialog
        isOpen={showReportConfirm}
        title="日次レポート生成"
        message="日次レポートを生成しますか？"
        confirmLabel="生成する"
        variant="info"
        onConfirm={() => {
          setShowReportConfirm(false);
          handleGenerateReport();
        }}
        onCancel={() => setShowReportConfirm(false)}
      />
    </div>
  );
}
