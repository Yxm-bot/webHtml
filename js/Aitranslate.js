const recordBtn = document.getElementById('recordBtn');
const translateBtn = document.getElementById('translateBtn');
const transcriptArea = document.getElementById('transcript');
const translationArea = document.getElementById('translation');
const recordLanguageSelect = document.getElementById('recordLanguage');
const translateLanguageSelect = document.getElementById('translateLanguage');
const loadingModal = document.getElementById('loadingModal');

let recognition;
let isRecording = false;
let transcript = '';

// 重写 console.log
// (function () {
//     const oldLog = console.log;
//     const logContainer = document.getElementById('log');

//     console.log = function () {
//         oldLog.apply(console, arguments);
//         const logEntry = document.createElement('div');
//         logEntry.textContent = `> ${Array.from(arguments).join(' ')}`;
//         logContainer.appendChild(logEntry);
//         logContainer.scrollTop = logContainer.scrollHeight;
//     };
// })();

window.addEventListener('DOMContentLoaded', async () => {
    // 认证检查（登录验证）
    fetch('https://www.yexieman.com/serverApi/checkLogin', {
        method: 'GET',
        credentials: 'include',
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "已登录") {
            console.log("用户已登录");
            // 继续执行需要登录后的操作
        } else if(data.message === "权限不够"){
            alert("用户权限不够")
            window.location.href = 'https://www.yexieman.com/account/login.html?redirect=' + encodeURIComponent(window.location.href);
        }
    })
    .catch(error => {
        window.location.href = 'https://www.yexieman.com/account/login.html?redirect=' + encodeURIComponent(window.location.href);
    });

    // 获取目录列表并填充到下拉框
    const directorySelect = document.getElementById('directory-select');
    try {
        const response = await fetch('https://www.yexieman.com/toolServer/getDirectories', {
            method: 'GET',
        });
        const directories = await response.json();
        directories.forEach(dir => {
            const option = document.createElement('option');
            option.value = dir;
            option.textContent = dir;
            directorySelect.appendChild(option);
        });
    } catch (error) {
        console.error("获取目录失败:", error);
    }
});

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = recordLanguageSelect.value; // 默认录音语言

    recognition.onresult = function (event) {
        transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
        }
        transcriptArea.value = transcript;
    };

    recognition.onend = function () {
        isRecording = false;
        recordBtn.textContent = 'Start Recording';
    };

    recognition.onerror = function (event) {
        console.log("Speech recognition error: ", event.error);
    };
} else {
    alert('Web Speech API is not supported in this browser.');
}

// 录音按钮点击事件
recordBtn.addEventListener('click', () => {
    if (isRecording) {
        recognition.stop();
    } else {
        recognition.lang = recordLanguageSelect.value; // 设置录音语言
        console.log(" recognition.lang: ",  recognition.lang);
        recognition.start();
        isRecording = true;
        recordBtn.textContent = 'Stop Recording';
    }
});

// 翻译按钮点击事件
translateBtn.addEventListener('click', async () => {
    loadingModal.style.display = 'flex'; // 显示弹框
    const targetLanguage = translateLanguageSelect.value;
    const srcLanguage = recordLanguageSelect.value;
    try {
        const response = await fetch('https://www.yexieman.com/translate/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: transcript,
                src_lang: srcLanguage,
                tgt_lang: targetLanguage
            }),
        });
        const result = await response.json();
        if (result.translated_text) {
            translationArea.value = result.translated_text;
        } 
        if(result.error){
            alert(result.error);
        }
    } catch (error) {
        console.error("Translation error: ", error);
        alert("翻译失败，请重试");
    } finally {
        loadingModal.style.display = 'none'; // 关闭弹框
    }
});