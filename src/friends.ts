// ============================================
// 友情链接配置
// ============================================

export interface FriendLink {
    name: string;
    description: string;
    url: string;
    avatar: string;
    addDate?: string;
    recommended?: boolean;
    disconnected?: boolean; // 是否失联
}

export const FRIEND_LINKS: FriendLink[] = [
    {
        name: "纸鹿摸鱼处",
        description: "纸鹿至麓不知路，支炉制露不止漉",
        url: "https://blog.zhilu.site/",
        avatar: "https://www.zhilu.site/api/avatar.png",
        addDate: "2025-09-03",
        recommended: true
    },
    {
        name: "ATao-Blog",
        description: "做自己喜欢的事",
        url: "https://blog.atao.cyou",
        avatar: "https://cdn.atao.cyou/Web/Avatar.png",
        addDate: "2025-09-09",
        recommended: true
    },
    {
        name: "松坂日记",
        description: "The world is big, you have to go and see",
        url: "https://blog.mysqil.com",
        avatar: "https://blog.mysqil.com/_astro/avatar.D239-k4C_ZU0B2r.webp",
        addDate: "2025-11-23",
        recommended: true
    },
    {
        name: "RyuChan",
        description: "Ciallo～(∠・ω<)⌒★",
        url: "https://hub.xiaozhangya.xin",
        avatar: "https://hub.xiaozhangya.xin/profile.png",
        addDate: "2025-11-23",
        recommended: true
    },
    {
        name: "梦爱吃鱼",
        description: "不负心灵，不负今生.",
        url: "https://blog.bsgun.cn/",
        avatar: "https://oss-cdn.bsgun.cn/logo/avatar.256.png",
        addDate: "2025-12-02",
        recommended: true
    },
    {
        name: "安知鱼",
        description: "生活明朗，万物可爱",
        url: "https://blog.anheyu.com/",
        avatar: "https://npm.elemecdn.com/anzhiyu-blog-static@1.0.4/img/avatar.jpg",
        addDate: "2025-11-23",
        recommended: true
    },
    {
        name: "清羽飞扬",
        description: "柳影曳曳，清酒孤灯，扬笔撒墨，心境如霜",
        url: "https://blog.liushen.fun/",
        avatar: "https://blog.liushen.fun/info/avatar.ico",
        addDate: "2025-11-23",
        recommended: true
    },
    {
        name: "Cynosura",
        description: "Trying to light up the dark.",
        url: "https://cynosura.one/",
        avatar: "https://cynosura.one/img/avatar.webp",
        addDate: "2025-12-04"
    },
    {
        name: "张洪Heo",
        description: "分享设计与科技生活",
        url: "https://blog.zhheo.com/",
        avatar: "https://img.zhheo.com/i/67d8fa75943e4.webp",
        addDate: "2026-01-10",
        recommended: true
    },
    {
        name: "CWorld Site",
        description: "求知若愚，虚怀若谷",
        url: "https://cworld0.com/",
        avatar: "https://cravatar.cn/avatar/1ffe42aa45a6b1444a786b1f32dfa8aa?s=200",
        addDate: "2026-01-10",
        recommended: true
    },
    {
        name: "梨尽兴",
        description: "A place for peace",
        url: "https://blog.ljx.icu",
        avatar: "https://blog.ljx.icu/favicon.png",
        addDate: "2026-01-10",
        recommended: true
    }, 
    {
        name: "失联",
        description: "失联",
        url: "https://shilian.example.com/",
        avatar: "https://shilian.example.com/avatar.webp",
        addDate: "2025-12-04",
        disconnected: true
    },    
];
