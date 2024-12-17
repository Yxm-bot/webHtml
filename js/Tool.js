window.addEventListener('DOMContentLoaded', async () => {
    fetch('https://www.yexieman.com/serverApi/checkLogin', {
        method: 'GET',
        credentials: 'include',  // 确保发送 Cookie（如果有的话）
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
});
document.getElementById('qrForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const url = document.getElementById('url').value;
    if (url) {
        fetch('https://www.yexieman.com/toolServer/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url })
        }).then(response => {
            if (response.ok) {
                return response.blob();
            } else {
                throw new Error('生成二维码失败');
            }
        }).then(blob => {
            const qrCodeUrl = window.URL.createObjectURL(blob);
            const qrCodeImage = document.getElementById('qrCodeImage');
            qrCodeImage.src = qrCodeUrl;
            qrCodeImage.onclick = function() {
                const a = document.createElement('a');
                a.href = qrCodeUrl;
                a.download = 'qrcode.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            };

            document.getElementById('qrCodeContainer').style.display = 'block';
        }).catch(error => {
            alert(error.message);
        });
    }
});