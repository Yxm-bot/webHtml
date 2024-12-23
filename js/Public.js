const fetchFilesButton = document.getElementById('fetch-files-btn');
const fileList = document.getElementById('file-list');
const message = document.getElementById('message');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modal-message');
const downloadButton = document.getElementById('download-btn');
const cancelButton = document.getElementById('cancel-btn');
let selectedFile = null;

const dir = "public";
// 获取文件列表
async function fetchFiles() {
    if (!dir) {
        message.textContent = '请选择目录!';
        return;
    }
    const response = await fetch(`https://www.yexieman.com/toolServer/getFiles?dir=${dir}`);
    const files = await response.json();

    // 清空之前的文件列表
    fileList.innerHTML = '';
    if (!files||files.length === 0) {
        message.textContent = '该目录没有文件';
        return;
    }
    message.textContent = '';
    // 显示文件
    files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.classList.add('file-item');
        fileItem.dataset.name = file.name;  // 截取文件名前10个字符;
        fileItem.dataset.type = file.type;

        const fileIcon = document.createElement('div');
        fileIcon.classList.add('file-icon');
        console.log("file.ImgUrl===",file.string)

        const fileName = document.createElement('p');
        fileName.textContent = file.name.slice(0, 10);
        
        fileItem.appendChild(fileName);
        fileItem.onclick = () => openModal(file.name);
        fileList.appendChild(fileItem);
        // 处理视频文件（MP4）
        if (file.type === 'video') {
            console.log("file.name===", file.name);
            fileName.textContent = "mp4";
            // 获取视频封面
            const video = document.createElement('video');
            video.src = `https://www.yexieman.com${file.string}`; // 确保路径正确
           // video.style.display = 'none'; // 隐藏视频元素
            hideVideo(video)
            video.muted=true
            video.autoplay=true
            // 使用 canvas 获取视频的第一帧作为封面
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            // 在加载过程中设置默认封面（如果手机浏览器没有获取到第一帧）
            const defaultPoster = 'https://www.yexieman.com/res/mp4.png';  // 假设你有一个默认封面图
            video.poster = defaultPoster;  // 设置 poster 作为初始封面

            // 等待视频元数据加载完成
            video.addEventListener('loadedmetadata', () => {
                console.log('Video metadata loaded');

                // 强制等待视频加载到足够的状态再进行封面提取
                setTimeout(() => {
                    // 手动设置视频的当前时间来跳到第一帧
                    video.currentTime = 0.5;  // 设置视频播放时间为 0.5 秒，确保视频可以正常跳到第一帧
                }, 500);  // 给视频更多时间加载（延迟500ms）
            });

            // 使用 'seeked' 事件来确保视频已经加载并处于第一帧
            video.addEventListener('seeked', () => {
                console.log('Video seeked to first frame');
                    // 获取视频的原始宽度和高度
                const originalWidth = video.videoWidth;
                const originalHeight = video.videoHeight;
                // 设置 canvas 为最大宽度或最大高度的 1.5 倍，保持比例
                const maxWidth = fileItem.clientWidth;  // 受 fileItem 限制
                const maxHeight = fileItem.clientHeight;

                // 根据宽高比调整封面图大小
                const scaleFactor = Math.min(maxWidth / originalWidth, maxHeight / originalHeight, 1);
                canvas.width = originalWidth * scaleFactor;
                canvas.height = originalHeight * scaleFactor;
                // 绘制视频的第一帧
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                // 将 canvas 转为图片并作为封面图
                const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.7);  // 可选：压缩图片，避免太大
                const img = document.createElement('img');
                img.src = thumbnailUrl;
                img.alt = file.name;

                // 创建播放图标并居中显示
                const playIcon = document.createElement('img');
                playIcon.src = 'https://www.yexieman.com/img/play.png';  // 替换为你的视频播放图标
                playIcon.alt = 'Play';
                playIcon.style.position = 'absolute';
                playIcon.style.top = '50%';
                playIcon.style.left = '50%';
                playIcon.style.transform = 'translate(-50%, -50%) scale(0.3)';  // 确保图标居中

                // 将封面图和播放图标包裹在一个容器中
                const imgContainer = document.createElement('div');
                imgContainer.style.position = 'relative';
                imgContainer.style.display = 'inline-block';  // 使其成为一个行内块级元素
                imgContainer.style.width = '100%';  // 使其充满父容器
                imgContainer.style.height = '100%';  // 使其充满父容器
                imgContainer.style.overflow = 'hidden';  // 防止溢出
                imgContainer.style.marginTop = '0px';
                imgContainer.appendChild(img);  // 添加封面图
                imgContainer.appendChild(playIcon);  // 添加播放图标
                fileItem.appendChild(imgContainer);
            });

            // 手动播放视频以确保解码
            video.addEventListener('canplay', () => {
                console.log('Video can play');
                video.play();  // 触发播放以解码视频
            });

            // 防止浏览器因没有播放而不触发 canplay 事件，可以手动触发视频加载
            video.load();
        }else if (file.type === 'image') {
            const img = document.createElement('img');
            img.src = `https://www.yexieman.com${file.string}`; // 直接使用 url
            img.alt = file.name;
            img.onload = () => {
                if((img.width/img.height)>=1){
                   img.style.marginTop = '25px';
                }else{
                    img.style.marginTop = '0px';
                }
                console.log("img==",img.width,img.height,img.width/img.height)
            }
            fileItem.appendChild(img);
        } else if (file.type === 'zip') {
            const img = document.createElement('img');
            img.src = `https://www.yexieman.com/img/zip.png`; // 直接使用 url
            img.alt = file.name;
            img.style.marginTop = '25px';
            fileItem.appendChild(img);
        }else if (file.type === 'rar') {
            const img = document.createElement('img');
            img.src = `https://www.yexieman.com/img/rar.png`; // 直接使用 url
            img.alt = file.name;
            img.style.marginTop = '25px';
            fileItem.appendChild(img);
        }else if (file.type === 'mp3') {
            const img = document.createElement('img');
            img.src = `https://www.yexieman.com/img/mp3.png`; // 直接使用 url
            img.alt = file.name;
            img.style.marginTop = '20px';
            fileItem.appendChild(img);
        }
    });
}

