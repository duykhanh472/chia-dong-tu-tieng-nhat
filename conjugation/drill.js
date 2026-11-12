// drill.js

import rules from './rules.js';

const qs = (sel, ctx) => (ctx || document).querySelector(sel);
const qsa = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
const elById = (id) => document.getElementById(id);

function setHtml(el, html) {
  if (el) el.innerHTML = html;
}

function setText(el, text) {
  if (el) el.textContent = text;
}

function show(el) {
  if (el) el.style.display = 'block';
}

function hide(el) {
  if (el) el.style.display = 'none';
}

const tagTranslations = {
  "plain": "thường (thể ngắn)",
  "polite": "lịch sự (thể ます)",
  "negative": "phủ định (ない)",
  "past": "quá khứ (た)",
  "te-form": "thể て",
  "progressive": "tiếp diễn (ている)",
  "desire": "mong muốn (たい)",
  "volitional": "ý chí / ý định",
  "potential": "khả năng",
  "conditional": "điều kiện (たら)",
  "provisional": "giả định (ば)",
  "imperative": "mệnh lệnh",
  "passive": "bị động",
  "causative": "sai khiến",
  "dictionary": "từ điển (nguyên dạng)",
  "affirmative": "khẳng định",
  "present": "hiện tại",
  "active": "chủ động"
};

const phraseTranslations = {
  "affirmative": "khẳng định",
  "negative": "phủ định",
  "present": "hiện tại",
  "past": "quá khứ",
  "plain": "thể thông thường (thể ngắn)",
  "polite": "thể lịch sự (thể ます)",
  "て": "thể て",
  "non-て": "thể thường (bỏ thể て)",
  "potential": "thể khả năng",
  "non-potential": "thể thường (bỏ thể khả năng)",
  "conditional": "thể điều kiện (たら)",
  "non-conditional": "thể thường (bỏ thể điều kiện たら)",
  "provisional": "thể giả định (ば)",
  "non-provisional": "thể thường (bỏ thể giả định ば)",
  "imperative": "thể mệnh lệnh",
  "non-imperative": "thể thường (bỏ thể mệnh lệnh)",
  "causative": "thể sai khiến",
  "non-causative": "thể thường (bỏ thể sai khiến)",
  "passive": "thể bị động",
  "active": "thể chủ động",
  "progressive": "thể tiếp diễn (ている)",
  "non-progressive": "thể thường (bỏ thể tiếp diễn)",
  "&apos;desire&apos;": "thể mong muốn (たい)",
  "'desire'": "thể mong muốn (たい)",
  "&apos;non-desire&apos;": "thể thường (bỏ thể mong muốn)",
  "'non-desire'": "thể thường (bỏ thể mong muốn)",
  "volitional": "thể ý chí / ý định",
  "non-volitional": "thể thường (bỏ thể ý chí)"
};

const groupLabels = {
  "godan": "Động từ Godan",
  "ichidan": "Động từ Ichidan",
  "iku": "Động từ Godan đặc biệt (行く)",
  "suru": "Động từ nhóm する",
  "kuru": "Động từ 来る (Kuru)",
  "aru": "Động từ đặc biệt ある",
  "iru": "Động từ đặc biệt いる",
  "da": "Hệ từ だ / です (Copula)",
  "i-adjective": "Tính từ đuôi い",
  "ii": "Tính từ đặc biệt いい",
  "na-adjective": "Tính từ đuôi な"
};

function translateTag(tag) {
  return tagTranslations[tag] || tag;
}

function translateTags(tags) {
  return tags.filter(function (t) { return t !== ""; }).map(translateTag);
}

function tagSpans(tags) {
  return tags.filter(function (t) { return t !== ""; }).map(function (tag) {
    return "<span class='tag' data-tag='" + tag + "'>" + translateTag(tag) + "</span>";
  }).join(" ");
}

function confirmAndStopQuiz() {
  if (confirm("Bạn có chắc chắn muốn dừng làm bài và quay lại trang chủ không?")) {
    showSplash();
  }
}

function getGroupCheckboxes(group) {
  var ids = [];
  switch (group) {
    case 'conjugations':
      ids = ['plain', 'polite', 'negative', 'past', 'te-form', 'progressive', 'desire', 'volitional', 'potential', 'conditional', 'provisional', 'imperative', 'passive', 'causative'];
      break;
    case 'verbs':
      ids = ['godan', 'ichidan', 'suru', 'kuru', 'iku', 'aru', 'iru', 'da'];
      break;
    case 'adjectives':
      ids = ['i-adjective', 'na-adjective', 'ii'];
      break;
    case 'filters':
      ids = ['common', 'n5', 'n4', 'n3', 'n2', 'n1'];
      break;
    case 'all':
      ids = [
        'plain', 'polite', 'negative', 'past', 'te-form', 'progressive', 'desire', 'volitional', 'potential', 'conditional', 'provisional', 'imperative', 'passive', 'causative',
        'godan', 'ichidan', 'suru', 'kuru', 'iku', 'aru', 'iru', 'da',
        'i-adjective', 'na-adjective', 'ii',
        'common', 'n5', 'n4', 'n3', 'n2', 'n1'
      ];
      break;
  }
  return ids.map(elById).filter(Boolean);
}

var words;
var count_dict;
var grp_sample;
var transformations = [];
var question_pool = [];
var log;

const configOptions = {
  options: [
    "plain", "polite", "negative", "past", "te-form", "progressive",
    "potential", "conditional", "provisional", "imperative", "passive", "causative",
    "godan", "ichidan", "iku", "kuru", "suru", "aru", "iru", "da",
    "i-adjective", "na-adjective", "ii", "desire", "volitional",
    "trick", "kana", "furigana_always", "go_to_next_question",
    "auto_show_explanation", "use_voice", "common", "n5", "n4", "n3", "n2", "n1"
  ],
  selects: ["questionFocus"],
  inputs: ["numQuestions"]
};

const defaultConfig = {
  "plain": true,
  "polite": false,
  "negative": true,
  "past": true,
  "te-form": true,
  "progressive": false,
  "desire": false,
  "volitional": false,
  "potential": false,
  "conditional": false,
  "provisional": false,
  "imperative": false,
  "passive": false,
  "causative": false,
  "godan": true,
  "ichidan": true,
  "iku": true,
  "kuru": true,
  "suru": true,
  "aru": true,
  "iru": true,
  "da": true,
  "i-adjective": false,
  "na-adjective": false,
  "ii": false,
  "trick": false,
  "kana": false,
  "furigana_always": true,
  "go_to_next_question": false,
  "auto_show_explanation": false,
  "numQuestions": "10",
  "questionFocus": "none",
  "use_voice": false,
  "common": false,
  "n5": false,
  "n4": false,
  "n3": false,
  "n2": false,
  "n1": false
};

const localStorageOptionsKey = "conjugationDrillOptions";
const japaneseTextPattern = /^[ぁ-んァ-ヶー一-龯]+$/;

Array.prototype.randomElement = function () {
  return this[Math.floor(Math.random() * this.length)];
};

function arrayDifference(a, b) {
  return a.filter(function (x) {
    return b.indexOf(x) < 0;
  });
}

function arrayUnique(a) {
  return a.filter(function (item, pos) {
    return a.indexOf(item) == pos;
  });
}

function getCursorPosition(el) {
  return el.selectionStart;
}

function setCursorPosition(el, pos) {
  el.setSelectionRange(pos, pos);
}

function kanaForm(words) {
  if (words.constructor !== Array) {
    words = [words];
  }
  return words.map(function (word) {
    return word.split(/(?:.)\[([^\]]*)\]/).join("");
  });
}

function kanjiForm(words) {
  if (words.constructor !== Array) {
    words = [words];
  }
  return words.map(function (word) {
    return word.split(/(.+)\[[^\]]*\]/).join("");
  });
}

function getVerbForms(entry) {
  var result = {
    "kanji": {},
    "hiragana": {},
    "furigana": {}
  };
  if (!words[entry] || !words[entry].conjugations) return result;

  Object.keys(words[entry].conjugations).forEach(function (key) {
    var c = words[entry].conjugations[key];
    if (c && c.forms) {
      result["kanji"][key] = kanjiForm(c.forms);
      result["hiragana"][key] = kanaForm(c.forms);
      result["furigana"][key] = c.forms;
    }
  });

  return result;
}

