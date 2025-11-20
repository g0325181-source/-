"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import FacilityMap from './FacilityMap';
import DetailMap from './DetailMap';
import AlertPanel from './AlertPanel';
import { LogOut, Building2, AlertTriangle, Bell, Settings, FileText } from 'lucide-react';
import { mockFacilityData, Floor } from './mockData';

interface DashboardProps {
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenLogs: () => void;
  floors: Floor[];
}

export default function Dashboard({ onLogout, onOpenSettings, onOpenLogs, floors }: DashboardProps) {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<string>(floors[0]?.id || '1F');

  const currentFloorData = floors.find(f => f.id === selectedFloor);
  const selectedAreaData = selectedArea 
    ? currentFloorData?.areas.find(a => a.id === selectedArea)
    : null;

  // 全体の統計を計算
  const totalToilets = currentFloorData?.areas.reduce((sum, area) => sum + area.toilets.length, 0) || 0;
  const lowStockToilets = currentFloorData?.areas.reduce((sum, area) => 
    sum + area.toilets.filter(t => !t.hasPaper).length, 0
  ) || 0;
  const averageStock = currentFloorData?.areas.reduce((sum, area) => sum + area.percentage, 0) || 0;
  const avgPercentage = currentFloorData ? Math.round(averageStock / currentFloorData.areas.length) : 0;
  
  // アラート統計
  const activeAlerts = mockFacilityData.alerts.filter(a => !a.isResolved);
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1>トイレットペーパー残量管理</h1>
              <p className="text-sm text-gray-500">施設管理ダッシュボード</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeAlerts.length > 0 && (
              <Badge variant="outline" className="bg-red-50 border-red-300 text-red-700">
                <Bell className="w-4 h-4 mr-1" />
                {activeAlerts.length}件のアラート
                {criticalAlerts.length > 0 && ` (緊急${criticalAlerts.length})`}
              </Badge>
            )}
            <Button variant="outline" onClick={onOpenSettings} className="border-gray-300 hover:bg-gray-100">
              <Settings className="w-4 h-4 mr-2" />
              設定
            </Button>
            <Button variant="outline" onClick={onOpenLogs} className="border-gray-300 hover:bg-gray-100">
              <FileText className="w-4 h-4 mr-2" />
              ログ
            </Button>
            <Button variant="outline" onClick={onLogout} className="border-gray-300 hover:bg-gray-100">
              <LogOut className="w-4 h-4 mr-2" />
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>総個室数</CardDescription>
              <CardTitle className="text-3xl">{totalToilets}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>平均残量</CardDescription>
              <CardTitle className="text-3xl">{avgPercentage}%</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                補充が必要
              </CardDescription>
              <CardTitle className="text-3xl text-red-600">{lowStockToilets}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* アラートパネル */}
        <AlertPanel />

        {/* フロア選択 */}
        <Tabs value={selectedFloor} onValueChange={(value) => {
          setSelectedFloor(value);
          setSelectedArea(null);
        }}>
          <TabsList>
            {floors.map(floor => (
              <TabsTrigger key={floor.id} value={floor.id}>
                {floor.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {floors.map(floor => (
            <TabsContent key={floor.id} value={floor.id} className="space-y-4">
              {selectedArea ? (
                // 詳細ビュー
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedAreaData?.name}</CardTitle>
                        <CardDescription>個室のトイレットペーパー残量（バイナリ表示）</CardDescription>
                      </div>
                      <Button variant="outline" onClick={() => setSelectedArea(null)} className="border-gray-300 hover:bg-gray-100">
                        戻る
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <DetailMap area={selectedAreaData!} />
                  </CardContent>
                </Card>
              ) : (
                // フロアマップビュー
                <Card>
                  <CardHeader>
                    <CardTitle>{floor.name} - フロアマップ</CardTitle>
                    <CardDescription>
                      エリアをクリックすると各個室の詳細が表示されます
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FacilityMap 
                      floor={floor} 
                      onAreaClick={(areaId) => setSelectedArea(areaId)}
                    />
                  </CardContent>
                </Card>
              )}

              {/* エリア一覧 */}
              {!selectedArea && (
                <Card>
                  <CardHeader>
                    <CardTitle>エリア一覧</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {floor.areas.map(area => {
                        const stockLevel = area.percentage >= 70 ? 'high' : area.percentage >= 30 ? 'medium' : 'low';
                        const stockColor = stockLevel === 'high' ? 'bg-green-100 text-green-700' : 
                                          stockLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' : 
                                          'bg-red-100 text-red-700';
                        
                        return (
                          <button
                            key={area.id}
                            onClick={() => setSelectedArea(area.id)}
                            className="text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors border-gray-300 hover:bg-gray-100">
                            <div className="flex items-center justify-between mb-2">
                              <span>{area.name}</span>
                              <Badge className={stockColor}>
                                {area.percentage}%
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                              個室数: {area.toilets.length} | 補充必要: {area.toilets.filter(t => !t.hasPaper).length}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}