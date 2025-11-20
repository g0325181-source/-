import { Check, X } from 'lucide-react';
import { Badge } from './ui/badge';
import { type Area } from './mockData';

interface DetailMapProps {
  area: Area;
}

export default function DetailMap({ area }: DetailMapProps) {
  return (
    <div>
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">エリア全体の残量</p>
            <p className="text-2xl">{area.percentage}%</p>
          </div>
          <Badge className={
            area.percentage >= 70 ? 'bg-green-100 text-green-700' :
            area.percentage >= 30 ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }>
            {area.toilets.filter(t => t.hasPaper).length}/{area.toilets.length} 在庫あり
          </Badge>
        </div>
      </div>

      {/* 個室マップ（バイナリ表示） */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {area.toilets.map((toilet) => (
          <div
            key={toilet.id}
            className={`border-2 rounded-lg p-4 transition-all ${
              toilet.hasPaper 
                ? 'bg-green-50 border-green-300' 
                : 'bg-red-50 border-red-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">{toilet.name}</span>
              {toilet.hasPaper ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <X className="w-5 h-5 text-red-600" />
              )}
            </div>
            
            <div className={`text-center py-2 rounded ${
              toilet.hasPaper ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <div className="text-xs">{toilet.hasPaper ? '在庫あり' : '補充必要'}</div>
            </div>

            {toilet.lastChecked && (
              <p className="text-xs text-gray-500 mt-2">
                最終確認: {toilet.lastChecked}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* バイナリ表示の説明 */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm">
          <span className="inline-flex items-center gap-1 mr-3">
            <Check className="w-4 h-4 text-green-600" /> = 在庫あり
          </span>
          <span className="inline-flex items-center gap-1">
            <X className="w-4 h-4 text-red-600" /> = 補充必要
          </span>
        </p>
      </div>
    </div>
  );
}
