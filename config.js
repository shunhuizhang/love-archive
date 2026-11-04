/* =========================================================
   部署配置（唯一需要改的地方）
   ---------------------------------------------------------
   1. 在 https://supabase.com 建一个项目
   2. Project Settings → API 里复制两个值，填到下面
   3. anon key 是公开的，可以放在前端；service_role key 绝对不要放进来
   4. 没填之前网站会自动进入「演示模式」：照片墙用 data.js 里的示例，不能登录、不能留言
   ========================================================= */

window.LOVE_CONFIG = {
  supabaseUrl: "https://nnrtyetvjttsiucxfdvr.supabase.co",
  supabaseAnonKey: "sb_publishable_D50xNquXuwRfK7I_iz597w_uHQwr2AO",

  // 照片存放的 Storage bucket 名字，和 schema.sql 里创建的一致
  bucket: "photos",

  // 前端先拦一道的敏感词（后端 schema.sql 里还有一份，真正生效的是后端那份）
  // 想加词：两边都加，或者只在数据库的 banned_words 表里加
  bannedWords: [
    "傻逼", "傻B", "沙比", "煞笔", "脑残", "智障", "弱智", "白痴", "蠢货",
    "去死", "死全家", "祝你死", "绝后", "贱人", "婊子", "妈的", "他妈",
    "你妈", "草泥马", "操你", "日你", "狗东西", "畜生", "王八蛋", "混蛋",
    "滚蛋", "废物", "变态", "神经病", "恶心死了", "丑八怪", "垃圾东西",
    "fuck", "shit", "bitch", "asshole", "dumbass", "idiot", "stupid",
    "whore", "slut", "cunt", "retarded",
  ],
};
