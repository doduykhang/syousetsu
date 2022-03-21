const PORT = process.env.PORT || 8000;
const express = require("express");

const axios = require("axios");
const cheerio = require("cheerio");
const app = express();

app.listen(PORT, () => console.log("server listening at port 5000"));

const searchNovel = async (p = 1, word = "") => {
  const response = await axios("https://www.google.com", {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:5.0) Gecko/20100101 Firefox/5.0",
      Cookie: "over18=yes;",
    },
    // params: { p, word },
  });
  return response.data;
  // const $ = cheerio.load(response.data);
  // let novels = [];
  // $("div.searchkekka_box").each((i, el) => {
  //   const text = $(el).text();
  //   const title = $(el).find("a.tl").text();
  //   const author = text.substring(
  //     text.indexOf("作者：") + 3,
  //     text.lastIndexOf("小説情報") - 1
  //   );
  //   const rawTags = text.substring(
  //     text.indexOf("キーワード") + 6,
  //     text.lastIndexOf("最終掲載")
  //   );
  //   const tags = rawTags.trim().split("\n");
  //   const nCode = text
  //     .substring(text.indexOf("Nコード") + 5, text.lastIndexOf("読了時間"))
  //     .trim();
  //   const description = $(el).find("td.ex").text();
  //   const chapter = $(el).find("td.left").text();
  //   const novel = {
  //     nCode,
  //     title,
  //     author,
  //     description,
  //     chapter,
  //     tags,
  //   };
  //   novels.push(novel);
  // });
  // return novels;
};

const getNovelDetail = async (ncode) => {
  const response = await axios(`https://novel18.syosetu.com/${ncode}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:5.0) Gecko/20100101 Firefox/5.0",
      Cookie: "over18=yes;",
    },
  });
  const $ = cheerio.load(response.data);
  const title = $("p.novel_title").text();
  const author = $("div.novel_writername").text();
  const description = $("div#novel_ex").text();
  const chapters = [];
  const rawChapters = $("dd.subtitle").each((i, el) => {
    const chapter = $(el).text();
    chapters.push(chapter);
  });
  return {
    title,
    author,
    description,
    chapters,
  };
};

const getChapterDetail = async (ncode, chapter) => {
  const response = await axios(
    `https://novel18.syosetu.com/${ncode}/${chapter}`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:5.0) Gecko/20100101 Firefox/5.0",
        Cookie: "over18=yes;",
      },
    }
  );
  const $ = cheerio.load(response.data);
  const title = $("p.novel_subtitle").text();
  const lastChapter = $("div#novel_no").text().split("/")[1];
  const content = $("div#novel_honbun").text();
  return {
    title,
    lastChapter,
    content,
  };
};

app.get("/api/novel/search", async (req, res) => {
  try {
    const novels = await searchNovel(req.query.page, req.query.word);
    res.json(novels);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err });
  }
});

app.get("/api/novel/detail/:ncode", async (req, res) => {
  try {
    const novel = await getNovelDetail(req.params.ncode);
    res.json(novel);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err });
  }
});

app.get("/api/novel/detail/:ncode/:chapter", async (req, res) => {
  try {
    const chapterDetail = await getChapterDetail(
      req.params.ncode,
      req.params.chapter
    );
    res.json(chapterDetail);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err });
  }
});
