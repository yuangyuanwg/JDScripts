(() => {
  const reg0 = /(?<=pt_(key|pin)=)[^;]+/g;
  const reg1 = /(?:(?:\u52A9\u529B|\u4e92\u52a9|\u9080\u8BF7)(?:pk)?\u7801)|\u56e2\u4e3b|(?:\u56e2|tuan)(?:\u6d3b\u52a8)?\s*ID|token|encrypt|pin|uuid|code|share|invite/i;
  const reg2 = /^\d{0,10}$|^(.)\1+$|^[a-zA-Z]+$|^(?:1[6-9]|2[0-5])\d{11}$|^\d+(?:-\d+)+$/;
  const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value))
          return '[Circular]';
        seen.add(value);
      }
      return value;
    };
  }
  for (const name of ['log', 'info', 'warn', 'error', 'debug']) {
    const _fn = console[name];
    console[name] = function (...args) {
      for (let i = 0; i < args.length; i++) {
        let str = args[i], isReference = false;
        if (!str) continue;
        const type = typeof(str), isError = args[i] instanceof Error, mask = '***';
        if (type === 'object' || type === 'array') {
          try {
            str = JSON.stringify(str, getCircularReplacer());
          } catch (ex) {
            isReference = true;
          }
        } else {
          str = `${str}`;
        }
        const cks = process?.env?.JD_COOKIE?.match?.(reg0) || [];
        if (isError)
          str = args[i].message;
        if(isReference || /pt_(pin|key)=/.test(str) || 
          cks.some(s => str.includes(s))
        ){
          if (isReference) {
            args[i] = mask;
          } else {
            cks.forEach(c => {
              str = str.replace(new RegExp(c.replace(/[.*+?^${}()|[\]\\]/g, '\\'), 'g'), mask);
            });
            if (isError) {
              args[i].message = str;
            } else {
              args[i] = str;
            }
          }
        }
        if (!isReference && args.some(arg => {
          try {
            return reg1.test(JSON.stringify(arg));
          } catch (ex) {}
        })) {
          str = str.replace(/[a-z\d\-=_]{6,}/ig, s => {
            return reg2.test(s) ? s : '*'.repeat(Math.max(5, Math.floor(Math.random() * s.length)));
          });
          if (isError) {
            args[i].message = str;
          } else {
            args[i] = str;
          }
        }
      }
      return _fn.apply(this, args);
    };
  }
})();
/*
此文件为Node.js专用。其他用户请忽略
 */
//此处填写京东账号cookie。
let CookieJDs = [
  '',//账号一ck,例:pt_key=XXX;pt_pin=XXX;
  '',//账号二ck,例:pt_key=XXX;pt_pin=XXX;如有更多,依次类推
]
// 判断环境变量里面是否有京东ck
if (process.env.JD_COOKIE) {
  if (process.env.JD_COOKIE.indexOf('&') > -1) {
    CookieJDs = process.env.JD_COOKIE.split('&');
  } else if (process.env.JD_COOKIE.indexOf('\n') > -1) {
    CookieJDs = process.env.JD_COOKIE.split('\n');
  } else {
    CookieJDs = [process.env.JD_COOKIE];
  }
}
if (JSON.stringify(process.env).indexOf('GIТHUВ')>-1) {
  console.log(`请勿使用github action运行此脚本,无论你是从你自己的私库还是其他哪里拉取的源代码，都会导致我被封号\n`);
  !(async () => {
    await require('./sendNotify').sendNotify('提醒', `请勿使用github action、滥用github资源会封我仓库以及账号`)
    await process.exit(0);
  })()
}
CookieJDs = [...new Set(CookieJDs.filter(item => !!item))]
console.log(`\n====================共${CookieJDs.length}个京东账号Cookie=========\n`);
console.log(`==================脚本执行- 北京时间(UTC+8)：${new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000).toLocaleString()}=====================\n`)
if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
for (let i = 0; i < CookieJDs.length; i++) {
  if (!CookieJDs[i].match(/pt_pin=(.+?);/) || !CookieJDs[i].match(/pt_key=(.+?);/)) console.log(`\n提示:京东cookie 【${CookieJDs[i]}】填写不规范,可能会影响部分脚本正常使用。正确格式为: pt_key=xxx;pt_pin=xxx;（分号;不可少）\n`);
  const index = (i + 1 === 1) ? '' : (i + 1);
  exports['CookieJD' + index] = CookieJDs[i].trim();
}
