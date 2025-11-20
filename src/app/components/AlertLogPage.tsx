"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  ShieldAlert, 
  WrenchIcon, 
  Clock,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Calendar
} from 'lucide-react';
import { Alert, AlertType, AlertSeverity } from './mockData';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

export interface AlertLog {
  id: string;
  alert: Alert;
  action: 'created' | 'resolved';
  timestamp: number; // Unix timestamp
  actionTime: string; // 表示用の時刻
}

interface AlertLogPageProps {
  onBack: () => void;
}

const LOG_STORAGE_KEY = 'toilet_paper_alert_logs';
const LOG_RETENTION_DAYS = 30;

export default function AlertLogPage({ onBack }: AlertLogPageProps) {
  const [logs, setLogs] = useState<AlertLog[]>(() => {
    try {
      if (typeof window === 'undefined') return [];
      const storedLogs = localStorage.getItem(LOG_STORAGE_KEY);
      if (!storedLogs) return [];
      const parsedLogs: AlertLog[] = JSON.parse(storedLogs);
      // 30日以上前のログをフィルタリング
      const now = Date.now();
      const retentionMs = LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000;
      const filteredLogs = parsedLogs.filter(log => now - log.timestamp < retentionMs);

      // フィルタリング後のログを保存（古いログを削除）
      if (filteredLogs.length !== parsedLogs.length) {
        localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(filteredLogs));
      }

      // 新しい順にソート
      filteredLogs.sort((a, b) => b.timestamp - a.timestamp);
      return filteredLogs;
    } catch (error) {
      console.error('ログの読み込みに失敗しました:', error);
      return [];
    }
  });

  const [showClearDialog, setShowClearDialog] = useState(false);

  const clearAllLogs = () => {
    localStorage.removeItem(LOG_STORAGE_KEY);
    setLogs([]);
    setShowClearDialog(false);
  };

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'theft':
        return <ShieldAlert className="w-5 h-5" />;
      case 'malfunction':
        return <WrenchIcon className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getAlertColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };

  const getBadgeColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-700 hover:bg-red-100';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
      default:
        return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
    }
  };

  const getActionBadge = (action: 'created' | 'resolved') => {
    if (action === 'resolved') {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          解決済み
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
        <AlertCircle className="w-3 h-3 mr-1" />
        発生
      </Badge>
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - timestamp;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `今日 ${date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `昨日 ${date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays}日前 ${date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleString('ja-JP', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const renderLogCard = (log: AlertLog) => (
    <div
      key={log.id}
      className={`border-2 rounded-lg p-4 ${getAlertColor(log.alert.severity)}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            {getAlertIcon(log.alert.type)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h4>{log.alert.title}</h4>
              <Badge className={getBadgeColor(log.alert.severity)}>
                {log.alert.severity === 'critical' ? '緊急' : 
                 log.alert.severity === 'warning' ? '警告' : '情報'}
              </Badge>
              {getActionBadge(log.action)}
            </div>
            <p className="text-sm mb-2">{log.alert.description}</p>
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {log.alert.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDate(log.timestamp)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const theftLogs = logs.filter(log => log.alert.type === 'theft');
  const malfunctionLogs = logs.filter(log => log.alert.type === 'malfunction');
  const createdLogs = logs.filter(log => log.action === 'created');
  const resolvedLogs = logs.filter(log => log.action === 'resolved');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onBack} className="border-gray-300 hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Button>
            <div className="flex-1">
              <h1>アラートログ</h1>
              <p className="text-sm text-gray-500">過去30日間のアラート履歴</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowClearDialog(true)}
              disabled={logs.length === 0}
              className="border-gray-300 hover:bg-gray-100"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              全ログを削除
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* 統計カード */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>総ログ数</CardDescription>
              <CardTitle className="text-3xl">{logs.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-1">
                <ShieldAlert className="w-4 h-4" />
                盗難検知
              </CardDescription>
              <CardTitle className="text-3xl text-red-600">{theftLogs.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-1">
                <WrenchIcon className="w-4 h-4" />
                障害検知
              </CardDescription>
              <CardTitle className="text-3xl text-orange-600">{malfunctionLogs.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                解決済み
              </CardDescription>
              <CardTitle className="text-3xl text-green-600">{resolvedLogs.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* ログリスト */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              ログ履歴
            </CardTitle>
            <CardDescription>
              ログは30日間保持され、自動的に削除されます
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>ログはまだありません</p>
              </div>
            ) : (
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">
                    全て ({logs.length})
                  </TabsTrigger>
                  <TabsTrigger value="theft">
                    <ShieldAlert className="w-4 h-4 mr-1" />
                    盗難 ({theftLogs.length})
                  </TabsTrigger>
                  <TabsTrigger value="malfunction">
                    <WrenchIcon className="w-4 h-4 mr-1" />
                    障害 ({malfunctionLogs.length})
                  </TabsTrigger>
                  <TabsTrigger value="created">
                    発生 ({createdLogs.length})
                  </TabsTrigger>
                  <TabsTrigger value="resolved">
                    解決 ({resolvedLogs.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-3">
                  {logs.map(renderLogCard)}
                </TabsContent>

                <TabsContent value="theft" className="space-y-3">
                  {theftLogs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      盗難ログはありません
                    </div>
                  ) : (
                    theftLogs.map(renderLogCard)
                  )}
                </TabsContent>

                <TabsContent value="malfunction" className="space-y-3">
                  {malfunctionLogs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      障害ログはありません
                    </div>
                  ) : (
                    malfunctionLogs.map(renderLogCard)
                  )}
                </TabsContent>

                <TabsContent value="created" className="space-y-3">
                  {createdLogs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      発生ログはありません
                    </div>
                  ) : (
                    createdLogs.map(renderLogCard)
                  )}
                </TabsContent>

                <TabsContent value="resolved" className="space-y-3">
                  {resolvedLogs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      解決ログはありません
                    </div>
                  ) : (
                    resolvedLogs.map(renderLogCard)
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 削除確認ダイアログ */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>全てのログを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。全てのアラートログが完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={clearAllLogs} className="bg-red-600 hover:bg-red-700">
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ログを保存するユーティリティ関数
export const saveAlertLog = (alert: Alert, action: 'created' | 'resolved') => {
  try {
    const storedLogs = localStorage.getItem(LOG_STORAGE_KEY);
    const logs: AlertLog[] = storedLogs ? JSON.parse(storedLogs) : [];
    
    const newLog: AlertLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      alert,
      action,
      timestamp: Date.now(),
      actionTime: new Date().toLocaleString('ja-JP'),
    };
    
    logs.push(newLog);
    
    // 30日以上前のログを削除
    const now = Date.now();
    const retentionMs = LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000;
    const filteredLogs = logs.filter(log => now - log.timestamp < retentionMs);
    
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(filteredLogs));
  } catch (error) {
    console.error('ログの保存に失敗しました:', error);
  }
};
