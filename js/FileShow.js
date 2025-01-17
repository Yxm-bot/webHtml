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
});
const fetchFilesButton = document.getElementById('fetch-files-btn');
const dirSelect = document.getElementById('dir-select');
const childSelect = document.getElementById('childDir-select');
const fileList = document.getElementById('file-list');
const message = document.getElementById('message');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modal-message');
const downloadButton = document.getElementById('download-btn');
const cancelButton = document.getElementById('close-btn');
const deleteButton = document.getElementById('delete-btn');
const openButton = document.getElementById('open-btn');
const overlay = document.getElementById('overlay');
const deleteDirButton=document.getElementById('delete-dir-btn');
const deleteModal=document.getElementById('delete-modal');
const confirmDelete = document.getElementById('confirm-delete');
const cancelDelete = document.getElementById('cancel-delete');
hideVideo(modal)
let selectedFile = null;
let curClickNode=null
deleteDirButton.disabled=true
deleteModal.style.display="none"

// 获取目录列表
async function fetchDirectories() {
    const response = await fetch('https://www.yexieman.com/toolServer/getDirectories', {
        method: 'GET',
    });
    const dirs = await response.json();

    dirSelect.innerHTML = ''; // 清空下拉框
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '请选择目录';
    dirSelect.appendChild(defaultOption);

    dirs.forEach(dir => {
        const option = document.createElement('option');
        option.value = dir;
        option.textContent = dir;
        dirSelect.appendChild(option);
    });
    dirSelect.addEventListener('change', function() {
        fetchChildDirectories()
        // 如果没有文件选中，禁用上传按钮
        deleteDirButton.disabled = dirSelect.value === "";
    });
}

// 获取二级目录列表
async function fetchChildDirectories() {
    const response = await fetch(`https://www.yexieman.com/toolServer/getDirectories?dir=${dirSelect.value}`, {
        method: 'GET',
    });
    const dirs = await response.json();

    childSelect.innerHTML = ''; // 清空下拉框
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent =  '主目录';
    childSelect.appendChild(defaultOption);
    if(dirs){
        dirs.forEach(dir => {
            const option = document.createElement('option');
            option.value = dir;
            option.textContent = dir;
            childSelect.appendChild(option);
        });  
    }
}

function openDeleteModel(){
    deleteModal.style.display= 'flex';
}

function confirmDeleteClick(){
    deleteModal.style.display= 'none';
    deleteDir()
}

function cancelDeleteClick(){
    deleteModal.style.display= 'none';
}

//删除整个目录
async function deleteDir(){
    console.log("dirSelect.value===deleteDir==",childSelect.value)
    dir=dirSelect.value
    if(childSelect.value!=""){
        dir=dir+"/"+childSelect.value
    }
    console.log("dir===deleteDir==",dir)
    if (!dir||!childSelect.value) {
        message.textContent = '请选择目录!';
        return;
    }
    console.log("dir===deleteDir===",dir)
    message.textContent = '';
    console.log("dir===deleteDir===")
    const response = await fetch('https://www.yexieman.com/toolServer/deleteDir', {
        method: 'POST',
        body: JSON.stringify({
            file_path: dir
        })
    });
    const result = await response.json();
    console.log("=result===deleteDir==",result)
    if (result.status == 'success') {
        message.textContent = '删除目录成功！';
        hideVideo(overlay)
        childSelect.value=""
        fetchChildDirectories()
    } else {
        message.textContent = '删除目录失败';
        alert(result.message)
    }
}

// 获取文件列表
async function fetchFiles() {
    let params={
        dirSelectValue:dirSelect.value,
        childSelectValue:childSelect.value,
        root:"true"
    }
    // 将参数对象转换为查询字符串
    let queryString = new URLSearchParams(params).toString();

    // 将整个查询字符串进行 Base64 编码
    let encodedParams = btoa(queryString);
    var newUrl = `itemShow.html?data=${encodedParams}`;
    window.location.href = newUrl;  // 跳转到新页面
    return
}

// 打开下载确认对话框
function openModal(fileName,type) {
    selectedFile = fileName;
    modalMessage.textContent = `${fileName}?`;
    showVideo(modal)
    console.log('openModal type: ' + type);
    if(type=="image"){
        openButton.style.display = 'flex';
    }else{
        openButton.style.display = 'none';
    }
}

// 关闭模态框
cancelButton.onclick = () => {
    hideVideo(modal)
    selectedFile = null;
};

openButton.onclick = () => {
    if(curClickNode!=null){
        hideVideo(modal)
        selectedFile = null;
        const img = curClickNode.querySelector('img');
        if (img) {
            const imgSrc = img.src;  // 获取 <img> 的 src 属性
            window.open(imgSrc, '_blank'); // '_blank' 表示在新标签页中打开
        }
    }
};

// 删除文件
deleteButton.addEventListener('click',async () => {
    console.log("deleteButton===",selectedFile)
    if(selectedFile){
        hideVideo(overlay)
        // overlay.style.display = 'flex';  // 显示二级界面
        let d=dirSelect.value
        if(childSelect.value!=""){
            d=d+"/"+childSelect.value
        }
        try {
            const response = await fetch('https://www.yexieman.com/toolServer/deleteFile', {
                method: 'POST',
                body: JSON.stringify({
                    dir:d,
                    file_path: selectedFile
                })
            });
            const result = await response.json();
            console.log("=result===result",result)
            if (result.status == 'success') {
                message.textContent = '删除文件成功！';
            } else {
                message.textContent = '删除失败';
                alert(result.message)
            }
        } catch (error) {
            message.textContent = '删除失败';
            alert(result.message)
        }finally {
            // overlay.style.display = 'none';  // 隐藏二级界面
            // modal.style.display = 'none';
            hideVideo(modal)
            hideVideo(overlay)
            fetchFiles()
        }
    }   
    selectedFile = null;
});


// 下载文件
downloadButton.onclick = () => {
    if (selectedFile) {
        // 通过HTTP请求下载文件
        let d=dirSelect.value
        if(childSelect.value!=""){
            d=d+"/"+childSelect.value
        }
        const dir = dirSelect.value;  // 假设 dirSelect 是存储选择目录的元素
        const url = `https://www.yexieman.com/toolServer/downloadFile?dir=${encodeURIComponent(d)}&file=${encodeURIComponent(selectedFile)}`;
        
        // 创建一个隐藏的下载链接，模拟点击实现文件下载
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = selectedFile; // 设置下载文件名
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
    modal.style.display = 'none';
    selectedFile = null;
};

function hideVideo(video) {
    video.style.display = 'none';
    video.style.transition = "opacity 0.3s ease";
    video.style.opacity = "0";  // 使视频渐隐
    setTimeout(() => {
        video.style.visibility = "hidden"; // 隐藏元素
    }, 300); // 等待过渡完成后再隐藏元素
}

function showVideo(video) {
    video.style.display = 'flex';
    video.style.visibility = "visible";  // 显示元素
    video.style.transition = "opacity 0.3s ease";
    video.style.opacity = "1";  // 渐显
}

// 初始化目录列表
fetchDirectories();

// 设置获取文件按钮的点击事件
fetchFilesButton.onclick = fetchFiles;

// 删除目录
deleteDirButton.onclick = openDeleteModel;
confirmDelete.onclick = confirmDeleteClick;
cancelDelete.onclick = cancelDeleteClick;