// Task Generation Rule Engine
// Generates daily tasks based on completion rate, platform weights, and recovery mode

import { format, subDays } from 'date-fns';
import type { DailyTask, Platform } from '@/lib/types';

interface TaskTemplate {
  platform: DailyTask['platform'];
  task_type: DailyTask['task_type'];
  title: string;
  description: string;
  scheduled_time: string | null;
  estimated_minutes: number;
  priority: number;
  weight: number; // higher = heavier load
}

// Platform load weights
const PLATFORM_WEIGHT: Record<string, number> = {
  x: 1,
  instagram: 2,
  note: 3,
  general: 1,
};

// All possible task templates
const TASK_TEMPLATES: TaskTemplate[] = [
  // X tasks (light)
  {
    platform: 'x',
    task_type: 'write_post',
    title: 'X投稿文案を作成',
    description: 'テーマを決めてX投稿の文案を作成する',
    scheduled_time: '09:00',
    estimated_minutes: 15,
    priority: 1,
    weight: 1,
  },
  {
    platform: 'x',
    task_type: 'publish_post',
    title: 'X投稿を公開',
    description: '作成した文案をXに投稿する',
    scheduled_time: '12:00',
    estimated_minutes: 5,
    priority: 1,
    weight: 1,
  },
  {
    platform: 'x',
    task_type: 'engage',
    title: 'Xでエンゲージメント活動',
    description: '関連アカウントへのリプライ・いいね・リポスト',
    scheduled_time: '13:00',
    estimated_minutes: 15,
    priority: 2,
    weight: 1,
  },
  // Instagram tasks (medium)
  {
    platform: 'instagram',
    task_type: 'write_post',
    title: 'Instagramキャプションを作成',
    description: 'Instagram投稿用のキャプションを作成する',
    scheduled_time: '10:00',
    estimated_minutes: 20,
    priority: 1,
    weight: 2,
  },
  {
    platform: 'instagram',
    task_type: 'publish_post',
    title: 'Instagram投稿を公開',
    description: '画像/リールとキャプションを投稿する',
    scheduled_time: '18:00',
    estimated_minutes: 10,
    priority: 1,
    weight: 2,
  },
  {
    platform: 'instagram',
    task_type: 'research',
    title: 'Instagramトレンドリサーチ',
    description: '競合やトレンドのリール/投稿をチェックする',
    scheduled_time: '11:00',
    estimated_minutes: 15,
    priority: 2,
    weight: 1,
  },
  // Note tasks (heavy)
  {
    platform: 'note',
    task_type: 'write_note',
    title: 'note記事の構成作成',
    description: 'note記事のアウトライン・構成を作成する',
    scheduled_time: '14:00',
    estimated_minutes: 30,
    priority: 2,
    weight: 3,
  },
  {
    platform: 'note',
    task_type: 'write_note',
    title: 'note記事の執筆',
    description: 'noteの記事本文を書く',
    scheduled_time: '15:00',
    estimated_minutes: 45,
    priority: 2,
    weight: 3,
  },
  // General tasks
  {
    platform: 'general',
    task_type: 'analyze',
    title: '参考投稿を分析',
    description: '伸びている投稿を1件選んで構造を分析する',
    scheduled_time: '16:00',
    estimated_minutes: 15,
    priority: 2,
    weight: 1,
  },
  {
    platform: 'general',
    task_type: 'review',
    title: '今日の振り返り',
    description: '今日の投稿と結果を振り返り、明日に活かす',
    scheduled_time: '21:00',
    estimated_minutes: 10,
    priority: 3,
    weight: 1,
  },
  {
    platform: 'general',
    task_type: 'create_script',
    title: '動画プロンプト作成',
    description: '外部動画ツール用のプロンプト・台本を作成する',
    scheduled_time: '17:00',
    estimated_minutes: 20,
    priority: 3,
    weight: 2,
  },
];