function wordWithFurigana(words) {
  var options = getOptions();
  if (words.constructor !== Array) {
    words = [words];
  }

  return words.map(function (word) {
    var bits = word.split(/(.)\[([^\]]*)\]/);
    while (bits.length > 1) {
      if (options["kana"]) {
        bits[0] = bits[0] + bits[2] + bits[3];
      } else if (options["furigana_always"]) {
        bits[0] = bits[0] + "<ruby>" + bits[1] + "<rp>(</rp><rt>" + bits[2] + "</rt><rp>)</rp></ruby>" + bits[3];
      } else {
        bits[0] = bits[0] + "<ruby class='furiganaHover'>" + bits[1] + "<rp>(</rp><rt>" + bits[2] + "</rt><rp>)</rp></ruby>" + bits[3];
      }
      bits.splice(1, 3);
    }
    return bits[0];
  });
}

function processAnswerKey() {
  var el = elById('answer');
  if (!el) return;
  var pos = getCursorPosition(el);
  var val = el.value;

  var last1 = val.slice(pos - 1, pos);
  var last2 = val.slice(pos - 2, pos);
  var last3 = val.slice(pos - 3, pos);

  var replace1 = { "a": "あ", "i": "い", "u": "う", "e": "え", "o": "お" };
  var replace2 = {
    "ka": "か", "ki": "き", "ku": "く", "ke": "け", "ko": "こ",
    "sa": "さ", "si": "し", "su": "す", "se": "せ", "so": "そ",
    "ta": "た", "ti": "ち", "tu": "つ", "te": "て", "to": "と",
    "na": "な", "ni": "に", "nu": "ぬ", "ne": "ね", "no": "の",
    "ha": "は", "hi": "ひ", "hu": "ふ", "he": "へ", "ho": "ほ",
    "ma": "ま", "mi": "み", "mu": "む", "me": "め", "mo": "も",
    "ra": "ら", "ri": "り", "ru": "る", "re": "れ", "ro": "ろ",
    "ga": "が", "gi": "ぎ", "gu": "ぐ", "ge": "げ", "go": "ご",
    "za": "ざ", "zi": "じ", "zu": "ず", "ze": "ぜ", "zo": "ぞ",
    "da": "だ", "di": "ぢ", "du": "づ", "de": "で", "do": "ど",
    "ba": "ば", "bi": "び", "bu": "ぶ", "be": "べ", "bo": "ぼ",
    "pa": "ぱ", "pi": "ぴ", "pu": "ぷ", "pe": "ぺ", "po": "ぽ",
    "qa": "くぁ", "qi": "くぃ", "qu": "く", "qe": "くぇ", "qo": "くぉ",
    "wa": "わ", "wi": "うぃ", "wu": "う", "we": "うぇ", "wo": "を",
    "ya": "や", "yi": "い", "yu": "ゆ", "ye": "いぇ", "yo": "よ",
    "fa": "ふぁ", "fi": "ふぃ", "fu": "ふ", "fe": "ふぇ", "fo": "ふぉ",
    "ja": "じゃ", "ji": "じ", "ju": "じゅ", "je": "じぇ", "jo": "じょ",
    "la": "ぁ", "li": "ぃ", "lu": "ぅ", "le": "ぇ", "lo": "ぉ",
    "xa": "ぁ", "xi": "ぃ", "xu": "ぅ", "xe": "ぇ", "xo": "ぉ",
    "ca": "か", "ci": "し", "cu": "く", "ce": "せ", "co": "こ",
    "va": "ヴぁ", "vi": "ヴぃ", "vu": "ヴ", "ve": "ヴぇ", "vo": "ヴぉ",
    "nn": "ん", "n'": "ん",
    "nb": "んb", "nc": "んc", "nd": "んd", "nf": "んf", "ng": "んg",
    "nh": "んh", "nj": "んj", "nk": "んk", "nl": "んl", "nm": "んm",
    "np": "んp", "nq": "んq", "nr": "んr", "ns": "んs", "nt": "んt",
    "nv": "んv", "nw": "んw", "nx": "んx", "nz": "んz",
    "aa": "っa", "bb": "っb", "cc": "っc", "dd": "っd", "ee": "っe",
    "ff": "っf", "gg": "っg", "hh": "っh", "ii": "っi", "jj": "っj",
    "kk": "っk", "ll": "っl", "mm": "っm", "oo": "っo", "pp": "っp",
    "qq": "っq", "rr": "っr", "ss": "っs", "tt": "っt", "uu": "っu",
    "vv": "っv", "ww": "っw", "xx": "っx", "yy": "っy", "zz": "っz"
  };
  var replace3 = {
    "kya": "きゃ", "kyi": "きぃ", "kyu": "きゅ", "kye": "きぇ", "kyo": "きょ",
    "sha": "しゃ", "shi": "し", "shu": "しゅ", "she": "しぇ", "sho": "しょ",
    "cha": "ちゃ", "chi": "ち", "chu": "ちゅ", "che": "ちぇ", "cho": "ちょ",
    "nya": "にゃ", "nyi": "にぃ", "nyu": "にゅ", "nye": "にぇ", "nyo": "にょ",
    "hya": "ひゃ", "hyi": "ひぃ", "hyu": "ひゅ", "hye": "ひぇ", "hyo": "ひょ",
    "mya": "みゃ", "myi": "みぃ", "myu": "みゅ", "mye": "みぇ", "myo": "みょ",
    "rya": "りゃ", "ryi": "りぃ", "ryu": "りゅ", "rye": "りぇ", "ryo": "りょ",
    "gya": "ぎゃ", "gyi": "ぎぃ", "gyu": "ぎゅ", "gye": "ぎぇ", "gyo": "ぎょ",
    "zya": "じゃ", "zyi": "じぃ", "zyu": "じゅ", "zye": "じぇ", "zyo": "じょ",
    "dya": "ぢゃ", "dyi": "ぢぃ", "dyu": "ぢゅ", "dye": "ぢぇ", "dyo": "ぢょ",
    "bya": "びゃ", "byi": "びぃ", "byu": "びゅ", "bye": "びぇ", "byo": "びょ",
    "pya": "ぴゃ", "pyi": "ぴぃ", "pyu": "ぴゅ", "pye": "ぴぇ", "pyo": "ぴょ",
    "jiu": "じゅう", "jyu": "じゅ", "jyo": "じょ",
    "tsu": "つ"
  };

  if (replace3[last3]) {
    val = val.slice(0, pos - 3) + replace3[last3] + val.slice(pos);
    el.value = val;
    setCursorPosition(el, pos - 3 + replace3[last3].length);
  } else if (replace2[last2]) {
    val = val.slice(0, pos - 2) + replace2[last2] + val.slice(pos);
    el.value = val;
    setCursorPosition(el, pos - 2 + replace2[last2].length);
  } else if (replace1[last1]) {
    val = val.slice(0, pos - 1) + replace1[last1] + val.slice(pos);
    el.value = val;
    setCursorPosition(el, pos - 1 + replace1[last1].length);
  }
}

function processAnswerKeyDown(evt) {
  if (evt.keyCode == 32) {
    var options = getOptions();
    if (options.use_voice) {
      window.speechSynthesis.cancel();
      textToSpeech(window.questionData.givenWordAsKanji, evt.shiftKey);
      evt.preventDefault();
    }
  }
}

function validWordForOptions(entry, options) {
  if (!words[entry]) return false;
  var grp = words[entry].group;
  if (options[grp] === false) return false;

  var hasMetaFilter = options.n5 || options.n4 || options.n3 || options.n2 || options.n1 || options.common;
  if (hasMetaFilter) {
    var wTags = words[entry].tags || [];
    var match = false;
    if (options.common && wTags.includes('common')) match = true;
    if (options.n5 && wTags.includes('n5')) match = true;
    if (options.n4 && wTags.includes('n4')) match = true;
    if (options.n3 && wTags.includes('n3')) match = true;
    if (options.n2 && wTags.includes('n2')) match = true;
    if (options.n1 && wTags.includes('n1')) match = true;
    if (!match) return false;
  }
  return true;
}

