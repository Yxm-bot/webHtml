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
(function () {
    const oldLog = console.log;
    const logContainer = document.getElementById('log');

    console.log = function () {
        oldLog.apply(console, arguments);
        const logEntry = document.createElement('div');
        logEntry.textContent = `> ${Array.from(arguments).join(' ')}`;
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
    };
})();

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
    try {
        const response = await fetch('https://www.yexieman.com/toolServer/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: transcript,
                target_lang: targetLanguage,
            }),
        });
        const result = await response.json();
        if (result.status === 'success') {
            translationArea.value = result.data;
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Translation error: ", error);
        alert("翻译失败，请重试");
    } finally {
        loadingModal.style.display = 'none'; // 关闭弹框
    }
});