// 打开下载确认对话框
function openModal(fileName) {
    selectedFile = fileName;
    modalMessage.textContent = `是否下载 ${fileName}?`;
    //modal.style.display = 'flex';
    showVideo(modal)
}

// 关闭模态框
cancelButton.onclick = () => {
    //modal.style.display = 'none';
    hideVideo(modal)
    selectedFile = null;
};

// 下载文件
downloadButton.onclick = () => {
    if (selectedFile) {
        // 通过HTTP请求下载文件
        const url = `https://www.yexieman.com/toolServer/downloadFile?dir=${encodeURIComponent(dir)}&file=${encodeURIComponent(selectedFile)}`;
        
        // 创建一个隐藏的下载链接，模拟点击实现文件下载
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        console.log("url===",url)
        downloadLink.download = selectedFile; // 设置下载文件名
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
    //modal.style.display = 'none';
    hideVideo(modal)
    selectedFile = null;
};

function hideVideo(video) {
    video.style.transition = "opacity 0.3s ease";
    video.style.opacity = "0";  // 使视频渐隐
    setTimeout(() => {
        video.style.visibility = "hidden"; // 隐藏元素
    }, 300); // 等待过渡完成后再隐藏元素
    video.style.display = 'none';
}

function showVideo(video) {
    video.style.visibility = "visible";  // 显示元素
    video.style.transition = "opacity 0.3s ease";
    video.style.opacity = "1";  // 渐显
    video.style.display = 'flex';
}


// 设置获取文件按钮的点击事件
fetchFilesButton.onclick = fetchFiles;