function validTransformationForOptions(transformation, options) {
  for (var i = 0; i < transformation.tags.length; i++) {
    var type = transformation.tags[i];
    if (type !== 'trick' && options[type] === false) {
      return false;
    }
  }

  if (options.questionFocus && options.questionFocus !== "none") {
    if (options.questionFocus === 'tetakei') {
      // Checked during pairing
    } else if (transformation.type !== options.questionFocus) {
      return false;
    }
  }
  return true;
}

function validQuestion(entry, forms, transformation, options) {
  if (!validWordForOptions(entry, options)) return false;
  if (!validTransformationForOptions(transformation, options)) return false;

  if (!forms["furigana"] || !forms["furigana"][transformation.from] || !forms["furigana"][transformation.to]) {
    return false;
  }

  if (options.questionFocus === 'tetakei') {
    var fFrom = words[entry].conjugations[transformation.from];
    var fTo = words[entry].conjugations[transformation.to];
    if (fFrom && fTo && fFrom.tetakei === fTo.tetakei) {
      return false;
    }
  }

  return true;
}

function getGrammarRuleExplanation(group, dictClean, fromForm, toForm, isTrick, phrase) {
  if (isTrick) {
    return {
      title: "Câu hỏi giữ nguyên thể (Câu hỏi mẹo)",
      desc: "Từ được cho vốn dĩ đã ở đúng thể mà câu hỏi yêu cầu. Vì vậy đáp án chính là từ ban đầu, không cần thay đổi.",
      step: "Dạng ban đầu = Dạng yêu cầu → Giữ nguyên"
    };
  }

  var targetName = phraseTranslations[phrase] || phrase;
  var ending = dictClean.slice(-1);
  var stem = dictClean.slice(0, -1);
  var title = "Quy tắc chuyển sang " + targetName;
  var desc = "";
  var step = "";

  if (group === "godan") {
    if (toForm === "te-form" || toForm === "past" || toForm === "conditional") {
      var isTe = (toForm === "te-form");
      var isCond = (toForm === "conditional");
      var suffix1 = isTe ? "って" : (isCond ? "ったら" : "った");
      var suffix2 = isTe ? "んで" : (isCond ? "んだら" : "んだ");
      var suffix3 = isTe ? "いて" : (isCond ? "いたら" : "いた");
      var suffix4 = isTe ? "いで" : (isCond ? "いだら" : "いだ");
      var suffix5 = isTe ? "して" : (isCond ? "したら" : "した");

      if (["う", "つ", "る"].includes(ending)) {
        desc = "Với <strong>Động từ Godan</strong> có đuôi tận cùng là <strong>「う, つ, る」</strong>: khi chia sang " + targetName + ", ta đổi đuôi thành <strong>「" + suffix1 + "」</strong> (âm ngắt).";
        step = stem + " + " + ending + " → " + stem + " + " + suffix1;
      } else if (["む", "ぶ", "ぬ"].includes(ending)) {
        desc = "Với <strong>Động từ Godan</strong> có đuôi tận cùng là <strong>「む, ぶ, ぬ」</strong>: khi chia sang " + targetName + ", ta đổi đuôi thành <strong>「" + suffix2 + "」</strong> (âm mũi hóa đục).";
        step = stem + " + " + ending + " → " + stem + " + " + suffix2;
      } else if (ending === "く") {
        if (dictClean === "行く") {
          desc = "Với <strong>Động từ 行く</strong> (Godan đặc biệt): khi chia sang " + targetName + ", biến đổi ngoại lệ thành <strong>「" + (isTe ? "行って" : (isCond ? "行ったら" : "行った")) + "」</strong> (thay vì " + (isTe ? "いいて" : "いいた") + ").";
          step = "行く → " + (isTe ? "行って" : (isCond ? "行ったら" : "行った"));
        } else {
          desc = "Với <strong>Động từ Godan</strong> có đuôi tận cùng là <strong>「く」</strong>: khi chia sang " + targetName + ", ta đổi đuôi 「く」 thành <strong>「" + suffix3 + "」</strong> (âm i).";
          step = stem + " + く → " + stem + " + " + suffix3;
        }
      } else if (ending === "ぐ") {
        desc = "Với <strong>Động từ Godan</strong> có đuôi tận cùng là <strong>「ぐ」</strong>: khi chia sang " + targetName + ", ta đổi đuôi 「ぐ」 thành <strong>「" + suffix4 + "」</strong> (âm i có đục).";
        step = stem + " + ぐ → " + stem + " + " + suffix4;
      } else if (ending === "す") {
        desc = "Với <strong>Động từ Godan</strong> có đuôi tận cùng là <strong>「す」</strong>: khi chia sang " + targetName + ", ta đổi đuôi 「す」 thành <strong>「" + suffix5 + "」</strong>.";
        step = stem + " + す → " + stem + " + " + suffix5;
      }
    } else if (toForm.includes("negative") && !toForm.includes("polite")) {
      var aSound = { "う": "わ", "つ": "た", "る": "ら", "く": "か", "ぐ": "が", "す": "さ", "ぬ": "な", "ぶ": "ば", "む": "ま" }[ending] || "a";
      desc = "Với <strong>Động từ Godan</strong>: để chia sang " + targetName + ", ta đổi âm đuôi hàng <strong>[u]</strong> sang hàng <strong>[a]</strong> (riêng âm 「う」 chuyển thành 「わ」) rồi thêm <strong>「ない」</strong>.";
      step = stem + " + " + ending + " → " + stem + " + " + aSound + " + ない";
    } else if (toForm.includes("polite")) {
      var iSound = { "う": "い", "つ": "ち", "る": "り", "く": "き", "ぐ": "ぎ", "す": "し", "ぬ": "に", "ぶ": "び", "む": "み" }[ending] || "i";
      var polSuffix = toForm.includes("negative") ? (toForm.includes("past") ? "ませんでした" : "ません") : (toForm.includes("past") ? "ました" : "ます");
      desc = "Với <strong>Động từ Godan</strong>: để chia sang " + targetName + ", ta đổi âm đuôi hàng <strong>[u]</strong> sang hàng <strong>[i]</strong> rồi thêm <strong>「" + polSuffix + "」</strong>.";
      step = stem + " + " + ending + " → " + stem + " + " + iSound + " + " + polSuffix;
    } else if (toForm === "potential" || toForm === "potential negative") {
      var eSound = { "う": "え", "つ": "て", "る": "れ", "く": "け", "ぐ": "げ", "す": "せ", "ぬ": "ね", "ぶ": "べ", "む": "め" }[ending] || "e";
      desc = "Với <strong>Động từ Godan</strong>: để chia sang thể khả năng, ta đổi âm đuôi hàng <strong>[u]</strong> sang hàng <strong>[e]</strong> rồi thêm <strong>「る」</strong> (hoặc 「ない」 nếu phủ định).";
      step = stem + " + " + ending + " → " + stem + " + " + eSound + "る";
    } else if (toForm === "volitional") {
      var oSound = { "う": "お", "つ": "と", "る": "ろ", "く": "こ", "ぐ": "ご", "す": "そ", "ぬ": "の", "ぶ": "ぼ", "む": "も" }[ending] || "o";
      desc = "Với <strong>Động từ Godan</strong>: để chia sang thể ý chí / ý định, ta đổi âm đuôi hàng <strong>[u]</strong> sang hàng <strong>[o]</strong> rồi thêm <strong>「う」</strong>.";
      step = stem + " + " + ending + " → " + stem + " + " + oSound + "う";
    } else if (toForm === "provisional" || toForm === "provisional negative") {
      var eSoundP = { "う": "え", "つ": "て", "る": "れ", "く": "け", "ぐ": "げ", "す": "せ", "ぬ": "ね", "ぶ": "べ", "む": "め" }[ending] || "e";
      desc = "Với <strong>Động từ Godan</strong>: để chia sang thể giả định (ば), ta đổi âm đuôi hàng <strong>[u]</strong> sang hàng <strong>[e]</strong> rồi thêm <strong>「ば」</strong>.";
      step = stem + " + " + ending + " → " + stem + " + " + eSoundP + "ば";
    } else if (toForm === "imperative") {
      var eSoundImp = { "う": "え", "つ": "て", "る": "れ", "く": "け", "ぐ": "げ", "す": "せ", "ぬ": "ね", "ぶ": "べ", "む": "め" }[ending] || "e";
      desc = "Với <strong>Động từ Godan</strong>: để chia sang thể mệnh lệnh, ta đổi âm đuôi hàng <strong>[u]</strong> sang hàng <strong>[e]</strong> tương ứng.";
      step = stem + " + " + ending + " → " + stem + " + " + eSoundImp;
    } else if (toForm === "passive") {
      var aSoundPass = { "う": "わ", "つ": "た", "る": "ら", "く": "か", "ぐ": "が", "す": "さ", "ぬ": "な", "ぶ": "ば", "む": "ま" }[ending] || "a";
      desc = "Với <strong>Động từ Godan</strong>: để chia sang thể bị động, ta đổi âm đuôi hàng <strong>[u]</strong> sang hàng <strong>[a]</strong> (riêng âm 「う」 chuyển thành 「わ」) rồi thêm <strong>「れる」</strong>.";
      step = stem + " + " + ending + " → " + stem + " + " + aSoundPass + "れる";
    } else if (toForm === "causative") {
      var aSoundCaus = { "う": "わ", "つ": "た", "る": "ら", "く": "か", "ぐ": "が", "す": "さ", "ぬ": "な", "ぶ": "ば", "む": "ま" }[ending] || "a";
      desc = "Với <strong>Động từ Godan</strong>: để chia sang thể sai khiến, ta đổi âm đuôi hàng <strong>[u]</strong> sang hàng <strong>[a]</strong> (riêng âm 「う」 chuyển thành 「わ」) rồi thêm <strong>「せる」</strong>.";
      step = stem + " + " + ending + " → " + stem + " + " + aSoundCaus + "せる";
    } else if (toForm === "desire") {
      var iSoundDes = { "う": "い", "つ": "ち", "る": "り", "く": "き", "ぐ": "ぎ", "す": "し", "ぬ": "に", "ぶ": "び", "む": "み" }[ending] || "i";
      desc = "Với <strong>Động từ Godan</strong>: để chia sang thể mong muốn (たい), ta đổi âm đuôi hàng <strong>[u]</strong> sang hàng <strong>[i]</strong> rồi thêm <strong>「たい」</strong>.";
      step = stem + " + " + ending + " → " + stem + " + " + iSoundDes + "たい";
    } else if (toForm === "progressive") {
      desc = "Với <strong>Động từ Godan</strong>: để chia sang thể tiếp diễn (ている), trước tiên chia sang thể て rồi thêm <strong>「いる」</strong> (hoặc thể lịch sự 「います」).";
      step = "Thể て + いる / います";
    } else {
      desc = "Chuyển từ gốc theo quy tắc của Động từ Godan sang " + targetName + ".";
      step = dictClean + " → " + targetName;
    }
  } else if (group === "ichidan") {
    var ichidanStem = dictClean.endsWith("る") ? dictClean.slice(0, -1) : dictClean;
    desc = "Với <strong>Động từ Ichidan</strong>: quy tắc chia rất nhất quán, ta chỉ cần <strong>bỏ đuôi 「る」</strong> và gắn hậu tố tương ứng.";
    if (toForm === "te-form") {
      step = ichidanStem + " + る → " + ichidanStem + " + て";
    } else if (toForm === "past") {
      step = ichidanStem + " + る → " + ichidanStem + " + た";
    } else if (toForm.includes("negative") && !toForm.includes("polite")) {
      step = ichidanStem + " + る → " + ichidanStem + " + ない";
    } else if (toForm.includes("polite")) {
      var sfx = toForm.includes("negative") ? (toForm.includes("past") ? "ませんでした" : "ません") : (toForm.includes("past") ? "ました" : "ます");
      step = ichidanStem + " + る → " + ichidanStem + " + " + sfx;
    } else if (toForm === "potential") {
      step = ichidanStem + " + る → " + ichidanStem + " + られる";
    } else if (toForm === "volitional") {
      step = ichidanStem + " + る → " + ichidanStem + " + よう";
    } else if (toForm === "provisional") {
      step = ichidanStem + " + る → " + ichidanStem + " + れば";
    } else if (toForm === "conditional") {
      step = ichidanStem + " + る → " + ichidanStem + " + たら";
    } else if (toForm === "imperative") {
      step = ichidanStem + " + る → " + ichidanStem + " + ろ";
    } else if (toForm === "passive") {
      step = ichidanStem + " + る → " + ichidanStem + " + られる";
    } else if (toForm === "causative") {
      step = ichidanStem + " + る → " + ichidanStem + " + させる";
    } else if (toForm === "desire") {
      step = ichidanStem + " + る → " + ichidanStem + " + たい";
    } else if (toForm === "progressive") {
      step = ichidanStem + " + る → " + ichidanStem + " + ている";
    } else {
      step = ichidanStem + " + [Hậu tố " + targetName + "]";
    }
  } else if (group === "suru") {
    var suruBase = dictClean.endsWith("する") ? dictClean.slice(0, -2) : "";
    desc = "Với <strong>Động từ nhóm する</strong> (bất quy tắc): biến đổi phần 「する」 theo thể tương ứng.";
    if (toForm === "te-form") step = suruBase + "する → " + suruBase + "して";
    else if (toForm === "past") step = suruBase + "する → " + suruBase + "した";
    else if (toForm.includes("negative") && !toForm.includes("polite")) step = suruBase + "する → " + suruBase + "しない";
    else if (toForm.includes("polite")) {
      var sfxS = toForm.includes("negative") ? (toForm.includes("past") ? "しませんでした" : "しません") : (toForm.includes("past") ? "しました" : "します");
      step = suruBase + "する → " + suruBase + sfxS;
    } else if (toForm === "potential") step = suruBase + "する → " + suruBase + "できる";
    else if (toForm === "volitional") step = suruBase + "する → " + suruBase + "しよう";
    else if (toForm === "provisional") step = suruBase + "する → " + suruBase + "すれば";
    else if (toForm === "conditional") step = suruBase + "する → " + suruBase + "したら";
    else if (toForm === "imperative") step = suruBase + "する → " + suruBase + "しろ";
    else if (toForm === "passive") step = suruBase + "する → " + suruBase + "される";
    else if (toForm === "causative") step = suruBase + "する → " + suruBase + "させる";
    else step = suruBase + "する → " + targetName;
  } else if (group === "kuru") {
    desc = "Với <strong>Động từ 来る (くる)</strong> (bất quy tắc): âm đầu biến đổi tùy theo thể.";
    if (toForm === "te-form") step = "来る (くる) → 来て (きて)";
    else if (toForm === "past") step = "来る (くる) → 来た (きた)";
    else if (toForm.includes("negative") && !toForm.includes("polite")) step = "来る (くる) → 来ない (こない)";
    else if (toForm.includes("polite")) step = "来る (くる) → 来ます (きます)";
    else if (toForm === "potential") step = "来る (くる) → 来られる (こられる)";
    else if (toForm === "volitional") step = "来る (くる) → 来よう (こよう)";
    else if (toForm === "provisional") step = "来る (くる) → 来れば (くれば)";
    else if (toForm === "conditional") step = "来る (くる) → 来たら (きたら)";
    else if (toForm === "imperative") step = "来る (くる) → 来い (こい)";
    else step = "来る (くる) → " + targetName;
  } else if (group === "iku") {
    desc = "Với <strong>Động từ 行く</strong>: là trường hợp Godan đặc biệt ở thể て và thể た.";
    if (toForm === "te-form") step = "行く → 行って (いって)";
    else if (toForm === "past") step = "行く → 行った (いった)";
    else if (toForm === "conditional") step = "行く → 行ったら (いったら)";
    else step = "Các thể khác chia như Godan đuôi く (行かない, 行きます, 行ける...)";
  } else if (group === "aru") {
    desc = "Với <strong>Động từ ある</strong>: là động từ đặc biệt chỉ sự tồn tại của đồ vật.";
    if (toForm.includes("negative")) step = "Phủ định đặc biệt tương ứng là 「ない」(không dùng あらない)";
    else if (toForm === "te-form") step = "ある → あって";
    else if (toForm === "past") step = "ある → あった";
    else if (toForm === "polite") step = "ある → あります";
    else step = "ある → " + targetName;
  } else if (group === "iru") {
    desc = "Với <strong>Động từ いる</strong>: là động từ Ichidan đặc biệt chỉ sự tồn tại của người/động vật.";
    step = "Chia bỏ る như động từ Ichidan (いて, いた, いない, います, いられる...)";
  } else if (group === "da") {
    desc = "Với <strong>Hệ từ だ / です (Copula)</strong>: biểu thị sự khẳng định/vị ngữ danh từ.";
    if (toForm === "polite") step = "だ (thể thường) → です (thể lịch sự)";
    else if (toForm.includes("negative")) step = "だ → ではない / じゃない (lịch sự: ではありません / じゃありません)";
    else if (toForm === "past") step = "だ → だった (lịch sự: でした)";
    else if (toForm === "te-form") step = "だ → で";
    else if (toForm === "conditional") step = "だ → だったら";
    else if (toForm === "provisional") step = "だ → なら / ならば";
    else if (toForm === "volitional") step = "だ → だろう (lịch sự: でしょう)";
    else step = "だ → " + targetName;
  } else if (group === "i-adjective") {
    var iStem = dictClean.endsWith("い") ? dictClean.slice(0, -1) : dictClean;
    desc = "Với <strong>Tính từ đuôi い</strong>: biến đổi ở âm đuôi 「い」.";
    if (toForm.includes("negative")) step = iStem + " + い → " + iStem + " + くない (lịch sự: くないです / くありません)";
    else if (toForm === "past") step = iStem + " + い → " + iStem + " + かった (lịch sự: かったです)";
    else if (toForm === "te-form") step = iStem + " + い → " + iStem + " + くて";
    else if (toForm === "provisional") step = iStem + " + い → " + iStem + " + ければ";
    else if (toForm === "polite") step = iStem + "い → " + iStem + "いです";
    else step = iStem + "い → " + targetName;
  } else if (group === "ii") {
    desc = "Với <strong>Tính từ đặc biệt いい</strong>: biến đổi dựa trên gốc 「よい」.";
    if (toForm.includes("negative")) step = "いい → よくない (lịch sự: よくないです / よくありません)";
    else if (toForm === "past") step = "いい → よかった (lịch sự: よかったです)";
    else if (toForm === "te-form") step = "いい → よくて";
    else if (toForm === "provisional") step = "いい → よければ";
    else if (toForm === "polite") step = "いい → いいです";
    else step = "いい → " + targetName;
  } else if (group === "na-adjective") {
    var naStem = dictClean.replace(/だ$/, "").replace(/な$/, "");
    desc = "Với <strong>Tính từ đuôi な</strong>: kết hợp với các dạng của hệ từ だ / です.";
    if (toForm.includes("negative")) step = naStem + " → " + naStem + "ではない / " + naStem + "じゃない";
    else if (toForm === "past") step = naStem + " → " + naStem + "だった (lịch sự: でした)";
    else if (toForm === "polite") step = naStem + " → " + naStem + "です";
    else if (toForm === "provisional") step = naStem + " → " + naStem + "なら / " + naStem + "ならば";
    else step = naStem + " + " + targetName;
  }

  return { title: title, desc: desc, step: step };
}

