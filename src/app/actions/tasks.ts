'use server';

import { createClient } from '@/lib/supabase/server';
import { generateDailyTasks, calculateCompletionStats } from '@/lib/tasks/generator';
import type { DailyTask, Platform } from '@/lib/types';
import { subDays, format } from 'date-fns';

export async function getTodayTasks(workspaceId: string, date: string): Promise<DailyTask[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('daily_tasks')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('task_date', date)
    .order('scheduled_time', { ascending: true, nullsFirst: false })
    .order('priority');

  return data || [];
}

export async function generateTodayTasks(workspaceId: string, date: string): Promise<DailyTask[]> {
  const supabase = await createClient();

  // Check if tasks already exist for today
  const { data: existing } = await supabase
    .from('daily_tasks')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('task_date', date)
    .limit(1);

  if (existing && existing.length > 0) {
    return getTodayTasks(workspaceId, date);
  }

  // Get recent tasks for completion stats (last 3 days)
  const threeDaysAgo = format(subDays(new Date(date), 3), 'yyyy-MM-dd');
  const { data: recentTasks } = await supabase
    .from('daily_tasks')
    .select('task_date, status')
    .eq('workspace_id', workspaceId)
    .gte('task_date', threeDaysAgo)
    .lt('task_date', date);

  const stats = calculateCompletionStats(recentTasks || []);

  // Get active platforms
  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('platform')
    .eq('workspace_id', workspaceId);

  const activePlatforms = (accounts || []).map(a => a.platform as Platform);
  // If no accounts yet, default to X
  if (activePlatforms.length === 0) activePlatforms.push('x');

  const dayOfWeek = new Date(date).getDay();

  const tasks = generateDailyTasks({
    workspaceId,
    date,
    stats,
    activePlatforms,
    hasNote: activePlatforms.includes('note'),
    dayOfWeek,
  });

  // Insert tasks
  const { data: inserted } = await supabase
    .from('daily_tasks')
    .insert(tasks)
    .select();

  return inserted || [];
}

export async function updateTaskStatus(
  taskId: string,
  status: DailyTask['status']
): Promise<DailyTask | null> {
  const supabase = await createClient();
  const updates: Record<string, unknown> = { status };

  if (status === 'done') {
    updates.completed_at = new Date().toISOString();
  } else {
    updates.completed_at = null;
  }

  const { data } = await supabase
    .from('daily_tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single();

  return data;
}

export async function postponeTask(taskId: string, newDate: string): Promise<void> {
  const supabase = await createClient();

  // Get original task
  const { data: task } = await supabase
    .from('daily_tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (!task) return;

  // Mark original as postponed
  await supabase
    .from('daily_tasks')
    .update({ status: 'postponed' })
    .eq('id', taskId);

  // Create new task for the new date
  await supabase.from('daily_tasks').insert({
    workspace_id: task.workspace_id,
    task_date: newDate,
    platform: task.platform,
    task_type: task.task_type,
    title: task.title,
    description: task.description,
    scheduled_time: task.scheduled_time,
    estimated_minutes: task.estimated_minutes,
    priority: task.priority,
    status: 'todo',
    generated_by: 'system',
    source_reason: `延期: ${task.task_date}から繰越`,
  });
}

export async function addCustomTask(
  workspaceId: string,
  task: Partial<DailyTask>
): Promise<DailyTask | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('daily_tasks')
    .insert({
      workspace_id: workspaceId,
      task_date: task.task_date,
      platform: task.platform || 'general',
      task_type: task.task_type || 'write_post',
      title: task.title || '',
      description: task.description || '',
      scheduled_time: task.scheduled_time,
      estimated_minutes: task.estimated_minutes || 15,
      priority: task.priority || 2,
      status: 'todo',
      generated_by: 'user',
      source_reason: 'ユーザー追加',
    })
    .select()
    .single();

  return data;
}

export async function getRecentCompletionRate(
  workspaceId: string,
  days: number = 7
): Promise<{ date: string; rate: number; total: number; done: number }[]> {
  const supabase = await createClient();
  const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

  const { data } = await supabase
    .from('daily_tasks')
    .select('task_date, status')
    .eq('workspace_id', workspaceId)
    .gte('task_date', startDate)
    .order('task_date');

  if (!data) return [];

  const byDate = new Map<string, { total: number; done: number }>();
  for (const t of data) {
    const entry = byDate.get(t.task_date) || { total: 0, done: 0 };
    entry.total++;
    if (t.status === 'done') entry.done++;
    byDate.set(t.task_date, entry);
  }

  return Array.from(byDate.entries()).map(([date, { total, done }]) => ({
    date,
    rate: total > 0 ? Math.round((done / total) * 100) : 0,
    total,
    done,
  }));
}
