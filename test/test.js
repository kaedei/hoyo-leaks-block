// 基本功能测试
console.log('Testing Hoyo Leaks Block Extension...');

// 测试存储功能
function testStorage() {
  console.log('Testing storage functionality...');

  // 测试数据
  const testData = {
    blockTitleBili: '测试|内鬼|爆料',
    blockUsersBili: '测试用户1|测试用户2',
    blockUsersWhiteBili: '官方|可信用户'
  };

  // 保存测试数据
  chrome.storage.sync.set(testData, function () {
    console.log('✅ Test data saved');

    // 读取测试数据
    chrome.storage.sync.get(Object.keys(testData), function (result) {
      console.log('✅ Test data retrieved:', result);

      // 验证数据
      let allMatch = true;
      for (let key in testData) {
        if (result[key] !== testData[key]) {
          allMatch = false;
          console.log(`❌ Data mismatch for ${key}`);
        }
      }

      if (allMatch) {
        console.log('✅ Storage test passed!');
      } else {
        console.log('❌ Storage test failed!');
      }
    });
  });
}

// 测试正则表达式功能
function testRegex() {
  console.log('Testing regex functionality...');

  const testStrings = [
    '原神内鬼爆料最新消息',
    '星铁leak新角色',
    '官方正式公告',
    '测试内容',
    'beta测试服内容'
  ];

  const pattern = '内鬼|爆料|泄露|leak|beta|测试服';
  const regex = new RegExp(pattern, 'i');

  console.log('Test pattern:', pattern);

  testStrings.forEach(str => {
    const shouldBlock = regex.test(str);
    console.log(`${shouldBlock ? '🚫' : '✅'} "${str}" - ${shouldBlock ? 'BLOCKED' : 'ALLOWED'}`);
  });
}

// 测试模糊效果
function testBlurEffect() {
  console.log('Testing blur effect...');

  // 创建测试元素
  const testDiv = document.createElement('div');
  testDiv.id = 'hoyo-test-element';
  testDiv.textContent = '这是一个测试元素';
  testDiv.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    padding: 10px;
    background: #f0f0f0;
    border: 1px solid #ccc;
    border-radius: 4px;
    z-index: 9999;
  `;

  document.body.appendChild(testDiv);

  // 测试模糊效果
  setTimeout(() => {
    testDiv.classList.add('hoyo-blur-block');
    console.log('✅ Blur effect applied');

    setTimeout(() => {
      testDiv.classList.remove('hoyo-blur-block');
      console.log('✅ Blur effect removed');

      setTimeout(() => {
        document.body.removeChild(testDiv);
        console.log('✅ Test element cleaned up');
      }, 1000);
    }, 2000);
  }, 1000);
}

// 运行测试
if (typeof chrome !== 'undefined' && chrome.storage) {
  testStorage();
  testRegex();

  // 只在content script环境中测试DOM操作
  if (typeof document !== 'undefined') {
    testBlurEffect();
  }
} else {
  console.log('❌ Chrome extension API not available');
}

console.log('Test script loaded');