function generateQuestion() {
  var questionText = {
    "affirmative": "<span class='first'>chuyển</span> từ sau sang <span class='emphasis'>thể khẳng định</span>",
    "negative": "<span class='first'>chuyển</span> từ sau sang <span class='emphasis'>thể phủ định</span>",
    "present": "<span class='first'>chuyển</span> từ sau sang <span class='emphasis'>thì hiện tại</span>",
    "past": "<span class='first'>chuyển</span> từ sau sang <span class='emphasis'>thì quá khứ</span>",
    "plain": "<span class='first'>chuyển</span> từ sau sang <span class='emphasis'>thể thường (thể ngắn)</span>",
    "polite": "<span class='first'>chuyển</span> từ sau sang <span class='emphasis'>thể lịch sự (thể ます)</span>",
    "て": "<span class='emphasis first'>chuyển</span> từ sau sang <span class='emphasis'>thể て</span>",
    "non-て": "<span class='emphasis first'>bỏ</span> <span class='emphasis'>thể て</span> ở từ sau",
    "potential": "<span class='first'>chuyển</span> từ sau sang <span class='emphasis'>thể khả năng</span>",
    "non-potential": "<span class='first'>bỏ</span> <span class='emphasis'>thể khả năng</span> ở từ sau (đưa về thể thường)",
    "conditional": "<span class='first'>chuyển</span> từ sau sang <span class='emphasis'>thể điều kiện (たら)</span>",
    "non-conditional": "<span class='first'>bỏ</span> <span class='emphasis'>thể điều kiện (たら)</span> ở từ sau",
    "provisional": "<span class='first'>chuyển</span> từ sau sang <span class='emphasis'>thể giả định (ば)</span>",
    "non-provisional": "<span class='first'>bỏ</span> <span class='emphasis'>thể giả định (ば)</span> ở từ sau",
    "imperative": "<span class='first'>chuyển</span> từ sau sang <span class='emphasis'>thể mệnh lệnh</span>",
    "non-imperative": "<span class='first'>bỏ</span> <span class='emphasis'>thể mệnh lệnh</span> ở từ sau",
    "causative": "<span class='first'>chuyển</span> từ sau sang <span class='emphasis'>thể sai khiến</span>",
    "non-causative": "<span class='first'>bỏ</span> <span class='emphasis'>thể sai khiến</span> ở từ sau",
    "passive": "<span class='first'>chuyển</span> từ sau sang <span class='emphasis'>thể bị động</span>",
    "active": "<span class='first'>chuyển</span> từ sau sang <span class='emphasis'>thể chủ động</span>",
    "progressive": "<span class='first'>chuyển</span> từ sau sang <span class='emphasis'>thể tiếp diễn (ている)</span>",
    "non-progressive": "<span class='first'>bỏ</span> <span class='emphasis'>thể tiếp diễn (ている)</span> ở từ sau",
    "&apos;desire&apos;": "<span class='first'>chuyển</span> từ sau sang <span class='emphasis'>thể mong muốn (たい)</span>",
    "&apos;non-desire&apos;": "<span class='first'>bỏ</span> <span class='emphasis'>thể mong muốn (たい)</span> ở từ sau",
    "volitional": "<span class='first'>chuyển</span> từ sau sang <span class='emphasis'>thể ý định / ý chí</span>",
    "non-volitional": "<span class='first'>bỏ</span> <span class='emphasis'>thể ý định / ý chí</span> ở từ sau"
  };

  var options = getOptions();
  var activeWords = question_pool.filter(function (entry) {
    return validWordForOptions(entry, options);
  });

  var activeTransformations = transformations.filter(function (t) {
    return validTransformationForOptions(t, options);
  });

  if (activeWords.length === 0 || activeTransformations.length === 0) {
    elById('noQuestionError').style.display = 'block';
    showSplash();
    return;
  }

  var allowTrick = options.trick;
  var normalTransformations = activeTransformations.filter(function (t) { return t.tags.indexOf('trick') === -1; });
  var trickTransformations = activeTransformations.filter(function (t) { return t.tags.indexOf('trick') !== -1; });

  var selectedTransformation = null;
  var selectedEntry = null;
  var forms = null;

  // Pick combination directly without infinite loops
  var shuffledWords = activeWords.slice().sort(function () { return 0.5 - Math.random(); });
  for (var i = 0; i < shuffledWords.length; i++) {
    var candidateEntry = shuffledWords[i];
    var candidateForms = getVerbForms(candidateEntry);

    var useTrick = (allowTrick && trickTransformations.length > 0 && Math.random() < 0.15);
    var targetList = useTrick ? trickTransformations : normalTransformations;
    if (targetList.length === 0) targetList = activeTransformations;

    var candidateTrans = targetList.slice().sort(function () { return 0.5 - Math.random(); });
    for (var j = 0; j < candidateTrans.length; j++) {
      var trans = candidateTrans[j];
      if (validQuestion(candidateEntry, candidateForms, trans, options)) {
        selectedEntry = candidateEntry;
        selectedTransformation = trans;
        forms = candidateForms;
        break;
      }
    }
    if (selectedEntry && selectedTransformation) break;
  }

  if (!selectedEntry || !selectedTransformation || !forms) {
    elById('noQuestionError').style.display = 'block';
    showSplash();
    return;
  }

  var from_form = selectedTransformation.from;
  var to_form = selectedTransformation.to;

  var kanjiForms = forms["kanji"];
  var kanaForms = forms["hiragana"];
  var furiganaForms = forms["furigana"];

  var candidates;
  if (options["kana"]) {
    candidates = kanaForms[from_form];
  } else {
    candidates = wordWithFurigana(furiganaForms[from_form]);
  }

  var candidateIndex = Math.floor(Math.random() * candidates.length);
  var givenWord = candidates[candidateIndex];
  var givenWordAsKanji = kanjiForms[from_form][candidateIndex];

  var thisQuestionText = questionText[selectedTransformation.phrase] || ("chuyển từ sau sang " + (phraseTranslations[selectedTransformation.phrase] || selectedTransformation.phrase));
  var questionFirstHalf = thisQuestionText;
  var questionSecondHalf = givenWord;
  var question = questionFirstHalf.replace("từ sau", "từ " + questionSecondHalf).replace("từ sau", "từ " + questionSecondHalf);

  var answer = kanjiForms[to_form];
  var answer2 = kanaForms[to_form];
  var answerWithFurigana = wordWithFurigana(furiganaForms[to_form]);

  if (options["kana"]) {
    answer = answer2;
    answerWithFurigana = kanaForms[to_form];
  }

  window.questionData = {
    entry: selectedEntry,
    transformation: selectedTransformation,
    question: question,
    answer: answer,
    answer2: answer2,
    answerWithFurigana: answerWithFurigana,
    givenWord: givenWord,
    givenWordAsKanji: givenWordAsKanji
  };

  setHtml(elById('questionFirstHalf'), questionFirstHalf);

  if (options.use_voice) {
    setHtml(elById('questionSecondHalf'), "<div id='speechSpace'><i>Nhấn phím Space để nghe từ</i><br><div class='halfSpeed'>Nhấn giữ Shift để nghe với tốc độ chậm hơn</div></div>");
  } else {
    setHtml(elById('questionSecondHalf'), questionSecondHalf);
  }

  var wordInfo = words[selectedEntry];
  var rawDictForms = wordInfo.conjugations && wordInfo.conjugations["dictionary"] ? wordInfo.conjugations["dictionary"].forms : [wordInfo.dictionary];
  var cleanDictWord = wordInfo.word || selectedEntry;

  var displayDict = rawDictForms;
  if (wordInfo.group === "na-adjective") {
    displayDict = displayDict.map(function (d) { return d.replace(/だ$/, ''); });
  }

  if (!options["kana"]) {
    displayDict = wordWithFurigana(displayDict);
  } else {
    displayDict = kanaForm(displayDict);
  }

  var isTrick = selectedTransformation.tags.indexOf("trick") !== -1;
  var ruleExp = getGrammarRuleExplanation(wordInfo.group, cleanDictWord, from_form, to_form, isTrick, selectedTransformation.phrase);

  // Set Explanation Card UI
  setHtml(elById('explain-given-base'), displayDict.join(" / "));
  setText(elById('explain-group'), groupLabels[wordInfo.group] || wordInfo.group);
  setText(elById('explain-meaning'), wordInfo.meaning || "");
  setHtml(elById('explain-given'), givenWord);
  setHtml(elById('explain-given-tags'), tagSpans(selectedTransformation.from_tags));
  qsa('.explain-given-dictionary').forEach(function (el) { el.textContent = cleanDictWord; });

  setText(elById('explain-rule-title'), ruleExp.title);
  setHtml(elById('explain-rule-desc'), ruleExp.desc);
  setHtml(elById('explain-step-by-step'), ruleExp.step);

  setHtml(elById('explain-answer-display'), commaList(answerWithFurigana, " hoặc "));
  qsa('.explain-answer-tags2').forEach(function (el) { el.innerHTML = tagSpans(selectedTransformation.to_tags); });

  if (answer.length > 1) {
    qsa('.explain-answer-multiple').forEach(show);
    qsa('.explain-answer-single').forEach(hide);
    qsa('.explain-answer-as-list').forEach(function (el) {
      el.innerHTML = answerWithFurigana.map(function (ans) { return "<li>" + ans + "</li>"; }).join("");
    });
  } else {
    qsa('.explain-answer-multiple').forEach(hide);
    qsa('.explain-answer-single').forEach(show);
  }

  var sentenceJP = wordInfo.sentences && wordInfo.sentences[0] ? wordInfo.sentences[0] : "";
  var sentenceVI = wordInfo.sentences && wordInfo.sentences[1] ? wordInfo.sentences[1] : "";
  setText(elById('explain-sentence-jp'), sentenceJP);
  setText(elById('explain-sentence-en'), sentenceVI);

  var anchor = elById('jisho-link');
  if (anchor) {
    anchor.setAttribute('href', 'https://mazii.net/vi-VN/search/word/javi/' + encodeURIComponent(cleanDictWord));
  }

  var noteText = (wordInfo.notes && wordInfo.notes[0]) ? wordInfo.notes[0] : "";
  setText(elById('explain-notes'), noteText);

  hide(elById('message'));
  hide(elById('proceed'));
  hide(elById('explanation'));
  show(elById('inputArea'));

  var answerEl = elById('answer');
  if (answerEl) {
    answerEl.value = "";
    answerEl.focus();
  }
}

