// src/app/page.tsx (srcフォルダがない場合は app/page.tsx)

"use client"; // 1. クライアントコンポーネントとして宣言

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase"; // 2. 作成したfirebase.tsをインポート
import { collection, onSnapshot, QuerySnapshot, DocumentData } from "firebase/firestore";

// 3. データの型を定義（TypeScript）
interface ToiletData {
  id: string;
  Stall_ID?: string;
  Floor?: string;
  Paper_Remaining?: number;
  Reserve_Count?: number;
  Alert_Status?: string;
  Online?: boolean;
}

export default function Home() {
  // 4. 取得したデータを保存するState
  const [toilets, setToilets] = useState<ToiletData[]>([]);
  const [loading, setLoading] = useState(true);

  // 5. Firestoreからデータをリアルタイム取得
  useEffect(() => {
    const collectionRef = collection(db, "Toilets"); // 'toilets' コレクションを参照

    // onSnapshotでデータ変更をリアルタイムに購読
    const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
      const toiletsData: ToiletData[] = [];
      snapshot.forEach((doc) => {
        toiletsData.push({ id: doc.id, ...doc.data() } as ToiletData);
      });
      setToilets(toiletsData); // データをStateにセット
      setLoading(false);
    });

    // 6. コンポーネントが不要になったら購読を解除
    return () => unsubscribe();
  }, []);

  // 7. 取得したデータを表示
  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">トイレ残量ダッシュボード</h1>
      <div className="grid grid-cols-3 gap-4">
        {toilets.map((toilet) => (
          <div key={toilet.id} className="border p-4 rounded-lg shadow">
            <h2 className="font-bold text-lg">{toilet.id}</h2>
            <p>フロア: {toilet.Floor || "N/A"}</p>
            <p>個室番号: {toilet.Stall_ID || "N/A"}</p>
            <p className="font-bold text-xl">
              残量: {toilet.Paper_Remaining || 0}%
            </p>
            <p>予備: {toilet.Reserve_Count || 0}個</p>
            <p>状態: {toilet.Alert_Status || "normal"}</p>
          </div>
        ))}
      </div>
    </main>
  );
}