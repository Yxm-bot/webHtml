function login() {
    var form = document.getElementById('loginForm');
    var formData = new FormData(form);

    fetch('https://www.yexieman.com/serverApi/login', {
        method: 'POST',
        body: JSON.stringify({
            userId: formData.get('userId'),
            username: formData.get('username'),
            password: formData.get('password')
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log("data===",data)
        if (data.err=="OK") {
            alert('Login successful');
            const urlParams = new URLSearchParams(window.location.search);
            const redirectUrl = urlParams.get('redirect');
            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else {
                // 如果没有 redirect 参数，可以重定向到默认页面
                //window.location.href = '/';
            }
        } else {
            alert('Login failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error(error);
        alert('Login failed');
    });
}