function processAnswer() {
  var options = getOptions();
  var questionData = window.questionData;
  var answerEl = elById('answer');
  var response = answerEl.value.trim();

  var shake = false;
  if (response === "" || !response.match(japaneseTextPattern)) {
    shake = true;
  }

  if (shake) {
    shakeInputArea();
    return;
  }

  var correct = (questionData.answer.indexOf(response) !== -1 || questionData.answer2.indexOf(response) !== -1);
  var klass = correct ? "correct" : "incorrect";

  log.history.push({
    "question": questionData.question,
    "response": response,
    "answer": questionData.answerWithFurigana,
    "kana": questionData.answer2,
    "correct": correct
  });

  var totalQuestions = Number(elById('numQuestions').value);
  var answeredQuestions = log.history.length;

  updateProgressBar(answeredQuestions / totalQuestions * 100);

  var responseButton = elById('responseButton');
  responseButton.className = klass;
  responseButton.textContent = response;

  if (correct) {
    hide(elById('message'));
  } else {
    show(elById('message'));
    setHtml(elById('correction'), "Đáp án đúng là " + commaList(questionData.answerWithFurigana, " hoặc "));
  }

  hide(elById('inputArea'));
  show(elById('proceed'));
  hide(elById('explanation'));

  var proceedButton = qs('#proceed button');
  if (proceedButton) proceedButton.focus();

  updateHistoryView(log);

  if (correct) {
    if (options.go_to_next_question) {
      proceed();
    }
  } else {
    if (options.auto_show_explanation) {
      explain();
    }
  }
  window.scrollTo(0, 0);
}

