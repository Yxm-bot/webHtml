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

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
const uploadButton = document.getElementById('upload-button');
const message = document.getElementById('message');
const overlay = document.getElementById('overlay');
const directorySelect = document.getElementById('directory-select');  // 获取目录选择下拉框
let selectedFiles = [];  // 存储选择的文件

// 处理文件拖放事件
dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('click', () => {
    fileInput.click();
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (event) => {
    console.log("handleFileSelection==drop==")
    event.preventDefault();
    dropZone.classList.remove('dragover');
    handleFileSelection(event.dataTransfer.files);
});

fileInput.addEventListener('change', () => {
    console.log("handleFileSelection==change==")
    if (fileInput.files.length === 0) return;
    handleFileSelection(fileInput.files);
    fileInput.value = '';
});

function handleFileSelection(files) {
    console.log("handleFileSelection==",selectedFiles)
    const newFiles = Array.from(files);  // 转换文件为数组

    // 定义支持的文件类型
    const allowedTypes = ['.zip', '.rar', '.png', '.jpg', '.mp4', '.mp3'];
    const validFiles = newFiles.filter(file => {
        const ext = file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2);
        return allowedTypes.includes('.' + ext.toLowerCase());
    });

    selectedFiles = [...selectedFiles, ...validFiles];  // 添加新选择的文件
    if (validFiles.length !== newFiles.length) {
        message.textContent = `不支持格式，已忽略：${newFiles.length - validFiles.length} 个文件`;
    } else {
        message.textContent =`当前拖动的文件：${selectedFiles.length} 个`;
    }
    console.log("err==",selectedFiles)
    updateFileList();  // 更新文件列表
}

function updateFileList() {
    fileList.innerHTML = '';  // 清空文件列表
    selectedFiles.forEach((file, index) => {
        const listItem = document.createElement('li');
        listItem.style.display = 'flex';  // 使用flex布局
        listItem.style.justifyContent = 'space-between';  // 文件名左对齐，删除按钮右对齐
        listItem.style.alignItems = 'center';  // 垂直居中对齐

        const fileName = file.name.slice(0, 10);  // 截取文件名前10个字符
        const fileNameSpan = document.createElement('span');
        fileNameSpan.textContent = fileName;  // 设置文件名
        fileNameSpan.style.textAlign = 'left';  // 确保文件名左对齐

        const removeBtn = document.createElement('button');
        removeBtn.textContent = '删除';
        removeBtn.classList.add('remove-btn');
        removeBtn.addEventListener('click', () => {
            console.log("removeBtn==",index)
            selectedFiles.splice(index, 1);  // 删除文件
            if(selectedFiles.length==0){
                message.textContent = `暂未拖动文件`;
            }else{
                message.textContent = `当前拖动的文件：${selectedFiles.length} 个`;
            }
            updateFileList();  // 更新显示
        });

        listItem.appendChild(fileNameSpan);
        listItem.appendChild(removeBtn);
        fileList.appendChild(listItem);
    });

    // 如果没有文件选中，禁用上传按钮
    uploadButton.disabled = selectedFiles.length === 0;
}

// 上传按钮点击事件
uploadButton.addEventListener('click', async () => {
    const selectedDirectory = directorySelect.value;  // 获取当前选中的目录
    if (!selectedDirectory) {
        message.textContent = '请选择目录';
        return;
    }
    message.textContent = '';
    overlay.style.display = 'flex';  // 显示二级界面
    // 构造表单数据并上传文件
    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('file', file));
    formData.append('directory', selectedDirectory);

    try {
        const response = await fetch('https://www.yexieman.com/toolServer/upload', {
            method: 'POST',
            body: formData,
        });
        const result = await response.json();
        console.log("=result===result",result)
        if (result.status == 'success') {
            message.textContent = '文件上传成功！';
        } else {
            message.textContent = '上传失败，请稍后再试。';
        }
    } catch (error) {
        message.textContent = '上传失败，请重试';
    }finally {
        overlay.style.display = 'none';  // 隐藏二级界面
    }
    // 清空文件列表
    selectedFiles = [];
    updateFileList();  // 更新页面上的文件列表
});