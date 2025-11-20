import { Badge } from './ui/badge';
import { type Floor } from './mockData';

interface FacilityMapProps {
  floor: Floor;
  onAreaClick: (areaId: string) => void;
}

export default function FacilityMap({ floor, onAreaClick }: FacilityMapProps) {
  return (
    <div className="relative bg-white border-2 border-gray-200 rounded-lg p-8 min-h-[500px]">
      {/* フロア平面図のシミュレーション */}
      <div className="grid grid-cols-2 gap-8 h-full">
        {floor.areas.map((area, index) => {
          const stockLevel = area.percentage >= 70 ? 'high' : area.percentage >= 30 ? 'medium' : 'low';
          const bgColor = stockLevel === 'high' ? 'bg-green-50 border-green-300 hover:bg-green-100' : 
                         stockLevel === 'medium' ? 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100' : 
                         'bg-red-50 border-red-300 hover:bg-red-100';
          const textColor = stockLevel === 'high' ? 'text-green-700' : 
                           stockLevel === 'medium' ? 'text-yellow-700' : 
                           'text-red-700';

          return (
            <button
              key={area.id}
              onClick={() => onAreaClick(area.id)}
              className={`relative border-2 rounded-lg p-6 transition-all cursor-pointer ${bgColor} flex flex-col items-center justify-center min-h-[200px]`}
              style={{
                gridColumn: index === 0 || index === 2 ? '1' : '2',
              }}
            >
              <div className="text-center">
                <h3 className={`mb-2 ${textColor}`}>{area.name}</h3>
                <div className={`text-4xl mb-2 ${textColor}`}>
                  {area.percentage}%
                </div>
                <p className="text-sm text-gray-600">
                  個室数: {area.toilets.length}
                </p>
                <p className="text-sm text-gray-600">
                  補充必要: {area.toilets.filter(t => !t.hasPaper).length}
                </p>
              </div>
              
              {/* クリックヒント */}
              <div className="absolute bottom-2 right-2">
                <Badge variant="outline" className="text-xs">
                  クリックで詳細
                </Badge>
              </div>
            </button>
          );
        })}
      </div>

      {/* 凡例 */}
      <div className="absolute bottom-4 left-4 bg-white border rounded-lg p-3 shadow-sm">
        <p className="text-sm mb-2">残量レベル:</p>
        <div className="flex gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-200 border border-green-300 rounded"></div>
            <span>70%以上</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-yellow-200 border border-yellow-300 rounded"></div>
            <span>30-69%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-200 border border-red-300 rounded"></div>
            <span>30%未満</span>
          </div>
        </div>
      </div>
    </div>
  );
}
