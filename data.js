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
        date: "2026-04-25",
        title: "第一次见面",
        note: "二号线最后一节车厢。你把最后一个座位让给了我，自己站了两站，然后说：“反正我下一站就下。”",
        place: "杭州 · 地铁二号线",
        first: true,
        photo: P(
          "empty subway carriage at night with neon reflections on the window, Hangzhou, cinematic 35mm film, muted colors",
          "landscape_4_3"
        ),
      },
      {
        date: "2026-05-06",
        title: "第一次一起看电影",
        note: "看的是个烂片。散场后我们在便利店门口骂了四十分钟，比电影好看。",
        place: "杭州 · 湖滨",
        photo: P(
          "evening street outside a cinema with neon signs and convenience store glow, film photography, warm and cool contrast",
          "landscape_4_3"
        ),
      },
      {
        date: "2026-05-20",
        title: "第一次牵手",
        note: "西湖边人很多。你把手伸过来的时候，我假装在看湖。",
        place: "杭州 · 断桥",
        photo: P(
          "West Lake in Hangzhou at dusk, calm water, distant bridge and willow trees, soft mist, 35mm film",
          "landscape_4_3"
        ),
      },
      {
        date: "2026-06-01",
        title: "第一个纪念日",
        note: "蛋糕被切成了兔子形状。刀工很差，但我们吃完了。",
        place: "杭州 · 家",
        photo: P(
          "cake slices cut into rabbit shapes on a plate, warm fairy lights in the background, cozy home, film photo",
          "square_hd"
        ),
      },
      {
        date: "2026-06-19",
        title: "第一次看海",
        note: "厦门下雨，海是灰色的。你说灰色也算海。",
        place: "厦门 · 黄厝海滩",
        photo: P(
          "grey overcast sea at Xiamen beach, wet sand, muted blue tones, 35mm film grain, moody",
          "landscape_4_3"
        ),
      },
      {
        date: "2026-07-04",
        title: "湘湖边拍了张很丑的合照",
        note: "风太大，头发挡住了半张脸，但谁也没舍得删。",
        place: "杭州 · 湘湖",
        photo: P(
          "lakeside path in summer with green trees and wind, soft afternoon light, 35mm film photography",
          "portrait_4_3"
        ),
      },
      {
        date: "2026-07-18",
        title: "第一次一起做饭",
        note: "厨房像案发现场，番茄炒蛋最后变成了番茄汤。",
        place: "杭州 · 家",
        photo: P(
          "messy home kitchen after cooking, tomatoes and eggs on the counter, warm evening light, film photo",
          "landscape_4_3"
        ),
      },
      {
        date: "2026-08-01",
        title: "在外滩看夜景",
        note: "人挤人。灯光亮起来的时候我们只顾着笑，忘了拍照。",
        place: "上海 · 外滩",
        photo: P(
          "night crowd at the Bund in Shanghai, warm city lights, film photography",
          "landscape_4_3"
        ),
      },
      {
        date: "2026-08-10",
        title: "领养了一只猫",
        note: "它在纸箱里打了个哈欠，我们就走不动了。取名：年糕。",
        place: "杭州 · 家",
        photo: P(
          "fluffy orange cat sleeping on a windowsill, warm afternoon sunlight, film photography",
          "square_hd"
        ),
      },
      {
        date: "2026-08-22",
        title: "环洱海骑了两天",
        note: "第二天屁股疼得说不出话，但你说还想再来一次。",
        place: "大理 · 洱海",
        photo: P(
          "two bicycles leaning by Erhai lake in Dali, mountains in the background, golden hour, film photography",
          "landscape_4_3"
        ),
      },
      {
        date: "2026-09-05",
        title: "第一次看雪山",
        note: "零下十度。你把围巾分给我一半，自己冻得直跺脚。",
        place: "川西 · 四姑娘山",
        photo: P(
          "blue hour snowy mountain ridge in western Sichuan, deep blue shadows, tiny figures in the distance, cinematic film",
          "landscape_4_3"
        ),
      },
      {
        date: "2026-09-19",
        title: "露营看星星",
        note: "帐篷搭歪了，星星没歪。你说以后每年都来。",
        place: "莫干山",
        photo: P(
          "campfire and tent under a starry night sky in the mountains, warm glow, long exposure, film grain",
          "landscape_4_3"
        ),
      },
      {
        date: "2026-10-03",
        title: "第一个秋天",
        note: "桂花落了一地，我们踩着走回家。",
        place: "杭州 · 满觉陇",
        photo: P(
          "osmanthus flowers along a Hangzhou street in autumn, warm afternoon light, film photography",
          "landscape_4_3"
        ),
      },
      {
        date: "2026-10-18",
        title: "去三亚等日出",
        note: "四点半起床，云太厚，没看到太阳。你说那就等下一次。",
        place: "三亚 · 后海",
        photo: P(
          "sunrise over the sea in Sanya, thick clouds, two silhouettes sitting on the sand, pastel sky, film photo",
          "landscape_4_3"
        ),
      },
      {
        date: "2026-11-01",
        title: "搬进新家",
        note: "纸箱堆到天花板。第一件事是把合照挂在墙上。",
        place: "杭州 · 新家",
        photo: P(
          "cardboard moving boxes stacked in a new apartment, a framed couple photo on top, warm daylight, film photography",
          "portrait_4_3"
        ),
      },
    ],

    places: [
      {
        city: "杭州",
        date: "2022 — 至今",
        note: "一切开始的地方。住在这里，也在这里重新开始。",
        photo: P(
          "West Lake in Hangzhou at dusk, calm water, distant bridge and willow trees, soft mist, 35mm film",
          "landscape_4_3"
        ),
      },
      {
        city: "厦门",
        date: "2023.03",
        note: "第一次看海。海是灰色的，但记忆是暖的。",
        photo: P(
          "grey overcast sea at Xiamen beach, wet sand, muted blue tones, 35mm film grain, moody",
          "landscape_4_3"
        ),
      },
      {
        city: "上海",
        date: "2024.01",
        note: "在人潮里跨年，冻得说不出话，还是一直笑。",
        photo: P(
          "New Year crowd at the Bund in Shanghai at night, warm city lights, confetti, film photography",
          "landscape_4_3"
        ),
      },
      {
        city: "大理",
        date: "2024.10",
        note: "环洱海骑了两天。风很大，话很少，刚刚好。",
        photo: P(
          "two bicycles leaning by Erhai lake in Dali, mountains in the background, golden hour, film photography",
          "landscape_4_3"
        ),
      },
      {
        city: "川西",
        date: "2025.02",
        note: "零下十度的雪山，和一条被分成两半的围巾。",
        photo: P(
          "blue hour snowy mountain ridge in western Sichuan, deep blue shadows, tiny figures in the distance, cinematic film",
          "landscape_4_3"
        ),
      },
      {
        city: "莫干山",
        date: "2025.06",
        note: "帐篷搭歪了，星星没歪。说好了每年都来。",
        photo: P(
          "campfire and tent under a starry night sky in the mountains, warm glow, long exposure, film grain",
          "landscape_4_3"
        ),
      },
      {
        city: "南京",
        date: "2026.04",
        note: "梧桐絮飞了一脸，你笑得比春天还大声。",
        photo: P(
          "Nanjing plane tree lined street in spring, fresh green leaves, warm sunlight, film photography",
          "landscape_4_3"
        ),
      },
      {
        city: "三亚",
        date: "2026.07",
        note: "四点半起床，没等到的日出，和已经约好的下一次。",
        photo: P(
          "sunrise over the sea in Sanya, thick clouds, two silhouettes sitting on the sand, pastel sky, film photo",
          "landscape_4_3"
        ),
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