function shakeInputArea() {
  var inputArea = elById('inputArea');
  if (!inputArea) return;
  inputArea.classList.remove('shake');
  void inputArea.offsetWidth;
  inputArea.classList.add('shake');
}

function createMark(text, className) {
  var span = document.createElement('span');
  span.className = className;
  span.textContent = text;
  return span;
}

function updateHistoryView(log) {
  var historyEl = elById('history');
  if (!historyEl) return;
  historyEl.innerHTML = "";

  var table = document.createElement('table');
  table.className = "history-table";

  log.history.forEach(function (row) {
    var tr = document.createElement('tr');
    tr.className = row.correct ? "history-correct" : "history-incorrect";

    var tdQuestion = document.createElement('td');
    tdQuestion.innerHTML = row.question;
    tr.appendChild(tdQuestion);

    var tdResponse = document.createElement('td');
    tdResponse.className = "history-response";
    tdResponse.textContent = row.response;
    tr.appendChild(tdResponse);

    var tdAnswer = document.createElement('td');
    tdAnswer.className = "history-answer";
    tdAnswer.innerHTML = commaList(row.answer, " hoặc ");
    tr.appendChild(tdAnswer);

    table.appendChild(tr);
  });

  historyEl.appendChild(table);
}

function updateProgressBar(percentage) {
  var bar = qs('.progressBar');
  if (bar) bar.style.width = Math.min(percentage, 100) + "%";
}

