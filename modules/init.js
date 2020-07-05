const token = process.env.TELEGRAM_TOKEN;
const admin = process.env.ADMIN_ID;

function init() {
  // 判断变量状态是否满足正常运行条件
  if (token && admin) {
    // No need to pass any parameters as we will handle the updates with Express
    return true;
  } else {
    console.log("TELEGRAM_TOKEN and ADMIN_ID are required.");
    return false;
  }
}

module.exports = init;
