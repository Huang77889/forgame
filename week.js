//倒數 20 分鐘的 JavaScript 程式碼 
let gamelist="scratch_index.html"
// 變數設定｜設定倒數秒數：20分鐘 = 1200 秒 (測試時可以改成 5 秒方便測試)
let timeLeft = 1200; 
// 常數設定
const timerElement = document.getElementById('timer');
const lockMsgElement = document.getElementById('lock-msg');
const gameLink = document.getElementById('game-link');

const countdown = setInterval(function() {//設定函式
    timeLeft--;

    // 計算分與秒
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;

    // 補零顯示 (例如 05:09)
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    timerElement.textContent = minutes + ':' + seconds;

    // 時間到，解除限制
    if (timeLeft <= 0) {
        clearInterval(countdown);//呼叫函式？
        lockMsgElement.innerHTML = "🔓 時間到！遊戲區已解鎖，請點擊下方按鈕開始。";
        lockMsgElement.style.color = "#27ae60";//按鍵顏色轉換
        gameLink.classList.remove('disabled-link'); // 移除禁止點擊的樣式
        gameLink.style.background = "#e74c3c"; // 變成亮眼的紅色按鈕
        }
    }, 1000);
//遊戲列表輸入密碼開啟
function checkPassword() {
    const correctPassword = "0000"; // 🔑 老師請在這裡修改您想要的密碼
    const hint = "認真上完課老師會給密碼！"; // 💡 密碼錯誤時的提示內容
    
    let userInput = prompt("請輸入遊戲區密碼：");

    // 使用迴圈：若輸入錯誤會一直彈出，直到答對或點擊「取消/關閉」為止
    while (userInput !== null) {
        if (userInput === correctPassword) {
            alert("🎉 密碼正確！正在為您開啟遊戲區。");
            
            // 效果：平滑滾動到下方的遊戲區域（若要跳轉到全新網頁，請參考下方說明）
            
            window.location.href = "gamelist.html";
            return; // 結束 function
        } else {
            // 密碼錯誤，給予提示，並讓學生重新輸入
            userInput = prompt("❌ 密碼錯誤！\n\n 還沒上完課就想玩遊戲？\n\n" + hint + "\n\n請重新輸入密碼（或點擊取消回到原頁面）：");
        }
    }
    
    // 如果學生點選「取消」或關閉視窗，userInput 會是 null，直接退回原網頁
    alert("已關閉輸入視窗，請繼續完成作業。");
}
