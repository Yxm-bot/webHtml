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
   // 初始化粒子背景效果
   particlesJS('particles-js', {
       particles: {
           number: {
               value: 100, // 设置粒子数量
               density: {
                   enable: true,
                   value_area: 800
               }
           },
           color: {
               value: '#ffffff' // 粒子颜色为白色
           },
           shape: {
               type: 'circle', // 粒子形状为圆形
               stroke: {
                   width: 0,
                   color: '#ffffff'
               }
           },
           opacity: {
               value: 0.5,
               random: true,
               anim: {
                   enable: true,
                   speed: 1,
                   opacity_min: 0.1,
                   sync: false
               }
           },
           size: {
               value: 6,
               random: true,
               anim: {
                   enable: true,
                   speed: 5,
                   size_min: 1,
                   sync: false
               }
           },
           move: {
               enable: true,
               speed: 1,
               direction: 'none',
               random: true,
               straight: false,
               out_mode: 'out',
               bounce: false
           }
       },
       interactivity: {
           detect_on: 'canvas',
           events: {
               onhover: {
                   enable: true,
                   mode: 'none' // 在此禁用推开粒子的效果
               },
               onclick: {
                   enable: true,
                   mode: 'push' // 鼠标点击时粒子加入
               }
           }
       },
       retina_detect: true
   });

   // 获取粒子容器和粒子数组
   let canvas = document.querySelector('#particles-js');
   let canvasWidth = canvas.offsetWidth;
   let canvasHeight = canvas.offsetHeight;

   // 鼠标移动时跟随粒子
   document.addEventListener('mousemove', function(event) {
       let mouseX = event.clientX;
       let mouseY = event.clientY;

       let particles = window.pJSDom[0].pJS.particles.array;

       // 更新粒子的坐标，让它们随鼠标位置移动
       particles.forEach(function(particle) {
           // 计算粒子与鼠标位置的相对距离
           let dx = mouseX - particle.x;
           let dy = mouseY - particle.y;
           let distance = Math.sqrt(dx * dx + dy * dy);
           let angle = Math.atan2(dy, dx);

           // 增加粒子的追随效果
           let speed = 0.1; // 速度
           if (distance < 100) { // 粒子在靠近鼠标时加速
               let vx = Math.cos(angle) * speed;
               let vy = Math.sin(angle) * speed;
               particle.x += vx;
               particle.y += vy;
           }
       });
   });