function commaList(arr, conjunction) {
  if (!arr || arr.length === 0) return "";
  if (arr.length === 1) return arr[0];
  conjunction = conjunction || "hoặc";
  return arr.slice(0, -1).join(", ") + " " + conjunction + " " + arr[arr.length - 1];
}

function resetLog() {
  log = { history: [] };
  var historyEl = elById('history');
  if (historyEl) historyEl.innerHTML = "";
}

function proceed() {
  var totalQuestions = Number(elById('numQuestions').value);
  var answeredQuestions = log.history.length;

  if (answeredQuestions >= totalQuestions) {
    endQuiz();
  } else {
    generateQuestion();
  }
}

function showSplash() {
  show(elById('splash'));
  hide(elById('quizSection'));
  hide(elById('scoreSection'));
  var go = elById('go');
  if (go) go.focus();
}

function startQuiz(event) {
  if (event) event.preventDefault();
  var options = getOptions();

  var voiceSelectError = elById('voiceSelectError');
  if (options.use_voice && !getVoiceConfig()) {
    if (voiceSelectError) voiceSelectError.style.display = "block";
    return;
  } else {
    if (voiceSelectError) voiceSelectError.style.display = "none";
  }

  updateProgressBar(0);
  hide(elById('splash'));
  show(elById('quizSection'));
  hide(elById('scoreSection'));

  if (options.furigana_always) {
    document.body.classList.add("furiganaAlways");
  } else {
    document.body.classList.remove("furiganaAlways");
  }

  resetLog();
  generateQuestion();
}

function endQuiz() {
  hide(elById('splash'));
  hide(elById('quizSection'));
  show(elById('scoreSection'));

  var total = log.history.length;
  var correctCount = log.history.filter(function (h) { return h.correct; }).length;
  var pct = total > 0 ? Math.round(correctCount / total * 100) : 0;

  var titleEl = elById('scoreSectionTitle');
  if (titleEl) {
    titleEl.innerHTML = "<div class='score-badge'>Bạn đúng <strong>" + correctCount + " / " + total + "</strong> câu (" + pct + "%)</div>";
  }

  var backToStart = elById('backToStart');
  if (backToStart) backToStart.focus();
}

function explain() {
  show(elById('explanation'));
  hide(elById('message'));
  var explainProceedButton = elById('explain-proceed-button');
  if (explainProceedButton) explainProceedButton.focus();
}

function textToSpeech(text, slow) {
  if (!('speechSynthesis' in window)) return;
  var voiceConfig = getVoiceConfig();
  var utterance = new SpeechSynthesisUtterance(text);
  if (voiceConfig) {
    var voices = window.speechSynthesis.getVoices();
    for (var i = 0; i < voices.length; i++) {
      if (voices[i].name === voiceConfig.voice) {
        utterance.voice = voices[i];
        break;
      }
    }
  }
  utterance.lang = 'ja-JP';
  utterance.rate = slow ? 0.6 : 1.0;
  window.speechSynthesis.speak(utterance);
}

function getVoiceConfig() {
  var v = localStorage.getItem('voiceConfig');
  return v ? JSON.parse(v) : null;
}

function setVoiceConfig(cfg) {
  localStorage.setItem('voiceConfig', JSON.stringify(cfg));
}

function populateVoiceList() {
  if (!('speechSynthesis' in window)) return;
  var select = elById('voice_select');
  if (!select) return;
  var voices = window.speechSynthesis.getVoices();
  var jaVoices = voices.filter(function (v) { return v.lang.startsWith('ja'); });
  select.innerHTML = "";

  if (jaVoices.length === 0) {
    jaVoices = voices;
  }

  jaVoices.forEach(function (v) {
    var opt = document.createElement('option');
    opt.textContent = v.name + " (" + v.lang + ")";
    opt.value = v.name;
    select.appendChild(opt);
  });
}

function calculateConjugations(word, conjugation) {
  var group = words[word].group;
  var dictionary = words[word].dictionary;

  if (conjugation === 'dictionary') {
    return { forms: [dictionary] };
  }
  if (!rules[group] || !rules[group][conjugation]) return undefined;

  var cForms = rules[group][conjugation].forms;
  var result = { forms: [] };
  if (rules[group][conjugation].tetakei) {
    result.tetakei = true;
  }

  cForms.forEach(function (rule) {
    if (rule.before && rule.after) {
      if (dictionary.endsWith(rule.before)) {
        result.forms.push(dictionary.substring(0, dictionary.length - rule.before.length) + rule.after);
      }
    }
    if (rule.result) {
      result.forms.push(rule.result);
    }
  });
  return result;
}

function calculateAllConjugations() {
  Object.keys(words).forEach(function (word) {
    words[word].conjugations = {
      "dictionary": { forms: [words[word].dictionary] }
    };
    var group = words[word].group;
    if (rules[group]) {
      Object.keys(rules[group]).forEach(function (conjugation) {
        words[word].conjugations[conjugation] = calculateConjugations(word, conjugation);
      });
    }
  });
}

function calculateTransitions() {
  function getTags(str) {
    var tags = str.split(" ");
    if (tags.length === 1 && tags[0] === "plain") tags = [];
    return tags;
  }

  function calculateTags(tags) {
    tags = tags.split(" ");
    if (tags.indexOf("polite") === -1) tags.splice(0, 0, "plain");
    if (tags.indexOf("dictionary") !== -1) tags.splice(tags.indexOf("dictionary"), 1);
    return tags;
  }

  var allTags = {};
  Object.keys(words).forEach(function (word) {
    if (!words[word].conjugations) return;
    Object.keys(words[word].conjugations).forEach(function (conjugation) {
      if (conjugation === "dictionary") conjugation = "";
      allTags[conjugation] = conjugation.split(" ");
    });
  });

  transformations = [];
  Object.keys(allTags).forEach(function (srcTag) {
    if (srcTag !== "") {
      for (var i = 0; i < allTags[srcTag].length; i++) {
        var tagWithDrop = allTags[srcTag].slice();
        tagWithDrop.splice(i, 1);
        var dstTag = tagWithDrop.join(" ");

        if (allTags[dstTag]) {
          var s = srcTag === "" ? "dictionary" : srcTag;
          var d = dstTag === "" ? "dictionary" : dstTag;
          transformations.push({ from: s, to: d });
          transformations.push({ from: d, to: s });
        }
      }
    }
  });

  var from_extra = {
    "negative": "affirmative", "past": "present", "polite": "plain",
    "te-form": "non-て", "potential": "non-potential", "conditional": "non-conditional",
    "provisional": "non-provisional", "imperative": "non-imperative",
    "causative": "non-causative", "passive": "active", "progressive": "non-progressive",
    "desire": "&apos;non-desire&apos;", "volitional": "non-volitional"
  };

  var to_extra = {
    "negative": "negative", "past": "past", "polite": "polite",
    "te-form": "て", "potential": "potential", "conditional": "conditional",
    "provisional": "provisional", "imperative": "imperative",
    "causative": "causative", "passive": "passive", "progressive": "progressive",
    "desire": "&apos;desire&apos;", "volitional": "volitional"
  };

  transformations.forEach(function (transformation) {
    var from = getTags(transformation.from);
    var to = getTags(transformation.to);

    var phrase = from_extra[arrayDifference(from, to)[0]] || to_extra[arrayDifference(to, from)[0]];
    transformation.phrase = phrase;
    transformation.from_tags = calculateTags(transformation.from);
    transformation.to_tags = calculateTags(transformation.to);
    transformation.tags = arrayUnique(calculateTags(transformation.from).concat(calculateTags(transformation.to)));

    var diffFromTo = arrayDifference(transformation.from_tags, transformation.to_tags);
    var type = diffFromTo.length > 0 ? diffFromTo[0] : arrayDifference(transformation.to_tags, transformation.from_tags)[0];
    if (type === "plain" || type === "polite") type = "politeness";
    transformation.type = type;
  });

  var trick_forms = [];
  transformations.forEach(function (transformation) {
    trick_forms.push({
      from: transformation.to,
      to: transformation.to,
      type: transformation.type,
      phrase: transformation.phrase,
      from_tags: transformation.to_tags,
      to_tags: transformation.to_tags,
      tags: transformation.tags.concat(["trick"])
    });
  });

  transformations = transformations.concat(trick_forms);
}

