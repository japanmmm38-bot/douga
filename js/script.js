// すべての動画要素と音量切り替えボタンを取得
const videoElements = document.querySelectorAll('.video-item video');
const muteToggleButtons = document.querySelectorAll('.mute-toggle');

// 音の状態を記憶するためのグローバル変数
// 初期値はブラウザポリシーによりミュートが必須なので 'muted' に設定
let currentVolumeState = 'muted'; 

// Intersection Observerの設定: 動画の80%が画面内に表示されたら検知
const options = {
    root: null, 
    rootMargin: '0px',
    threshold: 0.8 
};

/**
 * 画面内に表示された動画を再生し、画面外の動画を停止する関数
 */
const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
        const video = entry.target;
        const button = video.nextElementSibling; // 次の要素（mute-toggleボタン）を取得

        if (entry.isIntersecting) {
            // 動画が画面内に大きく表示された場合
            
            // 記憶した音の状態を引き継ぐ
            if (currentVolumeState === 'unmuted') {
                video.muted = false;
                if (button) {
                    button.textContent = '🔊';
                }
            } else {
                // 自動再生のため、再生時は常にミュート状態を維持
                video.muted = true;
                if (button) {
                    button.textContent = '🔇';
                }
            }

            // 再生を試みる
            video.play().catch(error => {
                console.error('動画の自動再生がブロックされました。', error);
            });

        } else {
            // 動画が画面外に出た場合
            
            // 画面外に出る直前の動画の状態を記憶する
            currentVolumeState = video.muted ? 'muted' : 'unmuted';
            
            // 画面外に出た動画は必ず停止し、ミュートに戻す (次の再生に備える)
            video.pause();
            video.muted = true;
            if (button) {
                button.textContent = '🔇';
            }
            video.currentTime = 0; // 動画の再生位置を最初に戻す
        }
    });
};

// Intersection Observerのインスタンスを作成
const observer = new IntersectionObserver(observerCallback, options);

// すべての動画要素を監視対象に追加
videoElements.forEach(video => {
    observer.observe(video);
});


// 🔊 音量切り替えボタンのイベントリスナー設定
muteToggleButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        // ボタンクリック時は、動画の再生/一時停止操作を無効化する
        e.stopPropagation(); 
        
        const video = button.previousElementSibling; 
        
        // ミュートの状態を切り替える
        video.muted = !video.muted;
        
        // アイコンを切り替える (ミュート時: 🔇, 音あり時: 🔊)
        button.textContent = video.muted ? '🔇' : '🔊';

        // ボタン操作が行われたら、その状態をグローバル変数に記録する
        currentVolumeState = video.muted ? 'muted' : 'unmuted';
    });
});

// ⏯️ 動画のタップ/クリックで再生・一時停止を切り替える処理を追加
videoElements.forEach(video => {
    video.addEventListener('click', () => {
        if (video.paused) {
            // 一時停止中の場合、再生する
            video.play().catch(error => {
                console.error('再生に失敗しました:', error);
            });
        } else {
            // 再生中の場合、一時停止する
            video.pause();
        }
    });
});