"""
PC側ブリッジスクリプト (盗難フラグ対応バージョン)
------------------------------------
Arduinoからシリアルポート経由で
"LOCATION_ID,STALL_ID,VALUE,IS_STOLEN" という
4つのデータを受け取り、Firestoreに書き込みます。
"""

import serial
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import time

# --- 1. Firebaseの初期化 ---
# （重要）▼▼▼ 秘密鍵(JSON)のファイル名に書き換えてください ▼▼▼
CRED_PATH = "my-firebase-key.json"

try:
    cred = credentials.Certificate(CRED_PATH)
    try:
        firebase_admin.initialize_app(cred)
        print("Firebaseの初期化に成功しました。")
    except ValueError:
        print("Firebaseは既に初期化されています。")

except Exception as e:
    print(f"Firebaseの初期化に失敗しました: {e}")
    exit()

db = firestore.client()
print("Firestoreクライアントを取得しました。")


# --- 2. シリアルポートの初期化 ---
# （重要）▼▼▼ Arduino IDEで確認した正しいポート名に書き換えてください ▼▼▼
SERIAL_PORT = "COM3"
BAUD_RATE = 9600

try:
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    print(f"{SERIAL_PORT} への接続を試みます...")
    time.sleep(2)
    if ser.is_open:
        print(f"{SERIAL_PORT} に接続しました。データ受信待機中...")
    else:
        raise Exception("ポートが開いていません。")

except Exception as e:
    print(f"エラー: シリアルポート {SERIAL_PORT} を開けません。")
    exit()


# --- 3. メインループ (データ受信 → 4つに分割 → Firebaseへ書き込み) ---
print("\n--- データ送信を開始します (Ctrl+C で終了) ---")
try:
    while True:
        line_str = ser.readline().decode('utf-8').strip()

        if line_str:
            try:
                # データをカンマで分割する
                # 例: "1F-A-male,stall-01,80,true" -> ["1F-A-male", "stall-01", "80", "true"]
                parts = line_str.split(',')

                # ▼▼▼ 3から4に変更 ▼▼▼
                # 4つの部分に正しく分割できたか確認
                if len(parts) == 4:
                    # データを分かりやすい変数名に割り当てる
                    location_id = parts[0]
                    stall_id = parts[1]
                    remaining_value = int(parts[2]) # 3番目の部分を数値に

                    # ▼▼▼ 4番目のデータを取得 ▼▼▼
                    is_stolen_str = parts[3] # "true" または "false" という文字列

                    # 文字列 "true" を python の True (ブール値) に変換
                    is_stolen_bool = (is_stolen_str == "true")

                    print(f"受信: [{location_id} / {stall_id}] -> {remaining_value}%  盗難フラグ: {is_stolen_bool}")

                    # Firebaseに送信するデータ（辞書形式）を作成
                    data_to_send = {
                        'remaining_percentage': remaining_value,
                        'is_stolen': is_stolen_bool, # ★盗難フラグを追加★
                        'last_updated': firestore.SERVER_TIMESTAMP
                    }

                    # 受信したIDを使って、書き込み先の「住所」を動的に指定
                    doc_ref = db.collection('toilet_locations').document(location_id) \
                                .collection('stalls').document(stall_id)

                    doc_ref.set(data_to_send, merge=True)

                    print(f"  -> Firebase書き込み成功")

                else:
                    # ▼▼▼ 3から4に変更 ▼▼▼
                    print(f"  -> 無視 (形式が不正なデータ: カンマ区切りが4つではありません): {line_str}")

            except ValueError:
                print(f"  -> 無視 (数値変換エラー): {line_str}")
            except Exception as e:
                print(f"  -> Firebaseへの書き込みエラー: {e}")

except KeyboardInterrupt:
    print("\n--- プログラムを終了します ---")
except Exception as e:
    print(f"\n予期せぬエラーが発生しました: {e}")
finally:
    if ser.is_open:
        ser.close()
        print("シリアルポートを閉じました。")
