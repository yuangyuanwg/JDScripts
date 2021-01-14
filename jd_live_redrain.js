/*
直播红包雨
每天0,9,11,13,15,17,19,20,21,23可领，每日上限未知
活动时间：2020-12-7 到 2020-12-12
更新地址：https://raw.githubusercontent.com/Tersd07/st1/master/jd_live_redrain.js
已支持IOS双京东账号, Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, 小火箭，JSBox, Node.js
============Quantumultx===============
[task_local]
#直播红包雨
0 0,9,11,13,15,17,19,20,21,23 * * * https://raw.githubusercontent.com/Tersd07/st1/master/jd_live_redrain.js, tag=直播红包雨, img-url=https://raw.githubusercontent.com/58xinian/icon/master/jd_redPacket.png, enabled=true

================Loon==============
[Script]
cron "0 0,9,11,13,15,17,19,20,21,23 * * *" script-path=https://raw.githubusercontent.com/Tersd07/st1/master/jd_live_redrain.js, tag=直播红包雨

===============Surge=================
直播红包雨 = type=cron,cronexp="0 0,9,11,13,15,17,19,20,21,23 * * *",wake-system=1,timeout=20,script-path=https://raw.githubusercontent.com/Tersd07/st1/master/jd_live_redrain.js

============小火箭=========
直播红包雨 = type=cron,script-path=https://raw.githubusercontent.com/Tersd07/st1/master/jd_live_redrain.js, cronexpr="0 0,9,11,13,15,17,19,20,21,23 * * *", timeout=200, enable=true
 */
const $ = new Env('直播红包雨');
main();
async function main() {
  const hours = [0, 9, 11, 13, 15, 17, 19, 20, 21, 23];
  while(true) {
    const t = 15 * 1000;
    const d = new Date(Date.now() + (new Date().getTimezoneOffset() + 8 * 60) * 60 * 1000);
    const cM = d.getMinutes() % 60;
    // 如果是在非红包雨活动小时的 35分 后运行。则在下一个零时的 10秒 后运行。
    const s = (((60 - cM) * 60) - d.getSeconds() + 10) * 1000 - d.getMilliseconds();
    if(s < 0 || cM < 35 || (cM > 5 && cM < 50 && hours.includes(d.getHours()))) break;
    console.log(`当前 ${
      d.toTimeString().replace(/\s.+/, '')
    }，${$.name}时间未到，还需等待 ${
      (s / 1000).toFixed(0)
    } 秒后才能继续执行。`);
    if(s - t < 0){
      await $.wait(s);
      break;
    }else{
      await $.wait(t);
    }
  }
  $.http.get({url: `https://purge.jsdelivr.net/gh/Tersd07/st1@master/jd_live_redrain.js`}).then((resp) => {
    if (resp.statusCode === 200) {
      console.log(`${$.name}CDN缓存刷新成功`)
    }
  });
  await updateShareCodes();
  if (!$.body) await updateShareCodesCDN();
  if ($.body) {
    $.body = $.body.replace(
      /require\('\.\.\//g,
      "require\('./"
    );
    //同时运行 jd_live_redRain3.json 的活动 id。
    const m = $.body.match(/(function getRedRain)(\(\)[\s\S]+?)(?=\nfunction)/);
    const m1 = $.body.match(/(await getRedRain)(\(\);[\s\S]+?\$\.log\(`远程红包雨配置获取成功`\)\s+\})/);
    if(m && m1){
      $.body = $.body.replace(
        m[0],
        `${
          m[0]}\n${m[1]}_1${
          m[2].replace(
            'jd_live_redRain.json',
            'jd_live_redRain3.json'
          )
        }`
      ).replace(
        m1[0], ''
      ).replace(
        'message = `【${new Date().getUTCHours()+8}点${$.name}】`',
        ''
      ).replace(
        "let cookiesArr = [], cookie = '', message;",
        "let cookiesArr = [], cookie = '', message = '', _beansCount = 0;"
      ).replace(
        'await receiveRedRain();',
        `
        console.log('正在进行 jd_live_redRain.json 的活动 id。\\n');
        ${m1[0].replace(
          /return/g, 'void(0);'
        )}
        if($.activityId){
          if(!message) message += \`【\${new Date().getUTCHours()+8}点\${$.name}】\\n\`;
          $&
        }
        console.log('\\n\\n正在进行 jd_live_redRain3.json 的活动 id。\\n');
        ${m1[1]}_1();
        nowTs = new Date().getTime();
        if ($.st <= nowTs && nowTs < $.ed) {
          if(!message) message += \`【\${new Date().getUTCHours()+8}点\${$.name}】\\n\`;
          $&
        }else{
          $.log(\`不在红包雨时间之内\`);
        }`
      ).replace(
        'message += `领取成功，获得 ${(data.lotteryResult.jPeasList[0].quantity)} 京豆\\n`',
        `$&;\n_beansCount += (data.lotteryResult.jPeasList[0].quantity * 1);`
      ).replace(
        'async function showMsg() {',
        `$&\nif(!message) {
          return
        }else if(_beansCount){
          message += \`\\n共获得 \${_beansCount} 京豆。\`;
        };`
      );
    }
    eval($.body);
  }
}
function updateShareCodes(url = 'https://raw.githubusercontent.com/Tersd07/st1/master/jd_live_redrain.js') {
  return new Promise(resolve => {
    $.get({url}, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
        } else {
          $.body = data;
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function updateShareCodesCDN(url = 'https://cdn.jsdelivr.net/gh/Tersd07/st1@master/jd_live_redrain.js') {
  return new Promise(resolve => {
    $.get({url}, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          $.body = data;
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r)));let h=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];h.push(e),s&&h.push(s),i&&h.push(i),console.log(h.join("\n")),this.logs=this.logs.concat(h)}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}