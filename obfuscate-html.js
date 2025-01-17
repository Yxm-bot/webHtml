const fs = require('fs-extra');
const path = require('path');
const jsObfuscator = require('javascript-obfuscator');

// 主目录路径（你的 JS 文件所在的主目录）
const rootDir = './js/';
// 输出目录
const outputDir = './outJs';

/**
 * 混淆 JS 文件
 * @param {string} inputFile - JS 文件路径
 * @param {string} outputFile - 输出混淆后的 JS 文件路径
 */
function obfuscateJs(inputFile, outputFile) {
    console.log(`Processing: ${inputFile}`);
    let jsContent = fs.readFileSync(inputFile, 'utf-8');

    // 混淆 JavaScript
    const obfuscatedJs = jsObfuscator.obfuscate(jsContent, {
        compact: true,  // 压缩代码
        controlFlowFlattening: true,  // 控制流扭曲
        deadCodeInjection: true,  // 注入无效代码
        stringArray: true,  // 字符串数组化
        rotateStringArray: true,  // 字符串数组轮转
        stringArrayThreshold: 0.75,  // 字符串混淆概率
        ignoreCustomComments: true,  // 忽略自定义注释
        removeCDATASectionsFromScriptElement: true,  // 移除 script 标签中的 CDATA
        collapseWhitespace: true,  // 压缩空格
        removeComments: true,  // 删除注释
        obfuscateJavascript: true,  // 混淆 JavaScript
        renameGlobals: false,  // 全局变量和函数不进行混淆，避免冲突
        transformObjectKeys: true,  // 混淆对象键名
        mangle: true,  // 混淆变量和函数名
        selfDefending: true,  // 启用自我防护，防止反混淆
        reservedNames: [],  // 不保留任何全局变量名（可选）
        debugProtection: false,  // 禁用调试保护（可选）
    }).getObfuscatedCode();

    // 确保输出目录存在
    fs.ensureDirSync(path.dirname(outputFile));
    // 写入混淆后的 JS 文件
    fs.writeFileSync(outputFile, obfuscatedJs, 'utf-8');
    console.log(`File saved to: ${outputFile}`);
}

/**
 * 遍历目录及其子目录，处理所有 JS 文件
 * @param {string} dir - 输入目录路径
 * @param {string} outputBaseDir - 输出根目录路径
 */
function traverseAndObfuscateJs(dir, outputBaseDir) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
        const fullPath = path.join(dir, file);
        const relativePath = path.relative(rootDir, fullPath); // 保留目录结构
        const outputFilePath = path.join(outputBaseDir, relativePath);

        // 跳过 node_modules 目录
        if (fullPath.includes('node_modules')) {
            return;
        }

        if (fs.statSync(fullPath).isDirectory()) {
            // 如果是目录，递归处理
            traverseAndObfuscateJs(fullPath, outputBaseDir);
        } else if (path.extname(fullPath) === '.js') {
            // 如果是 JS 文件，处理混淆
            obfuscateJs(fullPath, outputFilePath);
        }
    });
}

// 清空或创建输出目录
fs.emptyDirSync(outputDir);

// 开始处理
console.log('Starting to obfuscate JS files...');
traverseAndObfuscateJs(rootDir, outputDir);
console.log('All files processed. Output saved to:', outputDir);