// Normal day: ~5-7 tasks
const NORMAL_TASK_INDICES = [0, 1, 2, 3, 8, 9]; // X write+pub+engage, IG write, analyze, review
const FULL_TASK_INDICES = [0, 1, 2, 3, 4, 5, 8, 9]; // + IG pub+research
const RECOVERY_TASK_INDICES = [0, 1, 8, 9]; // X write+pub, analyze, review

export interface CompletionStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  consecutiveLowDays: number;
}

export function calculateCompletionStats(
  recentTasks: Pick<DailyTask, 'task_date' | 'status'>[]
): CompletionStats {
  if (recentTasks.length === 0) {
    return { totalTasks: 0, completedTasks: 0, completionRate: 1, consecutiveLowDays: 0 };
  }

  const completed = recentTasks.filter(t => t.status === 'done').length;
  const rate = recentTasks.length > 0 ? completed / recentTasks.length : 1;

  // Count consecutive low days
  const byDate = new Map<string, { total: number; done: number }>();
  for (const t of recentTasks) {
    const d = t.task_date;
    const entry = byDate.get(d) || { total: 0, done: 0 };
    entry.total++;
    if (t.status === 'done') entry.done++;
    byDate.set(d, entry);
  }

  let consecutiveLow = 0;
  const dates = Array.from(byDate.keys()).sort().reverse();
  for (const d of dates) {
    const entry = byDate.get(d)!;
    if (entry.total > 0 && entry.done / entry.total < 0.5) {
      consecutiveLow++;
    } else {
      break;
    }
  }

  return {
    totalTasks: recentTasks.length,
    completedTasks: completed,
    completionRate: rate,
    consecutiveLowDays: consecutiveLow,
  };
}

export interface GenerateTasksInput {
  workspaceId: string;
  date: string; // YYYY-MM-DD
  stats: CompletionStats;
  activePlatforms: Platform[];
  hasNote: boolean; // noteアカウントがあるかどうか
  dayOfWeek: number; // 0=Sun, 6=Sat
}

export function generateDailyTasks(input: GenerateTasksInput): Omit<DailyTask, 'id' | 'created_at' | 'updated_at'>[] {
  const { workspaceId, date, stats, activePlatforms, hasNote, dayOfWeek } = input;

  const isRecovery = stats.consecutiveLowDays >= 2;
  const isHighPerformer = stats.completionRate >= 0.8 && stats.totalTasks > 0;

  // Select task set
  let taskIndices: number[];
  if (isRecovery) {
    taskIndices = [...RECOVERY_TASK_INDICES];
  } else if (isHighPerformer) {
    taskIndices = [...FULL_TASK_INDICES];
  } else {
    taskIndices = [...NORMAL_TASK_INDICES];
  }

  // Add note tasks only on certain days (not every day, it's heavy)
  // Wed + Sat for outline, Thu + Sun for writing
  if (hasNote && !isRecovery) {
    if (dayOfWeek === 3 || dayOfWeek === 6) {
      taskIndices.push(6); // note outline
    }
    if (dayOfWeek === 4 || dayOfWeek === 0) {
      taskIndices.push(7); // note writing
    }
  }

  // Add video prompt occasionally (Tue, Fri)
  if (!isRecovery && (dayOfWeek === 2 || dayOfWeek === 5)) {
    taskIndices.push(10); // video prompt
  }

  // Filter by active platforms
  const platformSet = new Set([...activePlatforms, 'general']);
  const templates = taskIndices
    .map(i => TASK_TEMPLATES[i])
    .filter(t => t && platformSet.has(t.platform));

  // Build tasks
  return templates.map(t => ({
    workspace_id: workspaceId,
    task_date: date,
    platform: t.platform,
    task_type: t.task_type,
    title: t.title,
    description: t.description,
    scheduled_time: t.scheduled_time,
    estimated_minutes: t.estimated_minutes,
    priority: t.priority,
    status: 'todo' as const,
    generated_by: 'system' as const,
    source_reason: isRecovery
      ? 'リカバリーモード: 最低限のタスクに集中'
      : isHighPerformer
        ? '好調: 追加タスクを含む'
        : '通常モード',
    completed_at: null,
  }));
}
