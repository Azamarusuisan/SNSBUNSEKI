'use client';

import { useState } from 'react';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label, Select } from '@/components/ui/input';
import { useToast } from '@/components/providers/toast-provider';
import type { Workspace, SocialAccount } from '@/lib/types';
import { Save, Plus, Check } from 'lucide-react';
import { Modal } from '@/components/ui/modal';

function useIsDemo() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return !url || url.includes('your-project');
}

export function SettingsContent({
  workspace: initialWorkspace,
  initialAccounts,
}: {
  workspace: Workspace;
  initialAccounts: SocialAccount[];
}) {
  const isDemo = useIsDemo();
  const { toast } = useToast();
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const [accounts, setAccounts] = useState(initialAccounts);
  const [saved, setSaved] = useState(false);

  const [wsName, setWsName] = useState(workspace.name);
  const [wsGoal, setWsGoal] = useState(String(workspace.goal_followers));
  const [wsPlatform, setWsPlatform] = useState(workspace.primary_platform || 'x');

  const [showAccountForm, setShowAccountForm] = useState(false);
  const [newPlatform, setNewPlatform] = useState('x');
  const [newAccountName, setNewAccountName] = useState('');
  const [newNiche, setNewNiche] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newFollowers, setNewFollowers] = useState('');

  const handleSaveWorkspace = async () => {
    try {
      if (isDemo) {
        setWorkspace(prev => ({ ...prev, name: wsName, goal_followers: parseInt(wsGoal) || 10000, primary_platform: wsPlatform }));
      } else {
        const { updateWorkspaceSettings } = await import('@/app/actions/workspace');
        const updated = await updateWorkspaceSettings(workspace.id, {
          name: wsName, goal_followers: parseInt(wsGoal) || 10000, primary_platform: wsPlatform,
        });
        if (updated) setWorkspace(updated);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast({ type: 'success', message: 'ワークスペースを保存しました' });
    } catch {
      toast({ type: 'error', message: 'ワークスペースの保存に失敗しました' });
    }
  };

  const handleAddAccount = async () => {
    if (!newAccountName.trim()) {
      toast({ type: 'warning', message: 'アカウント名を入力してください' });
      return;
    }
    try {
      if (isDemo) {
        const acc: SocialAccount = {
          id: `sa-new-${Date.now()}`, workspace_id: workspace.id,
          platform: newPlatform as SocialAccount['platform'],
          account_name: newAccountName, niche: newNiche,
          target_audience: newTarget, current_followers: parseInt(newFollowers) || 0,
          goal_followers: 10000, posting_style: '',
          created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        };
        setAccounts(prev => [...prev, acc]);
      } else {
        const { createOrUpdateSocialAccount } = await import('@/app/actions/workspace');
        const account = await createOrUpdateSocialAccount(workspace.id, {
          platform: newPlatform as 'x' | 'instagram' | 'note', account_name: newAccountName,
          niche: newNiche, target_audience: newTarget,
          current_followers: parseInt(newFollowers) || 0,
        });
        if (account) setAccounts(prev => [...prev, account]);
      }
      setNewAccountName(''); setNewNiche(''); setNewTarget(''); setNewFollowers(''); setShowAccountForm(false);
      toast({ type: 'success', message: 'アカウントを追加しました' });
    } catch {
      toast({ type: 'error', message: 'アカウントの追加に失敗しました' });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold text-neutral-900 lg:text-2xl">設定</h1>

      {isDemo && (
        <Card className="p-4 border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-800">デモモードで動作中。データは保存されません。</p>
          <p className="text-xs text-amber-600 mt-1">Supabaseを設定すると本番モードになります。</p>
        </Card>
      )}

      <Card className="p-5 space-y-4">
        <CardTitle>ワークスペース</CardTitle>
        <div className="space-y-3">
          <div><Label>名前</Label><Input value={wsName} onChange={e => setWsName(e.target.value)} /></div>
          <div><Label>目標フォロワー数</Label><Input type="number" value={wsGoal} onChange={e => setWsGoal(e.target.value)} /></div>
          <div><Label>優先媒体</Label><Select value={wsPlatform} onChange={e => setWsPlatform(e.target.value)}><option value="x">X</option><option value="instagram">Instagram</option><option value="note">note</option></Select></div>
          <Button onClick={handleSaveWorkspace}>
            {saved ? <Check className="w-4 h-4 mr-1" /> : <Save className="w-4 h-4 mr-1" />}
            {saved ? '保存しました' : '保存'}
          </Button>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle>SNSアカウント</CardTitle>
          <Button variant="secondary" size="sm" onClick={() => setShowAccountForm(!showAccountForm)}>
            <Plus className="w-4 h-4 mr-1" />追加
          </Button>
        </div>

        {accounts.length === 0 && !showAccountForm && (
          <div className="flex flex-col items-center py-8 px-4">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-3">
              <circle cx="28" cy="22" r="10" stroke="#d4d4d4" strokeWidth="2" fill="none" />
              <path d="M12 46c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="#d4d4d4" strokeWidth="2" strokeLinecap="round" fill="none" />
              <circle cx="42" cy="38" r="8" fill="#a3a3a3" />
              <path d="M39 38h6M42 35v6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p className="text-sm font-medium text-neutral-700 mb-1">SNSアカウントを追加して、最適なタスクを受け取りましょう</p>
            <p className="text-xs text-neutral-400 mb-4 text-center">アカウント情報を登録すると、<br />あなたに合ったタスクをAIが自動生成します</p>
            <Button size="sm" onClick={() => setShowAccountForm(true)}>
              <Plus className="w-4 h-4 mr-1" />
              アカウントを追加
            </Button>
          </div>
        )}

        {accounts.map(acc => (
          <div key={acc.id} className="border border-neutral-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium capitalize">{acc.platform}</span>
              <span className="text-sm text-neutral-600">@{acc.account_name}</span>
              <span className="text-xs text-neutral-400 ml-auto">
                {acc.current_followers.toLocaleString()} followers
              </span>
            </div>
            {acc.niche && <p className="text-xs text-neutral-400 mt-1">ニッチ: {acc.niche}</p>}
            {acc.target_audience && <p className="text-xs text-neutral-400">ターゲット: {acc.target_audience}</p>}
          </div>
        ))}

      </Card>

      {/* Add Account Modal */}
      <Modal
        isOpen={showAccountForm}
        onClose={() => setShowAccountForm(false)}
        title="SNSアカウントを追加"
        description="アカウント情報を入力してください"
        size="md"
      >
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label>媒体</Label><Select value={newPlatform} onChange={e => setNewPlatform(e.target.value)}><option value="x">X</option><option value="instagram">Instagram</option><option value="note">note</option></Select></div>
            <div><Label>アカウント名</Label><Input value={newAccountName} onChange={e => setNewAccountName(e.target.value)} placeholder="@username" /></div>
            <div><Label>ニッチ/ジャンル</Label><Input value={newNiche} onChange={e => setNewNiche(e.target.value)} placeholder="例: マーケティング" /></div>
            <div><Label>ターゲット層</Label><Input value={newTarget} onChange={e => setNewTarget(e.target.value)} placeholder="例: 20-30代起業家" /></div>
            <div><Label>現在のフォロワー数</Label><Input type="number" value={newFollowers} onChange={e => setNewFollowers(e.target.value)} placeholder="0" /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setShowAccountForm(false)}>キャンセル</Button>
            <Button size="sm" onClick={handleAddAccount}>追加</Button>
          </div>
        </div>
      </Modal>

      <Card className="p-5 space-y-3">
        <CardTitle>AI利用状況</CardTitle>
        <CardDescription>今月の利用量</CardDescription>
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-neutral-200 rounded-lg p-3">
            <p className="text-xs text-neutral-500">推定コスト</p>
            <p className="text-lg font-bold">{isDemo ? '¥0' : '¥---'}</p>
            <p className="text-xs text-neutral-400">{isDemo ? 'デモモード' : 'Supabase接続後に表示'}</p>
          </div>
          <div className="border border-neutral-200 rounded-lg p-3">
            <p className="text-xs text-neutral-500">API呼び出し</p>
            <p className="text-lg font-bold">{isDemo ? '0回' : '---回'}</p>
          </div>
        </div>
        <p className="text-xs text-neutral-400">月間予算目安: ¥3,000 | AI_PROVIDERとAI_MODELは環境変数で設定</p>
      </Card>

      <Card className="p-5 space-y-3">
        <CardTitle>外部ツールリンク</CardTitle>
        <div className="space-y-2">
          <a href="https://www.higgsfield.ai" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            Higgsfield (動画生成) →
          </a>
          <p className="text-xs text-neutral-400">動画プロンプトは「コンテンツ作成」画面で作成し、外部ツールで動画を生成してください</p>
        </div>
      </Card>
    </div>
  );
}