function updateQuestionPool() {
  var options = getOptions();
  question_pool = [];

  Object.keys(words).forEach(function (word) {
    if (validWordForOptions(word, options)) {
      question_pool.push(word);
    }
  });
}

function updateOptionSummary() {
  updateQuestionPool();
  var options = getOptions();
  var applicable = 0;

  var activeTransformations = transformations.filter(function (t) {
    return validTransformationForOptions(t, options);
  });

  question_pool.forEach(function (word) {
    var forms = getVerbForms(word);
    activeTransformations.forEach(function (t) {
      if (validQuestion(word, forms, t, options)) {
        applicable++;
      }
    });
  });

  setText(elById('questionCount'), applicable);

  var numQuestionsEl = elById('numQuestions');
  var noQErr = elById('noQuestionError');
  if (noQErr && numQuestionsEl) {
    noQErr.style.display = applicable < Number(numQuestionsEl.value) ? 'block' : 'none';
  }

  var polPlainErr = elById('politePlainError');
  if (polPlainErr) {
    polPlainErr.style.display = (!options.plain && !options.polite) ? 'block' : 'none';
  }
}

function getOptions() {
  var result = {};
  configOptions.options.forEach(function (opt) {
    var el = elById(opt);
    result[opt] = el ? el.checked : false;
  });
  configOptions.selects.forEach(function (sel) {
    var el = elById(sel);
    result[sel] = el ? el.value : "";
  });
  configOptions.inputs.forEach(function (inp) {
    var el = elById(inp);
    result[inp] = el ? el.value : "";
  });
  return result;
}

function saveOptions() {
  localStorage.setItem(localStorageOptionsKey, JSON.stringify(getOptions()));
}

function loadOptions() {
  var storedOptionsText = localStorage.getItem(localStorageOptionsKey);
  var storedOptions = storedOptionsText ? JSON.parse(storedOptionsText) : defaultConfig;

  configOptions.options.forEach(function (opt) {
    var el = elById(opt);
    if (el) el.checked = (storedOptions[opt] !== undefined) ? storedOptions[opt] : (defaultConfig[opt] || false);
  });
  configOptions.selects.forEach(function (sel) {
    var el = elById(sel);
    if (el) el.value = storedOptions[sel] || defaultConfig[sel] || "";
  });
  configOptions.inputs.forEach(function (inp) {
    var el = elById(inp);
    if (el) el.value = storedOptions[inp] || defaultConfig[inp] || "";
  });
}

function restoreDefaults() {
  localStorage.setItem(localStorageOptionsKey, JSON.stringify(defaultConfig));
  loadOptions();
  updateOptionSummary();
}

function applyTheme(theme, persist) {
  var isDark = theme === 'dark';
  var root = document.documentElement;
  if (root) {
    if (isDark) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }
  var btn = elById('themeToggle');
  if (btn) {
    btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    btn.setAttribute('aria-label', isDark ? 'Đổi sang chế độ sáng' : 'Đổi sang chế độ tối');
    btn.title = isDark ? 'Chế độ sáng' : 'Chế độ tối';
  }
  if (persist) {
    try {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch (e) {}
  }
}

function initTheme() {
  var stored = null;
  try { stored = localStorage.getItem('theme'); } catch (e) {}
  if (stored === 'dark' || stored === 'light') {
    applyTheme(stored, false);
  } else {
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light', false);
  }
  var btn = elById('themeToggle');
  if (btn) {
    btn.addEventListener('click', function () {
      var currentlyDark = document.documentElement.getAttribute('data-theme') === 'dark';
      applyTheme(currentlyDark ? 'light' : 'dark', true);
    });
  }
}

function runMain() {
  calculateAllConjugations();
  calculateTransitions();
  loadOptions();
  updateOptionSummary();
  showSplash();
}

function loadData() {
  return Promise.all([
    fetch('./words.json').then(function (res) { return res.json(); }),
    fetch('./count.json').then(function (res) { return res.json(); }),
    fetch('./grp_sample.json').then(function (res) { return res.json(); })
  ]).then(function (results) {
    words = results[0];
    count_dict = results[1];
    grp_sample = results[2];
    runMain();
  }).catch(function (error) {
    console.error('Không tải được dữ liệu:', error);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  initTheme();
  loadData();

  var goBtn = elById('go');
  if (goBtn) goBtn.addEventListener('click', startQuiz);

  var defaultsBtn = elById('defaults');
  if (defaultsBtn) defaultsBtn.addEventListener('click', restoreDefaults);

  var stopQuizBtn = elById('stopQuiz');
  if (stopQuizBtn) {
    stopQuizBtn.addEventListener('click', function (e) {
      e.preventDefault();
      confirmAndStopQuiz();
    });
  }

  var backToStart = elById('backToStart');
  if (backToStart) backToStart.addEventListener('click', showSplash);

  var proceedBtn = qs('#proceed button');
  if (proceedBtn) proceedBtn.addEventListener('click', proceed);

  var explainProceedBtn = elById('explain-proceed-button');
  if (explainProceedBtn) explainProceedBtn.addEventListener('click', proceed);

  var explainMsgBtn = elById('explain-message-button');
  if (explainMsgBtn) explainMsgBtn.addEventListener('click', explain);

  var answerEl = elById('answer');
  if (answerEl) {
    answerEl.addEventListener('input', processAnswerKey);
    answerEl.addEventListener('keydown', processAnswerKeyDown);
  }

  var quizForm = qs('form[name="quizForm"]');
  if (quizForm) {
    quizForm.addEventListener('submit', function (e) {
      e.preventDefault();
      processAnswer();
    });
  }

  qsa('.select-all-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var group = btn.dataset.group;
      getGroupCheckboxes(group).forEach(function (el) { el.checked = true; });
      updateOptionSummary();
      saveOptions();
    });
  });

  qsa('.deselect-all-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var group = btn.dataset.group;
      getGroupCheckboxes(group).forEach(function (el) { el.checked = false; });
      updateOptionSummary();
      saveOptions();
    });
  });

  var globalSelectBtn = qs('.select-all-global-btn');
  if (globalSelectBtn) {
    globalSelectBtn.addEventListener('click', function () {
      getGroupCheckboxes('all').forEach(function (el) { el.checked = true; });
      updateOptionSummary();
      saveOptions();
    });
  }

  var globalDeselectBtn = qs('.deselect-all-global-btn');
  if (globalDeselectBtn) {
    globalDeselectBtn.addEventListener('click', function () {
      getGroupCheckboxes('all').forEach(function (el) { el.checked = false; });
      updateOptionSummary();
      saveOptions();
    });
  }

  qsa('.options input, .toggles input').forEach(function (el) {
    el.addEventListener('change', function () {
      updateOptionSummary();
      saveOptions();
    });
  });

  var questionFocus = elById('questionFocus');
  if (questionFocus) {
    questionFocus.addEventListener('change', function () {
      updateOptionSummary();
      saveOptions();
    });
  }

  var numQuestions = elById('numQuestions');
  if (numQuestions) {
    numQuestions.addEventListener('change', function () {
      updateOptionSummary();
      saveOptions();
    });
  }
});
