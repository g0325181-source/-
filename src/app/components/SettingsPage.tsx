"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit, 
  Building2,
  MapPin,
  DoorOpen
} from 'lucide-react';
import { Floor, Area, Toilet } from './mockData';
import { toast } from 'sonner';

interface SettingsPageProps {
  floors: Floor[];
  onSave: (floors: Floor[]) => void;
  onBack: () => void;
}

export default function SettingsPage({ floors: initialFloors, onSave, onBack }: SettingsPageProps) {
  const [floors, setFloors] = useState<Floor[]>(initialFloors);
  const [selectedFloor, setSelectedFloor] = useState<string>(floors[0]?.id || '');
  
  // Dialog states
  const [showFloorDialog, setShowFloorDialog] = useState(false);
  const [showAreaDialog, setShowAreaDialog] = useState(false);
  const [showToiletDialog, setShowToiletDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Edit states
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
  const [editingArea, setEditingArea] = useState<{ floorId: string; area: Area | null }>({ floorId: '', area: null });
  const [editingToilet, setEditingToilet] = useState<{ floorId: string; areaId: string; toilet: Toilet | null }>({ floorId: '', areaId: '', toilet: null });
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'floor' | 'area' | 'toilet'; id: string; parentId?: string } | null>(null);
  
  // Form states
  const [floorForm, setFloorForm] = useState({ id: '', name: '' });
  const [areaForm, setAreaForm] = useState({ id: '', name: '', percentage: 0 });
  const [toiletForm, setToiletForm] = useState({ id: '', name: '', hasPaper: true });

  const currentFloor = floors.find(f => f.id === selectedFloor);

  const handleSaveFloor = () => {
    if (!floorForm.id || !floorForm.name) {
      toast.error('全ての項目を入力してください');
      return;
    }

    if (editingFloor) {
      // Edit existing floor
      setFloors(floors.map(f => f.id === editingFloor.id ? { ...f, id: floorForm.id, name: floorForm.name } : f));
      toast.success(`${floorForm.name}を更新しました`);
    } else {
      // Add new floor
      if (floors.some(f => f.id === floorForm.id)) {
        toast.error('このIDは既に使用されています');
        return;
      }
      setFloors([...floors, { id: floorForm.id, name: floorForm.name, areas: [] }]);
      toast.success(`${floorForm.name}を追加しました`);
    }
    
    setShowFloorDialog(false);
    setEditingFloor(null);
    setFloorForm({ id: '', name: '' });
  };

  const handleSaveArea = () => {
    if (!areaForm.id || !areaForm.name) {
      toast.error('全ての項目を入力してください');
      return;
    }

    const floorId = editingArea.floorId;
    setFloors(floors.map(floor => {
      if (floor.id === floorId) {
        if (editingArea.area) {
          // Edit existing area
          return {
            ...floor,
            areas: floor.areas.map(a => 
              a.id === editingArea.area!.id 
                ? { ...a, id: areaForm.id, name: areaForm.name, percentage: areaForm.percentage }
                : a
            )
          };
        } else {
          // Add new area
          if (floor.areas.some(a => a.id === areaForm.id)) {
            toast.error('このIDは既に使用されています');
            return floor;
          }
          return {
            ...floor,
            areas: [...floor.areas, { id: areaForm.id, name: areaForm.name, percentage: areaForm.percentage, toilets: [] }]
          };
        }
      }
      return floor;
    }));

    toast.success(editingArea.area ? `${areaForm.name}を更新しました` : `${areaForm.name}を追加しました`);
    setShowAreaDialog(false);
    setEditingArea({ floorId: '', area: null });
    setAreaForm({ id: '', name: '', percentage: 0 });
  };

  const handleSaveToilet = () => {
    if (!toiletForm.id || !toiletForm.name) {
      toast.error('全ての項目を入力してください');
      return;
    }

    const { floorId, areaId } = editingToilet;
    setFloors(floors.map(floor => {
      if (floor.id === floorId) {
        return {
          ...floor,
          areas: floor.areas.map(area => {
            if (area.id === areaId) {
              if (editingToilet.toilet) {
                // Edit existing toilet
                return {
                  ...area,
                  toilets: area.toilets.map(t =>
                    t.id === editingToilet.toilet!.id
                      ? { ...t, id: toiletForm.id, name: toiletForm.name, hasPaper: toiletForm.hasPaper }
                      : t
                  )
                };
              } else {
                // Add new toilet
                if (area.toilets.some(t => t.id === toiletForm.id)) {
                  toast.error('このIDは既に使用されています');
                  return area;
                }
                return {
                  ...area,
                  toilets: [...area.toilets, { id: toiletForm.id, name: toiletForm.name, hasPaper: toiletForm.hasPaper }]
                };
              }
            }
            return area;
          })
        };
      }
      return floor;
    }));

    toast.success(editingToilet.toilet ? `${toiletForm.name}を更新しました` : `${toiletForm.name}を追加しました`);
    setShowToiletDialog(false);
    setEditingToilet({ floorId: '', areaId: '', toilet: null });
    setToiletForm({ id: '', name: '', hasPaper: true });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    const { type, id, parentId } = deleteTarget;

    if (type === 'floor') {
      setFloors(floors.filter(f => f.id !== id));
      toast.success('フロアを削除しました');
      if (selectedFloor === id && floors.length > 1) {
        setSelectedFloor(floors.find(f => f.id !== id)!.id);
      }
    } else if (type === 'area' && parentId) {
      setFloors(floors.map(floor => {
        if (floor.id === parentId) {
          return {
            ...floor,
            areas: floor.areas.filter(a => a.id !== id)
          };
        }
        return floor;
      }));
      toast.success('エリアを削除しました');
    } else if (type === 'toilet' && parentId) {
      const [floorId, areaId] = parentId.split('::');
      setFloors(floors.map(floor => {
        if (floor.id === floorId) {
          return {
            ...floor,
            areas: floor.areas.map(area => {
              if (area.id === areaId) {
                return {
                  ...area,
                  toilets: area.toilets.filter(t => t.id !== id)
                };
              }
              return area;
            })
          };
        }
        return floor;
      }));
      toast.success('個室を削除しました');
    }

    setShowDeleteDialog(false);
    setDeleteTarget(null);
  };

  const openFloorDialog = (floor?: Floor) => {
    if (floor) {
      setEditingFloor(floor);
      setFloorForm({ id: floor.id, name: floor.name });
    } else {
      setEditingFloor(null);
      setFloorForm({ id: '', name: '' });
    }
    setShowFloorDialog(true);
  };

  const openAreaDialog = (floorId: string, area?: Area) => {
    if (area) {
      setEditingArea({ floorId, area });
      setAreaForm({ id: area.id, name: area.name, percentage: area.percentage });
    } else {
      setEditingArea({ floorId, area: null });
      setAreaForm({ id: '', name: '', percentage: 50 });
    }
    setShowAreaDialog(true);
  };

  const openToiletDialog = (floorId: string, areaId: string, toilet?: Toilet) => {
    if (toilet) {
      setEditingToilet({ floorId, areaId, toilet });
      setToiletForm({ id: toilet.id, name: toilet.name, hasPaper: toilet.hasPaper });
    } else {
      setEditingToilet({ floorId, areaId, toilet: null });
      setToiletForm({ id: '', name: '', hasPaper: true });
    }
    setShowToiletDialog(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onBack} className="border-gray-300 hover:bg-gray-100">
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Button>
              <div>
                <h1>施設設定</h1>
                <p className="text-sm text-gray-500">フロア・エリア・個室の管理</p>
              </div>
            </div>
            <Button onClick={() => onSave(floors)} className="bg-black text-white hover:bg-gray-800">
              変更を保存
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* フロア管理 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>フロア管理</CardTitle>
                <CardDescription>施設内のフロアを管理します</CardDescription>
              </div>
              <Button onClick={() => openFloorDialog()} className="bg-black text-white hover:bg-gray-800">
                <Plus className="w-4 h-4 mr-2" />
                フロアを追加
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {floors.map(floor => (
                <div key={floor.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <span>{floor.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openFloorDialog(floor)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setDeleteTarget({ type: 'floor', id: floor.id });
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    ID: {floor.id} | エリア数: {floor.areas.length}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* エリア・個室管理 */}
        {floors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>エリア・個室管理</CardTitle>
              <CardDescription>各フロアのエリアと個室を管理します</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedFloor} onValueChange={setSelectedFloor}>
                <TabsList>
                  {floors.map(floor => (
                    <TabsTrigger key={floor.id} value={floor.id}>
                      {floor.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {floors.map(floor => (
                  <TabsContent key={floor.id} value={floor.id} className="space-y-4 mt-4">
                    {/* エリア追加ボタン */}
                    <div className="flex justify-end">
                      <Button onClick={() => openAreaDialog(floor.id)} className="bg-black text-white hover:bg-gray-800">
                        <Plus className="w-4 h-4 mr-2" />
                        エリアを追加
                      </Button>
                    </div>

                    {/* エリア一覧 */}
                    {floor.areas.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        エリアがありません。追加してください。
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {floor.areas.map(area => (
                          <Card key={area.id}>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-5 h-5 text-green-600" />
                                  <div>
                                    <CardTitle className="text-lg">{area.name}</CardTitle>
                                    <CardDescription>ID: {area.id} | 個室数: {area.toilets.length}</CardDescription>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => openToiletDialog(floor.id, area.id)}
                                  >
                                    <Plus className="w-4 h-4 mr-1" />
                                    個室追加
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => openAreaDialog(floor.id, area)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setDeleteTarget({ type: 'area', id: area.id, parentId: floor.id });
                                      setShowDeleteDialog(true);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {area.toilets.length === 0 ? (
                                <p className="text-sm text-gray-500">個室がありません</p>
                              ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  {area.toilets.map(toilet => (
                                    <div key={toilet.id} className="border rounded p-3">
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-1">
                                          <DoorOpen className="w-4 h-4" />
                                          <span className="text-sm">{toilet.name}</span>
                                        </div>
                                        <div className="flex gap-1">
                                          <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                            onClick={() => openToiletDialog(floor.id, area.id, toilet)}
                                          >
                                            <Edit className="w-3 h-3" />
                                          </Button>
                                          <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                            onClick={() => {
                                              setDeleteTarget({ type: 'toilet', id: toilet.id, parentId: `${floor.id}::${area.id}` });
                                              setShowDeleteDialog(true);
                                            }}
                                          >
                                            <Trash2 className="w-3 h-3 text-red-600" />
                                          </Button>
                                        </div>
                                      </div>
                                      <p className="text-xs text-gray-500">ID: {toilet.id}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>

      {/* フロア追加/編集ダイアログ */}
      <Dialog open={showFloorDialog} onOpenChange={setShowFloorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFloor ? 'フロアを編集' : 'フロアを追加'}</DialogTitle>
            <DialogDescription>
              フロアの情報を入力してください
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="floor-id">フロアID</Label>
              <Input
                id="floor-id"
                value={floorForm.id}
                onChange={(e) => setFloorForm({ ...floorForm, id: e.target.value })}
                placeholder="例: 1F, 2F"
              />
            </div>
            <div>
              <Label htmlFor="floor-name">フロア名</Label>
              <Input
                id="floor-name"
                value={floorForm.name}
                onChange={(e) => setFloorForm({ ...floorForm, name: e.target.value })}
                placeholder="例: 1階, 2階"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFloorDialog(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSaveFloor}>
              {editingFloor ? '更新' : '追加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* エリア追加/編集ダイアログ */}
      <Dialog open={showAreaDialog} onOpenChange={setShowAreaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingArea.area ? 'エリアを編集' : 'エリアを追加'}</DialogTitle>
            <DialogDescription>
              エリアの情報を入力してください
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="area-id">エリアID</Label>
              <Input
                id="area-id"
                value={areaForm.id}
                onChange={(e) => setAreaForm({ ...areaForm, id: e.target.value })}
                placeholder="例: 1f-north"
              />
            </div>
            <div>
              <Label htmlFor="area-name">エリア名</Label>
              <Input
                id="area-name"
                value={areaForm.name}
                onChange={(e) => setAreaForm({ ...areaForm, name: e.target.value })}
                placeholder="例: 北側トイレ"
              />
            </div>
            <div>
              <Label htmlFor="area-percentage">初期残量 (%)</Label>
              <Input
                id="area-percentage"
                type="number"
                min="0"
                max="100"
                value={areaForm.percentage}
                onChange={(e) => setAreaForm({ ...areaForm, percentage: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAreaDialog(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSaveArea}>
              {editingArea.area ? '更新' : '追加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 個室追加/編集ダイアログ */}
      <Dialog open={showToiletDialog} onOpenChange={setShowToiletDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingToilet.toilet ? '個室を編集' : '個室を追加'}</DialogTitle>
            <DialogDescription>
              個室の情報を入力してください
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="toilet-id">個室ID</Label>
              <Input
                id="toilet-id"
                value={toiletForm.id}
                onChange={(e) => setToiletForm({ ...toiletForm, id: e.target.value })}
                placeholder="例: 1f-n-1"
              />
            </div>
            <div>
              <Label htmlFor="toilet-name">個室名</Label>
              <Input
                id="toilet-name"
                value={toiletForm.name}
                onChange={(e) => setToiletForm({ ...toiletForm, name: e.target.value })}
                placeholder="例: 個室1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="toilet-paper"
                type="checkbox"
                checked={toiletForm.hasPaper}
                onChange={(e) => setToiletForm({ ...toiletForm, hasPaper: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="toilet-paper">トイレットペーパー在庫あり</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowToiletDialog(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSaveToilet}>
              {editingToilet.toilet ? '更新' : '追加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>削除の確認</AlertDialogTitle>
            <AlertDialogDescription>
              この{deleteTarget?.type === 'floor' ? 'フロア' : deleteTarget?.type === 'area' ? 'エリア' : '個室'}を削除してもよろしいですか？
              {deleteTarget?.type !== 'toilet' && '配下のデータも全て削除されます。'}
              この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
