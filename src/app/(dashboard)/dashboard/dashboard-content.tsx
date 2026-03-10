'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, platformLabel, platformColor, statusLabel, statusColor, todayString, formatDate } from '@/lib/utils';
import type { Workspace, DailyTask } from '@/lib/types';
import {
  DEMO_TASKS, DEMO_COMPLETION_HISTORY,
} from '@/lib/demo';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  PenTool,
  CalendarCheck,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { SkeletonKPI, SkeletonList } from '@/components/ui/skeleton';
import { useToast } from '@/components/providers/toast-provider';

function useIsDemo() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return !url || url.includes('your-project');
}

export function DashboardContent({ workspace }: { workspace: Workspace }) {
  const isDemo = useIsDemo();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [completionHistory, setCompletionHistory] = useState<{ date: string; rate: number; done: number; total: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const today = todayString();

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (isDemo) {
        setTasks(DEMO_TASKS);
        setCompletionHistory(DEMO_COMPLETION_HISTORY);
      } else {
        const { generateTodayTasks, getRecentCompletionRate } = await import('@/app/actions/tasks');
        const [t, h] = await Promise.all([
          generateTodayTasks(workspace.id, today),
          getRecentCompletionRate(workspace.id, 7),
        ]);
        setTasks(t);
        setCompletionHistory(h);
      }
      setLoading(false);
    }
    load();
  }, [workspace.id, today, isDemo]);

  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const todoTasks = tasks.filter(t => t.status === 'todo');

  const handleToggleTask = useCallback(async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    try {
      if (isDemo) {
        setTasks(prev => prev.map(t =>
          t.id === taskId
            ? { ...t, status: newStatus as DailyTask['status'], completed_at: newStatus === 'done' ? new Date().toISOString() : null }
            : t
        ));
      } else {
        const { updateTaskStatus } = await import('@/app/actions/tasks');
        const updated = await updateTaskStatus(taskId, newStatus as DailyTask['status']);
        if (updated) {
          setTasks(prev => prev.map(t => (t.id === taskId ? updated : t)));
        }
      }
      if (newStatus === 'done') {
        toast({ type: 'success', message: 'タスクを完了しました' });
      } else {
        toast({ type: 'info', message: 'タスクを未完了に戻しました' });
      }
    } catch {
      toast({ type: 'error', message: 'タスクの更新に失敗しました' });
    }
  }, [isDemo, toast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-40 rounded bg-neutral-200 animate-pulse" />
          <div className="h-4 w-56 rounded bg-neutral-200 animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SkeletonKPI />
          <SkeletonKPI />
          <SkeletonKPI />
          <SkeletonKPI />
        </div>
        <SkeletonList count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date and Summary */}
      <div>
        <h1 className="text-xl font-bold text-neutral-900 lg:text-2xl">{formatDate(today)}</h1>
        <p className="text-sm text-neutral-500 mt-1">
          {completionRate === 100
            ? '全タスク完了！お疲れ様でした'
            : todoTasks.length > 0
              ? `残り${todoTasks.length}件のタスクがあります`
              : 'タスクはまだありません'}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          <Card key="kpi-0" className="p-4 animate-fade-in-up border-brand-200 bg-gradient-to-br from-brand-50 to-white" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
            <p className="text-xs text-brand-600 mb-1">今日の達成率</p>
            <p className="text-2xl font-bold text-brand-700">{completionRate}%</p>
            <div className="w-full bg-brand-100 rounded-full h-1.5 mt-2">
              <div
                className="bg-gradient-to-r from-brand-500 to-brand-400 h-1.5 rounded-full transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </Card>,
          <Card key="kpi-1" className="p-4 animate-fade-in-up" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
            <p className="text-xs text-neutral-500 mb-1">完了タスク</p>
            <p className="text-2xl font-bold text-neutral-900">
              {doneTasks}<span className="text-sm text-neutral-400">/{totalTasks}</span>
            </p>
          </Card>,
          <Card key="kpi-2" className="p-4 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            <p className="text-xs text-neutral-500 mb-1">優先媒体</p>
            <p className="text-lg font-bold text-neutral-900">{platformLabel(workspace.primary_platform || 'x')}</p>
          </Card>,
          <Card key="kpi-3" className="p-4 animate-fade-in-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
            <p className="text-xs text-neutral-500 mb-1">直近7日の継続</p>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: 7 }, (_, i) => {
                const entry = completionHistory[i];
                return (
                  <div
                    key={i}
                    className={cn(
                      'w-6 h-6 rounded-sm flex items-center justify-center text-[10px] font-medium',
                      entry
                        ? entry.rate >= 80
                          ? 'bg-green-500 text-white'
                          : entry.rate >= 50
                            ? 'bg-yellow-400 text-white'
                            : 'bg-red-400 text-white'
                        : 'bg-neutral-100 text-neutral-400'
                    )}
                  >
                    {entry ? entry.rate : '-'}
                  </div>
                );
              })}
            </div>
          </Card>,
        ]}
      </div>

      {/* Main Content: Tasks + Quick Actions */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-6 space-y-6 lg:space-y-0">
        {/* Today's Tasks */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle>今日のタスク</CardTitle>
            <Link href="/today">
              <Button variant="ghost" size="sm">
                詳細 <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          {tasks.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-12 px-6">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4">
                <rect x="12" y="16" width="40" height="36" rx="4" stroke="#d4d4d4" strokeWidth="2" fill="none" />
                <line x1="20" y1="28" x2="44" y2="28" stroke="#d4d4d4" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="36" x2="38" y2="36" stroke="#d4d4d4" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="44" x2="34" y2="44" stroke="#d4d4d4" strokeWidth="2" strokeLinecap="round" />
                <circle cx="48" cy="16" r="8" fill="#a3a3a3" />
                <path d="M45 16h6M48 13v6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p className="text-sm font-medium text-neutral-700 mb-1">今日のタスクを生成しましょう</p>
              <p className="text-xs text-neutral-400 mb-4 text-center">AIがあなたの目標に合わせた<br />最適なタスクを提案します</p>
              <Link href="/today">
                <Button size="sm">
                  <CalendarCheck className="w-4 h-4 mr-1" />
                  今日の運用を始める
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-2">
              {tasks.map((task, index) => (
                <Card
                  key={task.id}
                  className={cn(
                    'p-3 flex items-center gap-3 cursor-pointer transition-all hover:shadow-sm animate-fade-in-up',
                    task.status === 'done' && 'opacity-60'
                  )}
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                  onClick={() => handleToggleTask(task.id, task.status)}
                >
                  <div className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                    task.status === 'done'
                      ? 'border-green-500 bg-green-500'
                      : 'border-neutral-300'
                  )}>
                    {task.status === 'done' && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm font-medium',
                      task.status === 'done' && 'line-through text-neutral-400'
                    )}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge className={cn('text-xs', platformColor(task.platform))}>
                        {platformLabel(task.platform)}
                      </Badge>
                      {task.scheduled_time && (
                        <span className="text-xs text-neutral-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.scheduled_time.slice(0, 5)}
                        </span>
                      )}
                      <span className="text-xs text-neutral-400">
                        {task.estimated_minutes}分
                      </span>
                    </div>
                  </div>
                  <Badge className={cn('text-xs flex-shrink-0', statusColor(task.status))}>
                    {statusLabel(task.status)}
                  </Badge>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <CardTitle>クイックアクション</CardTitle>
          <div className="space-y-2">
            <Link href="/create">
              <Card className="p-4 hover:shadow-md transition-all cursor-pointer flex items-center gap-3 hover:border-brand-200 animate-scale-in" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
                <PenTool className="w-5 h-5 text-brand-500" />
                <div>
                  <p className="text-sm font-medium">文案を作成</p>
                  <p className="text-xs text-neutral-400">X / Instagram / note</p>
                </div>
              </Card>
            </Link>
            <Link href="/today">
              <Card className="p-4 hover:shadow-md transition-all cursor-pointer flex items-center gap-3 hover:border-brand-200 animate-scale-in" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
                <CalendarCheck className="w-5 h-5 text-brand-500" />
                <div>
                  <p className="text-sm font-medium">今日の運用画面</p>
                  <p className="text-xs text-neutral-400">タスクの管理と実行</p>
                </div>
              </Card>
            </Link>
            <Link href="/trends">
              <Card className="p-4 hover:shadow-md transition-all cursor-pointer flex items-center gap-3 hover:border-brand-200 animate-scale-in" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
                <TrendingUp className="w-5 h-5 text-brand-500" />
                <div>
                  <p className="text-sm font-medium">参考投稿を分析</p>
                  <p className="text-xs text-neutral-400">競合・トレンド分析</p>
                </div>
              </Card>
            </Link>
            <Link href="/analysis">
              <Card className="p-4 hover:shadow-md transition-all cursor-pointer flex items-center gap-3 hover:border-brand-200 animate-scale-in" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
                <BarChart3 className="w-5 h-5 text-brand-500" />
                <div>
                  <p className="text-sm font-medium">分析を見る</p>
                  <p className="text-xs text-neutral-400">投稿成績・傾向</p>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
