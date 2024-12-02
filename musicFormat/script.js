document.getElementById('fileInput').addEventListener('change', function() {
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const files = fileInput.files;

    if (files.length > 0) {
        const fileNames = Array.from(files).map(file => file.name).join(', ');
        fileInfo.textContent = `已选择文件: ${fileNames}`;
    } else {
        fileInfo.textContent = '支持 ncm 格式 等...';
    }
});

document.getElementById('convertButton').addEventListener('click', function() {
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;
    const messageDiv = document.getElementById('message');

    if (files.length === 0) {
        messageDiv.textContent = '请上传文件!';
        return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('files[]', files[i]);
    }

    messageDiv.textContent = '正在转换文件...';

    // 发送请求到后端
    fetch('http://47.101.195.52/toolServer/MsFormat', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        messageDiv.textContent = '文件转换完成！';
        console.log(data);
    })
    .catch(error => {
        messageDiv.textContent = '转换失败，请重试！';
        console.error('Error:', error);
    });
});