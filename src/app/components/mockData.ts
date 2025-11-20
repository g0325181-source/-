export interface Toilet {
  id: string;
  name: string;
  hasPaper: boolean;
  lastChecked?: string;
}

export interface Area {
  id: string;
  name: string;
  percentage: number;
  toilets: Toilet[];
}

export interface Floor {
  id: string;
  name: string;
  areas: Area[];
}

export interface FacilityData {
  floors: Floor[];
  alerts: Alert[];
}

export type AlertType = 'theft' | 'malfunction' | 'low-stock';
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  isResolved: boolean;
}

// モックデータ
export const mockFacilityData: FacilityData = {
  alerts: [
    {
      id: 'alert-1',
      type: 'theft',
      severity: 'critical',
      title: '盗難の疑い',
      description: '過去30分間で異常な消費速度を検知しました',
      location: '2階 中央トイレ 個室2',
      timestamp: '5分前',
      isResolved: false,
    },
    {
      id: 'alert-2',
      type: 'malfunction',
      severity: 'critical',
      title: 'センサー障害',
      description: 'センサーからの応答がありません。確認が必要です',
      location: '1階 西側トイレ 個室4',
      timestamp: '12分前',
      isResolved: false,
    },
    {
      id: 'alert-3',
      type: 'theft',
      severity: 'warning',
      title: '盗難の疑い',
      description: '通常より2倍の消費速度を検知しました',
      location: '3階 北側トイレ 個室2',
      timestamp: '18分前',
      isResolved: false,
    },
    {
      id: 'alert-4',
      type: 'malfunction',
      severity: 'warning',
      title: '通信エラー',
      description: 'センサーとの通信が不安定です',
      location: '2階 南側トイレ 個室3',
      timestamp: '25分前',
      isResolved: false,
    },
    {
      id: 'alert-5',
      type: 'theft',
      severity: 'critical',
      title: '盗難の疑い',
      description: '残量が5分で0%になりました',
      location: '1階 南側トイレ 個室4',
      timestamp: '32分前',
      isResolved: true,
    },
    {
      id: 'alert-6',
      type: 'malfunction',
      severity: 'warning',
      title: 'バッテリー低下',
      description: 'センサーのバッテリー残量が10%以下です',
      location: '3階 南側トイレ 個室5',
      timestamp: '1時間前',
      isResolved: true,
    },
  ],
  floors: [
    {
      id: '1F',
      name: '1階',
      areas: [
        {
          id: '1f-north',
          name: '北側トイレ',
          percentage: 85,
          toilets: [
            { id: '1f-n-1', name: '個室1', hasPaper: true, lastChecked: '10分前' },
            { id: '1f-n-2', name: '個室2', hasPaper: true, lastChecked: '15分前' },
            { id: '1f-n-3', name: '個室3', hasPaper: true, lastChecked: '5分前' },
            { id: '1f-n-4', name: '個室4', hasPaper: true, lastChecked: '20分前' },
            { id: '1f-n-5', name: '個室5', hasPaper: true, lastChecked: '8分前' },
            { id: '1f-n-6', name: '個室6', hasPaper: false, lastChecked: '3分前' },
            { id: '1f-n-7', name: '個室7', hasPaper: true, lastChecked: '12分前' },
          ],
        },
        {
          id: '1f-south',
          name: '南側トイレ',
          percentage: 50,
          toilets: [
            { id: '1f-s-1', name: '個室1', hasPaper: true, lastChecked: '25分前' },
            { id: '1f-s-2', name: '個室2', hasPaper: false, lastChecked: '18分前' },
            { id: '1f-s-3', name: '個室3', hasPaper: true, lastChecked: '7分前' },
            { id: '1f-s-4', name: '個室4', hasPaper: false, lastChecked: '30分前' },
            { id: '1f-s-5', name: '個室5', hasPaper: true, lastChecked: '11分前' },
            { id: '1f-s-6', name: '個室6', hasPaper: false, lastChecked: '22分前' },
          ],
        },
        {
          id: '1f-east',
          name: '東側トイレ',
          percentage: 75,
          toilets: [
            { id: '1f-e-1', name: '個室1', hasPaper: true, lastChecked: '6分前' },
            { id: '1f-e-2', name: '個室2', hasPaper: true, lastChecked: '14分前' },
            { id: '1f-e-3', name: '個室3', hasPaper: false, lastChecked: '9分前' },
            { id: '1f-e-4', name: '個室4', hasPaper: true, lastChecked: '17分前' },
          ],
        },
        {
          id: '1f-west',
          name: '西側トイレ',
          percentage: 40,
          toilets: [
            { id: '1f-w-1', name: '個室1', hasPaper: true, lastChecked: '13分前' },
            { id: '1f-w-2', name: '個室2', hasPaper: false, lastChecked: '19分前' },
            { id: '1f-w-3', name: '個室3', hasPaper: false, lastChecked: '4分前' },
            { id: '1f-w-4', name: '個室4', hasPaper: false, lastChecked: '26分前' },
            { id: '1f-w-5', name: '個室5', hasPaper: true, lastChecked: '21分前' },
          ],
        },
      ],
    },
    {
      id: '2F',
      name: '2階',
      areas: [
        {
          id: '2f-north',
          name: '北側トイレ',
          percentage: 90,
          toilets: [
            { id: '2f-n-1', name: '個室1', hasPaper: true, lastChecked: '5分前' },
            { id: '2f-n-2', name: '個室2', hasPaper: true, lastChecked: '8分前' },
            { id: '2f-n-3', name: '個室3', hasPaper: true, lastChecked: '12分前' },
            { id: '2f-n-4', name: '個室4', hasPaper: true, lastChecked: '3分前' },
            { id: '2f-n-5', name: '個室5', hasPaper: true, lastChecked: '16分前' },
            { id: '2f-n-6', name: '個室6', hasPaper: true, lastChecked: '7分前' },
            { id: '2f-n-7', name: '個室7', hasPaper: true, lastChecked: '10分前' },
            { id: '2f-n-8', name: '個室8', hasPaper: true, lastChecked: '14分前' },
            { id: '2f-n-9', name: '個室9', hasPaper: false, lastChecked: '2分前' },
            { id: '2f-n-10', name: '個室10', hasPaper: true, lastChecked: '6分前' },
          ],
        },
        {
          id: '2f-south',
          name: '南側トイレ',
          percentage: 66,
          toilets: [
            { id: '2f-s-1', name: '個室1', hasPaper: true, lastChecked: '11分前' },
            { id: '2f-s-2', name: '個室2', hasPaper: true, lastChecked: '20分前' },
            { id: '2f-s-3', name: '個室3', hasPaper: false, lastChecked: '4分前' },
            { id: '2f-s-4', name: '個室4', hasPaper: true, lastChecked: '15分前' },
            { id: '2f-s-5', name: '個室5', hasPaper: false, lastChecked: '9分前' },
            { id: '2f-s-6', name: '個室6', hasPaper: true, lastChecked: '18分前' },
          ],
        },
        {
          id: '2f-center',
          name: '中央トイレ',
          percentage: 25,
          toilets: [
            { id: '2f-c-1', name: '個室1', hasPaper: false, lastChecked: '28分前' },
            { id: '2f-c-2', name: '個室2', hasPaper: false, lastChecked: '35分前' },
            { id: '2f-c-3', name: '個室3', hasPaper: true, lastChecked: '1分前' },
            { id: '2f-c-4', name: '個室4', hasPaper: false, lastChecked: '40分前' },
          ],
        },
      ],
    },
    {
      id: '3F',
      name: '3階',
      areas: [
        {
          id: '3f-north',
          name: '北側トイレ',
          percentage: 60,
          toilets: [
            { id: '3f-n-1', name: '個室1', hasPaper: true, lastChecked: '22分前' },
            { id: '3f-n-2', name: '個室2', hasPaper: false, lastChecked: '10分前' },
            { id: '3f-n-3', name: '個室3', hasPaper: true, lastChecked: '5分前' },
            { id: '3f-n-4', name: '個室4', hasPaper: false, lastChecked: '30分前' },
            { id: '3f-n-5', name: '個室5', hasPaper: true, lastChecked: '8分前' },
          ],
        },
        {
          id: '3f-south',
          name: '南側トイレ',
          percentage: 80,
          toilets: [
            { id: '3f-s-1', name: '個室1', hasPaper: true, lastChecked: '3分前' },
            { id: '3f-s-2', name: '個室2', hasPaper: true, lastChecked: '12分前' },
            { id: '3f-s-3', name: '個室3', hasPaper: true, lastChecked: '7分前' },
            { id: '3f-s-4', name: '個室4', hasPaper: true, lastChecked: '15分前' },
            { id: '3f-s-5', name: '個室5', hasPaper: false, lastChecked: '20分前' },
          ],
        },
      ],
    },
  ],
};
