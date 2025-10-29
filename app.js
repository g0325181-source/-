// --- あなたのFirebaseプロジェクトの接続情報 ---
// (以前あなたが貼り付けたものと同じです)
const firebaseConfig = {
  apiKey: "AIzaSyDeq8PU8oVxVlOkoC6AsApeOvL8xkkh9DY",
  authDomain: "designproject-73a7d.firebaseapp.com",
  projectId: "designproject-73a7d",
  storageBucket: "designproject-73a7d.firebasestorage.app",
  messagingSenderId: "289138083257",
  appId: "1:289138083257:web:e92b9d99ca27e7039ea268",
  measurementId: "G-8JSKCTQY6Q"
};
// -----------------------------------------------------------

// Firebaseを初期化
firebase.initializeApp(firebaseConfig);

// Firestoreデータベースのクライアントを取得
const db = firebase.firestore();

// データを表示するHTML要素（<div id="toilet-list">）を取得
const listContainer = document.getElementById('toilet-list');

//
// アラートの重複防止用
// --------------------
// 既に盗難アラートを出した個室のID（パス）を保存しておくためのSet
// (例: "toilet_locations/1F-A-male/stalls/stall-01")
//
const currentlyStolen = new Set();


//
// --- データベースの監視を開始 ---
//
// 'stalls' (個室) という名前のコレクションを、
// 場所（`toilet_locations`）に関わらず、すべて（Collection Group）監視します。
// 'last_updated' (最終更新日時) が新しい順に並べ替えます。
//
const stallsQuery = db.collectionGroup('stalls').orderBy('last_updated', 'desc');

// .onSnapshot で、データが更新されるたびに自動でこの関数が実行されます
stallsQuery.onSnapshot(
    (snapshot) => {

        // データが更新されるたびに、まずリストを空にする
        listContainer.innerHTML = '';

        if (snapshot.empty) {
            // データが1件も無い場合
            listContainer.innerHTML = '<p>データがまだありません。</p>';
            return;
        }

        // 取得した全個室のデータ（snapshot.docs）を1件ずつ処理
        snapshot.forEach(doc => {
            // doc.data() で { remaining_percentage: 80, is_stolen: true, ... } などを取得
            const stallData = doc.data();

            // ドキュメントID (例: "stall-01") を取得
            const stallId = doc.id;

            // 親の親をたどって、場所のID (例: "1F-A-male") を取得
            const locationId = doc.ref.parent.parent.id;

            // この個室のユニークID（フルパス）を取得 (アラート管理用)
            const stallPathId = doc.ref.path;

            // ------------------------------------
            // 表示用のHTML要素（カード）を作成
            // ------------------------------------
            const stallElement = document.createElement('div');
            stallElement.classList.add('stall-item'); // CSSクラス 'stall-item' を追加

            // ------------------------------------
            // ★ 状態判定ロジック ★
            // ------------------------------------

            // 1. 盗難フラグ (is_stolen) が true の場合
            if (stallData.is_stolen === true) {

                stallElement.classList.add('stolen'); // 赤色・点滅クラスを適用

                // ★アラートロジック★
                // もし、この個室が「まだ」アラート済みリストになければ
                if (!currentlyStolen.has(stallPathId)) {
                    // アラートを表示
                    alert(`🚨 警報 🚨\n\n【${locationId} / ${stallId}】\n\nで盗難が検知されました！`);

                    // アラート済みリストに追加（次回からアラートを出さないようにする）
                    currentlyStolen.add(stallPathId);
                }

            // 2. 盗難フラグがなく、残量が20%以下の場合
            } else if (stallData.remaining_percentage <= 20) {

                stallElement.classList.add('low'); // 残量少クラス（薄い赤色）を適用

                // 盗難状態から復旧した場合、アラートリストから削除（アラートをリセット）
                currentlyStolen.delete(stallPathId);

            // 3. 正常な場合 (盗難でもなく、残量も十分)
            } else {

                // 盗難状態から復旧した場合、アラートリストから削除（アラートをリセット）
                currentlyStolen.delete(stallPathId);
            }

            // ------------------------------------
            // タイムスタンプを読みやすい形式に変換
            // ------------------------------------
            let lastUpdated = "更新日時不明";
            if (stallData.last_updated && stallData.last_updated.toDate) {
                // toDate() でFirebaseのTimestampをJavaScriptのDateオブジェクトに変換
                // toLocaleString() で '2025/10/30 10:30:00' のような文字列に変換
                lastUpdated = stallData.last_updated.toDate().toLocaleString('ja-JP');
            }

            // ------------------------------------
            // HTMLの中身を構築
            // ------------------------------------
            stallElement.innerHTML = `
                <h3>${locationId} / ${stallId}</h3>
                <p><strong>残量: ${stallData.remaining_percentage}%</strong></p>
                <p><small>最終更新: ${lastUpdated}</small></p>
            `;

            // 構築したHTMLカードを、リスト（<div id="toilet-list">）に追加
            listContainer.appendChild(stallElement);
        });
    },
    (error) => {
        // --- エラー処理 ---
        console.error("データの取得に失敗しました: ", error);
        listContainer.innerHTML = '<h2>エラー: データの取得に失敗しました</h2>';

        // 「インデックスが必要です」というエラーがコンソールに出た場合の案内
        console.warn("--- [開発者向けメッセージ] ---");
        console.warn("もしコンソールに「FAILED_PRECONDITION」や「インデックスが必要です」というエラーが出ている場合：");
        console.warn("エラーメッセージ内のURLをクリックして、Firestoreのインデックスを作成してください。");
        console.warn("インデックス作成後、数分待ってからページを再読み込みしてください。");
        console.warn("------------------------------");
    }
);
