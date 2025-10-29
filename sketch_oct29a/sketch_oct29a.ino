/*
 * Arduinoスケッチ (ボタンで残量変更 ＆ 非同期送信)
 *
 * D3ピンに接続されたボタンを押すと、残量が10%ずつ増えます。(100% -> 0%)
 * 2秒ごとに、現在の残量と盗難フラグを送信します。
 *
 * ★チャタリング対策（デバウンス）込み★
 */

// ★★★ このArduinoが担当する個室の「住所」をここで指定 ★★★
String LOCATION_ID = "1F-A-male";  // トイレの番号 (ドキュメントID)
String STALL_ID = "stall-01";      // 個室の番号 (ドキュメントID)
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

// --- ピン設定 ---
const int THEFT_PIN = 2;   // 盗難検知用ピン (D2)
const int BUTTON_PIN = 3;  // ★残量変更ボタン用ピン (D3)

// --- 残量用変数 ---
int current_percentage = 0; // 現在の残量 (グローバル変数)

// --- ▼▼▼ チャタリング対策用 変数 ▼▼▼ ---
int button_state;             // 現在のボタン状態
int last_button_state = HIGH; // 前回のボタン状態 (PULLUPなので初期値HIGH)
unsigned long last_debounce_time = 0; // 最後にボタンが押された（または離された）時刻
unsigned long debounce_delay = 50;  // チャタリング除去のための待機時間 (50ms)
// --- ▲▲▲ チャタリング対策用 変数 ▲▲▲ ---

// --- 非同期送信処理用 ---
unsigned long last_send_time = 0;   // 最後にデータを送信した時刻
const long send_interval = 2000;    // データ送信間隔 (2000ms = 2秒)


void setup() {
  Serial.begin(9600);
  
  // 各ピンのモード設定
  pinMode(THEFT_PIN, INPUT_PULLUP);
  pinMode(BUTTON_PIN, INPUT_PULLUP); // ★D3ピンをプルアップ入力に設定
  
  Serial.println("--- プログラム開始 ---");
  Serial.print("担当: ");
  Serial.print(LOCATION_ID);
  Serial.print("/");
  Serial.println(STALL_ID);
  Serial.print("現在の残量: ");
  Serial.println(current_percentage);
}

void loop() {
  // 現在の時刻を取得
  unsigned long current_time = millis();

  //
  // --- 1. ボタン処理 (チャタリング対策あり) ---
  //
  int reading = digitalRead(BUTTON_PIN); // D3ピンの状態を読む (押されるとLOW)

  // (A) 前回の状態と違った場合 (ボタンが押された、または離された)
  if (reading != last_button_state) {
    // 現在時刻を「最後に変化があった時刻」として記録
    last_debounce_time = current_time; 
  }

  // (B) 状態が 'debounce_delay' (50ms) 以上安定している場合
  //     (チャタリングによる細かく不安定な振動が終わった後)
  if ((current_time - last_debounce_time) > debounce_delay) {
    
    // (C) 安定した状態 (reading) が、確定済みの状態 (button_state) と違う場合
    if (reading != button_state) {
      button_state = reading; // 状態を確定

      // ★ボタンが「押された」瞬間 (HIGH -> LOW になった) を検知
      if (button_state == LOW) {
        
        // 残量を10%増やす
        current_percentage = current_percentage + 10;
        
        // もし100%を超えたら、0%に戻す
        if (current_percentage > 100) {
          current_percentage = 0;
        }
        
        // シリアルモニタにも表示 (確認用)
        Serial.print("--- ボタンが押されました --- 新しい残量: ");
        Serial.println(current_percentage);
      }
    }
  }
  last_button_state = reading; // 次回比較用に今の状態を保存


  //
  // --- 2. データ送信処理 (2秒ごとに実行) ---
  //
  // 最後に送信してから2秒以上経過したか？
  if (current_time - last_send_time >= send_interval) {
    last_send_time = current_time; // 送信時刻を更新

    // --- 盗難フラグの検知 ---
    bool is_stolen_flag = (digitalRead(THEFT_PIN) == LOW);
    String flag_string = (is_stolen_flag) ? "true" : "false";

    // --- センサー値の読み取り (★現在の残量変数を使う) ---
    int sensor_value = current_percentage; 

    // --- 送信データの組み立て ---
    String data_to_send = LOCATION_ID + "," + 
                          STALL_ID + "," + 
                          String(sensor_value) + "," + 
                          flag_string;
    
    // --- PCへシリアル送信 ---
    //Serial.print("データを送信: ");
    Serial.println(data_to_send);
    Serial.println(data_to_send); // ★★★ 2回送信 ★★★
  }
}