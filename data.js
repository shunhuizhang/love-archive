/* =========================================================
   内容都在这里改：名字、日期、事件、地点、示例照片
   ---------------------------------------------------------
   事件 / 地点 / 愿望清单：直接改下面的文字
   照片：这里只是示例数据。真正上传的照片存在 Supabase 里，
         管理员登录后点「导入示例数据」可以把这些照片写进数据库做测试
   动图：.gif 会自动识别，照片墙上出现「GIF · 动图」标记
   ========================================================= */

(function () {
  const P = (prompt, size) =>
    "https://trae-api-cn.mchost.guru/api/ide/v1/tool_text_to_image?prompt=" +
    encodeURIComponent(prompt) +
    "&image_size=" +
    size;

  window.LOVE = {
    us: {
      him: "小辉",
      her: "小唤",
      startDate: "2026-04-25",
      city: "杭州",
      intro:
        "这是小辉和小唤的私人小志。没有算法推荐，也没有访客统计，只有一起做过的事、一起去过的地方，和一卷还没拍完的底片。",
    },

    hero: {
      heroMain: {
        src: "assets/hero-main.jpg",
        alt: "夜里在杜甫江阁前，小辉和小唤举着一把写着「杜甫江阁」的折扇",
      },
      heroMini: {
        src: "assets/hero-mini.jpg",
        alt: "两只戴着戒指的手牵在一起，脚边落着一片黄叶",
      },
    },

    timeline: [
      {
        date: "2026-03-27",
        title: "一起打游戏",
        note: "你输了就耍赖，我假装没看见。",
        place: "客厅",
        photo: "assets/timeline/01-game.jpg",
      },
      {
        date: "2026-05-04",
        title: "一起拍照",
        note: "十张里九张糊了，剩下一张你笑得最好看。",
        place: "路上",
        photo: "assets/timeline/02-photo.jpg",
      },
      {
        date: "2026-05-10",
        title: "一起牵手",
        note: "从地铁口到你家楼下，一直没放开。",
        place: "街上",
        first: true,
        photo: "assets/timeline/03-hold.jpg",
      },
      {
        date: "2026-05-26",
        title: "一起亲亲",
        note: "说好只是拍张合照的。",
        place: "家里",
        first: true,
        photo: "assets/timeline/04-kiss.jpg",
      },
      {
        date: "2026-08-03",
        title: "一起睡觉",
        note: "半夜你把被子全卷走，我又一点点抢回来。",
        place: "卧室",
      },
      {
        date: "2026-08-03",
        title: "一起散步",
        note: "没有目的地，绕了一大圈又回到原地。",
        place: "江边",
        photo: "assets/timeline/05-walk.jpg",
      },
      {
        date: "2026-08-04",
        title: "一起吃汉堡咖喱饭",
        note: "你负责汉堡，我负责咖喱，谁也没让谁。",
        place: "快餐店",
        photo: "assets/timeline/06-meal.jpg",
      },
      {
        date: "2026-08-04",
        title: "一起做饭",
        note: "厨房像案发现场，最后两个人吃得干干净净。",
        place: "厨房",
      },
      {
        date: "2026-08-05",
        title: "一起去拼豆",
        note: "一颗一颗按下去，最后拼出了两个小人。",
        place: "家里",
        first: true,
        photo: "assets/timeline/07-beads.jpg",
      },
      {
        date: "2026-08-06",
        title: "一起去游乐园",
        note: "飞椅升到最高处，风把尖叫吹成了笑。",
        place: "游乐园",
        photo: "assets/timeline/08-park.jpg",
      },
      {
        date: "2026-08-06",
        title: "一起去景区看猴子",
        note: "猴子抢走了你的帽子，我们笑了半天。",
        place: "景区",
        photo: "assets/timeline/09-scenic.jpg",
      },
      {
        date: "2026-11-01",
        title: "一起买文创",
        note: "逛了很久，最后只买了两张贴纸和一张明信片。",
        place: "文创店",
        photo: "assets/timeline/10-merch.jpg",
      },
    ],
    places: [
      {
        city: "云南文山丘北欢乐世界",
        date: "2026.08",
        note: "飞椅转起来的时候，整座山都在脚下转。",
        photo: "assets/place-01.jpg",
      },
      {
        city: "云南普者黑景区",
        date: "2026.08",
        note: "荷花开满了一整片水，栈道一直走到山脚下。",
        photo: "assets/place-02.jpg",
      },
      {
        city: "长沙古开福寺",
        date: "2026.11",
        note: "在红墙下举着「旺」字，认真求了个好彩头。",
        photo: "assets/place-03.jpg",
      },
      {
        city: "长沙杜甫江阁",
        date: "2026.11",
        note: "夜里灯一亮，江阁像浮在江面上。",
        photo: "assets/place-04.jpg",
      },
      {
        city: "长沙湘江",
        date: "2026.11",
        note: "江风很大，你站在栏杆边看了很久。",
        photo: "assets/place-05.jpg",
      },
    ],

    wishlist: [
      { place: "冰岛", doing: "看一次极光" },
      { place: "京都", doing: "赶一场樱花" },
      { place: "新疆", doing: "走完独库公路" },
      { place: "里斯本", doing: "在海边住一个月" },
    ],

    photos: [
      {
        src: P(
          "empty subway carriage at night with neon reflections on the window, Hangzhou, cinematic 35mm film, muted colors",
          "landscape_4_3"
        ),
        caption: "二号线上的第一张合照",
        date: "2022.06",
        place: "杭州",
        tag: "日常",
        motion: false,
      },
      {
        src: P(
          "grey overcast sea at Xiamen beach, wet sand, muted blue tones, 35mm film grain, moody",
          "portrait_4_3"
        ),
        caption: "厦门，灰色的海",
        date: "2023.03",
        place: "厦门",
        tag: "旅行",
        motion: false,
      },
      {
        src: P(
          "fluffy orange cat sleeping on a windowsill, warm afternoon sunlight, film photography",
          "square_hd"
        ),
        caption: "年糕占领了窗台",
        date: "2024.04",
        place: "杭州",
        tag: "日常",
        motion: false,
      },
      {
        src: P(
          "messy home kitchen after cooking, tomatoes and eggs on the counter, warm evening light, film photo",
          "landscape_4_3"
        ),
        caption: "厨房事故现场",
        date: "2023.08",
        place: "杭州",
        tag: "日常",
        motion: false,
      },
      {
        src: P(
          "blue hour snowy mountain ridge in western Sichuan, deep blue shadows, tiny figures in the distance, cinematic film",
          "portrait_4_3"
        ),
        caption: "四姑娘山的蓝调时刻",
        date: "2025.02",
        place: "川西",
        tag: "旅行",
        motion: false,
      },
      {
        src: P(
          "campfire and tent under a starry night sky in the mountains, warm glow, long exposure, film grain",
          "landscape_4_3"
        ),
        caption: "帐篷外的那堆火",
        date: "2025.06",
        place: "莫干山",
        tag: "旅行",
        motion: false,
      },
      {
        src: P(
          "cherry blossom trees in full bloom along a path, falling petals, soft pink, spring, 35mm film photography",
          "portrait_4_3"
        ),
        caption: "樱花落了一地",
        date: "2023.05",
        place: "杭州",
        tag: "旅行",
        motion: false,
      },
      {
        src: P(
          "New Year crowd at the Bund in Shanghai at night, warm city lights, confetti, film photography",
          "landscape_4_3"
        ),
        caption: "外滩，人比灯多",
        date: "2024.01",
        place: "上海",
        tag: "旅行",
        motion: false,
      },
      {
        src: P(
          "two cups of coffee and a handwritten note on a sunlit cafe table, cozy warm tones, shallow depth of field, 35mm film photography",
          "square_hd"
        ),
        caption: "写在咖啡收据背面的便签",
        date: "2026.05",
        place: "杭州",
        tag: "日常",
        motion: false,
      },
      {
        src: P(
          "two bicycles leaning by Erhai lake in Dali, mountains in the background, golden hour, film photography",
          "landscape_4_3"
        ),
        caption: "洱海边的两辆单车",
        date: "2024.10",
        place: "大理",
        tag: "旅行",
        motion: false,
      },
      {
        src: P(
          "rainy window with blurred city bokeh at night, a coffee cup on the sill, film photography",
          "portrait_4_3"
        ),
        caption: "雨天车窗",
        date: "2025.03",
        place: "杭州",
        tag: "日常",
        motion: false,
      },
      {
        src: P(
          "dimly lit record store with pink neon light and rows of vinyl records, film grain",
          "portrait_4_3"
        ),
        caption: "唱片店的粉灯",
        date: "2025.11",
        place: "杭州",
        tag: "日常",
        motion: false,
      },
      {
        src: P(
          "fireworks over a river at night, silhouettes of two people watching from a bridge, warm pink and blue, film photo",
          "landscape_4_3"
        ),
        caption: "烟花下的剪影",
        date: "2024.02",
        place: "杭州",
        tag: "旅行",
        motion: false,
      },
      {
        src: P(
          "cardboard moving boxes stacked in a new apartment, a framed couple photo on top, warm daylight, film photography",
          "portrait_4_3"
        ),
        caption: "搬家那天的纸箱",
        date: "2026.09",
        place: "杭州",
        tag: "日常",
        motion: false,
      },
      {
        src: "assets/printing-test.gif",
        caption: "套印测试：会动的光",
        date: "2026.11",
        place: "暗房",
        tag: "动图",
        motion: true,
      },
    ],
  };
})();
