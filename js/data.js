/* ====== EDIT THIS FILE: projects, photos, server address ====== */
const API_URL = "/api/lead"; // address of your server (see server.js)

/* type: "multiplayer" | "arcade" (labels are in i18n.js). img: "img/cover.jpg" to use a picture as cover. */
const PROJECTS = [
  {
    title: { en: "Battleship Multiplayer", ru: "Морской бой: мультиплеер" }, type: "multiplayer",
    desc: { en: "An online naval battle game for two players.", ru: "Онлайн-игра «Морской бой» для двух игроков." },
    tags: { en: ["Multiplayer", "Web game"], ru: ["Мультиплеер", "Веб-игра"] },
    live: "https://ship-update-nwnzkhlay-yo-aeee.vercel.app",
    repo: "https://github.com/yoonoy/UpdatedShipBattle",
    c1: "#2b6cb0", c2: "#0b7285", img: ""
  },
  {
    title: { en: "Pick Fruits", ru: "Собери фрукты" }, type: "arcade",
    desc: { en: "A fast arcade game where you pick up the fruit.", ru: "Быстрая аркада, в которой нужно собирать фрукты." },
    tags: { en: ["Arcade", "Web game"], ru: ["Аркада", "Веб-игра"] },
    live: "https://newgame-v-napgo00r1-yo-aeee.vercel.app",
    repo: "https://github.com/yoonoy/catchFruitsGame",
    c1: "#e8590c", c2: "#f59f00", img: ""
  },
  {
    title: { en: "Sketch & Sabotage", ru: "Sketch & Sabotage" }, type: "multiplayer",
    desc: { en: "Drawing and social deduction for 10–15 players, in the spirit of Gartic and Codenames.", ru: "Рисование и социальная дедукция для 10–15 игроков в духе Gartic и Codenames." },
    tags: { en: ["Multiplayer", "Drawing"], ru: ["Мультиплеер", "Рисование"] },
    live: "https://sketch-sabotage-multiplayer.onrender.com/#room=D8E670",
    repo: "https://github.com/risolatkhonmadaminova-sys/sketch-sabotage",
    c1: "#d6336c", c2: "#6741d9", img: ""
  }
];


const GALLERY = [
  {
    src: "img/1.jpg",
    alt: { en: "Photo 1", ru: "Фото 1" }
  },
  {
    src: "img/2.jpg",
    alt: { en: "Photo 2", ru: "Фото 2" }
  },
  {
    src: "img/3.jpg",
    alt: { en: "Photo 3", ru: "Фото 3" }
  }
];

